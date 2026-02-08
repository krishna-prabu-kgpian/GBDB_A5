import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    
    # NeonDB PostgreSQL connection
    DATABASE_URL = os.getenv('DATABASE_URL')
    
    # JWT Configuration
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours
    
    # File upload configuration
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'pdf', 'mp4', 'png', 'jpg', 'jpeg', 'doc', 'docx'}