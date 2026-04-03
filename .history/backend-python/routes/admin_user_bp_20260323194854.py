# backend-python/routes/admin_user_bp.py
from flask import Blueprint, jsonify, request
from db import get_db_connection  # bạn phải có module db.py trả conn pyodbc

admin_user_bp = Blueprint("admin_user", __name__)
API_PREFIX = "/api/admin/users"

# =========================
# GET USERS LIST + FILTER + SORT + PAGINATION
# =========================
@admin_user_bp.route("/", methods=["GET"])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor()

    # query params
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    search = request.args.get("q", "").strip()
    role = request.args.get("role", "").strip()
    sort = request.args.get("sort", "created_desc")

    # base query
    sql = "SELECT UserID, Username, Email, Role, CreatedDate FROM Users WHERE 1=1"
    params = []

    if search:
        sql += " AND (Username LIKE ? OR Email LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    if role:
        sql += " AND Role=?"
        params.append(role)

    # sort
    if sort == "created_asc":
        sql += " ORDER BY CreatedDate ASC"
    elif sort == "username_asc":
        sql += " ORDER BY Username ASC"
    elif sort == "username_desc":
        sql += " ORDER BY Username DESC"
    else:  # default created_desc
        sql += " ORDER BY CreatedDate DESC"

    # pagination
    offset = (page - 1) * limit
    sql += " OFFSET ? ROWS FETCH NEXT ? ROWS ONLY"
    params.extend([offset, limit])

    cursor.execute(sql, params)
    users = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    users_list = [dict(zip(columns, row)) for row in users]

    # total count
    count_sql = "SELECT COUNT(*) FROM Users WHERE 1=1"
    count_params = []
    if search:
        count_sql += " AND (Username LIKE ? OR Email LIKE ?)"
        count_params.extend([f"%{search}%", f"%{search}%"])
    if role:
        count_sql += " AND Role=?"
        count_params.append(role)

    cursor.execute(count_sql, count_params)
    total = cursor.fetchone()[0]
    total_pages = (total + limit - 1) // limit

    # add stats for each user: total words, mastered words, progress pct, quiz avg, favorites
    for u in users_list:
        # total words
        cursor.execute("""
            SELECT COUNT(*) FROM LearningProgress WHERE UserID=?
        """, u["UserID"])
        u["TotalWords"] = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*) FROM LearningProgress WHERE UserID=? AND Status='Mastered'
        """, u["UserID"])
        u["MasteredWords"] = cursor.fetchone()[0]

        # progress %
        u["ProgressPct"] = round(u["MasteredWords"]/u["TotalWords"]*100, 0) if u["TotalWords"] else 0

        # quiz avg
        cursor.execute("""
            SELECT AVG(Score) FROM UserLearning WHERE UserID=?
        """, u["UserID"])
        avg = cursor.fetchone()[0]
        u["AvgScore"] = round(avg,0) if avg else 0

        # favorites
        cursor.execute("""
            SELECT COUNT(*) FROM FavoriteWords WHERE UserID=?
        """, u["UserID"])
        u["FavoriteCount"] = cursor.fetchone()[0]

    return jsonify({
        "data": users_list,
        "total": total,
        "total_pages": total_pages
    })


# =========================
# GET USER STATS
# =========================
@admin_user_bp.route("/stats", methods=["GET"])
def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM Users")
    total_users = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM Users WHERE Role='Admin'")
    total_admins = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM Users WHERE CAST(CreatedDate AS DATE)=CAST(GETDATE() AS DATE)")
    new_today = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM Users WHERE DATEPART(week, CreatedDate)=DATEPART(week, GETDATE())")
    new_week = cursor.fetchone()[0]

    return jsonify({
        "TotalUsers": total_users,
        "TotalAdmins": total_admins,
        "NewToday": new_today,
        "NewThisWeek": new_week
    })


# =========================
# GET USER DETAIL
# =========================
@admin_user_bp.route("/<int:user_id>", methods=["GET"])
def get_user_detail(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT UserID, Username, Email, Role, CreatedDate FROM Users WHERE UserID=?", user_id)
    user = cursor.fetchone()
    if not user:
        return jsonify({"error": "User not found"}), 404
    user_detail = dict(zip([desc[0] for desc in cursor.description], user))

    # learning progress
    cursor.execute("""
        SELECT LP.Status, LP.LastReviewed, V.WordID, V.Word,
               CASE WHEN LP.Status='Mastered' THEN 1 ELSE 0 END AS Mastered
        FROM LearningProgress LP
        JOIN Vocabulary V ON LP.WordID=V.WordID
        WHERE LP.UserID=?
    """, user_id)
    progress = cursor.fetchall()
    total_words = len(progress)
    mastered = sum(p[4] for p in progress)
    last_activity = max([p[1] for p in progress], default=None)
    pct = round(mastered/total_words*100,0) if total_words else 0
    user_detail["progress"] = {
        "TotalWords": total_words,
        "MasteredWords": mastered,
        "ProgressPct": pct,
        "LastActivity": str(last_activity.date()) if last_activity else None,
        "NewWords": sum(1 for p in progress if p[0]=='New'),
        "LearningWords": sum(1 for p in progress if p[0]=='Learning'),
    }

    # quiz stat
    cursor.execute("SELECT Score, LearnDate, WordID FROM UserLearning WHERE UserID=?", user_id)
    quiz = cursor.fetchall()
    total_quiz = len(quiz)
    avg_score = round(sum([q[0] for q in quiz])/total_quiz,0) if total_quiz else 0
    quiz_history = []
    for q in quiz[-5:]:  # last 5 quiz
        cursor.execute("SELECT Word FROM Vocabulary WHERE WordID=?", q[2])
        word = cursor.fetchone()[0]
        quiz_history.append({"Word": word, "Score": q[0], "LearnDate": str(q[1].date())})
    user_detail["quizStat"] = {"AvgScore": avg_score, "TotalQuiz": total_quiz}
    user_detail["quizHistory"] = quiz_history

    # category progress
    cursor.execute("""
        SELECT C.CategoryName,
               COUNT(LP.WordID) AS Total,
               SUM(CASE WHEN LP.Status='Mastered' THEN 1 ELSE 0 END) AS Mastered
        FROM LearningProgress LP
        JOIN Vocabulary V ON LP.WordID=V.WordID
        JOIN Categories C ON V.CategoryID=C.CategoryID
        WHERE LP.UserID=?
        GROUP BY C.CategoryName
    """, user_id)
    cats = cursor.fetchall()
    user_detail["categoryProgress"] = []
    for c in cats:
        total = c[1]
        mastered = c[2]
        pct = round(mastered/total*100,0) if total else 0
        user_detail["categoryProgress"].append({
            "CategoryName": c[0],
            "Total": total,
            "Mastered": mastered,
            "Pct": pct
        })

    # favorites
    cursor.execute("""
        SELECT V.Word, V.Meaning
        FROM FavoriteWords F
        JOIN Vocabulary V ON F.WordID=V.WordID
        WHERE F.UserID=?
    """, user_id)
    favs = cursor.fetchall()
    user_detail["favorites"] = [{"Word": f[0], "Meaning": f[1]} for f in favs]

    return jsonify(user_detail)


# =========================
# CREATE USER
# =========================
@admin_user_bp.route("/", methods=["POST"])
def create_user():
    data = request.json
    username = data.get("Username")
    password = data.get("PasswordHash")
    email = data.get("Email", "")
    role = data.get("Role", "User")

    if not username or not password:
        return jsonify({"error": "Username và password không được để trống"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO Users (Username, PasswordHash, Email, Role) VALUES (?,?,?,?)",
                       username, password, email, role)
        conn.commit()
        user_id = cursor.execute("SELECT @@IDENTITY").fetchone()[0]
        return jsonify({"UserID": user_id, "Username": username, "Email": email, "Role": role})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# =========================
# UPDATE USER
# =========================
@admin_user_bp.route("/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.json
    username = data.get("Username")
    email = data.get("Email")
    role = data.get("Role")
    password = data.get("PasswordHash")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        sql = "UPDATE Users SET Username=?, Email=?, Role=?"
        params = [username, email, role]
        if password:
            sql += ", PasswordHash=?"
            params.append(password)
        sql += " WHERE UserID=?"
        params.append(user_id)
        cursor.execute(sql, params)
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# =========================
# DELETE USER
# =========================
@admin_user_bp.route("/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM Users WHERE UserID=?", user_id)
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 400