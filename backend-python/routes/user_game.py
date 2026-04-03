from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from db import get_db_connection

user_game_bp = Blueprint("user_game", __name__)


# POST /api/user/game/score
# Body: { user_id, score }
# Ghi điểm game vào UserLearning với word_id = NULL (game chung)
# Vì UserLearning yêu cầu WordID NOT NULL, ta dùng WordID = 0 hoặc
# lưu vào một từ đặc biệt. Giải pháp đơn giản: dùng WordID của từ đầu tiên
# hoặc thêm cột nullable. Ở đây ta lưu WordID = 1 như placeholder.
@user_game_bp.route("/game/score", methods=["POST", "OPTIONS"])
@cross_origin()
def save_game_score():
    data = request.json
    user_id = data.get("user_id")
    score = data.get("score")

    if not all([user_id, score is not None]):
        return jsonify({"error": "Thiếu dữ liệu"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Lấy WordID đầu tiên tồn tại để dùng làm placeholder cho game score
    cursor.execute("SELECT TOP 1 WordID FROM Vocabulary ORDER BY WordID")
    row = cursor.fetchone()
    placeholder_word_id = row[0] if row else 1

    cursor.execute("""
        INSERT INTO UserLearning (UserID, WordID, Score, LearnDate)
        VALUES (?, ?, ?, GETDATE())
    """, (user_id, placeholder_word_id, score))

    conn.commit()
    conn.close()

    return jsonify({"message": "Lưu điểm game thành công"})


# GET /api/user/game/leaderboard
# Bảng xếp hạng: tổng điểm cao nhất mỗi user
@user_game_bp.route("/game/leaderboard", methods=["GET"])
@cross_origin()
def get_leaderboard():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT TOP 10
            u.UserID,
            u.Username,
            SUM(ul.Score) AS TotalScore
        FROM UserLearning ul
        JOIN Users u ON ul.UserID = u.UserID
        WHERE ul.Score IS NOT NULL
        GROUP BY u.UserID, u.Username
        ORDER BY TotalScore DESC
    """)

    rows = cursor.fetchall()
    conn.close()

    return jsonify([{
        "UserID": r[0],
        "Username": r[1],
        "TotalScore": r[2]
    } for r in rows])