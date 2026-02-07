from flask import Blueprint, request, jsonify
from ..db import query_db, get_db

instructor_bp = Blueprint('instructor', __name__)

@instructor_bp.route('/my-courses/<int:instructor_id>', methods=['GET'])
def my_courses(instructor_id):
    query = """
        SELECT c.Course_ID as course_id, c.Name as name
        FROM Teaches t
        JOIN Course c ON t.Course_ID = c.Course_ID
        WHERE t.Instructor_ID = ?
    """
    courses = query_db(query, (instructor_id,))
    return jsonify(courses if courses else [])

@instructor_bp.route('/add-content', methods=['POST'])
def add_content():
    data = request.get_json()
    course_id = data.get('course_id')
    content_url = data.get('url')
    content_type = data.get('type')
    
    if not all([course_id, content_url, content_type]):
        return jsonify({'error': 'Missing fields'}), 400
        
    from ..db import add_course_content_db
    success, message = add_course_content_db(course_id, content_url, content_type)
    
    if success:
        return jsonify({'message': message}), 201
    else:
        return jsonify({'error': message}), 400
