import os
import json
from dotenv import load_dotenv
from google import genai 
from google.genai import types
from google.genai.types import HttpOptions, HttpRetryOptions

load_dotenv()

# Khởi tạo Client
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(
    api_key=api_key,
    http_options=HttpOptions(
        retry_options=HttpRetryOptions(attempts=3) 
    )
)

print(f"--- AI System Initialized with Key: {api_key[:5]}... ---")

def generate_quiz_for_word(word: str, meaning: str):
    prompt = f"Tạo 1 câu hỏi trắc nghiệm tiếng Anh cho từ '{word}' ({meaning}). Trả về JSON chuẩn questionText và options."
    try:
        # SỬA LỖI 404: Chỉ dùng tên model, không dùng 'models/' phía trước
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
        # SỬA LỖI 404: Đảm bảo model ID là 'gemini-1.5-flash'
        # Lưu ý: 'gemini-2.5-flash' có thể chưa khả dụng ở khu vực/phiên bản của bạn, 
        # nên dùng 'gemini-1.5-flash' để ổn định nhất.
        response = client.models.generate_content(
            model='gemini-2.5-flash', 
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