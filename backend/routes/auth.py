from flask import Blueprint, request, jsonify, current_app
from ..database_connection import query_db, get_db
import jwt
import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    from werkzeug.security import check_password_hash
    from ..database_interfacing import get_user_by_username_db
    user = get_user_by_username_db(username)
    
    if user:
        if check_password_hash(user['password'], password):
             token = jwt.encode({
                 'user_id': user['user_id'],
                 'role': user['role'],
                 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
             }, current_app.config['JWT_SECRET_KEY'], algorithm="HS256")
             
             return jsonify({
                 'token': token,
                 'user_id': user['user_id'],
                 'role': user['role'],
                 'name': user['name']
             })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')
    name = data.get('name')
    email = data.get('email')
    
    if not all([username, password, role, name, email]):
        return jsonify({'error': 'Missing required fields'}), 400
        
    from ..database_interfacing import register_user_db
    from werkzeug.security import generate_password_hash

    hashed_password = generate_password_hash(password)
    
    additional_data = {}
    if role == 'Student':
        additional_data['age'] = data.get('age')
        additional_data['country'] = data.get('country')
    elif role == 'Instructor':
        additional_data['experience'] = data.get('experience', 0)
        
    success, result = register_user_db(username, hashed_password, role, name, email, additional_data)
    
    if success:
        return jsonify({'message': 'User registered successfully', 'user_id': result}), 201
    else:
        return jsonify({'error': result}), 400
