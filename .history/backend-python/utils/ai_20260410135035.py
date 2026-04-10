import os
import json
from dotenv import load_dotenv
from google import genai 
from google.genai import types
from google.genai.types import HttpOptions, HttpRetryOptions # Thêm thư viện để cấu hình Retry

load_dotenv()

# Khởi tạo Client với cơ chế tự động thử lại tối đa 3 lần nếu máy chủ quá tải (Lỗi 503)
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(
    api_key=api_key,
    http_options=HttpOptions(
        retry_options=HttpRetryOptions(attempts=3) 
    )
)

# Thử in ra để chắc chắn key đã ăn (Bạn có thể xóa dòng này sau khi chạy được)
print(f"--- AI System Initialized with Key: {api_key[:5]}... ---")

def generate_quiz_for_word(word: str, meaning: str):
    prompt = f"Tạo 1 câu hỏi trắc nghiệm tiếng Anh cho từ '{word}' ({meaning}). Trả về JSON chuẩn questionText và options."
    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash', 
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
        # Đã đổi tạm sang gemini-1.5-flash để đảm bảo tính ổn định
        response = client.models.generate_content(
            model='gemini-1.5-flash', 
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