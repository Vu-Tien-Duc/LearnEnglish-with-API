from flask import Blueprint, request, jsonify
from db import get_db_connection

quiz_bp = Blueprint("quiz", __name__)

# =========================
# 1. GET ALL QUESTIONS
# =========================
@quiz_bp.route("/", methods=["GET"])
def get_all_questions():
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    SELECT q.QuestionID, q.QuestionText, v.Word
    FROM QuizQuestions q
    JOIN Vocabulary v ON q.WordID = v.WordID
    """
    cursor.execute(query)

    questions = []
    for row in cursor.fetchall():
        questions.append({
            "QuestionID": row[0],
            "QuestionText": row[1],
            "Word": row[2]
        })

    return jsonify(questions)


# =========================
# 2. GET QUESTION DETAIL (kèm options)
# =========================
@quiz_bp.route("/<int:question_id>", methods=["GET"])
def get_question_detail(question_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # lấy câu hỏi
    cursor.execute("""
        SELECT QuestionID, QuestionText
        FROM QuizQuestions
        WHERE QuestionID = ?
    """, (question_id,))
    question = cursor.fetchone()

    if not question:
        return jsonify({"error": "Question not found"}), 404

    # lấy options
    cursor.execute("""
        SELECT OptionID, OptionText, IsCorrect
        FROM QuizOptions
        WHERE QuestionID = ?
    """, (question_id,))

    options = []
    for row in cursor.fetchall():
        options.append({
            "OptionID": row[0],
            "OptionText": row[1],
            "IsCorrect": bool(row[2])
        })

    return jsonify({
        "QuestionID": question[0],
        "QuestionText": question[1],
        "Options": options
    })


# =========================
# 3. CREATE QUESTION + OPTIONS
# =========================
@quiz_bp.route("/", methods=["POST"])
def create_question():
    data = request.json
    word_id = data.get("WordID")
    question_text = data.get("QuestionText")
    options = data.get("Options")  # list

    conn = get_db_connection()
    cursor = conn.cursor()

    # insert question
    cursor.execute("""
        INSERT INTO QuizQuestions (WordID, QuestionText)
        OUTPUT INSERTED.QuestionID
        VALUES (?, ?)
    """, (word_id, question_text))

    question_id = cursor.fetchone()[0]

    # insert options
    for opt in options:
        cursor.execute("""
            INSERT INTO QuizOptions (QuestionID, OptionText, IsCorrect)
            VALUES (?, ?, ?)
        """, (question_id, opt["OptionText"], opt["IsCorrect"]))

    conn.commit()

    return jsonify({"message": "Question created", "QuestionID": question_id})


# =========================
# 4. DELETE QUESTION
# =========================
@quiz_bp.route("/<int:question_id>", methods=["DELETE"])
def delete_question(question_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # xóa options trước
    cursor.execute("DELETE FROM QuizOptions WHERE QuestionID = ?", (question_id,))
    # xóa question
    cursor.execute("DELETE FROM QuizQuestions WHERE QuestionID = ?", (question_id,))

    conn.commit()

    return jsonify({"message": "Deleted successfully"})


# =========================
# 5. RANDOM QUIZ (USER)
# =========================
@quiz_bp.route("/random", methods=["GET"])
def get_random_quiz():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT TOP 10 QuestionID, QuestionText
        FROM QuizQuestions
        ORDER BY NEWID()
    """)

    questions = []

    for q in cursor.fetchall():
        question_id = q[0]

        # lấy options
        cursor.execute("""
            SELECT OptionID, OptionText
            FROM QuizOptions
            WHERE QuestionID = ?
        """, (question_id,))

        options = []
        for opt in cursor.fetchall():
            options.append({
                "OptionID": opt[0],
                "OptionText": opt[1]
            })

        questions.append({
            "QuestionID": question_id,
            "QuestionText": q[1],
            "Options": options
        })

    return jsonify(questions)