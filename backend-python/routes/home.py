from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from db import get_db_connection  # điều chỉnh đường dẫn import nếu cần

home_bp = Blueprint("home", __name__)

# ─────────────────────────────────────────────
# GET /api/user/dashboard-summary
# Trả về thống kê tổng quan cho User
# ─────────────────────────────────────────────
@home_bp.route("/user/dashboard-summary", methods=["GET", "OPTIONS"])
@cross_origin()
def dashboard_summary():
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 1. Tổng số từ vựng trong hệ thống
        cursor.execute("SELECT COUNT(*) FROM Vocabulary")
        total_words = cursor.fetchone()[0]

        # 2. Số từ đã thuộc (Mastered)
        cursor.execute(
            """
            SELECT COUNT(*) FROM LearningProgress
            WHERE UserID = ? AND Status = 'Mastered'
            """,
            (user_id,)
        )
        mastered_words = cursor.fetchone()[0]

        # 3. Số từ đang học (Learning / New)
        cursor.execute(
            """
            SELECT COUNT(*) FROM LearningProgress
            WHERE UserID = ? AND Status IN ('Learning', 'New')
            """,
            (user_id,)
        )
        learning_words = cursor.fetchone()[0]

        # 4. Tổng số từ yêu thích (Tim)
        cursor.execute(
            "SELECT COUNT(*) FROM FavoriteWords WHERE UserID = ?",
            (user_id,)
        )
        total_favorites = cursor.fetchone()[0]

        # 5. Tỉ lệ hoàn thành
        completion = round((mastered_words / total_words * 100), 1) if total_words > 0 else 0

        # 6. Lịch sử học gần đây (Gộp cả Quiz và Flashcard)
        cursor.execute(
            """
            SELECT TOP 5 LearnDate, Score, Word, Meaning
            FROM (
                -- Lịch sử làm bài trắc nghiệm (Quiz)
                SELECT ul.LearnDate, ul.Score, v.Word, v.Meaning
                FROM UserLearning ul
                JOIN Vocabulary v ON ul.WordID = v.WordID
                WHERE ul.UserID = ?

                UNION ALL

                -- Lịch sử lật thẻ (Flashcard)
                SELECT lp.LastReviewed AS LearnDate,
                       CASE WHEN lp.Status = 'Mastered' THEN 100 ELSE 50 END AS Score,
                       v.Word, v.Meaning
                FROM LearningProgress lp
                JOIN Vocabulary v ON lp.WordID = v.WordID
                WHERE lp.UserID = ? AND lp.LastReviewed IS NOT NULL
            ) AS CombinedHistory
            ORDER BY LearnDate DESC
            """,
            (user_id, user_id)
        )
        rows = cursor.fetchall()
        recent_history = [
            {
                "learnDate": row[0].isoformat() if row[0] else None,
                "score": row[1],
                "word": row[2],
                "meaning": row[3],
            }
            for row in rows
        ]

        # 7. Danh mục từ vựng (Category)
        cursor.execute(
            """
            SELECT c.CategoryName, COUNT(v.WordID) AS WordCount
            FROM Categories c
            LEFT JOIN Vocabulary v ON c.CategoryID = v.CategoryID
            GROUP BY c.CategoryName
            ORDER BY WordCount DESC
            """
        )
        cat_rows = cursor.fetchall()
        categories = [{"name": r[0], "count": r[1]} for r in cat_rows]

        return jsonify(
            {
                "TotalWords": total_words,
                "MasteredWords": mastered_words,
                "LearningWords": learning_words,
                "TotalFavorites": total_favorites,
                "completionPercentage": completion,
                "RecentHistory": recent_history,
                "Categories": categories,
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# ─────────────────────────────────────────────
# GET /api/user/streak
# ─────────────────────────────────────────────
@home_bp.route("/user/streak", methods=["GET", "OPTIONS"])
@cross_origin()
def get_streak():
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT DISTINCT CAST(LearnDate AS DATE) AS LearnDay
            FROM UserLearning
            WHERE UserID = ?
            ORDER BY LearnDay DESC
            """,
            (user_id,)
        )
        dates = [row[0] for row in cursor.fetchall()]

        streak = 0
        if dates:
            from datetime import date, timedelta
            today = date.today()
            for i, d in enumerate(dates):
                expected = today - timedelta(days=i)
                if d == expected:
                    streak += 1
                else:
                    break

        return jsonify({"streak": streak})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# ─────────────────────────────────────────────
# GET /api/user/lessons
# ─────────────────────────────────────────────
@home_bp.route("/user/lessons", methods=["GET", "OPTIONS"])
@cross_origin()
def get_lessons():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT
                l.LessonID,
                l.LessonName,
                c.CategoryName,
                COUNT(v.WordID) AS WordCount,
                l.CreatedDate
            FROM Lessons l
            LEFT JOIN Categories c ON l.CategoryID = c.CategoryID
            LEFT JOIN Vocabulary v ON l.LessonID = v.LessonID
            GROUP BY l.LessonID, l.LessonName, c.CategoryName, l.CreatedDate
            ORDER BY l.CreatedDate DESC
            """
        )
        rows = cursor.fetchall()
        lessons = [
            {
                "lessonId": r[0],
                "lessonName": r[1],
                "categoryName": r[2],
                "wordCount": r[3],
                "createdDate": r[4].isoformat() if r[4] else None,
            }
            for r in rows
        ]
        return jsonify(lessons)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()