import os
from dotenv import load_dotenv
import cloudinary
import cloudinary.api

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

try:
    result = cloudinary.api.ping()
    print("Cloudinary connection successful!")
    print("API status:", result.get("status", "Connected"))
except Exception as error:
    print("Cloudinary connection failed.")
    print("Error:", type(error).__name__, str(error))