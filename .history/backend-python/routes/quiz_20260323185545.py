# routes/quiz.py
from flask import Blueprint, jsonify, request
from db import get_db_connection

quiz_bp = Blueprint("quiz", __name__)


# =========================
# GET ALL QUESTIONS
# (kèm tên Word, CategoryName, số options)
# =========================
@quiz_bp.route("/", methods=["GET"])
def get_all_questions():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                q.QuestionID,
                q.QuestionText,
                q.WordID,
                v.Word,
                c.CategoryID,
                c.CategoryName,
                (SELECT COUNT(*) FROM QuizOptions o WHERE o.QuestionID = q.QuestionID) AS OptionCount
            FROM QuizQuestions q
            LEFT JOIN Vocabulary v ON v.WordID = q.WordID
            LEFT JOIN Categories c ON c.CategoryID = v.CategoryID
            ORDER BY q.QuestionID DESC
        """)

        columns = [col[0] for col in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# GET SINGLE QUESTION + OPTIONS
# =========================
@quiz_bp.route("/<int:question_id>", methods=["GET"])
def get_question(question_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Câu hỏi
        cursor.execute("""
            SELECT q.QuestionID, q.QuestionText, q.WordID, v.Word, c.CategoryName
            FROM QuizQuestions q
            LEFT JOIN Vocabulary v ON v.WordID = q.WordID
            LEFT JOIN Categories c ON c.CategoryID = v.CategoryID
            WHERE q.QuestionID = ?
        """, (question_id,))

        row = cursor.fetchone()
        if not row:
            conn.close()
            return jsonify({"error": "Not found"}), 404

        cols = [col[0] for col in cursor.description]
        question = dict(zip(cols, row))

        # Options
        cursor.execute("""
            SELECT OptionID, OptionText, IsCorrect
            FROM QuizOptions
            WHERE QuestionID = ?
            ORDER BY OptionID
        """, (question_id,))

        opt_cols = [col[0] for col in cursor.description]
        question["options"] = [dict(zip(opt_cols, r)) for r in cursor.fetchall()]

        conn.close()
        return jsonify(question)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# CREATE QUESTION + OPTIONS
# Body: { WordID, QuestionText, options: [{OptionText, IsCorrect}] }
# =========================
@quiz_bp.route("/", methods=["POST"])
def create_question():
    try:
        data = request.json
        word_id  = data.get("WordID")
        q_text   = data.get("QuestionText", "").strip()
        options  = data.get("options", [])

        if not word_id or not q_text:
            return jsonify({"error": "WordID và QuestionText là bắt buộc"}), 400
        if len(options) < 2:
            return jsonify({"error": "Cần ít nhất 2 options"}), 400
        if not any(o.get("IsCorrect") for o in options):
            return jsonify({"error": "Phải có ít nhất 1 đáp án đúng"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert câu hỏi
        cursor.execute("""
            INSERT INTO QuizQuestions (WordID, QuestionText)
            OUTPUT INSERTED.QuestionID
            VALUES (?, ?)
        """, (word_id, q_text))

        question_id = cursor.fetchone()[0]

        # Insert options
        for opt in options:
            cursor.execute("""
                INSERT INTO QuizOptions (QuestionID, OptionText, IsCorrect)
                VALUES (?, ?, ?)
            """, (
                question_id,
                opt.get("OptionText", "").strip(),
                1 if opt.get("IsCorrect") else 0
            ))

        conn.commit()
        conn.close()
        return jsonify({"message": "Tạo câu hỏi thành công", "QuestionID": question_id})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# UPDATE QUESTION + OPTIONS
# Body: { WordID, QuestionText, options: [{OptionID (nếu có), OptionText, IsCorrect}] }
# =========================
@quiz_bp.route("/<int:question_id>", methods=["PUT"])
def update_question(question_id):
    try:
        data    = request.json
        word_id = data.get("WordID")
        q_text  = data.get("QuestionText", "").strip()
        options = data.get("options", [])

        if not word_id or not q_text:
            return jsonify({"error": "WordID và QuestionText là bắt buộc"}), 400
        if len(options) < 2:
            return jsonify({"error": "Cần ít nhất 2 options"}), 400
        if not any(o.get("IsCorrect") for o in options):
            return jsonify({"error": "Phải có ít nhất 1 đáp án đúng"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Update câu hỏi
        cursor.execute("""
            UPDATE QuizQuestions
            SET WordID = ?, QuestionText = ?
            WHERE QuestionID = ?
        """, (word_id, q_text, question_id))

        # Xóa options cũ rồi insert lại (đơn giản & chắc chắn)
        cursor.execute("DELETE FROM QuizOptions WHERE QuestionID = ?", (question_id,))

        for opt in options:
            cursor.execute("""
                INSERT INTO QuizOptions (QuestionID, OptionText, IsCorrect)
                VALUES (?, ?, ?)
            """, (
                question_id,
                opt.get("OptionText", "").strip(),
                1 if opt.get("IsCorrect") else 0
            ))

        conn.commit()
        conn.close()
        return jsonify({"message": "Cập nhật thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# DELETE QUESTION (cascade options)
# =========================
@quiz_bp.route("/<int:question_id>", methods=["DELETE"])
def delete_question(question_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM QuizOptions   WHERE QuestionID = ?", (question_id,))
        cursor.execute("DELETE FROM QuizQuestions WHERE QuestionID = ?", (question_id,))

        conn.commit()
        conn.close()
        return jsonify({"message": "Xóa thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# GET VOCAB LIST (để chọn khi tạo câu hỏi)
# =========================
@quiz_bp.route("/vocabulary", methods=["GET"])
def get_vocab_list():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT v.WordID, v.Word, v.Meaning, c.CategoryName
            FROM Vocabulary v
            LEFT JOIN Categories c ON c.CategoryID = v.CategoryID
            ORDER BY v.Word
        """)

        cols = [col[0] for col in cursor.description]
        data = [dict(zip(cols, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# GET CATEGORIES (để filter)
# =========================
@quiz_bp.route("/categories", methods=["GET"])
def get_categories():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT CategoryID, CategoryName FROM Categories ORDER BY CategoryName")
        cols = [col[0] for col in cursor.description]
        data = [dict(zip(cols, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500