from database import get_db_connection

def get_user_profile(user_id):
    """Get user profile with points"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Try to get points column, fallback if it doesn't exist
        cursor.execute("SELECT id, name, email, points FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
    except Exception as e:
        # If points column doesn't exist, get without it
        print(f"Warning: {str(e)}")
        cursor.execute("SELECT id, name, email FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if user:
            user["points"] = 0
    conn.close()
    return user

def update_user_points(user_id, points_to_add):
    """Add points to user's account"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET points = points + %s WHERE id = %s", (points_to_add, user_id))
        conn.commit()
    except Exception as e:
        print(f"Warning: Could not update points - {str(e)}")
        # Silently fail if points column doesn't exist
        pass
    conn.close()

def get_items_by_user(user_id):
    """Get all items reported by a user"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM items WHERE user_id = %s ORDER BY date_reported DESC", (user_id,))
    items = cursor.fetchall()
    conn.close()
    
    # Serialize dates
    for item in items:
        if item.get("date_reported"):
            item["date_reported"] = str(item["date_reported"])
    
    return items
