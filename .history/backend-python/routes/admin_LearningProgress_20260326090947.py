from flask import Blueprint, jsonify
from db import get_db_connection

admin_learning_bp = Blueprint("admin_learning", __name__)

# =========================================================
# 1. GET USER PROGRESS (chi tiết 1 user)
# =========================================================
@admin_learning_bp.route("/progress/<int:user_id>", methods=["GET"])
def get_user_progress(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # 🔹 Tổng số từ
    cursor.execute("SELECT COUNT(*) FROM Vocabulary")
    total_words = cursor.fetchone()[0]

    # 🔹 Đếm trạng thái
    cursor.execute("""
        SELECT 
            SUM(CASE WHEN lp.Status IS NULL OR lp.Status = 'New' THEN 1 ELSE 0 END),
            SUM(CASE WHEN lp.Status = 'Learning' THEN 1 ELSE 0 END),
            SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)
        FROM Vocabulary v
        LEFT JOIN LearningProgress lp 
            ON v.WordID = lp.WordID AND lp.UserID = ?
    """, (user_id,))

    result = cursor.fetchone()
    new_count = result[0] or 0
    learning_count = result[1] or 0
    mastered_count = result[2] or 0

    # 🔹 Progress theo category
    cursor.execute("""
        SELECT 
            c.CategoryName,
            COUNT(v.WordID) AS TotalWords,
            SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END) AS Mastered
        FROM Vocabulary v
        JOIN Categories c ON v.CategoryID = c.CategoryID
        LEFT JOIN LearningProgress lp 
            ON v.WordID = lp.WordID AND lp.UserID = ?
        GROUP BY c.CategoryName
    """, (user_id,))

    categories = []
    for row in cursor.fetchall():
        total = row[1]
        mastered = row[2] or 0
        percent = int((mastered / total) * 100) if total > 0 else 0

        categories.append({
            "category": row[0],
            "percent": percent
        })

    conn.close()

    return jsonify({
        "total": total_words,
        "new": new_count,
        "learning": learning_count,
        "mastered": mastered_count,
        "categories": categories
    })


# =========================================================
# 2. GET USER QUIZ HISTORY
# =========================================================
@admin_learning_bp.route("/history/<int:user_id>", methods=["GET"])
def get_user_history(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            v.Word,
            ul.Score,
            ul.LearnDate
        FROM UserLearning ul
        JOIN Vocabulary v ON ul.WordID = v.WordID
        WHERE ul.UserID = ?
        ORDER BY ul.LearnDate DESC
    """, (user_id,))

    data = []
    for row in cursor.fetchall():
        data.append({
            "word": row[0],
            "score": row[1],
            "date": row[2].strftime("%Y-%m-%d %H:%M")
        })

    conn.close()

    return jsonify(data)


# =========================================================
# 3. GET ALL USERS PROGRESS (admin table)
# =========================================================
@admin_learning_bp.route("/users-progress", methods=["GET"])
def get_all_users_progress():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            u.UserID,
            u.Username,
            COUNT(v.WordID) AS TotalWords,

            SUM(CASE WHEN lp.Status IS NULL OR lp.Status = 'New' THEN 1 ELSE 0 END),
            SUM(CASE WHEN lp.Status = 'Learning' THEN 1 ELSE 0 END),
            SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)
        FROM Users u
        CROSS JOIN Vocabulary v
        LEFT JOIN LearningProgress lp 
            ON lp.UserID = u.UserID AND lp.WordID = v.WordID
        GROUP BY u.UserID, u.Username
    """)

    users = []
    for row in cursor.fetchall():
        users.append({
            "userId": row[0],
            "username": row[1],
            "total": row[2],
            "new": row[3] or 0,
            "learning": row[4] or 0,
            "mastered": row[5] or 0
        })

    conn.close()

    return jsonify(users)


# =========================================================
# 4. GET USER AVERAGE SCORE (quiz)
# =========================================================
@admin_learning_bp.route("/score/<int:user_id>", methods=["GET"])
def get_user_score(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT AVG(CAST(BestScore AS FLOAT))
        FROM (
            SELECT WordID, MAX(Score) AS BestScore
            FROM UserLearning
            WHERE UserID = ?
            GROUP BY WordID
        ) t
    """, (user_id,))

    result = cursor.fetchone()[0]
    avg_score = round(result, 1) if result else 0

    conn.close()

    return jsonify({
        "score": avg_score
    })