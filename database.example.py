import mysql.connector

# IMPORTANT: Copy this file to database.py and fill in your actual values
# DO NOT commit database.py to version control!

def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="your-mysql-password-here",
        database="lost_found_db"
    )
    return connection
