from flask import Blueprint, request, jsonify
from models.claim_model import create_claim, get_claim_by_id, get_contact_details
from models.item_model import get_item_by_id
from matching import calculate_description_match, calculate_location_match, calculate_total_match
from auth import token_required

claim_bp = Blueprint("claim_bp", __name__)


def _get_json_body():
    if not request.is_json:
        return None, (jsonify({"message": "Content-Type must be application/json"}), 415)
    data = request.get_json(silent=True)
    if data is None:
        return None, (jsonify({"message": "Invalid JSON payload"}), 400)
    return data, None

@claim_bp.route("/items/claim/<int:found_item_id>", methods=["POST"])
@token_required
def claim_item(current_user_id, found_item_id):
    found_item = get_item_by_id(found_item_id)

    if not found_item:
        return jsonify({"message": "Item not found"}), 404

    if found_item["status"] != "Found":
        return jsonify({"message": "You can only claim Found items"}), 400

    if found_item["user_id"] == current_user_id:
        return jsonify({"message": "You cannot claim your own item"}), 400

    data, error = _get_json_body()
    if error:
        return error

    description_provided = data.get("description")
    location_provided = data.get("location")
    claim_image_url = data.get("claim_image_url")

    if not description_provided or not location_provided:
        return jsonify({"message": "Description and location required"}), 400

    desc_score = calculate_description_match(
        description_provided, found_item["description"]
    )
    loc_score = calculate_location_match(
        location_provided, found_item["location"]
    )
    total_score = calculate_total_match(desc_score, loc_score)
    
    # Debug logging
    print(f"=== CLAIM VERIFICATION DEBUG ===")
    print(f"Found item description: {found_item['description']}")
    print(f"User provided description: {description_provided}")
    print(f"Description score: {desc_score}")
    print(f"Found item location: {found_item['location']}")
    print(f"User provided location: {location_provided}")
    print(f"Location score: {loc_score}")
    print(f"Total score: {total_score}")
    print(f"=== END DEBUG ===")

    # Lower threshold to 0.35 (35%) for better user experience
    if total_score >= 0.35:
        status = "Approved"
    else:
        status = "Rejected"
    
    # Create claim with custom status
    from database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    INSERT INTO claims (
        found_item_id, claimed_by_user_id,
        description_provided, location_provided,
        claim_image_url, match_score, status
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    values = (found_item_id, current_user_id,
              description_provided, location_provided,
              claim_image_url, total_score, status)

    cursor.execute(query, values)
    conn.commit()
    claim_id = cursor.lastrowid
    conn.close()

    if status == "Approved":
        return jsonify({
            "message": "Claim approved! You can now get contact details.",
            "claim_id": claim_id,
            "match_score": f"{int(total_score * 100)}%",
            "status": "Approved"
        })
    else:
        return jsonify({
            "message": "Claim rejected. Description does not match enough.",
            "match_score": f"{int(total_score * 100)}%",
            "status": "Rejected",
            "tip": "Try providing more specific details about the item"
        })


@claim_bp.route("/items/contact/<int:claim_id>", methods=["GET"])
@token_required
def get_contact(current_user_id, claim_id):
    print(f"=== GET CONTACT DEBUG ===")
    print(f"Claim ID: {claim_id}")
    print(f"Requesting User ID: {current_user_id}")
    
    contact = get_contact_details(claim_id, current_user_id)
    
    print(f"Contact result: {contact}")
    print(f"=== END DEBUG ===")

    if contact:
        return jsonify({
            "message": "Contact details retrieved successfully",
            "item_name": contact["item_name"],
            "found_location": contact["location"],
            "reporter_name": contact["reporter_name"],
            "reporter_email": contact["reporter_email"],
            "contact_number": contact["contact_number"],
            "match_score": f"{int(contact['match_score'] * 100)}%"
        })
    else:
        return jsonify({
            "message": "Contact not available. Claim may be rejected or does not exist."
        }), 403


@claim_bp.route("/items/direct-contact/<int:item_id>", methods=["GET"])
@token_required
def get_direct_contact(current_user_id, item_id):
    """Get contact details directly for matched items (user already reported lost item)"""
    from database import get_db_connection
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Get the found item details with reporter info
    query = """
    SELECT
        i.item_id,
        i.item_name,
        i.location,
        i.contact_number,
        u.name as reporter_name,
        u.email as reporter_email
    FROM items i
    JOIN users u ON i.user_id = u.id
    WHERE i.item_id = %s AND i.status = 'Found'
    """
    
    cursor.execute(query, (item_id,))
    item = cursor.fetchone()
    conn.close()
    
    if item:
        return jsonify({
            "message": "Contact details retrieved successfully",
            "item_name": item["item_name"],
            "found_location": item["location"],
            "reporter_name": item["reporter_name"],
            "reporter_email": item["reporter_email"],
            "contact_number": item["contact_number"]
        })
    else:
        return jsonify({
            "message": "Item not found"
        }), 404