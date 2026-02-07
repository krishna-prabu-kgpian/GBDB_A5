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
        
    conn = get_db()
    cur = conn.cursor()
    try:
        # Insert into Course_Content
        # SQLite uses lastrowid
        cur.execute('INSERT INTO Course_Content (URL, Type) VALUES (?, ?)',
                    (content_url, content_type))
        content_id = cur.lastrowid
        
        # Insert into Includes (as per ER diagram structure requirement)
        cur.execute('INSERT INTO Includes (Course_ID, Content_ID) VALUES (?, ?)',
                    (course_id, content_id))
                    
        conn.commit()
        return jsonify({'message': 'Content added successfully'}), 201
    except Exception as e:
        conn.rollback()
        print(e)
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
