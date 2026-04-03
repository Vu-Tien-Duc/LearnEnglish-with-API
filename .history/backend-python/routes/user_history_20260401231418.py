from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from db import get_db_connection

user_history_bp = Blueprint("user_history", __name__)

# ==========================================
# 1. GET /api/user/history
# CHỈ LẤY LỊCH SỬ FLASHCARD
# ==========================================
@user_history_bp.route("/history", methods=["GET", "OPTIONS"])
@cross_origin()
def get_history():
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "Thiếu user_id"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT TOP 50
            lp.WordID,
            v.Word,
            v.Meaning,
            v.ImageURL,
            lp.LastReviewed AS LearnDate,
            lp.Status
        FROM LearningProgress lp
        JOIN Vocabulary v ON lp.WordID = v.WordID
        WHERE lp.UserID = ?
        ORDER BY lp.LastReviewed DESC
    """, (user_id,))

    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        result.append({
            "WordID": r[0],
            "Word": r[1],
            "Meaning": r[2],
            "ImageURL": r[3],
            "LearnDate": r[4].isoformat() if r[4] else None,
            "Status": r[5]
        })

    return jsonify(result)

# ==========================================
# 2. GET /api/user/history/word
# Lấy chi tiết 1 từ vựng (dùng cho trang SingleWord)
# ==========================================
@user_history_bp.route("/history/word", methods=["GET", "OPTIONS"])
@cross_origin()
def get_single_word():
    user_id = request.args.get("user_id", type=int)
    word_id = request.args.get("word_id", type=int)
    
    if not user_id or not word_id:
        return jsonify({"error": "Thiếu dữ liệu"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            v.WordID, v.Word, v.Meaning, v.ImageURL, v.LessonID, c.CategoryName,
            p.IPA, p.AudioURL, p.Accent, e.ExampleSentence, e.Translation,
            ISNULL(lp.Status, 'New') AS Status,
            CASE WHEN fw.FavoriteID IS NOT NULL THEN 1 ELSE 0 END AS IsFavorite
        FROM Vocabulary v
        LEFT JOIN Categories c ON v.CategoryID = c.CategoryID
        LEFT JOIN Pronunciations p ON v.WordID = p.WordID
        LEFT JOIN Examples e ON v.WordID = e.WordID
        LEFT JOIN LearningProgress lp ON v.WordID = lp.WordID AND lp.UserID = ?
        LEFT JOIN FavoriteWords fw ON v.WordID = fw.WordID AND fw.UserID = ?
        WHERE v.WordID = ?
    """, (user_id, user_id, word_id))

    r = cursor.fetchone()
    conn.close()

    if r:
        return jsonify({
            "WordID": r[0], "Word": r[1], "Meaning": r[2], "ImageURL": r[3],
            "LessonID": r[4], "CategoryName": r[5], "IPA": r[6], "AudioURL": r[7],
            "Accent": r[8], "ExampleSentence": r[9], "Translation": r[10],
            "Status": r[11], "IsFavorite": bool(r[12])
        })
    return jsonify({"error": "Không tìm thấy từ vựng"}), 404