from flask import Blueprint, jsonify, request
from db import get_db_connection

admin_category_bp = Blueprint("admin_category", __name__)

# ================= GET =================
@admin_category_bp.route("/", methods=["GET"])
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT CategoryID, CategoryName, Description FROM Categories")
    columns = [col[0] for col in cursor.description]

    data = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()

    return jsonify(data)


# ================= CREATE =================
@admin_category_bp.route("/", methods=["POST"])
def create_category():
    data = request.json
    name = data.get("CategoryName")
    desc = data.get("Description", "")

    if not name:
        return jsonify({"error": "CategoryName is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO Categories (CategoryName, Description) VALUES (?, ?)",
        (name, desc)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Category created"})


# ================= UPDATE =================
@admin_category_bp.route("/<int:id>", methods=["PUT"])
def update_category(id):
    data = request.json
    name = data.get("CategoryName")
    desc = data.get("Description", "")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE Categories
        SET CategoryName = ?, Description = ?
        WHERE CategoryID = ?
        """,
        (name, desc, id)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Category updated"})


# ================= DELETE =================
@admin_category_bp.route("/<int:id>", methods=["DELETE"])
def delete_category(id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # check FK
    cursor.execute("SELECT COUNT(*) FROM Vocabulary WHERE CategoryID = ?", (id,))
    count = cursor.fetchone()[0]

    if count > 0:
        conn.close()
        return jsonify({"error": "Category đang được sử dụng"}), 400

    cursor.execute("DELETE FROM Categories WHERE CategoryID = ?", (id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Category deleted"})