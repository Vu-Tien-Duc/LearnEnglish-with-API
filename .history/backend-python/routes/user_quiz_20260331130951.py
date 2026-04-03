from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from db import get_db_connection

user_quiz_bp = Blueprint("user_quiz", __name__)


# GET /api/user/quiz?lesson_id=1
# Trả về danh sách câu hỏi kèm options cho lesson
@user_quiz_bp.route("/quiz", methods=["GET"])
@cross_origin()
def get_quiz():
    lesson_id = request.args.get("lesson_id", type=int)

    conn = get_db_connection()
    cursor = conn.cursor()

    if lesson_id:
        cursor.execute("""
            SELECT qq.QuestionID, qq.QuestionText, qq.WordID,
                   v.Word, p.AudioURL
            FROM QuizQuestions qq
            JOIN Vocabulary v ON qq.WordID = v.WordID
            LEFT JOIN Pronunciations p ON v.WordID = p.WordID
            WHERE qq.LessonID = ?
        """, (lesson_id,))
    else:
        cursor.execute("""
            SELECT TOP 10 qq.QuestionID, qq.QuestionText, qq.WordID,
                   v.Word, p.AudioURL
            FROM QuizQuestions qq
            JOIN Vocabulary v ON qq.WordID = v.WordID
            LEFT JOIN Pronunciations p ON v.WordID = p.WordID
        """)

    questions = cursor.fetchall()

    result = []
    for q in questions:
        question_id = q[0]

        # Lấy options cho câu hỏi này
        cursor.execute("""
            SELECT OptionID, OptionText, IsCorrect
            FROM QuizOptions
            WHERE QuestionID = ?
        """, (question_id,))
        options = cursor.fetchall()

        result.append({
            "id": question_id,
            "text": q[1],
            "wordId": q[2],
            "word": q[3],
            "audioUrl": q[4],
            "options": [{
                "id": o[0],
                "text": o[1],
                "isCorrect": bool(o[2])
            } for o in options]
        })

    conn.close()
    return jsonify(result)


# POST /api/user/quiz/submit
# Body: { user_id, word_id, score }
# Ghi từng câu trả lời vào UserLearning
@user_quiz_bp.route("/quiz/submit", methods=["POST", "OPTIONS"])
@cross_origin()
def submit_quiz():
    data = request.json
    user_id = data.get("user_id")
    word_id = data.get("word_id")
    score = data.get("score")

    if not all([user_id, word_id, score is not None]):
        return jsonify({"error": "Thiếu dữ liệu"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO UserLearning (UserID, WordID, Score, LearnDate)
        VALUES (?, ?, ?, GETDATE())
    """, (user_id, word_id, score))

    conn.commit()
    conn.close()

    return jsonify({"message": "Lưu điểm thành công"})


# GET /api/user/lessons
# Trả về danh sách lessons kèm tiến độ của user
@user_quiz_bp.route("/lessons", methods=["GET"])
@cross_origin()
def get_lessons():
    user_id = request.args.get("user_id", type=int)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            l.LessonID,
            l.LessonName,
            c.CategoryName,
            COUNT(DISTINCT v.WordID) AS TotalWords,
            COUNT(DISTINCT CASE WHEN lp.Status = 'Mastered' THEN lp.WordID END) AS MasteredWords,
            -- Điểm TB quiz của lesson này
            (
                SELECT AVG(CAST(ul2.Score AS FLOAT))
                FROM UserLearning ul2
                JOIN Vocabulary v2 ON ul2.WordID = v2.WordID
                WHERE ul2.UserID = ? AND v2.LessonID = l.LessonID
                  AND ul2.Score IS NOT NULL
            ) AS AvgScore
        FROM Lessons l
        LEFT JOIN Categories c ON l.CategoryID = c.CategoryID
        LEFT JOIN Vocabulary v ON v.LessonID = l.LessonID
        LEFT JOIN LearningProgress lp ON lp.WordID = v.WordID AND lp.UserID = ?
        GROUP BY l.LessonID, l.LessonName, c.CategoryName
        ORDER BY l.LessonID
    """, (user_id, user_id) if user_id else (0, 0))

    rows = cursor.fetchall()
    conn.close()

    return jsonify([{
        "LessonID": r[0],
        "LessonName": r[1],
        "CategoryName": r[2],
        "TotalWords": r[3],
        "MasteredWords": r[4],
        "AvgScore": round(r[5]) if r[5] else None
    } for r in rows])