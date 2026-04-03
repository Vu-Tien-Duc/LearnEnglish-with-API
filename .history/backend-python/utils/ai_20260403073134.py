import os
import json
from dotenv import load_dotenv
from google import genai 
from google.genai import types

load_dotenv()

# Khởi tạo Client
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

# Thử in ra để chắc chắn key đã ăn (Bạn có thể xóa dòng này sau khi chạy được)
print(f"--- AI System Initialized with Key: {api_key[:5]}... ---")
def generate_quiz_for_word(word: str, meaning: str):
    prompt = f"Tạo 1 câu hỏi trắc nghiệm tiếng Anh cho từ '{word}' ({meaning}). Trả về JSON chuẩn questionText và options."
    try:
        # Cú pháp đúng của SDK mới: Model ID truyền vào đầu tiên
        response = client.models.generate_content(
            model='gemini-1.5-flash', # Đảm bảo không có chữ 'models/' ở đây
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"❌ Lỗi AI Quiz: {e}")
        return None

def chat_with_teacher(user_message: str):
    prompt = f"""
    Bạn là giáo viên tiếng Anh. Học viên nói: "{user_message}".
    Trả về JSON: 
    {{
        "reply": "Tiếng Anh",
        "correction": "Giải thích tiếng Việt nếu sai, không sai để rỗng",
        "better_version": "Câu hay hơn"
    }}
    """
    try:
        # Nhớ kiểm tra xem biến api_key phía trên có bị None không bằng lệnh print cũ
        response = client.models.generate_content(
            model='gemini-2.0-flash', 
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"❌ Lỗi AI Chat CHI TIẾT: {e}") 
        return {
            "reply": "I'm having some technical issues. Please check your Terminal.",
            "correction": f"Lỗi: {str(e)[:50]}...", 
            "better_version": ""
        }