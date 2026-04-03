from flask import Flask
from flask_cors import CORS
from flask import send_from_directory
from utils.auth import auth_bp


app = Flask(__name__, static_folder="uploads", static_url_path="/uploads")
CORS(app)
app.json.ensure_ascii = False

# Import route modules
from routes import admin_vocab, admin_category, user_vocab, quiz

app.register_blueprint(admin_vocab.admin_vocab_bp, url_prefix="/api/admin/vocabulary")
app.register_blueprint(auth_bp, url_prefix="/api/auth")
@app.route("/")
def home():
    return "Python API running"


if __name__ == "__main__":
    app.run(port=5000, debug=True)