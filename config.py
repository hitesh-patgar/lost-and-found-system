import os

# config.py
SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "9f2c4a7b8d1e3f6a9c0d5e7f8b2a4c6d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4",
)

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "djutlrluy")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "967342862967219")
CLOUDINARY_API_SECRET = os.getenv(
    "CLOUDINARY_API_SECRET",
    "MBRAzq9pActIsyJq9W9btF9We-A",
)