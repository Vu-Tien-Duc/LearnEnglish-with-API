from db import get_db_connection
import bcrypt

def migrate_passwords():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT UserID, PasswordHash FROM Users")
    users = cursor.fetchall()

    for user in users:
        user_id, old_pwd = user
        # Bỏ qua nếu đã hash (ví dụ bắt đầu bằng $2b$)
        if old_pwd.startswith("$2b$"):
            continue
        hashed = bcrypt.hashpw(old_pwd.encode("utf-8"), bcrypt.gensalt())
        cursor.execute("UPDATE Users SET PasswordHash=? WHERE UserID=?", (hashed.decode("utf-8"), user_id))

    conn.commit()
    conn.close()
    print("Đã migrate tất cả password cũ sang bcrypt")

if __name__ == "__main__":
    migrate_passwords()