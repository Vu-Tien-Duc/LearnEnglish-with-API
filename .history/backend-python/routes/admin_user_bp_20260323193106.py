from flask import Blueprint, request, jsonify
from db import get_db_connection
import math

admin_user_bp = Blueprint("admin_user", __name__)

# ─────────────────────────────────────────────
# HELPER: format row thành dict
# ─────────────────────────────────────────────
def row_to_dict(cursor, row):
    return dict(zip([col[0] for col in cursor.description], row))


def rows_to_list(cursor, rows):
    cols = [col[0] for col in cursor.description]
    return [dict(zip(cols, row)) for row in rows]


def fmt_date(dt):
    return dt.strftime("%d/%m/%Y") if dt else None


def fmt_datetime(dt):
    return dt.strftime("%d/%m/%Y %H:%M") if dt else None


# ═══════════════════════════════════════════════
# 1. GET ALL  –  danh sách users + tổng hợp stats
# GET /api/admin/users/?page=1&limit=10&q=&role=&sort=created_desc
# ═══════════════════════════════════════════════
@admin_user_bp.route("/", methods=["GET"])
def get_all_users():
    try:
        page   = max(1, int(request.args.get("page",  1)))
        limit  = min(50, max(1, int(request.args.get("limit", 10))))
        q      = request.args.get("q",    "").strip()
        role   = request.args.get("role", "").strip()
        sort   = request.args.get("sort", "created_desc")
        offset = (page - 1) * limit

        sort_map = {
            "created_desc":  "u.CreatedDate DESC",
            "created_asc":   "u.CreatedDate ASC",
            "username_asc":  "u.Username ASC",
            "username_desc": "u.Username DESC",
            "progress_desc": "MasteredWords DESC",
            "score_desc":    "AvgScore DESC",
        }
        order_by = sort_map.get(sort, "u.CreatedDate DESC")

        where_clauses = []
        params = []

        if q:
            where_clauses.append("(u.Username LIKE ? OR u.Email LIKE ?)")
            params += [f"%{q}%", f"%{q}%"]
        if role:
            where_clauses.append("u.Role = ?")
            params.append(role)

        where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

        base_query = f"""
            SELECT
                u.UserID,
                u.Username,
                u.Email,
                u.Role,
                u.CreatedDate,
                COUNT(DISTINCT lp.WordID)                                           AS TotalWords,
                ISNULL(SUM(CASE WHEN lp.Status = 'New'      THEN 1 ELSE 0 END), 0) AS NewWords,
                ISNULL(SUM(CASE WHEN lp.Status = 'Learning' THEN 1 ELSE 0 END), 0) AS LearningWords,
                ISNULL(SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END), 0) AS MasteredWords,
                ISNULL(AVG(CAST(ul.Score AS FLOAT)), 0)                             AS AvgScore,
                COUNT(DISTINCT fw.WordID)                                           AS FavoriteCount
            FROM Users u
            LEFT JOIN LearningProgress lp ON u.UserID = lp.UserID
            LEFT JOIN UserLearning     ul ON u.UserID = ul.UserID
            LEFT JOIN FavoriteWords    fw ON u.UserID = fw.UserID
            {where_sql}
            GROUP BY u.UserID, u.Username, u.Email, u.Role, u.CreatedDate
        """

        conn   = get_db_connection()
        cursor = conn.cursor()

        # đếm tổng để phân trang
        cursor.execute(f"SELECT COUNT(*) FROM ({base_query}) AS sub", params)
        total_count = cursor.fetchone()[0]
        total_pages = math.ceil(total_count / limit)

        # lấy trang hiện tại
        cursor.execute(
            f"{base_query} ORDER BY {order_by} OFFSET ? ROWS FETCH NEXT ? ROWS ONLY",
            params + [offset, limit],
        )
        rows = rows_to_list(cursor, cursor.fetchall())

        for r in rows:
            r["CreatedDate"] = fmt_date(r["CreatedDate"])
            r["AvgScore"]    = round(r["AvgScore"] or 0, 1)
            total = r["TotalWords"] or 0
            r["ProgressPct"] = round((r["MasteredWords"] / total) * 100) if total else 0

        conn.close()
        return jsonify({
            "data":        rows,
            "total":       total_count,
            "page":        page,
            "limit":       limit,
            "total_pages": total_pages,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ═══════════════════════════════════════════════
# 2. GET BY ID  –  full profile 1 user
# GET /api/admin/users/<id>
# ═══════════════════════════════════════════════
@admin_user_bp.route("/<int:user_id>", methods=["GET"])
def get_user_by_id(user_id):
    try:
        conn   = get_db_connection()
        cursor = conn.cursor()

        # ── thông tin cơ bản ──────────────────
        cursor.execute(
            "SELECT UserID, Username, Email, Role, CreatedDate FROM Users WHERE UserID = ?",
            (user_id,),
        )
        row = cursor.fetchone()
        if not row:
            conn.close()
            return jsonify({"error": "User không tồn tại"}), 404

        user = row_to_dict(cursor, row)
        user["CreatedDate"] = fmt_date(user["CreatedDate"])

        # ── learning progress tổng hợp ────────
        cursor.execute(
            """
            SELECT
                COUNT(WordID)                                           AS TotalWords,
                SUM(CASE WHEN Status = 'New'      THEN 1 ELSE 0 END)  AS NewWords,
                SUM(CASE WHEN Status = 'Learning' THEN 1 ELSE 0 END)  AS LearningWords,
                SUM(CASE WHEN Status = 'Mastered' THEN 1 ELSE 0 END)  AS MasteredWords,
                MAX(LastReviewed)                                       AS LastActivity
            FROM LearningProgress
            WHERE UserID = ?
            """,
            (user_id,),
        )
        prog = row_to_dict(cursor, cursor.fetchone())
        prog["LastActivity"] = fmt_datetime(prog["LastActivity"])
        total = prog["TotalWords"] or 0
        prog["ProgressPct"] = round((prog["MasteredWords"] / total) * 100) if total else 0
        user["progress"] = prog

        # ── quiz score trung bình ─────────────
        cursor.execute(
            "SELECT ISNULL(AVG(CAST(Score AS FLOAT)), 0) AS AvgScore, COUNT(*) AS TotalQuiz FROM UserLearning WHERE UserID = ?",
            (user_id,),
        )
        quiz_stat = row_to_dict(cursor, cursor.fetchone())
        quiz_stat["AvgScore"] = round(quiz_stat["AvgScore"], 1)
        user["quizStat"] = quiz_stat

        # ── tiến độ theo từng category ────────
        cursor.execute(
            """
            SELECT
                c.CategoryName,
                COUNT(lp.WordID)                                           AS Total,
                SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)   AS Mastered
            FROM LearningProgress lp
            JOIN Vocabulary  v ON lp.WordID     = v.WordID
            JOIN Categories  c ON v.CategoryID  = c.CategoryID
            WHERE lp.UserID = ?
            GROUP BY c.CategoryName
            ORDER BY Total DESC
            """,
            (user_id,),
        )
        cats = rows_to_list(cursor, cursor.fetchall())
        for c in cats:
            c["Pct"] = round((c["Mastered"] / c["Total"]) * 100) if c["Total"] else 0
        user["categoryProgress"] = cats

        # ── lịch sử quiz gần nhất (10 bản ghi) ─
        cursor.execute(
            """
            SELECT TOP 10
                v.Word,
                ul.Score,
                ul.LearnDate
            FROM UserLearning ul
            JOIN Vocabulary v ON ul.WordID = v.WordID
            WHERE ul.UserID = ?
            ORDER BY ul.LearnDate DESC
            """,
            (user_id,),
        )
        history = rows_to_list(cursor, cursor.fetchall())
        for h in history:
            h["LearnDate"] = fmt_datetime(h["LearnDate"])
        user["quizHistory"] = history

        # ── danh sách từ yêu thích ─────────────
        cursor.execute(
            """
            SELECT v.Word, v.Meaning, c.CategoryName
            FROM FavoriteWords fw
            JOIN Vocabulary v ON fw.WordID     = v.WordID
            LEFT JOIN Categories c ON v.CategoryID = c.CategoryID
            WHERE fw.UserID = ?
            """,
            (user_id,),
        )
        user["favorites"] = rows_to_list(cursor, cursor.fetchall())

        conn.close()
        return jsonify(user)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ═══════════════════════════════════════════════
# 3. CREATE USER
# POST /api/admin/users/
# Body: { Username, PasswordHash, Email, Role }
# ═══════════════════════════════════════════════
@admin_user_bp.route("/", methods=["POST"])
def create_user():
    try:
        data = request.json or {}

        # validate required
        if not data.get("Username", "").strip():
            return jsonify({"error": "Username không được để trống"}), 400
        if not data.get("PasswordHash", "").strip():
            return jsonify({"error": "Password không được để trống"}), 400

        conn   = get_db_connection()
        cursor = conn.cursor()

        # kiểm tra trùng username
        cursor.execute("SELECT 1 FROM Users WHERE Username = ?", (data["Username"].strip(),))
        if cursor.fetchone():
            conn.close()
            return jsonify({"error": "Username đã tồn tại"}), 409

        # kiểm tra trùng email
        email = data.get("Email", "").strip() or None
        if email:
            cursor.execute("SELECT 1 FROM Users WHERE Email = ?", (email,))
            if cursor.fetchone():
                conn.close()
                return jsonify({"error": "Email đã được sử dụng"}), 409

        cursor.execute(
            """
            INSERT INTO Users (Username, PasswordHash, Email, Role)
            OUTPUT INSERTED.UserID
            VALUES (?, ?, ?, ?)
            """,
            (
                data["Username"].strip(),
                data["PasswordHash"],           # nên bcrypt hash trước khi gửi lên
                email,
                data.get("Role", "User"),
            ),
        )
        new_id = cursor.fetchone()[0]
        conn.commit()
        conn.close()

        return jsonify({"message": "Tạo user thành công", "UserID": new_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ═══════════════════════════════════════════════
# 4. UPDATE USER
# PUT /api/admin/users/<id>
# Body: { Username, Email, Role, PasswordHash? }
# ═══════════════════════════════════════════════
@admin_user_bp.route("/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    try:
        data = request.json or {}

        if not data.get("Username", "").strip():
            return jsonify({"error": "Username không được để trống"}), 400

        conn   = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT 1 FROM Users WHERE UserID = ?", (user_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({"error": "User không tồn tại"}), 404

        # kiểm tra trùng username với user khác
        cursor.execute(
            "SELECT 1 FROM Users WHERE Username = ? AND UserID <> ?",
            (data["Username"].strip(), user_id),
        )
        if cursor.fetchone():
            conn.close()
            return jsonify({"error": "Username đã tồn tại"}), 409

        email = data.get("Email", "").strip() or None
        if email:
            cursor.execute(
                "SELECT 1 FROM Users WHERE Email = ? AND UserID <> ?",
                (email, user_id),
            )
            if cursor.fetchone():
                conn.close()
                return jsonify({"error": "Email đã được sử dụng"}), 409

        if data.get("PasswordHash", "").strip():
            cursor.execute(
                "UPDATE Users SET Username=?, Email=?, Role=?, PasswordHash=? WHERE UserID=?",
                (data["Username"].strip(), email, data.get("Role", "User"), data["PasswordHash"], user_id),
            )
        else:
            cursor.execute(
                "UPDATE Users SET Username=?, Email=?, Role=? WHERE UserID=?",
                (data["Username"].strip(), email, data.get("Role", "User"), user_id),
            )

        conn.commit()
        conn.close()
        return jsonify({"message": "Cập nhật thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ═══════════════════════════════════════════════
# 5. DELETE USER  (cascade đúng thứ tự FK)
# DELETE /api/admin/users/<id>
# ═══════════════════════════════════════════════
@admin_user_bp.route("/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        conn   = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT Username FROM Users WHERE UserID = ?", (user_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return jsonify({"error": "User không tồn tại"}), 404

        username = row[0]

        # cascade đúng thứ tự để không vi phạm FK
        cursor.execute("DELETE FROM FavoriteWords    WHERE UserID = ?", (user_id,))
        cursor.execute("DELETE FROM UserLearning      WHERE UserID = ?", (user_id,))
        cursor.execute("DELETE FROM LearningProgress  WHERE UserID = ?", (user_id,))
        cursor.execute("DELETE FROM Users             WHERE UserID = ?", (user_id,))

        conn.commit()
        conn.close()
        return jsonify({"message": f'Đã xóa user "{username}"'})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ═══════════════════════════════════════════════
# 6. STATS  –  dùng cho dashboard card
# GET /api/admin/users/stats
# ═══════════════════════════════════════════════
@admin_user_bp.route("/stats", methods=["GET"])
def get_stats():
    try:
        conn   = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                COUNT(*)                                                                          AS TotalUsers,
                SUM(CASE WHEN Role = 'Admin' THEN 1 ELSE 0 END)                                  AS TotalAdmins,
                SUM(CASE WHEN Role = 'User'  THEN 1 ELSE 0 END)                                  AS TotalRegular,
                SUM(CASE WHEN CAST(CreatedDate AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS NewToday,
                SUM(CASE WHEN CreatedDate >= DATEADD(DAY,-7,GETDATE()) THEN 1 ELSE 0 END)        AS NewThisWeek
            FROM Users
            """
        )
        stats = row_to_dict(cursor, cursor.fetchone())
        conn.close()
        return jsonify(stats)

    except Exception as e:
        return jsonify({"error": str(e)}), 500