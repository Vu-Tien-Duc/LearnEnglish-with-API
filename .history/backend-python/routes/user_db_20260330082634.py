from flask import Blueprint, request, jsonify
from db import get_db_connection

user_bp = Blueprint("user", __name__)


# ============================================================
# HELPER
# ============================================================
def get_user_id_from_request():
    """Lấy UserID từ header hoặc query param (tuỳ auth setup của bạn)."""
    uid = request.headers.get("X-User-ID") or request.args.get("user_id")
    return int(uid) if uid else None


# ============================================================
# 1. LESSONS — dùng chung cho cả Flashcard và Quiz
# ============================================================
@user_bp.route("/lessons", methods=["GET"])
def get_lessons():
    """
    GET /user/lessons
    Trả về danh sách lesson kèm số từ và số câu quiz.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                l.LessonID,
                l.LessonName,
                c.CategoryName,
                COUNT(DISTINCT v.WordID)  AS WordCount,
                COUNT(DISTINCT q.QuestionID) AS QuizCount
            FROM Lessons l
            LEFT JOIN Categories c  ON l.CategoryID   = c.CategoryID
            LEFT JOIN Vocabulary v  ON v.LessonID      = l.LessonID
            LEFT JOIN QuizQuestions q ON q.LessonID    = l.LessonID
            GROUP BY l.LessonID, l.LessonName, c.CategoryName
            ORDER BY l.LessonName
        """)
        cols = [c[0] for c in cursor.description]
        data = [dict(zip(cols, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
# 2. FLASHCARD
# ============================================================
@user_bp.route("/flashcard/<int:lesson_id>", methods=["GET"])
def get_flashcard(lesson_id):
    """
    GET /user/flashcard/<lesson_id>?user_id=<uid>
    Trả về tất cả thẻ trong lesson kèm trạng thái học của user.
    """
    user_id = get_user_id_from_request()
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                v.WordID, v.Word, v.Meaning, v.ImageURL,
                p.IPA, p.AudioURL, p.Accent,
                e.ExampleSentence, e.Translation,
                lp.Status,
                CASE WHEN fw.WordID IS NOT NULL THEN 1 ELSE 0 END AS IsFavorite
            FROM Vocabulary v
            LEFT JOIN Pronunciations p  ON p.WordID = v.WordID
            LEFT JOIN Examples e        ON e.WordID = v.WordID
            LEFT JOIN LearningProgress lp
                ON lp.WordID = v.WordID AND lp.UserID = ?
            LEFT JOIN FavoriteWords fw
                ON fw.WordID = v.WordID AND fw.UserID = ?
            WHERE v.LessonID = ?
            ORDER BY v.WordID
        """, (user_id, user_id, lesson_id))

        cols = [c[0] for c in cursor.description]
        cards = [dict(zip(cols, row)) for row in cursor.fetchall()]

        # Mặc định Status = 'New' nếu chưa học
        for card in cards:
            if not card["Status"]:
                card["Status"] = "New"

        conn.close()
        return jsonify(cards)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_bp.route("/flashcard/status", methods=["POST"])
def update_flashcard_status():
    """
    POST /user/flashcard/status
    Body: { user_id, word_id, status }   status = 'Learning' | 'Mastered'
    Upsert vào LearningProgress.
    """
    try:
        data    = request.json
        user_id = data["user_id"]
        word_id = data["word_id"]
        status  = data["status"]   # 'Learning' | 'Mastered'

        conn   = get_db_connection()
        cursor = conn.cursor()

        # UPSERT — SQL Server MERGE
        cursor.execute("""
            MERGE LearningProgress AS target
            USING (SELECT ? AS UserID, ? AS WordID) AS src
                ON target.UserID = src.UserID AND target.WordID = src.WordID
            WHEN MATCHED THEN
                UPDATE SET Status = ?, LastReviewed = GETDATE()
            WHEN NOT MATCHED THEN
                INSERT (UserID, WordID, Status, LastReviewed)
                VALUES (?, ?, ?, GETDATE());
        """, (user_id, word_id, status, user_id, word_id, status))

        conn.commit()
        conn.close()
        return jsonify({"message": "OK"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
# 3. QUIZ
# ============================================================
@user_bp.route("/quiz/<int:lesson_id>", methods=["GET"])
def get_quiz(lesson_id):
    """
    GET /user/quiz/<lesson_id>
    Trả về toàn bộ câu hỏi + options của lesson (frontend tự shuffle/giới hạn 10).
    """
    try:
        conn   = get_db_connection()
        cursor = conn.cursor()

        # Lấy câu hỏi
        cursor.execute("""
            SELECT q.QuestionID, q.WordID, q.QuestionText, v.Word
            FROM QuizQuestions q
            JOIN Vocabulary v ON v.WordID = q.WordID
            WHERE q.LessonID = ?
            ORDER BY NEWID()
        """, (lesson_id,))
        cols      = [c[0] for c in cursor.description]
        questions = [dict(zip(cols, row)) for row in cursor.fetchall()]

        if not questions:
            conn.close()
            return jsonify([])

        # Lấy options cho tất cả câu hỏi
        qids = tuple(q["QuestionID"] for q in questions)
        placeholders = ",".join(["?"] * len(qids))
        cursor.execute(f"""
            SELECT OptionID, QuestionID, OptionText, IsCorrect
            FROM QuizOptions
            WHERE QuestionID IN ({placeholders})
        """, qids)
        opts_cols = [c[0] for c in cursor.description]
        all_opts  = [dict(zip(opts_cols, row)) for row in cursor.fetchall()]

        # Gắn options vào question
        opts_map = {}
        for opt in all_opts:
            opts_map.setdefault(opt["QuestionID"], []).append(opt)

        for q in questions:
            q["Options"] = opts_map.get(q["QuestionID"], [])

        conn.close()
        return jsonify(questions)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_bp.route("/quiz/score", methods=["POST"])
def save_quiz_score():
    """
    POST /user/quiz/score
    Body: { user_id, word_id, attempt }   attempt = số lần thử (1,2,3,4+)
    Tính điểm theo rule:
        lần 1 = 100, lần 2 = 75, lần 3 = 50, lần 4+ = 25
    Thêm row mới vào UserLearning.
    """
    try:
        data    = request.json
        user_id = data["user_id"]
        word_id = data["word_id"]
        attempt = int(data.get("attempt", 1))

        # Tính điểm
        score_map = {1: 100, 2: 75, 3: 50}
        score     = score_map.get(attempt, 25)

        conn   = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO UserLearning (UserID, WordID, Score, LearnDate)
            VALUES (?, ?, ?, GETDATE())
        """, (user_id, word_id, score))
        conn.commit()
        conn.close()
        return jsonify({"message": "Saved", "score": score})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_bp.route("/quiz/result/<int:user_id>/<int:lesson_id>", methods=["GET"])
def get_quiz_result(user_id, lesson_id):
    """
    GET /user/quiz/result/<user_id>/<lesson_id>
    Trả về điểm TB của lesson (dùng công thức AvgScore đã cho).
    """
    try:
        conn   = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                COUNT(DISTINCT ul.WordID)       AS WordsDone,
                AVG(CAST(ul.Score AS FLOAT))    AS AvgScoreRaw,
                MAX(ul.LearnDate)               AS LastDate
            FROM UserLearning ul
            JOIN Vocabulary v ON v.WordID = ul.WordID
            WHERE ul.UserID = ? AND v.LessonID = ?
        """, (user_id, lesson_id))
        row  = cursor.fetchone()
        cols = [c[0] for c in cursor.description]
        result = dict(zip(cols, row)) if row else {}
        conn.close()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
# 4. YÊU THÍCH
# ============================================================
@user_bp.route("/favorites/<int:user_id>", methods=["GET"])
def get_favorites(user_id):
    """GET /user/favorites/<user_id>"""
    try:
        conn   = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT v.WordID, v.Word, v.Meaning, v.ImageURL,
                   p.IPA, p.Accent, c.CategoryName, l.LessonName
            FROM FavoriteWords fw
            JOIN Vocabulary v   ON v.WordID    = fw.WordID
            LEFT JOIN Pronunciations p ON p.WordID = v.WordID
            LEFT JOIN Categories c     ON c.CategoryID = v.CategoryID
            LEFT JOIN Lessons l        ON l.LessonID   = v.LessonID
            WHERE fw.UserID = ?
            ORDER BY fw.FavoriteID DESC
        """, (user_id,))
        cols = [c[0] for c in cursor.description]
        data = [dict(zip(cols, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_bp.route("/favorites/toggle", methods=["POST"])
def toggle_favorite():
    """
    POST /user/favorites/toggle
    Body: { user_id, word_id }
    Thêm nếu chưa có, xóa nếu đã có. Trả về { is_favorite: bool }
    """
    try:
        data    = request.json
        user_id = data["user_id"]
        word_id = data["word_id"]

        conn   = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT FavoriteID FROM FavoriteWords WHERE UserID=? AND WordID=?",
            (user_id, word_id)
        )
        existing = cursor.fetchone()

        if existing:
            cursor.execute(
                "DELETE FROM FavoriteWords WHERE UserID=? AND WordID=?",
                (user_id, word_id)
            )
            is_favorite = False
        else:
            cursor.execute(
                "INSERT INTO FavoriteWords (UserID, WordID) VALUES (?,?)",
                (user_id, word_id)
            )
            is_favorite = True

        conn.commit()
        conn.close()
        return jsonify({"is_favorite": is_favorite})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
# 5. LỊCH SỬ & THỐNG KÊ
# ============================================================
@user_bp.route("/history/<int:user_id>", methods=["GET"])
def get_history(user_id):
    """
    GET /user/history/<user_id>
    Trả về:
      - Danh sách bài học gần nhất kèm điểm TB
      - Tổng tiến độ (% Mastered)
      - AvgScore toàn bộ (công thức đã cho)
    """
    try:
        conn   = get_db_connection()
        cursor = conn.cursor()

        # ── Lịch sử theo lesson (mỗi lesson 1 dòng, lấy lần học gần nhất) ──
        cursor.execute("""
            SELECT
                l.LessonID,
                l.LessonName,
                c.CategoryName,
                COUNT(DISTINCT ul.WordID)        AS WordsDone,
                AVG(CAST(ul.Score AS FLOAT))     AS AvgScore,
                MAX(ul.LearnDate)                AS LastDate
            FROM UserLearning ul
            JOIN Vocabulary v ON v.WordID   = ul.WordID
            JOIN Lessons l    ON l.LessonID = v.LessonID
            LEFT JOIN Categories c ON c.CategoryID = l.CategoryID
            WHERE ul.UserID = ?
            GROUP BY l.LessonID, l.LessonName, c.CategoryName
            ORDER BY MAX(ul.LearnDate) DESC
        """, (user_id,))
        cols    = [c[0] for c in cursor.description]
        lessons = [dict(zip(cols, row)) for row in cursor.fetchall()]

        # ── Tiến độ từ vựng (% Mastered) ──
        cursor.execute("""
            SELECT
                COUNT(*)                                        AS Total,
                SUM(CASE WHEN Status='Mastered' THEN 1 ELSE 0 END) AS Mastered,
                SUM(CASE WHEN Status='Learning' THEN 1 ELSE 0 END) AS Learning
            FROM LearningProgress
            WHERE UserID = ?
        """, (user_id,))
        prog_row  = cursor.fetchone()
        prog_cols = [c[0] for c in cursor.description]
        progress  = dict(zip(prog_cols, prog_row)) if prog_row else {}

        # ── AvgScore toàn bộ theo công thức đã cho ──
        cursor.execute("""
            SELECT AVG(s.LessonScore) AS GlobalAvgScore
            FROM (
                SELECT ul.UserID, v.LessonID, AVG(CAST(ul.Score AS FLOAT)) AS LessonScore
                FROM UserLearning ul
                JOIN Vocabulary v ON ul.WordID = v.WordID
                WHERE ul.Score IS NOT NULL AND ul.UserID = ?
                GROUP BY ul.UserID, v.LessonID
            ) s
        """, (user_id,))
        avg_row = cursor.fetchone()
        global_avg = round(avg_row[0], 1) if avg_row and avg_row[0] else 0

        conn.close()
        return jsonify({
            "lessons":    lessons,
            "progress":   progress,
            "global_avg": global_avg
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500