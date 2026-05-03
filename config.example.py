import os

# config.py
# IMPORTANT: Copy this file to config.py and fill in your actual values
# DO NOT commit config.py to version control!

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "your-secret-key-here-change-this-to-a-random-string",
)

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "your-cloud-name")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "your-api-key")
CLOUDINARY_API_SECRET = os.getenv(
    "CLOUDINARY_API_SECRET",
    "your-api-secret",
)
