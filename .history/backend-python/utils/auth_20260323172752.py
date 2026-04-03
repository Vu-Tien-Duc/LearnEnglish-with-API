from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from db import get_db_connection
import bcrypt

auth_bp = Blueprint("auth", __name__)

# ================= LOGIN =================
@auth_bp.route("/login", methods=["POST"])
@cross_origin()
def login():
    data = request.json
    username = data.get("Username")
    password = data.get("Password")

    if not username or not password:
        return jsonify({"error": "Thiếu dữ liệu"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT UserID, Username, PasswordHash, Role
        FROM Users
        WHERE Username=?
    """, (username,))

    user = cursor.fetchone()
    conn.close()

    if user and bcrypt.checkpw(password.encode(), user[2].encode()):
        return jsonify({
            "UserID": user[0],
            "Username": user[1],
            "Role": user[3]
        })

    return jsonify({"error": "Sai tài khoản hoặc mật khẩu"}), 401


# ================= REGISTER =================
@auth_bp.route("/register", methods=["POST"])
@cross_origin()
def register():
    data = request.json
    username = data.get("Username")
    email = data.get("Email")
    password = data.get("Password")

    if not username or not password:
        return jsonify({"error": "Thiếu dữ liệu"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM Users WHERE Username=? OR Email=?",
        (username, email)
    )
    if cursor.fetchone():
        return jsonify({"error": "Username hoặc Email đã tồn tại"}), 400

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    cursor.execute("""
        INSERT INTO Users (Username, PasswordHash, Email, Role)
        VALUES (?, ?, ?, ?)
    """, (username, hashed.decode(), email, "User"))

    conn.commit()
    conn.close()

    return jsonify({"message": "Đăng ký thành công"})


# ================= CHANGE PASSWORD =================
@auth_bp.route("/change-password", methods=["PUT", "OPTIONS"])
@cross_origin()
def change_password():
    try:
        data = request.json
        user_id = data.get("UserID")
        old_password = data.get("OldPassword")
        new_password = data.get("NewPassword")

        if not user_id or not old_password or not new_password:
            return jsonify({"error": "Thiếu dữ liệu"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT PasswordHash FROM Users WHERE UserID=?", (user_id,))
        row = cursor.fetchone()

        if not row:
            conn.close()
            return jsonify({"error": "Không tìm thấy user"}), 404

        current_hash = row[0]

        # ✅ check mật khẩu cũ
        if not bcrypt.checkpw(old_password.encode(), current_hash.encode()):
            conn.close()
            return jsonify({"error": "Mật khẩu hiện tại không đúng"}), 401

        # ✅ hash mật khẩu mới
        new_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt())

        cursor.execute(
            "UPDATE Users SET PasswordHash=? WHERE UserID=?",
            (new_hash.decode(), user_id)
        )

        conn.commit()
        conn.close()

        return jsonify({"message": "Đổi mật khẩu thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500