import os

class Config:
    DATABASE_TYPE = 'postgres'
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://neondb_owner:npg_2uC1fxpocyXV@ep-green-recipe-a1n8o5be-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require')
    
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_secret_key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev_jwt_secret')
