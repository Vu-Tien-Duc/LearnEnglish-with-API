import os
import json
from dotenv import load_dotenv
from google import genai 
from google.genai import types # Thêm types để cấu hình ép kiểu trả về JSON

load_dotenv()

# Khởi tạo Client bằng API Key của bạn
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# SỬA LỖI TÊN MODEL: Đổi thành gemini-2.0-flash
MODEL_ID = 'gemini-1.5-flash'

def generate_quiz_for_word(word: str, meaning: str):
    prompt = f"""
    Bạn là một chuyên gia tạo đề thi tiếng Anh. 
    Hãy tạo 1 câu hỏi trắc nghiệm để kiểm tra từ vựng "{word}" (nghĩa là: {meaning}).
    
    YÊU CẦU BẮT BUỘC: 
    - Cấu trúc JSON phải chính xác như sau:
    {{
        "questionText": "Nội dung câu hỏi (ví dụ: Chọn từ tiếng Anh có nghĩa là '{meaning}')",
        "options": [
            {{"text": "Đáp án 1", "isCorrect": true}},
            {{"text": "Đáp án 2", "isCorrect": false}},
            {{"text": "Đáp án 3", "isCorrect": false}},
            {{"text": "Đáp án 4", "isCorrect": false}}
        ]
    }}
    Lưu ý: Các đáp án sai phải là các từ tiếng Anh có thật, dễ gây nhầm lẫn. Vị trí đáp án đúng nên được xáo trộn ngẫu nhiên.
    """
    try:
        # Gọi API có kèm config ép trả về chuẩn JSON
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        # Vì đã ép kiểu ở trên, response.text chắc chắn là JSON sạch 100%
        quiz_data = json.loads(response.text)
        return quiz_data
        
    except Exception as e:
        print(f"❌ Lỗi khi gọi AI (Tạo Quiz): {e}")
        return None


def chat_with_teacher(user_message: str):
    prompt = f"""
    Bạn là một giáo viên tiếng Anh nhiệt tình và vui tính. Học viên của bạn vừa nói câu này: "{user_message}".
    
    Nhiệm vụ của bạn:
    1. Trả lời lại học viên một cách tự nhiên bằng tiếng Anh để tiếp tục cuộc trò chuyện.
    2. Nếu câu của học viên có lỗi ngữ pháp hoặc dùng từ chưa tự nhiên, hãy chỉ ra lỗi sai và giải thích ngắn gọn bằng tiếng Việt.
    3. Gợi ý một cách nói hay hơn (Native speaker way).
    
    YÊU CẦU: Trả về ĐÚNG định dạng JSON sau:
    {{
        "reply": "Câu trả lời của giáo viên (Tiếng Anh)",
        "correction": "Phân tích lỗi sai bằng tiếng Việt (nếu không có lỗi thì để chuỗi rỗng '')",
        "better_version": "Câu gợi ý hay hơn (Tiếng Anh)"
    }}
    """
    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        # Đã sửa lỗi thụt lề (Indentation) ở đoạn này
        return json.loads(response.text)
        
    except Exception as e:
        print(f"❌ Lỗi khi gọi AI (Chat): {e}")
        return {
            "reply": "Sorry, I'm having a little trouble thinking right now. Can you say that again?",
            "correction": "Lỗi kết nối đến Server AI mới.",
            "better_version": ""
        }