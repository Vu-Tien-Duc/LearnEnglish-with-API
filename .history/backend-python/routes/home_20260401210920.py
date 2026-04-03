from flask import Blueprint, jsonify, request
from db import get_db_connection  # adjust import path as needed

home_bp = Blueprint("home", __name__)


# ─────────────────────────────────────────────
# GET /api/user/dashboard-summary
# Query params: user_id (int)
# Returns stats for the logged-in user
# ─────────────────────────────────────────────
@home_bp.route("/user/dashboard-summary", methods=["GET"])
def dashboard_summary():
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 1. Total words in the system
        cursor.execute("SELECT COUNT(*) FROM Vocabulary")
        total_words = cursor.fetchone()[0]

        # 2. Words the user has marked as Mastered
        cursor.execute(
            """
            SELECT COUNT(*) FROM LearningProgress
            WHERE UserID = ? AND Status = 'Mastered'
            """,
            (user_id,),
        )
        mastered_words = cursor.fetchone()[0]

        # 3. Words currently being learned (status = 'Learning' or 'New')
        cursor.execute(
            """
            SELECT COUNT(*) FROM LearningProgress
            WHERE UserID = ? AND Status IN ('Learning', 'New')
            """,
            (user_id,),
        )
        learning_words = cursor.fetchone()[0]

        # 4. Total favorite words
        cursor.execute(
            "SELECT COUNT(*) FROM FavoriteWords WHERE UserID = ?",
            (user_id,),
        )
        total_favorites = cursor.fetchone()[0]

        # 5. Completion percentage
        completion = round((mastered_words / total_words * 100), 1) if total_words > 0 else 0

        # 6. Recent learning history (last 5 entries)
        cursor.execute(
            """
            SELECT TOP 5
                ul.LearnDate,
                ul.Score,
                v.Word,
                v.Meaning
            FROM UserLearning ul
            JOIN Vocabulary v ON ul.WordID = v.WordID
            WHERE ul.UserID = ?
            ORDER BY ul.LearnDate DESC
            """,
            (user_id,),
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

        # 7. Categories with word counts
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
# Returns the current learning streak (days in a row)
# ─────────────────────────────────────────────
@home_bp.route("/user/streak", methods=["GET"])
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
            (user_id,),
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
# Returns all lessons with category info
# ─────────────────────────────────────────────
@home_bp.route("/user/lessons", methods=["GET"])
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