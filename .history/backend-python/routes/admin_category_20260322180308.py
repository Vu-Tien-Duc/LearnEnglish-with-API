from flask import Blueprint, jsonify, request
from db import get_db_connection

admin_category_bp = Blueprint("admin_category", __name__)

# =========================
# GET ALL Categories
# =========================
@admin_category_bp.route("/", methods=["GET"])
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT CategoryID, CategoryName FROM Categories")
    columns = [col[0] for col in cursor.description]

    data = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()

    return jsonify(data)


# =========================
# CREATE Category
# =========================
@admin_category_bp.route("/", methods=["POST"])
def create_category():
    data = request.json
    name = data.get("CategoryName")

    if not name:
        return jsonify({"error": "CategoryName is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO Categories (CategoryName) VALUES (?)",
        (name,)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Category created"})


# =========================
# UPDATE Category
# =========================
@admin_category_bp.route("/<int:id>", methods=["PUT"])
def update_category(id):
    data = request.json
    name = data.get("CategoryName")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE Categories SET CategoryName = ? WHERE CategoryID = ?",
        (name, id)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Category updated"})


# =========================
# DELETE Category
# =========================
@admin_category_bp.route("/<int:id>", methods=["DELETE"])
def delete_category(id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM Categories WHERE CategoryID = ?", (id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Category deleted"})