from flask import Blueprint, request, jsonify
import bcrypt
from db import get_db_connection

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Missing data"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # check trùng
    cursor.execute(
        "SELECT * FROM Users WHERE Username = ? OR Email = ?",
        (username, email)
    )
    if cursor.fetchone():
        return jsonify({"error": "User already exists"}), 400

    # hash password
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    cursor.execute("""
        INSERT INTO Users (Username, PasswordHash, Email)
        VALUES (?, ?, ?)
    """, (username, hashed.decode("utf-8"), email))

    conn.commit()
    conn.close()

    return jsonify({"message": "Register success"})