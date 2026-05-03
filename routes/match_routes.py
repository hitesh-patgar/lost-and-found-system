from flask import Blueprint, request, jsonify
from database import get_db_connection
from matching import calculate_description_match, calculate_location_match, calculate_total_match
from user_helper import update_user_points
from auth import token_required

match_bp = Blueprint("match_bp", __name__)


def _get_json_body():
    if not request.is_json:
        return None, (jsonify({"message": "Content-Type must be application/json"}), 415)
    data = request.get_json(silent=True)
    if data is None:
        return None, (jsonify({"message": "Invalid JSON payload"}), 400)
    return data, None

@match_bp.route("/items/match", methods=["POST"])
@token_required
def find_matches(current_user_id):
    data, error = _get_json_body()
    if error:
        return error

    description = data.get("description")
    location = data.get("location")
    status_looking_for = data.get("status")

    if not description or not location or not status_looking_for:
        return jsonify({"message": "Description, location and status required"}), 400
    if status_looking_for not in ("Lost", "Found"):
        return jsonify({"message": "Status must be either Lost or Found"}), 400

    search_status = "Found" if status_looking_for == "Lost" else "Lost"

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    # Exclude claimed items
    cursor.execute("SELECT * FROM items WHERE status = %s", (search_status,))
    items = cursor.fetchall()
    conn.close()

    matches = []

    for item in items:
        desc_score = calculate_description_match(description, item["description"])
        loc_score = calculate_location_match(location, item["location"])
        total_score = calculate_total_match(desc_score, loc_score)

        if total_score >= 0.4:
            matches.append({
                "item_id": item["item_id"],
                "item_name": item["item_name"],
                "category": item["category"],
                "description": item["description"],
                "location": item["location"],
                "date_reported": str(item["date_reported"]),
                "image_url": item["image_url"],
                "match_score": total_score,
                "match_percentage": f"{int(total_score * 100)}%"
            })

    matches.sort(key=lambda x: x["match_score"], reverse=True)
    
    # Award 5 points for finding matches
    if len(matches) > 0:
        update_user_points(current_user_id, 5)

    return jsonify({
        "message": f"{len(matches)} match(es) found",
        "matches": matches,
        "points_earned": 5 if len(matches) > 0 else 0
    })


@match_bp.route("/items/my-matches", methods=["GET"])
@token_required
def get_my_matches(current_user_id):
    """Get all matched items for the current user's lost items"""
    try:
        print(f"=== MY MATCHES DEBUG ===")
        print(f"Current user ID: {current_user_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get all lost items reported by the user (exclude claimed)
        print("Fetching lost items...")
        cursor.execute("SELECT * FROM items WHERE user_id = %s AND status = 'Lost'", (current_user_id,))
        lost_items = cursor.fetchall()
        print(f"Found {len(lost_items)} lost items")
        
        # Get all found items (not reported by this user, exclude claimed)
        print("Fetching found items...")
        cursor.execute("SELECT * FROM items WHERE status = 'Found' AND user_id != %s", (current_user_id,))
        found_items = cursor.fetchall()
        print(f"Found {len(found_items)} found items")
        
        conn.close()
        
        all_matches = []
        
        print("Calculating matches...")
        for lost_item in lost_items:
            for found_item in found_items:
                desc_score = calculate_description_match(lost_item["description"], found_item["description"])
                loc_score = calculate_location_match(lost_item["location"], found_item["location"])
                total_score = calculate_total_match(desc_score, loc_score)
                
                if total_score >= 0.4:
                    all_matches.append({
                        "lost_item": {
                            "item_id": lost_item["item_id"],
                            "item_name": lost_item["item_name"],
                            "category": lost_item["category"],
                            "description": lost_item["description"],
                            "location": lost_item["location"],
                            "date_reported": str(lost_item["date_reported"]),
                            "image_url": lost_item["image_url"]
                        },
                        "found_item": {
                            "item_id": found_item["item_id"],
                            "item_name": found_item["item_name"],
                            "category": found_item["category"],
                            "description": found_item["description"],
                            "location": found_item["location"],
                            "date_reported": str(found_item["date_reported"]),
                            "image_url": found_item["image_url"]
                        },
                        "match_score": total_score,
                        "match_percentage": f"{int(total_score * 100)}%"
                    })
        
        all_matches.sort(key=lambda x: x["match_score"], reverse=True)
        
        print(f"Total matches found: {len(all_matches)}")
        print("=== END DEBUG ===")
        
        return jsonify({
            "message": f"{len(all_matches)} match(es) found",
            "matches": all_matches
        })
    except Exception as e:
        print(f"=== ERROR IN MY MATCHES ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        import traceback
        traceback.print_exc()
        print("=== END ERROR ===")
        return jsonify({"message": f"Error fetching matches: {str(e)}"}), 500