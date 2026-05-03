import jwt
import datetime
from functools import wraps
from flask import request, jsonify
from config import SECRET_KEY

def generate_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"message": "Token is missing"}), 401

        try:
            scheme, token = auth_header.split(" ", 1)
        except ValueError:
            return jsonify({"message": "Token format invalid"}), 401
        if scheme.lower() != "bearer" or not token:
            return jsonify({"message": "Token format invalid"}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user_id = data["user_id"]
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        return f(current_user_id, *args, **kwargs)

    return decorated