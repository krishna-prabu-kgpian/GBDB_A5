import jwt
import datetime
from functools import wraps
from flask import request, jsonify
from config import Config
from database import execute_single
from werkzeug.security import check_password_hash, generate_password_hash

def generate_token(user_id, role):
    """Generate JWT token"""
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=Config.JWT_ACCESS_TOKEN_EXPIRES)
    }
    token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')
    return token

def decode_token(token):
    """Decode JWT token"""
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to protect routes with JWT"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            payload = decode_token(token)
            if not payload:
                return jsonify({'error': 'Token is invalid or expired'}), 401
            
            request.user_id = payload['user_id']
            request.user_role = payload['role']
            
        except Exception as e:
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

def role_required(allowed_roles):
    """Decorator to check user role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if request.user_role not in allowed_roles:
                return jsonify({'error': 'Access denied'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def verify_password(username, password):
    """Verify user credentials"""
    query = "SELECT User_ID, Username, Password, Role, Name, Email FROM Users WHERE Username = %s"
    user = execute_single(query, (username,))
    
    if user and check_password_hash(user['password'], password):
        return {
            'user_id': user['user_id'],
            'username': user['username'],
            'role': user['role'],
            'name': user['name'],
            'email': user['email']
        }
    return None

def hash_password(password):
    """Hash password"""
    return generate_password_hash(password)