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

        cursor.execute(
            "SELECT * FROM Users WHERE Username=? OR Email=?",
            (username, email)
        )
        if cursor.fetchone():
            return jsonify({"error": "Username hoặc Email đã tồn tại"}), 400

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


# ================= CHANGE PASSWORD =================
@auth_bp.route("/change-password", methods=["PUT"])
def change_password():
    """
    Body: { UserID, OldPassword, NewPassword }
    - Xác minh OldPassword với PasswordHash hiện tại
    - Hash NewPassword rồi UPDATE vào Users
    """
    try:
        data = request.json
        user_id      = data.get("UserID")
        old_password = data.get("OldPassword")
        new_password = data.get("NewPassword")

        if not user_id or not old_password or not new_password:
            return jsonify({"error": "Thiếu dữ liệu"}), 400

        if len(new_password) < 6:
            return jsonify({"error": "Mật khẩu mới phải có ít nhất 6 ký tự"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Lấy PasswordHash hiện tại theo UserID
        cursor.execute(
            "SELECT PasswordHash FROM Users WHERE UserID=?",
            (user_id,)
        )
        row = cursor.fetchone()

        if not row:
            conn.close()
            return jsonify({"error": "Không tìm thấy user"}), 404

        current_hash = row[0]

        # Xác minh mật khẩu cũ
        if not bcrypt.checkpw(old_password.encode("utf-8"), current_hash.encode("utf-8")):
            conn.close()
            return jsonify({"error": "Mật khẩu hiện tại không đúng"}), 401

        # Hash mật khẩu mới
        new_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())

        # Cập nhật vào Users.PasswordHash
        cursor.execute(
            "UPDATE Users SET PasswordHash=? WHERE UserID=?",
            (new_hash.decode("utf-8"), user_id)
        )
        conn.commit()
        conn.close()

        return jsonify({"message": "Đổi mật khẩu thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500