from database import get_db_connection

def create_item(item_name, category, description, location, 
                date_reported, status, contact_number, user_id, image_url=None):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    INSERT INTO items (item_name, category, description, location,
    date_reported, status, contact_number, user_id, image_url)
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """

    values = (item_name, category, description, location,
              date_reported, status, contact_number, user_id, image_url)

    cursor.execute(query, values)
    conn.commit()
    conn.close()


def get_lost_items():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM items WHERE status='Lost'")
    result = cursor.fetchall()
    conn.close()
    return result


def get_found_items():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM items WHERE status='Found'")
    result = cursor.fetchall()
    conn.close()
    return result


def search_items(category, location):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT * FROM items
    WHERE category = %s AND location = %s
    """

    cursor.execute(query, (category, location))
    result = cursor.fetchall()
    conn.close()
    return result


def get_item_by_id(item_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM items WHERE item_id = %s", (item_id,))
    item = cursor.fetchone()
    conn.close()
    return item