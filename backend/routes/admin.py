from flask import Blueprint, request, jsonify
from ..db import query_db, get_db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/assign-teacher', methods=['POST'])
def assign_teacher():
    data = request.get_json()
    instructor_id = data.get('instructor_id')
    course_id = data.get('course_id')
    
    from ..db import assign_instructor_db
    success, message = assign_instructor_db(instructor_id, course_id)
    
    if success:
        return jsonify({'message': message}), 201
    else:
        return jsonify({'error': message}), 400

@admin_bp.route('/users', methods=['GET'])
def get_users():
    query = "SELECT User_ID as user_id, Username as username, Role as role, Name as name, Email as email FROM Users"
    users = query_db(query)
    return jsonify(users if users else [])

@admin_bp.route('/user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    from ..db import delete_user_db
    success, message = delete_user_db(user_id)
    
    if success:
        return jsonify({'message': message}), 200
    else:
        status_code = 404 if message == 'User not found' else 400
        return jsonify({'error': message}), status_code

@admin_bp.route('/instructors', methods=['GET'])
def get_instructors():
    query = "SELECT Instructor_ID as instructor_id, Name as name FROM Instructor JOIN Users ON Instructor.Instructor_ID = Users.User_ID"
    instructors = query_db(query)
    return jsonify(instructors if instructors else [])

@admin_bp.route('/courses', methods=['GET'])
def get_courses():
    query = "SELECT Course_ID as course_id, Name as name FROM Course"
    courses = query_db(query)
    return jsonify(courses if courses else [])
