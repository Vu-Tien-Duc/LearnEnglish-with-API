from flask import Blueprint, request, jsonify
from db import get_db_connection
import bcrypt

auth_bp = Blueprint("auth", __name__)

# ================= LOGIN =================
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        username = data.get("Username")
        password = data.get("Password")

        if not username or not password:
            return jsonify({"error": "Thiếu dữ liệu"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Lấy user theo username
        cursor.execute("""
            SELECT UserID, Username, PasswordHash, Role
            FROM Users
            WHERE Username=?
        """, (username,))

        user = cursor.fetchone()
        conn.close()

        # Kiểm tra bcrypt
        if user and bcrypt.checkpw(password.encode("utf-8"), user[2].encode("utf-8")):
            return jsonify({
                "UserID": user[0],
                "Username": user[1],
                "Role": user[3]
            })

        return jsonify({"error": "Sai tài khoản hoặc mật khẩu"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= REGISTER =================
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        username = data.get("Username")
        email = data.get("Email")
        password = data.get("Password")

        if not username or not password:
            return jsonify({"error": "Thiếu dữ liệu"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # check trùng
        cursor.execute(
            "SELECT * FROM Users WHERE Username=? OR Email=?",
            (username, email)
        )
        if cursor.fetchone():
            return jsonify({"error": "Username hoặc Email đã tồn tại"}), 400

        # hash password
        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

        cursor.execute("""
            INSERT INTO Users (Username, PasswordHash, Email, Role)
            VALUES (?, ?, ?, ?)
        """, (username, hashed.decode("utf-8"), email, "User"))

        conn.commit()
        conn.close()

        return jsonify({"message": "Đăng ký thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500