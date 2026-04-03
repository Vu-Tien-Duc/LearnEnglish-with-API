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
        password = data.get("PasswordHash")

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT UserID, Username, Role
            FROM Users
            WHERE Username=? AND PasswordHash=?
        """, (username, password))

        user = cursor.fetchone()
        conn.close()

        if user:
            return jsonify({
                "UserID": user[0],
                "Username": user[1],
                "Role": user[2]
            })
        else:
            return jsonify({"error": "Sai tài khoản hoặc mật khẩu"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500