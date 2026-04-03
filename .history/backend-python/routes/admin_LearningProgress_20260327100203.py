flask import Blueprint, jsonify, request
from db import get_db_connection  # adjust import to match your project structure

admin_learning_progress_bp = Blueprint('admin_learning_progress', __name__)


# ─────────────────────────────────────────────
# GET /api/admin/learning-progress
# Lấy tổng hợp tiến độ học của tất cả users
# ─────────────────────────────────────────────
@admin_learning_progress_bp.route('/api/admin/learning-progress', methods=['GET'])
def get_all_progress():
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT
            u.UserID,
            u.Username,
            u.Email,
            -- Tổng từ đã có trong LearningProgress
            COUNT(lp.WordID) AS TotalWords,

            -- Đếm theo trạng thái
            SUM(CASE WHEN lp.Status = 'New'      THEN 1 ELSE 0 END) AS NewCount,
            SUM(CASE WHEN lp.Status = 'Learning' THEN 1 ELSE 0 END) AS LearningCount,
            SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END) AS MasteredCount,

            -- % tiến độ: số Mastered / tổng từ toàn hệ thống * 100
            CAST(
                SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)
                * 100.0
                / NULLIF((SELECT COUNT(*) FROM Vocabulary), 0)
            AS INT) AS ProgressPercent,

            -- Điểm quiz trung bình (best score mỗi từ)
            (
                SELECT AVG(CAST(best.BestScore AS FLOAT))
                FROM (
                    SELECT WordID, MAX(Score) AS BestScore
                    FROM UserLearning
                    WHERE UserID = u.UserID AND Score IS NOT NULL
                    GROUP BY WordID
                ) AS best
            ) AS AvgQuizScore,

            -- Lần cập nhật gần nhất
            MAX(lp.LastReviewed) AS LastReviewed

        FROM Users u
        LEFT JOIN LearningProgress lp ON u.UserID = lp.UserID
        GROUP BY u.UserID, u.Username, u.Email
        ORDER BY MasteredCount DESC
    """

    cursor.execute(query)
    rows = cursor.fetchall()
    columns = [col[0] for col in cursor.description]
    result = [dict(zip(columns, row)) for row in rows]

    cursor.close()
    conn.close()
    return jsonify(result), 200


# ─────────────────────────────────────────────
# GET /api/admin/learning-progress/<user_id>
# Chi tiết tiến độ của 1 user (theo category)
# ─────────────────────────────────────────────
@admin_learning_progress_bp.route('/api/admin/learning-progress/<int:user_id>', methods=['GET'])
def get_user_progress(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # --- Thống kê tổng quan user ---
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
            MAX(lp.LastReviewed)                                                  AS LastReviewed
        FROM Users u
        LEFT JOIN LearningProgress lp ON u.UserID = lp.UserID
        WHERE u.UserID = ?
        GROUP BY u.UserID, u.Username, u.Email
    """, (user_id,))

    row = cursor.fetchone()
    if not row:
        cursor.close()
        conn.close()
        return jsonify({'error': 'User not found'}), 404

    columns = [col[0] for col in cursor.description]
    user_summary = dict(zip(columns, row))

    # --- Tiến độ theo từng Category ---
    cursor.execute("""
        SELECT
            c.CategoryID,
            c.CategoryName,
            COUNT(v.WordID)                                                        AS TotalInCategory,
            SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)              AS MasteredInCategory,
            CAST(
                SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)
                * 100.0
                / NULLIF(COUNT(v.WordID), 0)
            AS INT)                                                                AS CategoryPercent
        FROM Categories c
        LEFT JOIN Vocabulary v   ON c.CategoryID = v.CategoryID
        LEFT JOIN LearningProgress lp
               ON v.WordID = lp.WordID AND lp.UserID = ?
        GROUP BY c.CategoryID, c.CategoryName
        ORDER BY CategoryPercent DESC
    """, (user_id,))

    rows = cursor.fetchall()
    cols = [col[0] for col in cursor.description]
    category_progress = [dict(zip(cols, r)) for r in rows]

    # --- Lịch sử quiz gần nhất (10 bản ghi) ---
    cursor.execute("""
        SELECT TOP 10
            ul.LearningID,
            v.Word,
            ul.Score,
            ul.LearnDate
        FROM UserLearning ul
        JOIN Vocabulary v ON ul.WordID = v.WordID
        WHERE ul.UserID = ?
        ORDER BY ul.LearnDate DESC
    """, (user_id,))

    rows = cursor.fetchall()
    cols = [col[0] for col in cursor.description]
    quiz_history = [dict(zip(cols, r)) for r in rows]

    cursor.close()
    conn.close()

    return jsonify({
        'user': user_summary,
        'categoryProgress': category_progress,
        'quizHistory': quiz_history
    }), 200


# ─────────────────────────────────────────────
# GET /api/admin/learning-progress/stats/overview
# Số liệu tổng quan toàn hệ thống (cho dashboard)
# ─────────────────────────────────────────────
@admin_learning_progress_bp.route('/api/admin/learning-progress/stats/overview', methods=['GET'])
def get_overview_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            COUNT(DISTINCT lp.UserID)                                             AS TotalLearners,
            COUNT(lp.ProgressID)                                                  AS TotalRecords,
            SUM(CASE WHEN lp.Status = 'New'      THEN 1 ELSE 0 END)              AS TotalNew,
            SUM(CASE WHEN lp.Status = 'Learning' THEN 1 ELSE 0 END)              AS TotalLearning,
            SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)              AS TotalMastered,
            CAST(
                SUM(CASE WHEN lp.Status = 'Mastered' THEN 1 ELSE 0 END)
                * 100.0
                / NULLIF(COUNT(lp.ProgressID), 0)
            AS INT)                                                                AS MasteredPercent
        FROM LearningProgress lp
    """)

    row = cursor.fetchone()
    columns = [col[0] for col in cursor.description]
    overview = dict(zip(columns, row))

    cursor.close()
    conn.close()
    return jsonify(overview), 200


# ─────────────────────────────────────────────
# PUT /api/admin/learning-progress/<user_id>/<word_id>
# Cập nhật trạng thái học của 1 từ (Status)
# ─────────────────────────────────────────────
@admin_learning_progress_bp.route('/api/admin/learning-progress/<int:user_id>/<int:word_id>', methods=['PUT'])
def update_progress(user_id, word_id):
    data = request.get_json()
    new_status = data.get('status')

    allowed = ['New', 'Learning', 'Mastered']
    if new_status not in allowed:
        return jsonify({'error': f'Status phải là một trong: {allowed}'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE LearningProgress
        SET Status = ?, LastReviewed = GETDATE()
        WHERE UserID = ? AND WordID = ?
    """, (new_status, user_id, word_id))

    if cursor.rowcount == 0:
        # Chưa có record → INSERT
        cursor.execute("""
            INSERT INTO LearningProgress (UserID, WordID, Status, LastReviewed)
            VALUES (?, ?, ?, GETDATE())
        """, (user_id, word_id, new_status))

    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Cập nhật thành công'}), 200


# ─────────────────────────────────────────────
# DELETE /api/admin/learning-progress/<user_id>/<word_id>
# Xóa 1 bản ghi tiến độ
# ─────────────────────────────────────────────
@admin_learning_progress_bp.route('/api/admin/learning-progress/<int:user_id>/<int:word_id>', methods=['DELETE'])
def delete_progress(user_id, word_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM LearningProgress
        WHERE UserID = ? AND WordID = ?
    """, (user_id, word_id))

    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Đã xóa bản ghi tiến độ'}), 200