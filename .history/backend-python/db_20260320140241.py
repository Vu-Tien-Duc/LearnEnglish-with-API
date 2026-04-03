import pyodbc

def get_db_connection():
    try:
        print("🔌 Connecting to SQL Server...")

        conn = pyodbc.connect(
            "DRIVER={SQL Server};"   # ⚠️ đổi nếu máy bạn có driver khác
            "SERVER=localhost\\VUDUC;"   # ⚠️ sửa đúng tên server của bạn
            "DATABASE=EnglishVocabularyDB;"
            "Trusted_Connection=yes;"
        )

        print("✅ Connected to DB")
        return conn

    except Exception as e:
        print("❌ DB CONNECTION ERROR:", e)
        return None