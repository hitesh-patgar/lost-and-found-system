from flask import Blueprint, request, jsonify
from models.user_model import create_user, login_user
from user_helper import get_user_profile, get_items_by_user
from auth import generate_token, token_required

user_bp = Blueprint('user_bp', __name__)


def _get_json_body():
    if not request.is_json:
        return None, (jsonify({"message": "Content-Type must be application/json"}), 415)
    data = request.get_json(silent=True)
    if data is None:
        return None, (jsonify({"message": "Invalid JSON payload"}), 400)
    return data, None

@user_bp.route("/register", methods=["POST"])
def register():
    data, error = _get_json_body()
    if error:
        return error

    if not data or not data.get("name") or not data.get("email") or not data.get("password"):
        return jsonify({"message": "All fields required"}), 400

    result = create_user(data["name"], data["email"], data["password"])

    if result == "exists":
        return jsonify({"message": "Email already registered"}), 400

    return jsonify({"message": "User registered successfully"}), 201


@user_bp.route("/login", methods=["POST"])
def login():
    data, error = _get_json_body()
    if error:
        return error

    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Email and password required"}), 400

    user = login_user(data["email"], data["password"])

    if user:
        token = generate_token(user["id"])
        return jsonify({
            "message": "Login successful",
            "token": token,
            "user_id": user["id"],
            "name": user["name"],
            "points": user.get("points", 0)
        })
    else:
        return jsonify({"message": "Invalid credentials"}), 401


@user_bp.route("/profile", methods=["GET"])
@token_required
def get_profile(current_user_id):
    try:
        user = get_user_profile(current_user_id)
        if user:
            items = get_items_by_user(current_user_id)
            # Separate items by status
            lost_items = [item for item in items if item.get("status") == "Lost"]
            found_items = [item for item in items if item.get("status") == "Found"]
            
            return jsonify({
                "name": user["name"],
                "email": user["email"],
                "points": user.get("points", 0),
                "community_points": user.get("points", 0),
                "lost_items": lost_items,
                "found_items": found_items
            })
        return jsonify({"message": "User not found"}), 404
    except Exception as e:
        print(f"Profile error: {str(e)}")
        return jsonify({"message": f"Error fetching profile: {str(e)}"}), 500