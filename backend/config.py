import os

class Config:
    # Database Configuration
    # DB_NAME = os.getenv('DB_NAME', 'cms_db')
    # DB_USER = os.getenv('DB_USER', 'postgres')
    # DB_PASSWORD = os.getenv('DB_PASSWORD', 'postgres')
    # DB_HOST = os.getenv('DB_HOST', 'localhost')
    # DB_PORT = os.getenv('DB_PORT', '5432')
    DATABASE = os.path.join(os.path.dirname(__file__), '..', 'cms_db.sqlite')
    
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_secret_key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev_jwt_secret')
