from flask import Blueprint, jsonify, request
from db import get_db_connection

home_bp = Blueprint("home", __name__)

@home_bp.route("/home/stats", methods=["GET"])
def home_stats():
    user_id = request.args.get("user_id")  # lấy từ URL

    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Tổng số từ
    cursor.execute("SELECT COUNT(*) FROM Vocabulary")
    total_words = cursor.fetchone()[0]

    # 2. Mastered
    cursor.execute("""
        SELECT COUNT(*) FROM LearningProgress
        WHERE UserID = ? AND Status = 'Mastered'
    """, (user_id,))
    mastered = cursor.fetchone()[0]

    progress = round(mastered * 100.0 / total_words) if total_words > 0 else 0

    # 3. Điểm TB
    cursor.execute("""
        SELECT AVG(LessonScore)
        FROM (
            SELECT v.LessonID, AVG(CAST(ul.Score AS FLOAT)) AS LessonScore
            FROM UserLearning ul
            JOIN Vocabulary v ON ul.WordID = v.WordID
            WHERE ul.Score IS NOT NULL AND ul.UserID = ?
            GROUP BY v.LessonID
        ) s
    """, (user_id,))
    row = cursor.fetchone()
    avg_score = round(row[0]) if row and row[0] is not None else 0

    # 4. Favorite
    cursor.execute("""
        SELECT COUNT(*) FROM FavoriteWords WHERE UserID = ?
    """, (user_id,))
    favorite_count = cursor.fetchone()[0]

    cursor.close()
    conn.close()

    return jsonify({
        "user_id": user_id,
        "progress": progress,
        "avg_score": avg_score,
        "favorite_count": favorite_count
    })