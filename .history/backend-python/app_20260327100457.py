from flask import Flask
from flask_cors import CORS

from utils.auth import auth_bp
from routes.admin_vocab import admin_vocab_bp
from routes.admin_category import admin_category_bp
from routes.admin_dashboard import admin_dashboard_bp
from routes.quiz import quiz_bp
from routes.admin_user_bp import admin_user_bp 
from routes.admin_LearningProgress import admin_learning_progress_bp
app = Flask(__name__, static_folder="uploads", static_url_path="/uploads")

CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

app.json.ensure_ascii = False

# 🔥 Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(admin_vocab_bp, url_prefix="/api/admin/vocabulary")
app.register_blueprint(admin_category_bp, url_prefix="/api/admin/category")
app.register_blueprint(admin_dashboard_bp, url_prefix="/api/admin/dashboard")
app.register_blueprint(quiz_bp, url_prefix="/api/admin/quiz")
app.register_blueprint(admin_user_bp,url_prefix="/api/admin/users")
app.register_blueprint(admin_learning_progress_bp, url_prefix="/api/admin/learnprogress")
@app.route("/")
def home():
    return "Python API running"

if __name__ == "__main__":
    app.run(port=5000, debug=True)