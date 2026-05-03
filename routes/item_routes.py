from flask import Blueprint, request, jsonify
from models.item_model import create_item, get_lost_items, get_found_items, search_items, get_item_by_id
from user_helper import update_user_points
from auth import token_required

item_bp = Blueprint("item_bp", __name__)


def _get_json_body():
    if not request.is_json:
        return None, (jsonify({"message": "Content-Type must be application/json"}), 415)
    data = request.get_json(silent=True)
    if data is None:
        return None, (jsonify({"message": "Invalid JSON payload"}), 400)
    return data, None


def _serialize_item(item):
    serialized = dict(item)
    if serialized.get("date_reported") is not None:
        serialized["date_reported"] = str(serialized["date_reported"])
    return serialized

@item_bp.route("/items/lost", methods=["POST"])
@token_required
def report_lost(current_user_id):
    data, error = _get_json_body()
    if error:
        return error

    item_name = data.get("item_name")
    category = data.get("category")
    description = data.get("description")
    location = data.get("location")
    date_reported = data.get("date_reported")
    contact_number = data.get("contact_number")
    image_url = data.get("image_url")

    if not item_name or not category or not description or not location:
        return jsonify({"message": "Required fields missing"}), 400

    create_item(
        item_name, category, description, location,
        date_reported, "Lost", contact_number,
        current_user_id, image_url
    )
    
    # Award 10 points for reporting a lost item
    update_user_points(current_user_id, 10)

    return jsonify({"message": "Lost item reported", "points_earned": 10}), 201


@item_bp.route("/items/found", methods=["POST"])
@token_required
def report_found(current_user_id):
    data, error = _get_json_body()
    if error:
        return error

    item_name = data.get("item_name")
    category = data.get("category")
    description = data.get("description")
    location = data.get("location")
    date_reported = data.get("date_reported")
    contact_number = data.get("contact_number")
    image_url = data.get("image_url")

    if not item_name or not category or not description or not location:
        return jsonify({"message": "Required fields missing"}), 400

    create_item(
        item_name, category, description, location,
        date_reported, "Found", contact_number,
        current_user_id, image_url
    )
    
    # Award 15 points for reporting a found item (helping others)
    update_user_points(current_user_id, 15)

    return jsonify({"message": "Found item reported", "points_earned": 15}), 201


@item_bp.route("/items/lost", methods=["GET"])
def view_lost_items():
    items = get_lost_items()
    return jsonify([_serialize_item(item) for item in items])


@item_bp.route("/items/found", methods=["GET"])
def view_found_items():
    items = get_found_items()
    # Filter out claimed items
    active_items = [item for item in items if item.get("status") != "Claimed"]
    return jsonify([_serialize_item(item) for item in active_items])


@item_bp.route("/items/search", methods=["GET"])
def search():
    category = request.args.get("category")
    location = request.args.get("location")
    items = search_items(category, location)
    return jsonify([_serialize_item(item) for item in items])


@item_bp.route("/items/<int:item_id>", methods=["GET"])
def get_item(item_id):
    item = get_item_by_id(item_id)
    if item:
        return jsonify(_serialize_item(item))
    return jsonify({"message": "Item not found"}), 404


@item_bp.route("/items/<int:item_id>", methods=["PUT"])
@token_required
def update_item(current_user_id, item_id):
    data, error = _get_json_body()
    if error:
        return error
    
    # Check if item belongs to current user
    item = get_item_by_id(item_id)
    if not item:
        return jsonify({"message": "Item not found"}), 404
    
    if item["user_id"] != current_user_id:
        return jsonify({"message": "Unauthorized"}), 403
    
    # Update item
    from database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    UPDATE items 
    SET item_name = %s, category = %s, description = %s, 
        location = %s, date_reported = %s, contact_number = %s, image_url = %s
    WHERE item_id = %s
    """
    
    values = (
        data.get("item_name"),
        data.get("category"),
        data.get("description"),
        data.get("location"),
        data.get("date_reported"),
        data.get("contact_number"),
        data.get("image_url"),
        item_id
    )
    
    cursor.execute(query, values)
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Item updated successfully"}), 200


@item_bp.route("/items/<int:item_id>", methods=["DELETE"])
@token_required
def delete_item(current_user_id, item_id):
    # Check if item belongs to current user
    item = get_item_by_id(item_id)
    if not item:
        return jsonify({"message": "Item not found"}), 404
    
    if item["user_id"] != current_user_id:
        return jsonify({"message": "Unauthorized"}), 403
    
    # Delete item
    from database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM items WHERE item_id = %s", (item_id,))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Item deleted successfully"}), 200


@item_bp.route("/items/<int:item_id>/mark-claimed", methods=["POST"])
@token_required
def mark_item_claimed(current_user_id, item_id):
    """Mark an item as claimed/reunited so it's hidden from listings"""
    item = get_item_by_id(item_id)
    if not item:
        return jsonify({"message": "Item not found"}), 404
    
    # Allow both the reporter and the claimer to mark as claimed
    from database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Update item status to 'Claimed'
    cursor.execute(
        "UPDATE items SET status = 'Claimed' WHERE item_id = %s",
        (item_id,)
    )
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Item marked as claimed successfully"}), 200