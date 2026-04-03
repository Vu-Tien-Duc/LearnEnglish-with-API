# backend-api/db.py
import pyodbc

def get_db_connection():
    try:
        conn = pyodbc.connect(
            "DRIVER={SQL Server};"           
            "SERVER=LAPTOP-9MACGRF6\\VUDUC;" 
            "DATABASE=EnglishVocabularyDB;"
            "Trusted_Connection=yes;"
        )
        print("✅ DB connection successful")
        return conn

    except pyodbc.Error as e:
        print("❌ DB connection failed:", e)
        return None