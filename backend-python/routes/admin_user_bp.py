from flask import Blueprint, jsonify, request
from db import get_db_connection
import bcrypt

admin_user_bp = Blueprint("admin_user", __name__)

# ── GET LIST USERS (pagination + search + role + stats) ──────
@admin_user_bp.route("/", methods=["GET"])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor()

    page   = int(request.args.get("page",  1))
    limit  = int(request.args.get("limit", 10))
    search = request.args.get("q",    "")
    role   = request.args.get("role", "")
    offset = (page - 1) * limit

    where_clause = "WHERE 1=1"
    params = []

    if search:
        where_clause += " AND (u.Username LIKE ? OR u.Email LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])

    if role and role.lower() not in ("", "all"):
        where_clause += " AND u.Role = ?"
        params.append(role)

    # ── TOTAL USERS ──
    cursor.execute(f"SELECT COUNT(*) FROM Users u {where_clause}", params)
    total = cursor.fetchone()[0]

    # ── MAIN QUERY (ĐÃ SỬA LOGIC TIẾN ĐỘ & ĐIỂM TB) ──
    cursor.execute(f"""
        SELECT 
            u.UserID,
            u.Username,
            u.Email,
            u.Role,
            u.CreatedDate,

            -- ======================
            -- ✅ PROGRESS: Tỷ lệ % từ vựng đã thuộc (Mastered)
            -- ======================
            ISNULL(lp.ProgressPct, 0) AS ProgressPct,

            -- ======================
            -- ✅ SCORE: Tổng điểm / Tổng số câu hỏi của hệ thống
            -- ======================
            ISNULL(avgq.AvgScore, 0) AS AverageScore

        FROM Users u

        -- ===== PROGRESS (Từ vựng Mastered / Tổng từ vựng) =====
        LEFT JOIN (
            SELECT 
                UserID,
                CAST(
                    COUNT(CASE WHEN Status = 'Mastered' THEN 1 END) * 100.0 
                    / NULLIF((SELECT COUNT(*) FROM Vocabulary), 0) 
                AS INT) AS ProgressPct
            FROM LearningProgress
            GROUP BY UserID
        ) lp ON u.UserID = lp.UserID

        -- ===== SCORE (Tổng điểm / Tổng số câu hỏi của hệ thống) =====
        LEFT JOIN (
            SELECT 
                UserID,
                CAST(
                    SUM(Score) * 1.0 
                    / NULLIF((SELECT COUNT(*) FROM QuizQuestions), 0) 
                AS INT) AS AvgScore
            FROM UserLearning
            WHERE Score IS NOT NULL
            GROUP BY UserID
        ) avgq ON u.UserID = avgq.UserID

        {where_clause}
        ORDER BY u.CreatedDate DESC
        OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    """, params + [offset, limit])

    users = []
    for row in cursor.fetchall():
        users.append({
            "UserID":       row.UserID,
            "Username":     row.Username,
            "Email":        row.Email,
            "Role":         row.Role,
            "CreatedDate":  row.CreatedDate.strftime("%d/%m/%Y") if row.CreatedDate else "",
            "Progress":     row.ProgressPct or 0,
            "AverageScore": int(row.AverageScore) if row.AverageScore else 0,
        })

    conn.close()

    return jsonify({
        "data":        users,
        "total":       total,
        "total_pages": (total + limit - 1) // limit,
    })

# ── GET SINGLE USER ─────────────────────────────────────────
@admin_user_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT UserID, Username, Email, Role, CreatedDate 
        FROM Users 
        WHERE UserID=?
    """, (user_id,))
    
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "User không tồn tại"}), 404

    return jsonify({
        "UserID":      row.UserID,
        "Username":    row.Username,
        "Email":       row.Email,
        "Role":        row.Role,
        "CreatedDate": row.CreatedDate.strftime("%d/%m/%Y") if row.CreatedDate else "",
    })


# ── CREATE USER ─────────────────────────────────────────────
@admin_user_bp.route("/", methods=["POST"])
def create_user():
    data     = request.get_json()
    username = data.get("Username", "").strip()
    email    = data.get("Email", "").strip()
    role     = data.get("Role", "User")
    password = data.get("PasswordHash", "").strip()

    if not username or not password:
        return jsonify({"error": "Username và password không được để trống"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
        cursor.execute("""
            INSERT INTO Users (Username, Email, Role, PasswordHash)
            VALUES (?, ?, ?, ?)
        """, (username, email, role, hashed.decode()))

        conn.commit()
        conn.close()
        return jsonify({"message": "Tạo user thành công"})
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 400


# ── UPDATE USER ─────────────────────────────────────────────
@admin_user_bp.route("/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    data     = request.get_json()
    username = data.get("Username", "").strip()
    email    = data.get("Email", "").strip()
    role     = data.get("Role", "User")
    password = data.get("PasswordHash", "").strip()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT UserID FROM Users WHERE UserID=?", (user_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "User không tồn tại"}), 404

    try:
        if password:
            hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
            cursor.execute("""
                UPDATE Users 
                SET Username=?, Email=?, Role=?, PasswordHash=? 
                WHERE UserID=?
            """, (username, email, role, hashed.decode(), user_id))
        else:
            cursor.execute("""
                UPDATE Users 
                SET Username=?, Email=?, Role=? 
                WHERE UserID=?
            """, (username, email, role, user_id))

        conn.commit()
        conn.close()
        return jsonify({"message": "Cập nhật thành công"})
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 400


# ── DELETE USER ─────────────────────────────────────────────
@admin_user_bp.route("/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT UserID FROM Users WHERE UserID=?", (user_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "User không tồn tại"}), 404

    try:
        cursor.execute("DELETE FROM LearningProgress WHERE UserID=?", (user_id,))
        cursor.execute("DELETE FROM UserLearning      WHERE UserID=?", (user_id,))
        cursor.execute("DELETE FROM FavoriteWords     WHERE UserID=?", (user_id,))
        cursor.execute("DELETE FROM Users             WHERE UserID=?", (user_id,))

        conn.commit()
        conn.close()
        return jsonify({"message": "Xóa user thành công"})
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 400