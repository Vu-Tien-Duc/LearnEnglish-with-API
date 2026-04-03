from flask import Blueprint, jsonify, request
from db import get_db_connection

admin_learning_progress_bp = Blueprint("admin_learning_progress", __name__)


# =========================
# GET OVERVIEW STATS
# GET /api/admin/learnprogress/overview
# =========================
@admin_learning_progress_bp.route("/overview", methods=["GET"])
def get_overview():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT
            u.UserID,
            u.Username,
            u.Email,
            COUNT(lp.WordID)                                                     AS TotalWords,
            SUM(CASE WHEN lp.Status = 'New'      THEN 1 ELSE 0 END)             AS NewCount,
            SUM(CASE WHEN lp.Status = 'Learning' THEN 1 ELSE 0 END)             AS LearningCount,
            SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)             AS MasteredCount,
            CAST(
                SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)
                * 100.0
                / NULLIF((SELECT COUNT(*) FROM Vocabulary), 0)
            AS INT)                                                               AS ProgressPercent,
            (
                SELECT AVG(CAST(best.BestScore AS FLOAT))
                FROM (
                    SELECT WordID, MAX(Score) AS BestScore
                    FROM UserLearning
                    WHERE UserID = u.UserID AND Score IS NOT NULL
                    GROUP BY WordID
                ) AS best
            )                                                                     AS AvgQuizScore,
            (SELECT MAX(v) FROM (VALUES
                (MAX(ul.LearnDate)),
                (MAX(lp.LastReviewed))
            ) AS t(v))                                                            AS LastReviewed
        FROM Users u
        LEFT JOIN LearningProgress lp ON u.UserID = lp.UserID
        LEFT JOIN UserLearning ul     ON u.UserID = ul.UserID
        GROUP BY u.UserID, u.Username, u.Email
        ORDER BY MasteredCount DESC
    """)

        columns = [col[0] for col in cursor.description]
        row = cursor.fetchone()
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Fix LastReviewed: nếu là '1900-...' thì set None
    for r in results:
        if r.get("LastReviewed"):
            if str(r["LastReviewed"])[:4] == "1900":
                r["LastReviewed"] = None
            else:
                r["LastReviewed"] = r["LastReviewed"].isoformat()

    conn.close()
    return jsonify(results)


# =========================
# GET ALL USERS + PROGRESS
# GET /api/admin/learnprogress/
# =========================
@admin_learning_progress_bp.route("/", methods=["GET"])
def get_all_progress():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                u.UserID,
                u.Username,
                u.Email,
                COUNT(lp.WordID)                                                     AS TotalWords,
                SUM(CASE WHEN lp.Status = 'New'      THEN 1 ELSE 0 END)             AS NewCount,
                SUM(CASE WHEN lp.Status = 'Learning' THEN 1 ELSE 0 END)             AS LearningCount,
                SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)             AS MasteredCount,
                CAST(
                    SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)
                    * 100.0
                    / NULLIF((SELECT COUNT(*) FROM Vocabulary), 0)
                AS INT)                                                               AS ProgressPercent,
                (
                    SELECT AVG(CAST(best.BestScore AS FLOAT))
                    FROM (
                        SELECT WordID, MAX(Score) AS BestScore
                        FROM UserLearning
                        WHERE UserID = u.UserID AND Score IS NOT NULL
                        GROUP BY WordID
                    ) AS best
                )                                                                     AS AvgQuizScore,
                MAX(lp.LastReviewed)                                                  AS LastReviewed
            FROM Users u
            LEFT JOIN LearningProgress lp ON u.UserID = lp.UserID
            GROUP BY u.UserID, u.Username, u.Email
            ORDER BY MasteredCount DESC
        """)

        columns = [col[0] for col in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        conn.close()
        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# GET DETAIL 1 USER
# GET /api/admin/learnprogress/<user_id>
# =========================
@admin_learning_progress_bp.route("/<int:user_id>", methods=["GET"])
def get_user_progress(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # --- Tổng quan user ---
        cursor.execute("""
            SELECT
                u.UserID, u.Username, u.Email,
                COUNT(lp.WordID)                                                      AS TotalWords,
                SUM(CASE WHEN lp.Status = 'New'      THEN 1 ELSE 0 END)              AS NewCount,
                SUM(CASE WHEN lp.Status = 'Learning' THEN 1 ELSE 0 END)              AS LearningCount,
                SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)              AS MasteredCount,
                CAST(
                    SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)
                    * 100.0
                    / NULLIF((SELECT COUNT(*) FROM Vocabulary), 0)
                AS INT)                                                                AS ProgressPercent,
                MAX(lp.LastReviewed)                                                   AS LastReviewed
            FROM Users u
            LEFT JOIN LearningProgress lp ON u.UserID = lp.UserID
            WHERE u.UserID = ?
            GROUP BY u.UserID, u.Username, u.Email
        """, (user_id,))

        row = cursor.fetchone()
        if not row:
            conn.close()
            return jsonify({"message": "User not found"}), 404

        columns = [col[0] for col in cursor.description]
        user_summary = dict(zip(columns, row))

        # --- Tiến độ theo Category ---
        cursor.execute("""
            SELECT
                c.CategoryID,
                c.CategoryName,
                COUNT(v.WordID)                                                        AS TotalInCategory,
                SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)               AS MasteredInCategory,
                CAST(
                    SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)
                    * 100.0
                    / NULLIF(COUNT(v.WordID), 0)
                AS INT)                                                                 AS CategoryPercent
            FROM Categories c
            LEFT JOIN Vocabulary v        ON c.CategoryID = v.CategoryID
            LEFT JOIN LearningProgress lp ON v.WordID = lp.WordID AND lp.UserID = ?
            GROUP BY c.CategoryID, c.CategoryName
            ORDER BY CategoryPercent DESC
        """, (user_id,))

        cols = [col[0] for col in cursor.description]
        category_progress = [dict(zip(cols, r)) for r in cursor.fetchall()]

        # --- Lịch sử Quiz 10 gần nhất ---
        cursor.execute("""
            SELECT TOP 10
                v.Word,
                ul.Score,
                ul.LearnDate
            FROM UserLearning ul
            JOIN Vocabulary v ON ul.WordID = v.WordID
            WHERE ul.UserID = ?
            ORDER BY ul.LearnDate DESC
        """, (user_id,))

        cols = [col[0] for col in cursor.description]
        quiz_history = [dict(zip(cols, r)) for r in cursor.fetchall()]

        conn.close()
        return jsonify({
            "user": user_summary,
            "categoryProgress": category_progress,
            "quizHistory": quiz_history
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# 🔥 MỚI: GET WORD LIST + STATUS của 1 user
# GET /api/admin/learnprogress/<user_id>/words
# =========================
@admin_learning_progress_bp.route("/<int:user_id>/words", methods=["GET"])
def get_user_words(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                v.WordID,
                v.Word,
                v.Meaning,
                c.CategoryName,
                l.LessonName,
                v.DifficultyLevel,
                ISNULL(lp.Status, 'Not Started')  AS Status,
                lp.LastReviewed,
                (
                    SELECT MAX(Score)
                    FROM UserLearning
                    WHERE UserID = ? AND WordID = v.WordID
                )                                  AS BestScore
            FROM Vocabulary v
            LEFT JOIN Categories c         ON v.CategoryID = c.CategoryID
            LEFT JOIN Lessons l            ON v.LessonID   = l.LessonID
            LEFT JOIN LearningProgress lp  ON v.WordID = lp.WordID AND lp.UserID = ?
            ORDER BY
                CASE ISNULL(lp.Status,'Not Started')
                    WHEN 'Mastered'  THEN 1
                    WHEN 'Learning'  THEN 2
                    WHEN 'New'       THEN 3
                    ELSE 4
                END,
                v.Word
        """, (user_id, user_id))

        cols = [col[0] for col in cursor.description]
        words = [dict(zip(cols, r)) for r in cursor.fetchall()]

        conn.close()
        return jsonify(words)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# 🔥 MỚI: GET LESSON PROGRESS của 1 user
# GET /api/admin/learnprogress/<user_id>/lessons
# =========================
@admin_learning_progress_bp.route("/<int:user_id>/lessons", methods=["GET"])
def get_user_lesson_progress(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                l.LessonID,
                l.LessonName,
                c.CategoryName,
                COUNT(v.WordID)                                                         AS TotalWords,
                SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)                AS MasteredCount,
                SUM(CASE WHEN lp.Status = 'Learning' THEN 1 ELSE 0 END)                AS LearningCount,
                SUM(CASE WHEN lp.Status = 'New'      THEN 1 ELSE 0 END)                AS NewCount,
                CAST(
                    SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)
                    * 100.0
                    / NULLIF(COUNT(v.WordID), 0)
                AS INT)                                                                  AS LessonPercent
            FROM Lessons l
            LEFT JOIN Categories c         ON l.CategoryID  = c.CategoryID
            LEFT JOIN Vocabulary v         ON v.LessonID    = l.LessonID
            LEFT JOIN LearningProgress lp  ON v.WordID = lp.WordID AND lp.UserID = ?
            GROUP BY l.LessonID, l.LessonName, c.CategoryName
            ORDER BY LessonPercent DESC
        """, (user_id,))

        cols = [col[0] for col in cursor.description]
        lessons = [dict(zip(cols, r)) for r in cursor.fetchall()]

        conn.close()
        return jsonify(lessons)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# 🔥 MỚI: GET DAILY ACTIVITY (30 ngày gần nhất) của 1 user
# GET /api/admin/learnprogress/<user_id>/daily
# =========================
@admin_learning_progress_bp.route("/<int:user_id>/daily", methods=["GET"])
def get_user_daily_activity(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                CAST(LearnDate AS DATE)  AS Day,
                COUNT(*)                 AS SessionCount,
                AVG(CAST(Score AS FLOAT)) AS AvgScore,
                COUNT(DISTINCT WordID)   AS WordsStudied
            FROM UserLearning
            WHERE UserID = ?
              AND LearnDate >= DATEADD(DAY, -30, GETDATE())
              AND Score IS NOT NULL
            GROUP BY CAST(LearnDate AS DATE)
            ORDER BY Day ASC
        """, (user_id,))

        cols = [col[0] for col in cursor.description]
        rows = []
        for r in cursor.fetchall():
            d = dict(zip(cols, r))
            # convert date to string for JSON
            d["Day"] = str(d["Day"])
            rows.append(d)

        conn.close()
        return jsonify(rows)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# UPDATE STATUS
# PUT /api/admin/learnprogress/<user_id>/<word_id>
# =========================
@admin_learning_progress_bp.route("/<int:user_id>/<int:word_id>", methods=["PUT"])
def update_progress(user_id, word_id):
    try:
        data = request.json
        new_status = data.get("status", "")

        allowed = ["New", "Learning", "Mastered"]
        if new_status not in allowed:
            return jsonify({"error": f"Status phải là một trong: {allowed}"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT ProgressID FROM LearningProgress
            WHERE UserID = ? AND WordID = ?
        """, (user_id, word_id))

        existing = cursor.fetchone()

        if existing:
            cursor.execute("""
                UPDATE LearningProgress
                SET Status = ?, LastReviewed = GETDATE()
                WHERE UserID = ? AND WordID = ?
            """, (new_status, user_id, word_id))
        else:
            cursor.execute("""
                INSERT INTO LearningProgress (UserID, WordID, Status, LastReviewed)
                VALUES (?, ?, ?, GETDATE())
            """, (user_id, word_id, new_status))

        conn.commit()
        conn.close()
        return jsonify({"message": "Cập nhật thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# DELETE PROGRESS RECORD
# DELETE /api/admin/learnprogress/<user_id>/<word_id>
# =========================
@admin_learning_progress_bp.route("/<int:user_id>/<int:word_id>", methods=["DELETE"])
def delete_progress(user_id, word_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            DELETE FROM LearningProgress
            WHERE UserID = ? AND WordID = ?
        """, (user_id, word_id))

        conn.commit()
        conn.close()
        return jsonify({"message": "Đã xóa bản ghi tiến độ"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# 🔥 MỚI: DELETE ALL PROGRESS của 1 user (reset)
# DELETE /api/admin/learnprogress/<user_id>/reset
# =========================
@admin_learning_progress_bp.route("/<int:user_id>/reset", methods=["DELETE"])
def reset_user_progress(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            DELETE FROM LearningProgress WHERE UserID = ?
        """, (user_id,))

        deleted = cursor.rowcount
        conn.commit()
        conn.close()
        return jsonify({"message": f"Đã reset {deleted} bản ghi tiến độ của user {user_id}"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500