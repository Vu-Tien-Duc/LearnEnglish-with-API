from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from db import get_db_connection

user_vocab_bp = Blueprint("user_vocab", __name__)

# GET /api/user/lessons
# Trả về danh sách các bài học kèm số lượng từ vựng bên trong
@user_vocab_bp.route("/lessons", methods=["GET", "OPTIONS"])
@cross_origin()
def get_lessons():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Lấy danh sách Lesson, Category và đếm tổng số từ vựng trong Lesson đó
    cursor.execute("""
        SELECT 
            l.LessonID, 
            l.LessonName, 
            c.CategoryName, 
            COUNT(v.WordID) as TotalWords
        FROM Lessons l
        LEFT JOIN Categories c ON l.CategoryID = c.CategoryID
        LEFT JOIN Vocabulary v ON l.LessonID = v.LessonID
        GROUP BY l.LessonID, l.LessonName, c.CategoryName
        HAVING COUNT(v.WordID) > 0  -- Chỉ lấy những bài học đã có từ vựng
    """)
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        result.append({
            "LessonID": r[0],
            "LessonName": r[1],
            "CategoryName": r[2],
            "TotalWords": r[3]
        })

    return jsonify(result)

# GET /api/user/vocabulary?user_id=2&lesson_id=1
# Trả về danh sách từ kèm trạng thái học (New/Learning/Mastered) và IPA, ví dụ
@user_vocab_bp.route("/vocabulary", methods=["GET"])
@cross_origin()
def get_vocabulary():
    user_id = request.args.get("user_id", type=int)
    lesson_id = request.args.get("lesson_id", type=int)

    if not user_id:
        return jsonify({"error": "Thiếu user_id"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT
            v.WordID,
            v.Word,
            v.Meaning,
            v.ImageURL,
            v.LessonID,
            c.CategoryName,
            p.IPA,
            p.AudioURL,
            p.Accent,
            e.ExampleSentence,
            e.Translation,
            ISNULL(lp.Status, 'New') AS Status,
            CASE WHEN fw.FavoriteID IS NOT NULL THEN 1 ELSE 0 END AS IsFavorite
        FROM Vocabulary v
        LEFT JOIN Categories c ON v.CategoryID = c.CategoryID
        LEFT JOIN Pronunciations p ON v.WordID = p.WordID
        LEFT JOIN Examples e ON v.WordID = e.WordID
        LEFT JOIN LearningProgress lp ON v.WordID = lp.WordID AND lp.UserID = ?
        LEFT JOIN FavoriteWords fw ON v.WordID = fw.WordID AND fw.UserID = ?
    """
    params = [user_id, user_id]

    if lesson_id:
        query += " WHERE v.LessonID = ?"
        params.append(lesson_id)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        result.append({
            "WordID": r[0],
            "Word": r[1],
            "Meaning": r[2],
            "ImageURL": r[3],
            "LessonID": r[4],
            "CategoryName": r[5],
            "IPA": r[6],
            "AudioURL": r[7],
            "Accent": r[8],
            "ExampleSentence": r[9],
            "Translation": r[10],
            "Status": r[11],
            "IsFavorite": bool(r[12])
        })

    return jsonify(result)

# POST /api/user/progress/update
# Body: { user_id, wordId, status }   status = "New" | "Learning" | "Mastered"
@user_vocab_bp.route("/progress/update", methods=["POST", "OPTIONS"])
@cross_origin()
def update_progress():
    data = request.json
    user_id = data.get("user_id")
    word_id = data.get("wordId")
    status = data.get("status")

    if not all([user_id, word_id, status]):
        return jsonify({"error": "Thiếu dữ liệu"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Đã sửa lại đúng 7 tham số truyền vào tương ứng với 7 dấu ?
    cursor.execute("""
        IF EXISTS (
            SELECT 1 FROM LearningProgress WHERE UserID = ? AND WordID = ?
        )
            UPDATE LearningProgress
            SET Status = ?, LastReviewed = GETDATE()
            WHERE UserID = ? AND WordID = ?
        ELSE
            INSERT INTO LearningProgress (UserID, WordID, Status, LastReviewed)
            VALUES (?, ?, ?, GETDATE())
    """, (user_id, word_id, status, user_id, word_id, user_id, word_id, status))

    conn.commit()
    conn.close()

    return jsonify({"message": "Cập nhật thành công", "status": status})