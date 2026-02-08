import os

class Config:
    # Database Configuration
    DATABASE_TYPE = 'postgres'
    
    # Postgres
    # Default to hosted Neon DB for demo purposes
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://neondb_owner:npg_2uC1fxpocyXV@ep-green-recipe-a1n8o5be-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require')
    # DB_NAME = os.getenv('DB_NAME', 'cms_db')
    # DB_USER = os.getenv('DB_USER', 'shreerajkalbande') # Current user
    # DB_PASSWORD = os.getenv('DB_PASSWORD', '') # Empty for local trust/ident
    # DB_HOST = os.getenv('DB_HOST', 'localhost')
    # DB_PORT = os.getenv('DB_PORT', '5432')
    
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_secret_key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev_jwt_secret')
