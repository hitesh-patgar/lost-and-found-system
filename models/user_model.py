from database import get_db_connection
import bcrypt

def create_user(name, email, password):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    existing_user = cursor.fetchone()

    if existing_user:
        conn.close()
        return "exists"

    hashed_password = bcrypt.hashpw(
        password.encode('utf-8'),
        bcrypt.gensalt()
    )

    query = """
    INSERT INTO users (name, email, password)
    VALUES (%s, %s, %s)
    """
    cursor.execute(query, (name, email, hashed_password))
    conn.commit()
    conn.close()
    return "created"


def login_user(email, password):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    conn.close()

    if user and bcrypt.checkpw(
        password.encode('utf-8'),
        user['password'].encode('utf-8')
    ):
        return user
    return None