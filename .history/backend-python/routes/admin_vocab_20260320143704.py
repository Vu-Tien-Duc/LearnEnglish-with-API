from flask import Blueprint, jsonify, request
from db import get_db_connection

admin_vocab_bp = Blueprint("admin_vocab", __name__)

# =========================
# GET ALL
# =========================
@admin_vocab_bp.route("/", methods=["GET"])
def get_all_vocab():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                v.WordID, v.Word, v.Meaning, v.DifficultyLevel,
                c.CategoryName,
                p.IPA, p.AudioURL, p.Accent,
                e.ExampleSentence, e.Translation
            FROM Vocabulary v
            LEFT JOIN Categories c ON v.CategoryID = c.CategoryID
            LEFT JOIN Pronunciations p ON v.WordID = p.WordID
            LEFT JOIN Examples e ON v.WordID = e.WordID
        """)

        columns = [col[0] for col in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        conn.close()
        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
# =========================
# GET BY ID
# =========================
@admin_vocab_bp.route("/<int:word_id>", methods=["GET"])
def get_vocab_by_id(word_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT v.WordID, v.Word, v.Meaning, v.CategoryID,
                   p.IPA, p.AudioURL, p.Accent,
                   e.ExampleSentence, e.Translation
            FROM Vocabulary v
            LEFT JOIN Pronunciations p ON v.WordID = p.WordID
            LEFT JOIN Examples e ON v.WordID = e.WordID
            WHERE v.WordID = ?
        """, (word_id,))  # ✅ FIX

        row = cursor.fetchone()

        if not row:
            return jsonify({"message": "Not found"}), 404

        columns = [col[0] for col in cursor.description]
        result = dict(zip(columns, row))

        conn.close()
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# ADD
# =========================
@admin_vocab_bp.route("/", methods=["POST"])
def add_vocab():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()

        difficulty = data.get("DifficultyLevel", 1)

        # 1️⃣ Vocabulary
        cursor.execute("""
            INSERT INTO Vocabulary(Word, Meaning, CategoryID, DifficultyLevel)
            OUTPUT INSERTED.WordID
            VALUES (?, ?, ?, ?)
        """, (data["Word"], data["Meaning"], data["CategoryID"], difficulty))

        word_id = cursor.fetchone()[0]

        # 2️⃣ Pronunciation
        cursor.execute("""
            INSERT INTO Pronunciations(WordID, IPA, AudioURL, Accent)
            VALUES (?, ?, ?, ?)
        """, (
            word_id,
            data.get("IPA", ""),
            data.get("AudioURL", ""),
            data.get("Accent", "")
        ))

        # 3️⃣ Example
        cursor.execute("""
            INSERT INTO Examples(WordID, ExampleSentence, Translation)
            VALUES (?, ?, ?)
        """, (
            word_id,
            data.get("ExampleSentence", ""),
            data.get("Translation", "")
        ))

        conn.commit()
        conn.close()

        return jsonify({"message": "Added successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# UPDATE
# =========================
@admin_vocab_bp.route("/<int:word_id>", methods=["PUT"])
def update_vocab(word_id):
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1️⃣ update Vocabulary
        cursor.execute("""
            UPDATE Vocabulary
            SET Word = ?, Meaning = ?, CategoryID = ?
            WHERE WordID = ?
        """, (data["Word"], data["Meaning"], data["CategoryID"], word_id))

        # 2️⃣ Pronunciation
        cursor.execute("SELECT * FROM Pronunciations WHERE WordID = ?", (word_id,))
        pron = cursor.fetchone()

        if pron:
            cursor.execute("""
                UPDATE Pronunciations
                SET IPA = ?, AudioURL = ?, Accent = ?
                WHERE WordID = ?
            """, (
                data.get("IPA", ""),
                data.get("AudioURL", ""),
                data.get("Accent", ""),
                word_id
            ))
        else:
            cursor.execute("""
                INSERT INTO Pronunciations(WordID, IPA, AudioURL, Accent)
                VALUES (?, ?, ?, ?)
            """, (
                word_id,
                data.get("IPA", ""),
                data.get("AudioURL", ""),
                data.get("Accent", "")
            ))

        # 3️⃣ Example
        cursor.execute("SELECT * FROM Examples WHERE WordID = ?", (word_id,))
        example = cursor.fetchone()

        if example:
            cursor.execute("""
                UPDATE Examples
                SET ExampleSentence = ?, Translation = ?
                WHERE WordID = ?
            """, (
                data.get("ExampleSentence", ""),
                data.get("Translation", ""),
                word_id
            ))
        else:
            cursor.execute("""
                INSERT INTO Examples(WordID, ExampleSentence, Translation)
                VALUES (?, ?, ?)
            """, (
                word_id,
                data.get("ExampleSentence", ""),
                data.get("Translation", "")
            ))

        conn.commit()
        conn.close()

        return jsonify({"message": "Updated successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# DELETE
# =========================
@admin_vocab_bp.route("/<int:word_id>", methods=["DELETE"])
def delete_vocab(word_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 🔥 FIX tuple
        cursor.execute("DELETE FROM Pronunciations WHERE WordID = ?", (word_id,))
        cursor.execute("DELETE FROM Examples WHERE WordID = ?", (word_id,))
        cursor.execute("DELETE FROM Vocabulary WHERE WordID = ?", (word_id,))

        conn.commit()
        conn.close()

        return jsonify({"message": "Deleted successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500