# routes/admin_lesson.py
from flask import Blueprint, jsonify, request
from db import get_db_connection

admin_lesson_bp = Blueprint("admin_lesson", __name__)


# =========================
# GET ALL LESSONS
# (kèm CategoryName, số từ vựng thuộc lesson)
# =========================
@admin_lesson_bp.route("/", methods=["GET"])
def get_all_lessons():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                l.LessonID,
                l.LessonName,
                l.CategoryID,
                c.CategoryName,
                l.CreatedDate,
                (SELECT COUNT(*) FROM Vocabulary v WHERE v.LessonID = l.LessonID) AS WordCount
            FROM Lessons l
            LEFT JOIN Categories c ON c.CategoryID = l.CategoryID
            ORDER BY l.LessonID DESC
        """)

        cols = [col[0] for col in cursor.description]
        data = [dict(zip(cols, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# GET SINGLE LESSON
# =========================
@admin_lesson_bp.route("/<int:lesson_id>", methods=["GET"])
def get_lesson(lesson_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                l.LessonID, l.LessonName, l.CategoryID,
                c.CategoryName, l.CreatedDate,
                (SELECT COUNT(*) FROM Vocabulary v WHERE v.LessonID = l.LessonID) AS WordCount
            FROM Lessons l
            LEFT JOIN Categories c ON c.CategoryID = l.CategoryID
            WHERE l.LessonID = ?
        """, (lesson_id,))

        row = cursor.fetchone()
        if not row:
            conn.close()
            return jsonify({"error": "Not found"}), 404

        cols = [col[0] for col in cursor.description]
        lesson = dict(zip(cols, row))
        conn.close()
        return jsonify(lesson)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# CREATE LESSON
# Body: { LessonName, CategoryID }
# =========================
@admin_lesson_bp.route("/", methods=["POST"])
def create_lesson():
    try:
        data = request.json
        name        = data.get("LessonName", "").strip()
        category_id = data.get("CategoryID")

        if not name:
            return jsonify({"error": "LessonName là bắt buộc"}), 400
        if not category_id:
            return jsonify({"error": "CategoryID là bắt buộc"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO Lessons (LessonName, CategoryID)
            OUTPUT INSERTED.LessonID
            VALUES (?, ?)
        """, (name, category_id))

        lesson_id = cursor.fetchone()[0]
        conn.commit()
        conn.close()
        return jsonify({"message": "Tạo lesson thành công", "LessonID": lesson_id})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# UPDATE LESSON
# Body: { LessonName, CategoryID }
# =========================
@admin_lesson_bp.route("/<int:lesson_id>", methods=["PUT"])
def update_lesson(lesson_id):
    try:
        data = request.json
        name        = data.get("LessonName", "").strip()
        category_id = data.get("CategoryID")

        if not name:
            return jsonify({"error": "LessonName là bắt buộc"}), 400
        if not category_id:
            return jsonify({"error": "CategoryID là bắt buộc"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE Lessons
            SET LessonName = ?, CategoryID = ?
            WHERE LessonID = ?
        """, (name, category_id, lesson_id))

        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "Lesson không tồn tại"}), 404

        conn.commit()
        conn.close()
        return jsonify({"message": "Cập nhật thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# DELETE LESSON
# Xóa lesson — từ vựng sẽ được set LessonID = NULL
# =========================
@admin_lesson_bp.route("/<int:lesson_id>", methods=["DELETE"])
def delete_lesson(lesson_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Nullify LessonID trong Vocabulary và QuizQuestions trước
        cursor.execute("UPDATE Vocabulary      SET LessonID = NULL WHERE LessonID = ?", (lesson_id,))
        cursor.execute("UPDATE QuizQuestions   SET LessonID = NULL WHERE LessonID = ?", (lesson_id,))
        cursor.execute("DELETE FROM Lessons WHERE LessonID = ?", (lesson_id,))

        conn.commit()
        conn.close()
        return jsonify({"message": "Xóa lesson thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# GET CATEGORIES (để chọn khi tạo/sửa lesson)
# =========================
@admin_lesson_bp.route("/categories", methods=["GET"])
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


# =========================
# GET WORDS THUỘC LESSON (để xem chi tiết)
# =========================
@admin_lesson_bp.route("/<int:lesson_id>/words", methods=["GET"])
def get_lesson_words(lesson_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                v.WordID, v.Word, v.Meaning, v.DifficultyLevel,
                p.IPA, p.Accent
            FROM Vocabulary v
            LEFT JOIN Pronunciations p ON p.WordID = v.WordID
            WHERE v.LessonID = ?
            ORDER BY v.Word
        """, (lesson_id,))

        cols = [col[0] for col in cursor.description]
        data = [dict(zip(cols, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500