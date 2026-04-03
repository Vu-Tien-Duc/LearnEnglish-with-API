from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from db import get_db_connection

user_history_bp = Blueprint("user_history", __name__)


# GET /api/user/history?user_id=2
# Trả về lịch sử từ UserLearning (quiz score) mới nhất
@user_history_bp.route("/history", methods=["GET"])
@cross_origin()
def get_history():
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "Thiếu user_id"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT TOP 30
            ul.LearningID,
            v.Word,
            v.Meaning,
            l.LessonName,
            ul.Score,
            ul.LearnDate
        FROM UserLearning ul
        JOIN Vocabulary v ON ul.WordID = v.WordID
        LEFT JOIN Lessons l ON v.LessonID = l.LessonID
        WHERE ul.UserID = ?
        ORDER BY ul.LearnDate DESC
    """, (user_id,))

    rows = cursor.fetchall()
    conn.close()

    return jsonify([{
        "LearningID": r[0],
        "Word": r[1],
        "Meaning": r[2],
        "LessonName": r[3],
        "Score": r[4],
        "LearnDate": r[5].isoformat() if r[5] else None
    } for r in rows])