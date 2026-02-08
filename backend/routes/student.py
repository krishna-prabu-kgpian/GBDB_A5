from flask import Blueprint, request, jsonify
from ..database_connection import query_db

student_bp = Blueprint('student', __name__)

@student_bp.route('/courses', methods=['GET'])
def get_courses():
    search = request.args.get('search', '')
    query = "SELECT Course_ID as course_id, Name as name, Duration as duration, Fees as fees FROM Course WHERE Name ILIKE ?" 
    courses = query_db(query, (f'%{search}%',))
    return jsonify(courses if courses else [])

@student_bp.route('/enroll', methods=['POST'])
def enroll():
    data = request.get_json()
    student_id = data.get('student_id')
    course_id = data.get('course_id')
    
    if not student_id or not course_id:
        return jsonify({'error': 'Missing student_id or course_id'}), 400
        
    from ..database_interfacing import enroll_student_db
    success, message = enroll_student_db(student_id, course_id)
    
    if success:
        return jsonify({'message': message}), 201
    else:
        status_code = 400 if message == 'Already enrolled' else 500
        return jsonify({'error': message}), status_code

@student_bp.route('/courses/<int:course_id>', methods=['GET'])
def get_course_details(course_id):
    # 1. Course Details
    course_query = "SELECT Course_ID as course_id, Name as name, Duration as duration, Fees as fees FROM Course WHERE Course_ID = ?"
    course_query = "SELECT Course_ID as course_id, Name as name, Duration as duration, Fees as fees FROM Course WHERE Course_ID = ?"
    course = query_db(course_query, (course_id,), one=True)
    
    if not course:
        return jsonify({'error': 'Course not found'}), 404
e as name, i.Experience as experience
        FROM Teaches t
        JOIN Instructor i ON t.Instructor_ID = i.Instructor_ID
        JOIN Users u ON i.Instructor_ID = u.User_ID
        WHERE t.Course_ID = ?
    """
    instructors = query_db(inst_query, (course_id,))

    # 3. Topics
    topic_query = """
        FROM Covers c
        JOIN Topic t ON c.Topic_ID = t.Topic_ID
        WHERE c.Course_ID = ?
    """
    topics = query_db(topic_query, (course_id,))

    # 4. Content
        SELECT cc.Type as type, cc.URL as url
        FROM Includes i
        JOIN Course_Content cc ON i.Content_ID = cc.Content_ID
        WHERE i.Course_ID = ?
    """
    content = query_db(content_query, (course_id,))
    
    # 5. Textbooks (References) -- Assuming Course_Reference table links Course and Textbook
    # Check schema? Assuming table Course_Reference (Course_ID, ISBN) and Textbook (ISBN, Title, Author)
    textbook_query = """
        SELECT tb.Title as title, tb.Author as author
        FROM Course_Reference r
        JOIN Textbook tb ON r.ISBN = tb.ISBN
        WHERE r.Course_ID = ?
    """
    
    textbooks = []
    try:
        textbooks = query_db(textbook_query, (course_id,))
    except:
        pass
        'course': course,
        'instructors': instructors if instructors else [],
        'topics': topics if topics else [],
        'content': content if content else [],
        'textbooks': textbooks if textbooks else []
    })

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
