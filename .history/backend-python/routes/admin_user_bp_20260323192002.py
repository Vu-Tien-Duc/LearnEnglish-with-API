from flask import Blueprint, request, jsonify
from db import get_db_connection

admin_user_bp = Blueprint("admin_user", __name__)

# =========================
# GET ALL USERS
# =========================
@admin_user_bp.route("/", methods=["GET"])
def get_all_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                u.UserID,
                u.Username,
                u.Email,
                u.Role,
                u.CreatedDate,
                -- Tổng số từ đang theo dõi
                COUNT(DISTINCT lp.WordID) AS TotalWords,
                -- Đếm theo status
                SUM(CASE WHEN lp.Status = 'New' THEN 1 ELSE 0 END) AS NewWords,
                SUM(CASE WHEN lp.Status = 'Learning' THEN 1 ELSE 0 END) AS LearningWords,
                SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END) AS MasteredWords,
                -- Quiz score trung bình
                AVG(CAST(ul.Score AS FLOAT)) AS AvgScore
            FROM Users u
            LEFT JOIN LearningProgress lp ON u.UserID = lp.UserID
            LEFT JOIN UserLearning ul ON u.UserID = ul.UserID
            GROUP BY u.UserID, u.Username, u.Email, u.Role, u.CreatedDate
            ORDER BY u.CreatedDate DESC
        """)

        columns = [col[0] for col in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # Format datetime
        for r in results:
            if r.get("CreatedDate"):
                r["CreatedDate"] = r["CreatedDate"].strftime("%d/%m/%Y")
            if r.get("AvgScore") is not None:
                r["AvgScore"] = round(r["AvgScore"], 1)

        conn.close()
        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# GET USER BY ID
# =========================
@admin_user_bp.route("/<int:user_id>", methods=["GET"])
def get_user_by_id(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Thông tin cơ bản
        cursor.execute("""
            SELECT UserID, Username, Email, Role, CreatedDate
            FROM Users
            WHERE UserID = ?
        """, (user_id,))

        row = cursor.fetchone()
        if not row:
            return jsonify({"message": "User not found"}), 404

        columns = [col[0] for col in cursor.description]
        user = dict(zip(columns, row))
        if user.get("CreatedDate"):
            user["CreatedDate"] = user["CreatedDate"].strftime("%d/%m/%Y")

        # Learning progress
        cursor.execute("""
            SELECT 
                COUNT(WordID) AS TotalWords,
                SUM(CASE WHEN Status = 'New' THEN 1 ELSE 0 END) AS NewWords,
                SUM(CASE WHEN Status = 'Learning' THEN 1 ELSE 0 END) AS LearningWords,
                SUM(CASE WHEN Status = 'Mastered' THEN 1 ELSE 0 END) AS MasteredWords
            FROM LearningProgress
            WHERE UserID = ?
        """, (user_id,))

        prog_row = cursor.fetchone()
        prog_cols = [col[0] for col in cursor.description]
        user["progress"] = dict(zip(prog_cols, prog_row))

        # Quiz history gần nhất
        cursor.execute("""
            SELECT TOP 5
                v.Word,
                ul.Score,
                ul.LearnDate
            FROM UserLearning ul
            JOIN Vocabulary v ON ul.WordID = v.WordID
            WHERE ul.UserID = ?
            ORDER BY ul.LearnDate DESC
        """, (user_id,))

        quiz_cols = [col[0] for col in cursor.description]
        user["quizHistory"] = [dict(zip(quiz_cols, r)) for r in cursor.fetchall()]
        for q in user["quizHistory"]:
            if q.get("LearnDate"):
                q["LearnDate"] = q["LearnDate"].strftime("%d/%m/%Y %H:%M")

        # Favorite words
        cursor.execute("""
            SELECT v.Word, v.Meaning
            FROM FavoriteWords fw
            JOIN Vocabulary v ON fw.WordID = v.WordID
            WHERE fw.UserID = ?
        """, (user_id,))

        fav_cols = [col[0] for col in cursor.description]
        user["favorites"] = [dict(zip(fav_cols, r)) for r in cursor.fetchall()]

        conn.close()
        return jsonify(user)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# CREATE USER
# =========================
@admin_user_bp.route("/", methods=["POST"])
def create_user():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()

        # Kiểm tra username đã tồn tại chưa
        cursor.execute("SELECT UserID FROM Users WHERE Username = ?", (data["Username"],))
        if cursor.fetchone():
            return jsonify({"error": "Username đã tồn tại"}), 400

        # Kiểm tra email
        if data.get("Email"):
            cursor.execute("SELECT UserID FROM Users WHERE Email = ?", (data["Email"],))
            if cursor.fetchone():
                return jsonify({"error": "Email đã được sử dụng"}), 400

        cursor.execute("""
            INSERT INTO Users (Username, PasswordHash, Email, Role)
            OUTPUT INSERTED.UserID
            VALUES (?, ?, ?, ?)
        """, (
            data["Username"],
            data["PasswordHash"],           # Nên hash trước khi lưu (bcrypt)
            data.get("Email", ""),
            data.get("Role", "User")
        ))

        new_id = cursor.fetchone()[0]
        conn.commit()
        conn.close()

        return jsonify({"message": "Tạo user thành công", "UserID": new_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# UPDATE USER
# =========================
@admin_user_bp.route("/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()

        # Kiểm tra user tồn tại
        cursor.execute("SELECT UserID FROM Users WHERE UserID = ?", (user_id,))
        if not cursor.fetchone():
            return jsonify({"message": "User not found"}), 404

        # Nếu có đổi password
        if data.get("PasswordHash"):
            cursor.execute("""
                UPDATE Users
                SET Username = ?, Email = ?, Role = ?, PasswordHash = ?
                WHERE UserID = ?
            """, (
                data["Username"],
                data.get("Email", ""),
                data.get("Role", "User"),
                data["PasswordHash"],
                user_id
            ))
        else:
            cursor.execute("""
                UPDATE Users
                SET Username = ?, Email = ?, Role = ?
                WHERE UserID = ?
            """, (
                data["Username"],
                data.get("Email", ""),
                data.get("Role", "User"),
                user_id
            ))

        conn.commit()
        conn.close()
        return jsonify({"message": "Cập nhật user thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# DELETE USER
# =========================
@admin_user_bp.route("/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT UserID FROM Users WHERE UserID = ?", (user_id,))
        if not cursor.fetchone():
            return jsonify({"message": "User not found"}), 404

        # Xóa các bảng liên quan trước (FK constraint)
        cursor.execute("DELETE FROM FavoriteWords WHERE UserID = ?", (user_id,))
        cursor.execute("DELETE FROM UserLearning WHERE UserID = ?", (user_id,))
        cursor.execute("DELETE FROM LearningProgress WHERE UserID = ?", (user_id,))
        cursor.execute("DELETE FROM Users WHERE UserID = ?", (user_id,))

        conn.commit()
        conn.close()
        return jsonify({"message": "Xóa user thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# SEARCH USERS
# =========================
@admin_user_bp.route("/search", methods=["GET"])
def search_users():
    try:
        keyword = request.args.get("q", "")
        role = request.args.get("role", "")

        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            SELECT UserID, Username, Email, Role, CreatedDate
            FROM Users
            WHERE (Username LIKE ? OR Email LIKE ?)
        """
        params = [f"%{keyword}%", f"%{keyword}%"]

        if role:
            query += " AND Role = ?"
            params.append(role)

        query += " ORDER BY CreatedDate DESC"

        cursor.execute(query, params)
        columns = [col[0] for col in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        for r in results:
            if r.get("CreatedDate"):
                r["CreatedDate"] = r["CreatedDate"].strftime("%d/%m/%Y")

        conn.close()
        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# GET USER STATS (cho dashboard)
# =========================
@admin_user_bp.route("/stats/summary", methods=["GET"])
def get_user_stats():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                COUNT(*) AS TotalUsers,
                SUM(CASE WHEN Role = 'Admin' THEN 1 ELSE 0 END) AS TotalAdmins,
                SUM(CASE WHEN CAST(CreatedDate AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS NewToday
            FROM Users
        """)

        row = cursor.fetchone()
        columns = [col[0] for col in cursor.description]
        stats = dict(zip(columns, row))

        conn.close()
        return jsonify(stats)

    except Exception as e:
        return jsonify({"error": str(e)}), 500