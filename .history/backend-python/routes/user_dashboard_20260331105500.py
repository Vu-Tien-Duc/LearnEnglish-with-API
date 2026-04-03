from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from db import get_db_connection

user_dashboard_bp = Blueprint("user_dashboard", __name__)


# GET /api/user/dashboard-summary?user_id=2
@user_dashboard_bp.route("/dashboard-summary", methods=["GET"])
@cross_origin()
def dashboard_summary():
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "Thiếu user_id"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Tổng từ toàn hệ thống
    cursor.execute("SELECT COUNT(*) FROM Vocabulary")
    total_words = cursor.fetchone()[0]

    # Số từ Mastered
    cursor.execute("""
        SELECT COUNT(*) FROM LearningProgress
        WHERE UserID = ? AND Status = 'Mastered'
    """, (user_id,))
    mastered = cursor.fetchone()[0]

    # Số từ Learning
    cursor.execute("""
        SELECT COUNT(*) FROM LearningProgress
        WHERE UserID = ? AND Status = 'Learning'
    """, (user_id,))
    learning = cursor.fetchone()[0]

    # Số từ yêu thích
    cursor.execute("""
        SELECT COUNT(*) FROM FavoriteWords WHERE UserID = ?
    """, (user_id,))
    total_favorites = cursor.fetchone()[0]

    # Tiến độ %
    completion = round(mastered * 100.0 / total_words) if total_words > 0 else 0

    conn.close()

    return jsonify({
        "TotalWords": total_words,
        "MasteredWords": mastered,
        "LearningWords": learning,
        "TotalFavorites": total_favorites,
        "completionPercentage": completion
    })