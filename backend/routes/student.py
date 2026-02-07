from flask import Blueprint, request, jsonify, g
from ..db import query_db, get_db
from .auth import auth_bp # If we need decorators later, or just use raw JWT check
# For simplicity, we assume the frontend sends the token and we decode it or middleware handles it.
# Ideally we'd have a @login_required decorator. For this lab, I'll extract user from token or pass user_id in headers for testing if simple.
# But since we implemented JWT in login, let's assume we parse it.
# To keep strictly to "Functional Requirements" and "Minimal", I will add a simple helper or just trust the ID passed in the body (insecure but fast for lab) 
# OR better: use the JWT.

student_bp = Blueprint('student', __name__)

@student_bp.route('/courses', methods=['GET'])
def get_courses():
    search = request.args.get('search', '')
    query = "SELECT Course_ID as course_id, Name as name, Duration as duration, Fees as fees FROM Course WHERE Name LIKE ?" # SQLite uses LIKE (case-insensitive by default in some configurations or use UPPER)
    # Actually SQLite LIKE is case-insensitive for ASCII.
    courses = query_db(query, (f'%{search}%',))
    return jsonify(courses if courses else [])

@student_bp.route('/enroll', methods=['POST'])
def enroll():
    data = request.get_json()
    student_id = data.get('student_id') # In real app, get from Token
    course_id = data.get('course_id')
    
    if not student_id or not course_id:
        return jsonify({'error': 'Missing student_id or course_id'}), 400
        
    # Check if already enrolled
    # Use helper function for enrollment
    from ..db import enroll_student_db
    success, message = enroll_student_db(student_id, course_id)
    
    if success:
        return jsonify({'message': message}), 201
    else:
        status_code = 400 if message == 'Already enrolled' else 500
        return jsonify({'error': message}), status_code

@student_bp.route('/my-courses/<int:student_id>', methods=['GET'])
def my_courses(student_id):
    query = """
        SELECT c.Course_ID as course_id, c.Name as name, c.Duration as duration, e.Score as score
        FROM Enrollment e
        JOIN Course c ON e.Course_ID = c.Course_ID
        WHERE e.Student_ID = ?
    """
    courses = query_db(query, (student_id,))
    return jsonify(courses if courses else [])
