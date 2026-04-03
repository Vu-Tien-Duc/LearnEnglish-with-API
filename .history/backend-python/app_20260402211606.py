from flask import Flask
from flask_cors import CORS

from utils.auth import auth_bp
from routes.admin_vocab import admin_vocab_bp
from routes.admin_category import admin_category_bp
from routes.admin_dashboard import admin_dashboard_bp
from routes.quiz import quiz_bp
from routes.admin_user_bp import admin_user_bp 
from routes.admin_LearningProgress import admin_learning_progress_bp
from routes.admin_lesson import admin_lesson_bp
from routes.admin_favoritewords import admin_favorite_bp

# User

from routes.user_vocabulary import user_vocab_bp
from routes.user_favorites  import user_favorites_bp
from routes.user_history    import user_history_bp
from routes.user_quiz       import user_quiz_bp
from routes.home import home_bp
app = Flask(__name__, static_folder="uploads", static_url_path="/uploads")

CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

app.json.ensure_ascii = False
# Import blueprint từ file home_bp của bạn (đảm bảo tên file khớp với project của bạn)


# Đăng ký Blueprint với url_prefix là /api
app.register_blueprint(home_bp, url_prefix="/api")

# 🔥 Register ADMIN
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(admin_vocab_bp, url_prefix="/api/admin/vocabulary")
app.register_blueprint(admin_category_bp, url_prefix="/api/admin/category")
app.register_blueprint(admin_dashboard_bp, url_prefix="/api/admin/dashboard")
app.register_blueprint(quiz_bp, url_prefix="/api/admin/quiz")
app.register_blueprint(admin_user_bp,url_prefix="/api/admin/users")
app.register_blueprint(admin_learning_progress_bp, url_prefix="/api/admin/learnprogress")
app.register_blueprint(admin_lesson_bp, url_prefix="/api/admin/lessons")
app.register_blueprint(admin_favorite_bp, url_prefix="/api/admin/favoriteword")


# USER

app.register_blueprint(user_vocab_bp,      url_prefix="/api/user")
app.register_blueprint(user_favorites_bp,  url_prefix="/api/user")
app.register_blueprint(user_history_bp,    url_prefix="/api/user")
app.register_blueprint(user_quiz_bp,       url_prefix="/api/user")
@app.route("/")
def home():
    return "Python API running"

if __name__ == "__main__":
    app.run(port=5000, debug=True)