from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from db import get_db_connection

user_favorites_bp = Blueprint("user_favorites", __name__)

# GET /api/user/favorites
@user_favorites_bp.route("/favorites", methods=["GET", "OPTIONS"])
@cross_origin()
def get_favorites():
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "Thiếu user_id"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Đã thêm v.ImageURL để hiển thị ảnh trên UI
    cursor.execute("""
        SELECT v.WordID, v.Word, v.Meaning, p.IPA, p.AudioURL,
               ISNULL(lp.Status, 'New') AS Status,
               v.ImageURL
        FROM FavoriteWords fw
        JOIN Vocabulary v ON fw.WordID = v.WordID
        LEFT JOIN Pronunciations p ON v.WordID = p.WordID
        LEFT JOIN LearningProgress lp ON v.WordID = lp.WordID AND lp.UserID = ?
        WHERE fw.UserID = ?
        ORDER BY fw.FavoriteID DESC
    """, (user_id, user_id))

    rows = cursor.fetchall()
    conn.close()

    return jsonify([{
        "WordID": r[0],
        "Word": r[1],
        "Meaning": r[2],
        "IPA": r[3],
        "AudioURL": r[4],
        "Status": r[5],
        "ImageURL": r[6]
    } for r in rows])


# POST /api/user/favorites/toggle
@user_favorites_bp.route("/favorites/toggle", methods=["POST", "OPTIONS"])
@cross_origin()
def toggle_favorite():
    data = request.json
    user_id = data.get("user_id")
    word_id = data.get("wordId")

    if not all([user_id, word_id]):
        return jsonify({"error": "Thiếu dữ liệu"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT FavoriteID FROM FavoriteWords WHERE UserID = ? AND WordID = ?
    """, (user_id, word_id))
    existing = cursor.fetchone()

    if existing:
        cursor.execute("""
            DELETE FROM FavoriteWords WHERE UserID = ? AND WordID = ?
        """, (user_id, word_id))
        is_favorite = False
    else:
        cursor.execute("""
            INSERT INTO FavoriteWords (UserID, WordID) VALUES (?, ?)
        """, (user_id, word_id))
        is_favorite = True

    conn.commit()
    conn.close()

    return jsonify({"isFavorite": is_favorite})