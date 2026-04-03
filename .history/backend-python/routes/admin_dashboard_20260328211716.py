from flask import Blueprint, jsonify
from db import get_db_connection   # thay bằng helper kết nối MSSQL của bạn

admin_dashboard_bp = Blueprint("admin_dashboard", __name__)


# ─────────────────────────────────────────────────────────────
#  HELPER: chạy query, trả về list[dict]
# ─────────────────────────────────────────────────────────────
def query(sql, params=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(sql, params or [])
    columns = [col[0] for col in cursor.description]
    rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return rows


def query_one(sql, params=None):
    rows = query(sql, params)
    return rows[0] if rows else {}


# ─────────────────────────────────────────────────────────────
#  GET /api/admin/dashboard/stats
#  Trả về các con số tổng quan (stat cards)
# ─────────────────────────────────────────────────────────────
@admin_dashboard_bp.route("/stats", methods=["GET"])
def get_stats():
    total_users = query_one("SELECT COUNT(*) AS total FROM Users")["total"]
    total_vocab = query_one("SELECT COUNT(*) AS total FROM Vocabulary")["total"]
    total_categories = query_one("SELECT COUNT(*) AS total FROM Categories")["total"]
    total_quiz = query_one("SELECT COUNT(*) AS total FROM QuizQuestions")["total"]

    # Số user tạo hôm nay
    new_users_today = query_one(
        "SELECT COUNT(*) AS total FROM Users WHERE CAST(CreatedDate AS DATE) = CAST(GETDATE() AS DATE)"
    )["total"]

    # Số từ thêm hôm nay
    new_vocab_today = query_one(
        "SELECT COUNT(*) AS total FROM Vocabulary WHERE CAST(CreatedDate AS DATE) = CAST(GETDATE() AS DATE)"
    )["total"]

    return jsonify({
        "total_users": total_users,
        "total_vocab": total_vocab,
        "total_categories": total_categories,
        "total_quiz": total_quiz,
        "new_users_today": new_users_today,
        "new_vocab_today": new_vocab_today,
    })


# ─────────────────────────────────────────────────────────────
#  GET /api/admin/dashboard/vocab-by-category
#  Số từ vựng theo từng category (cho bar chart)
# ─────────────────────────────────────────────────────────────
@admin_dashboard_bp.route("/vocab-by-category", methods=["GET"])
def vocab_by_category():
    rows = query("""
        SELECT c.CategoryName, COUNT(v.WordID) AS word_count
        FROM Categories c
        LEFT JOIN Vocabulary v ON v.CategoryID = c.CategoryID
        GROUP BY c.CategoryID, c.CategoryName
        ORDER BY word_count DESC
    """)
    return jsonify(rows)


# ─────────────────────────────────────────────────────────────
#  GET /api/admin/dashboard/learning-summary
#  Tổng hợp trạng thái học (New / Learning / Mastered) cho donut
# ─────────────────────────────────────────────────────────────
@admin_dashboard_bp.route("/learning-summary", methods=["GET"])
def learning_summary():
    rows = query("""
        SELECT Status, COUNT(*) AS cnt
        FROM LearningProgress
        GROUP BY Status
    """)
    # Tổng từ chưa có trong LearningProgress → "Chưa học"
    total_vocab = query_one("SELECT COUNT(*) AS total FROM Vocabulary")["total"]
    tracked = sum(r["cnt"] for r in rows)
    not_started = total_vocab - tracked

    result = {r["Status"]: r["cnt"] for r in rows}
    result["NotStarted"] = max(not_started, 0)

    # Quiz accuracy trung bình
    acc = query_one("""
        SELECT AVG(CAST(Score AS FLOAT)) AS avg_score
        FROM UserLearning
        WHERE Score IS NOT NULL
    """)
    result["avg_quiz_score"] = round(acc.get("avg_score") or 0, 1)

    return jsonify(result)


# ─────────────────────────────────────────────────────────────
#  GET /api/admin/dashboard/recent-activity
#  Hoạt động gần đây (quiz completions + new users + new vocab)
# ─────────────────────────────────────────────────────────────
@admin_dashboard_bp.route("/recent-activity", methods=["GET"])
def recent_activity():
    # Lịch sử học gần nhất
    learn_rows = query("""
        SELECT TOP 5
            u.Username,
            v.Word,
            ul.Score,
            ul.LearnDate,
            'quiz' AS activity_type
        FROM UserLearning ul
        JOIN Users u ON u.UserID = ul.UserID
        JOIN Vocabulary v ON v.WordID = ul.WordID
        ORDER BY ul.LearnDate DESC
    """)

    # User mới đăng ký gần nhất
    user_rows = query("""
        SELECT TOP 3
            Username,
            Email,
            CreatedDate,
            'new_user' AS activity_type
        FROM Users
        ORDER BY CreatedDate DESC
    """)

    # Từ vựng mới thêm gần nhất
    vocab_rows = query("""
        SELECT TOP 3
            v.Word,
            c.CategoryName,
            v.CreatedDate,
            'new_vocab' AS activity_type
        FROM Vocabulary v
        LEFT JOIN Categories c ON c.CategoryID = v.CategoryID
        ORDER BY v.CreatedDate DESC
    """)

    activities = []

    for r in learn_rows:
        activities.append({
            "type": "quiz",
            "text": f"{r['Username']} hoàn thành quiz từ \"{r['Word']}\"",
            "meta": f"Score {r['Score']}%" if r["Score"] is not None else "Không có điểm",
            "time": r["LearnDate"].isoformat() if r["LearnDate"] else None,
        })

    for r in user_rows:
        activities.append({
            "type": "new_user",
            "text": f"User mới đăng ký: {r['Email'] or r['Username']}",
            "meta": "",
            "time": r["CreatedDate"].isoformat() if r["CreatedDate"] else None,
        })

    for r in vocab_rows:
        activities.append({
            "type": "new_vocab",
            "text": f"Thêm từ mới \"{r['Word']}\" vào \"{r['CategoryName'] or 'Chưa phân loại'}\"",
            "meta": "",
            "time": r["CreatedDate"].isoformat() if r["CreatedDate"] else None,
        })

    # Sắp xếp theo thời gian gần nhất
    activities.sort(key=lambda x: x["time"] or "", reverse=True)

    return jsonify(activities[:10])


# ─────────────────────────────────────────────────────────────
#  GET /api/admin/dashboard/top-users
#  Top users theo số từ đã mastered
# ─────────────────────────────────────────────────────────────
@admin_dashboard_bp.route("/top-users", methods=["GET"])
def top_users():
    rows = query("""
        SELECT TOP 5
            u.Username,
            u.Email,
            COUNT(CASE WHEN lp.Status = 'Mastered' THEN 1 END) AS mastered,
            COUNT(CASE WHEN lp.Status = 'Learning' THEN 1 END) AS learning,
            COUNT(CASE WHEN lp.Status = 'New'      THEN 1 END) AS new_words,
            -- Lấy cái nào gần nhất giữa quiz và review
            GREATEST(
                ISNULL(MAX(ul.LearnDate),  '1900-01-01'),
                ISNULL(MAX(lp.LastReviewed),'1900-01-01')
            ) AS last_active
        FROM Users u
        LEFT JOIN LearningProgress lp ON lp.UserID = u.UserID
        LEFT JOIN UserLearning ul     ON ul.UserID  = u.UserID
        GROUP BY u.UserID, u.Username, u.Email
        ORDER BY mastered DESC
    """)
    # Trả None thay vì '1900-01-01' nếu user chưa có hoạt động nào
    for r in rows:
        if r.get("last_active") and str(r["last_active"])[:4] == "1900":
            r["last_active"] = None
        elif r.get("last_active"):
            r["last_active"] = r["last_active"].isoformat()
    return jsonify(rows)