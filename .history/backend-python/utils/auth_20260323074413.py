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
        password = data.get("Password")  # 🔥 đổi tên

        conn = get_db_connection()
        cursor = conn.cursor()

        # chỉ lấy user theo username
        cursor.execute("""
            SELECT UserID, Username, PasswordHash, Role
            FROM Users
            WHERE Username=?
        """, (username,))

        user = cursor.fetchone()
        conn.close()

        if user and bcrypt.checkpw(password.encode("utf-8"), user[2].encode("utf-8")):
            return jsonify({
                "UserID": user[0],
                "Username": user[1],
                "Role": user[3]
            })

        return jsonify({"error": "Sai tài khoản hoặc mật khẩu"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500