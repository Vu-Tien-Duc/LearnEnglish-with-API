import os
import json
import time  # Thêm thư viện này để dùng hàm sleep
from dotenv import load_dotenv
from google import genai 
from google.genai import types

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

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
    
    max_retries = 3  # Thử lại tối đa 3 lần
    for i in range(max_retries):
        try:
            # Lưu ý: Hiện tại bản ổn định nhất thường là gemini-1.5-flash
            # Nếu gemini-2.5-flash lỗi, hãy đổi lại thành 'gemini-1.5-flash'
            response = client.models.generate_content(
                model='gemini-2.0-flash', 
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                )
            )
            return json.loads(response.text)

        except Exception as e:
            err_str = str(e).upper()
            # Kiểm tra nếu lỗi là do quá tải (503 hoặc UNAVAILABLE)
            if "503" in err_str or "UNAVAILABLE" in err_str or "429" in err_str:
                wait_time = (i + 1) * 2  # Lần 1 đợi 2s, lần 2 đợi 4s...
                print(f"⚠️ AI đang bận (Lần thử {i+1}/{max_retries}). Đang đợi {wait_time}s...")
                time.sleep(wait_time)
                continue # Thử lại vòng lặp
            
            # Nếu là lỗi khác thì báo lỗi luôn
            print(f"❌ Lỗi AI Chat: {e}") 
            break

    # Nếu sau khi thử lại vẫn lỗi hoặc gặp lỗi nghiêm trọng
    return {
        "reply": "Hệ thống AI đang phản hồi chậm, bạn thử lại câu này sau vài giây nhé!",
        "correction": "Server Gemini hiện đang bận (503).", 
        "better_version": ""
    }

# Bạn cũng nên áp dụng tương tự cho hàm generate_quiz_for_word