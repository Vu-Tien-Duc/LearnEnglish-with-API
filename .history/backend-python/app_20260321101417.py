from flask import Flask
from flask_cors import CORS
from flask import send_from_directory

app = Flask(__name__)
CORS(app)
app.json.ensure_ascii = False

# Import route modules
from routes import admin_vocab, admin_category, user_vocab, quiz

app.register_blueprint(admin_vocab.admin_vocab_bp, url_prefix="/api/admin/vocabulary")
# app.register_blueprint(admin_category.admin_category_bp, url_prefix="/api/admin/category")
# app.register_blueprint(user_vocab.user_vocab_bp, url_prefix="/api/user/vocabulary")
# app.register_blueprint(quiz.quiz_bp, url_prefix="/api/quiz")

@app.route("/")
def home():
    return "Python API running"


@app.route("/uploads/images/<filename>")
def serve_image(filename):
    return send_from_directory("uploads/images", filename)
app = Flask(__name__, static_folder="uploads", static_url_path="/uploads")

if __name__ == "__main__":
    app.run(port=5000, debug=True)