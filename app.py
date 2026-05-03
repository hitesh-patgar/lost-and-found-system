from flask import Flask
from flask_cors import CORS
from routes.user_routes import user_bp
from routes.item_routes import item_bp
from routes.match_routes import match_bp
from routes.claim_routes import claim_bp
import os

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# CORS configuration for production
CORS(app, origins=[
    "http://localhost:5173",  # Local development
    "https://lost-and-found-system.opticallol81.workers.dev",  # Production frontend
], supports_credentials=True, allow_headers=["Content-Type", "Authorization"])

app.register_blueprint(user_bp)
app.register_blueprint(item_bp)
app.register_blueprint(match_bp)
app.register_blueprint(claim_bp)

@app.route("/")
def home():
    return "Welcome to East Point Lost and Found System"

if __name__ == "__main__":
    app.run(debug=True)