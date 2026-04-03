from db import get_db_connection
import bcrypt

def migrate_passwords():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT UserID, PasswordHash FROM Users")
    users = cursor.fetchall()

    for user in users:
        user_id, old_pwd = user

        if old_pwd.startswith("$2b$"):
            continue

        hashed = bcrypt.hashpw(old_pwd.encode(), bcrypt.gensalt())

        cursor.execute(
            "UPDATE Users SET PasswordHash=? WHERE UserID=?",
            (hashed.decode(), user_id)
        )

    conn.commit()
    conn.close()
    print("✅ Done migrate")

if __name__ == "__main__":
    migrate_passwords()