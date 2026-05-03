from database import get_db_connection

def create_claim(found_item_id, claimed_by_user_id,
                 description_provided, location_provided,
                 claim_image_url, match_score):
    conn = get_db_connection()
    cursor = conn.cursor()

    status = "Approved" if match_score >= 0.5 else "Rejected"

    query = """
    INSERT INTO claims (
        found_item_id, claimed_by_user_id,
        description_provided, location_provided,
        claim_image_url, match_score, status
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    values = (found_item_id, claimed_by_user_id,
              description_provided, location_provided,
              claim_image_url, match_score, status)

    cursor.execute(query, values)
    conn.commit()
    claim_id = cursor.lastrowid
    conn.close()

    return {"claim_id": claim_id, "status": status}


def get_claim_by_id(claim_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM claims WHERE claim_id = %s", (claim_id,))
    claim = cursor.fetchone()
    conn.close()
    return claim


def get_contact_details(claim_id, requesting_user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        c.claim_id,
        c.status,
        c.match_score,
        i.item_name,
        i.location,
        i.contact_number,
        u.name as reporter_name,
        u.email as reporter_email
    FROM claims c
    JOIN items i ON c.found_item_id = i.item_id
    JOIN users u ON i.user_id = u.id
    WHERE c.claim_id = %s
    AND c.claimed_by_user_id = %s
    AND c.status = 'Approved'
    """

    cursor.execute(query, (claim_id, requesting_user_id))
    result = cursor.fetchone()
    conn.close()
    return result