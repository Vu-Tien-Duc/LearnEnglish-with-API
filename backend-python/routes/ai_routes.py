# File: routes/ai_routes.py
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin

# 👇 Đã sửa dòng này: Thêm utils. ở phía trước
from utils.ai import chat_with_teacher 

ai_bp = Blueprint("ai", __name__)

# POST /api/ai/chat
@ai_bp.route("/chat", methods=["POST", "OPTIONS"])
@cross_origin()
def chat():
    data = request.json
    user_message = data.get("message")
    
    if not user_message:
        return jsonify({"error": "Thiếu nội dung tin nhắn"}), 400
        
    # Gọi hàm AI từ file utils/ai.py
    result = chat_with_teacher(user_message)
    
    return jsonify(result)