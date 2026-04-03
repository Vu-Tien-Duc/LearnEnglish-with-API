from flask import Blueprint, jsonify
from db import get_connection
import jwt
import os
from functools import wraps
from flask import request

home_bp = Blueprint("home", __name__)

# ── decorator lấy user từ token ──────────────────────────────────────────────
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Token missing"}), 401

        try:
            data = jwt.decode(token, os.getenv("JWT_SECRET", "secret"), algorithms=["HS256"])
            kwargs["user_id"] = data["UserID"]
            kwargs["username"] = data["Username"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except Exception:
            return jsonify({"error": "Token invalid"}), 401

        return f(*args, **kwargs)
    return decorated


# ── GET /api/home/stats ──────────────────────────────────────────────────────
@home_bp.route("/home/stats", methods=["GET"])
@token_required
def home_stats(user_id, username):
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Tổng số từ toàn hệ thống
    cursor.execute("SELECT COUNT(*) FROM Vocabulary")
    total_words = cursor.fetchone()[0]

    # 2. Số từ Mastered của user
    cursor.execute("""
        SELECT COUNT(*) FROM LearningProgress
        WHERE UserID = ? AND Status = 'Mastered'
    """, (user_id,))
    mastered = cursor.fetchone()[0]

    # 3. Tiến độ %
    progress = round(mastered * 100.0 / total_words) if total_words > 0 else 0

    # 4. Điểm quiz TB (AVG of per-lesson avg scores)
    cursor.execute("""
        SELECT AVG(LessonScore)
        FROM (
            SELECT
                ul.UserID,
                v.LessonID,
                AVG(CAST(ul.Score AS FLOAT)) AS LessonScore
            FROM UserLearning ul
            JOIN Vocabulary v ON ul.WordID = v.WordID
            WHERE ul.Score IS NOT NULL AND ul.UserID = ?
            GROUP BY ul.UserID, v.LessonID
        ) s
    """, (user_id,))
    row = cursor.fetchone()
    avg_score = round(row[0]) if row and row[0] is not None else 0

    # 5. Số từ yêu thích
    cursor.execute("""
        SELECT COUNT(*) FROM FavoriteWords WHERE UserID = ?
    """, (user_id,))
    favorite_count = cursor.fetchone()[0]

    cursor.close()
    conn.close()

    return jsonify({
        "username": username,
        "progress": progress,          # % Mastered / tổng từ
        "avg_score": avg_score,        # điểm quiz TB
        "favorite_count": favorite_count
    })