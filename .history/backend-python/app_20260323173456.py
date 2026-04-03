from flask import Flask
from flask_cors import CORS

from utils.auth import auth_bp
from routes.admin_vocab import admin_vocab_bp
from routes.admin_category import admin_category_bp

app = Flask(__name__, static_folder="uploads", static_url_path="/uploads")

CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

app.json.ensure_ascii = False

# 🔥 Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(admin_vocab_bp, url_prefix="/api/admin/vocabulary")
app.register_blueprint(admin_category_bp, url_prefix="/api/admin/category")

@app.route("/")
def home():
    return "Python API running"

if __name__ == "__main__":
    app.run(port=5000, debug=True)