from flask import Blueprint, jsonify
from db import get_db_connection

user_vocab_bp = Blueprint("user_vocab", __name__)

@user_vocab_bp.route("/vocab", methods=["GET"])
def get_all_vocab():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            SELECT 
                v.WordID, v.Word, v.Meaning, v.DifficultyLevel, v.ImageURL,
                c.CategoryName,
                p.IPA, p.AudioURL, p.Accent
            FROM Vocabulary v
            LEFT JOIN Categories c ON v.CategoryID = c.CategoryID
            LEFT JOIN Pronunciations p ON v.WordID = p.WordID
        """

        cursor.execute(query)

        columns = [col[0] for col in cursor.description]
        result = []

        for row in cursor.fetchall():
            result.append(dict(zip(columns, row)))

        return jsonify(result)

    except Exception as e:
        print(e)
        return jsonify({"message": "Lỗi khi lấy dữ liệu từ vựng"}), 500

    finally:
        conn.close()