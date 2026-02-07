from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import database_functions as dbfuncts
import json

app = Flask(__name__)

@app.route('/api/v1/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'All Fields not filled'}), 400
    
    result = dbfuncts.login(username, password)
    
    if result is None:
        return jsonify({'error': "Invalid credentials for user"}), 401
    
    else:
        session['userId'] = result.get('userId')
        response = {"userId": result.get('userId'), "role": result.get('role'), "name": result.get('name'), "email": result.get('email')}
        return jsonify(response), 200

@app.route('/api/v1/me', methods=['GET'])
def me():
    if 'userId' not in session:
        return jsonify({'error': "Not Authenticated"}), 401
    else:
        return jsonify(dbfuncts.USER_get_by_id(session['userId'])), 200

@app.route('/api/v1/entry', methods=['GET'])
def entry():
    if 'userId' not in session:
        return jsonify({'error': "Not Authenticated"}), 401
    
    else:
        userInfo = dbfuncts.USER_get_by_id(session['userId'])
        response = {}
        response['role'] = userInfo['role']
        if userInfo['role'] == 'STUDENT':
            pass
        elif userInfo['role'] == 'ADMIN':
            pass
        elif userInfo['role'] == 'INSTRUCTOR':
            pass
        else:
            pass
        
        return jsonify(response), 200
    
@app.route('/api/v1/courses', methods=['GET'])
def courses():
    pass   