# routes/admin_favorite_words.py
from flask import Blueprint, jsonify, request
from db import get_db_connection

admin_favorite_bp = Blueprint("admin_favorite", __name__)


# =========================
# GET ALL FAVORITES
# (kèm thông tin User, Word, Category)
# =========================
@admin_favorite_bp.route("/", methods=["GET"])
def get_all_favorites():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                fw.FavoriteID,
                fw.UserID,
                u.Username,
                u.Email,
                fw.WordID,
                v.Word,
                v.Meaning,
                v.DifficultyLevel,
                c.CategoryID,
                c.CategoryName,
                l.LessonID,
                l.LessonName
            FROM FavoriteWords fw
            JOIN Users     u ON u.UserID    = fw.UserID
            JOIN Vocabulary v ON v.WordID   = fw.WordID
            LEFT JOIN Categories c ON c.CategoryID = v.CategoryID
            LEFT JOIN Lessons     l ON l.LessonID   = v.LessonID
            ORDER BY fw.FavoriteID DESC
        """)

        cols = [col[0] for col in cursor.description]
        data = [dict(zip(cols, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# GET FAVORITES BY USER
# =========================
@admin_favorite_bp.route("/user/<int:user_id>", methods=["GET"])
def get_favorites_by_user(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                fw.FavoriteID,
                fw.WordID,
                v.Word,
                v.Meaning,
                v.DifficultyLevel,
                c.CategoryName,
                l.LessonName,
                p.IPA,
                p.Accent
            FROM FavoriteWords fw
            JOIN Vocabulary v ON v.WordID = fw.WordID
            LEFT JOIN Categories c  ON c.CategoryID = v.CategoryID
            LEFT JOIN Lessons     l  ON l.LessonID   = v.LessonID
            LEFT JOIN Pronunciations p ON p.WordID   = v.WordID
            WHERE fw.UserID = ?
            ORDER BY v.Word
        """, (user_id,))

        cols = [col[0] for col in cursor.description]
        data = [dict(zip(cols, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# DELETE FAVORITE (admin xóa 1 bản ghi)
# =========================
@admin_favorite_bp.route("/<int:favorite_id>", methods=["DELETE"])
def delete_favorite(favorite_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM FavoriteWords WHERE FavoriteID = ?", (favorite_id,))

        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "Không tìm thấy bản ghi"}), 404

        conn.commit()
        conn.close()
        return jsonify({"message": "Đã xóa khỏi danh sách yêu thích"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# DELETE ALL FAVORITES OF A USER (admin xóa toàn bộ của 1 user)
# =========================
@admin_favorite_bp.route("/user/<int:user_id>/clear", methods=["DELETE"])
def clear_user_favorites(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM FavoriteWords WHERE UserID = ?", (user_id,))
        deleted = cursor.rowcount

        conn.commit()
        conn.close()
        return jsonify({"message": f"Đã xóa {deleted} từ yêu thích của user {user_id}"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# GET STATS: top từ được yêu thích nhiều nhất
# =========================
@admin_favorite_bp.route("/stats/top-words", methods=["GET"])
def top_favorite_words():
    try:
        limit = request.args.get("limit", 10, type=int)
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT TOP (?)
                v.WordID,
                v.Word,
                v.Meaning,
                c.CategoryName,
                COUNT(fw.FavoriteID) AS FavoriteCount
            FROM FavoriteWords fw
            JOIN Vocabulary  v ON v.WordID     = fw.WordID
            LEFT JOIN Categories c ON c.CategoryID = v.CategoryID
            GROUP BY v.WordID, v.Word, v.Meaning, c.CategoryName
            ORDER BY FavoriteCount DESC
        """, (limit,))

        cols = [col[0] for col in cursor.description]
        data = [dict(zip(cols, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# GET STATS: số từ yêu thích theo từng user
# =========================
@admin_favorite_bp.route("/stats/by-user", methods=["GET"])
def favorites_by_user_stats():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                u.UserID,
                u.Username,
                u.Email,
                COUNT(fw.FavoriteID) AS FavoriteCount
            FROM Users u
            LEFT JOIN FavoriteWords fw ON fw.UserID = u.UserID
            GROUP BY u.UserID, u.Username, u.Email
            ORDER BY FavoriteCount DESC
        """)

        cols = [col[0] for col in cursor.description]
        data = [dict(zip(cols, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# GET ALL USERS (để filter)
# =========================
@admin_favorite_bp.route("/users", methods=["GET"])
def get_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT UserID, Username, Email FROM Users ORDER BY Username")
        cols = [col[0] for col in cursor.description]
        data = [dict(zip(cols, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500