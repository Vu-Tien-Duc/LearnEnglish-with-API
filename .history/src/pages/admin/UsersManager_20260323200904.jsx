from flask import Blueprint, jsonify, request
from db import get_db_connection
from datetime import datetime, timedelta

admin_user_bp = Blueprint("admin_user", __name__, url_prefix="/api/admin/users")

# ── GET LIST USERS ─────────────────────────────
@admin_user_bp.route("/", methods=["GET"])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor()

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    search = request.args.get("q", "")
    role = request.args.get("role", "")

    offset = (page - 1) * limit

    where_clause = "WHERE 1=1"
    params = []

    if search:
        where_clause += " AND Username LIKE ?"
        params.append(f"%{search}%")
    if role and role.lower() != "tất cả":
        where_clause += " AND Role = ?"
        params.append(role)

    # total count
    cursor.execute(f"SELECT COUNT(*) FROM Users {where_clause}", params)
    total = cursor.fetchone()[0]

    # user list
    cursor.execute(f"""
        SELECT u.UserID, u.Username, u.Email, u.Role, u.CreatedDate,
               ISNULL(lp.Status,'New') as LearningStatus,
               ISNULL(lp.ProgressPct,0) as ProgressPct,
               ISNULL(avgq.Score,0) as AverageScore,
               lp.LastReviewed
        FROM Users u
        LEFT JOIN (
            SELECT UserID,
                   CAST(SUM(CASE WHEN Status='Mastered' THEN 1 ELSE 0 END)*100.0/COUNT(*) AS INT) as ProgressPct,
                   MAX(LastReviewed) as LastReviewed,
                   MAX(Status) as Status
            FROM LearningProgress
            GROUP BY UserID
        ) lp ON u.UserID = lp.UserID
        LEFT JOIN (
            SELECT UserID, AVG(CAST(Score AS FLOAT)) as Score
            FROM UserLearning
            GROUP BY UserID
        ) avgq ON u.UserID = avgq.UserID
        {where_clause}
        ORDER BY u.CreatedDate DESC
        OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    """, params + [offset, limit])

    users = []
    for row in cursor.fetchall():
        last_reviewed = row.LastReviewed
        online = "Offline"
        if last_reviewed and (datetime.now() - last_reviewed).total_seconds() < 900:  # 15 phút
            online = "Online"
        users.append({
            "UserID": row.UserID,
            "Username": row.Username,
            "Email": row.Email,
            "Role": row.Role,
            "CreatedDate": row.CreatedDate.strftime("%d/%m/%Y"),
            "Progress": row.ProgressPct if row.ProgressPct is not None else 0,
            "AverageScore": int(row.AverageScore) if row.AverageScore is not None else 0,
            "Status": online
        })

    return jsonify({
        "data": users,
        "total": total,
        "total_pages": (total + limit - 1) // limit
    })

# ── GET SINGLE USER ─────────────────────────────
@admin_user_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT UserID, Username, Email, Role, CreatedDate FROM Users WHERE UserID=?", (user_id,))
    row = cursor.fetchone()
    if not row:
        return jsonify({"error": "User không tồn tại"}), 404
    return jsonify({
        "UserID": row.UserID,
        "Username": row.Username,
        "Email": row.Email,
        "Role": row.Role,
        "CreatedDate": row.CreatedDate.strftime("%d/%m/%Y")
    })

# ── CREATE USER ─────────────────────────────
@admin_user_bp.route("/", methods=["POST"])
def create_user():
    data = request.get_json()
    username = data.get("Username")
    email = data.get("Email")
    role = data.get("Role", "User")
    password = data.get("PasswordHash")

    if not username or not password:
        return jsonify({"error": "Username và password không được để trống"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO Users (Username, Email, Role, PasswordHash) VALUES (?,?,?,?)",
                       (username, email, role, password))
        conn.commit()
        return jsonify({"message": "Tạo user thành công"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ── UPDATE USER ─────────────────────────────
@admin_user_bp.route("/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.get_json()
    username = data.get("Username")
    email = data.get("Email")
    role = data.get("Role")
    password = data.get("PasswordHash")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT UserID FROM Users WHERE UserID=?", (user_id,))
    if not cursor.fetchone():
        return jsonify({"error": "User không tồn tại"}), 404

    try:
        if password:
            cursor.execute("UPDATE Users SET Username=?, Email=?, Role=?, PasswordHash=? WHERE UserID=?",
                           (username, email, role, password, user_id))
        else:
            cursor.execute("UPDATE Users SET Username=?, Email=?, Role=? WHERE UserID=?",
                           (username, email, role, user_id))
        conn.commit()
        return jsonify({"message": "Cập nhật thành công"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ── DELETE USER ─────────────────────────────
@admin_user_bp.route("/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT UserID FROM Users WHERE UserID=?", (user_id,))
    if not cursor.fetchone():
        return jsonify({"error": "User không tồn tại"}), 404

    try:
        cursor.execute("DELETE FROM LearningProgress WHERE UserID=?", (user_id,))
        cursor.execute("DELETE FROM UserLearning WHERE UserID=?", (user_id,))
        cursor.execute("DELETE FROM FavoriteWords WHERE UserID=?", (user_id,))
        cursor.execute("DELETE FROM Users WHERE UserID=?", (user_id,))
        conn.commit()
        return jsonify({"message": "Xóa user thành công"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400