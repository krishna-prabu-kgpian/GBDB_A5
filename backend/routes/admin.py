from flask import Blueprint, request, jsonify
from ..db import query_db, get_db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/assign-teacher', methods=['POST'])
def assign_teacher():
    data = request.get_json()
    instructor_id = data.get('instructor_id')
    course_id = data.get('course_id')
    
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute('INSERT INTO Teaches (Instructor_ID, Course_ID) VALUES (?, ?)',
                    (instructor_id, course_id))
        conn.commit()
        return jsonify({'message': 'Instructor assigned'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()

@admin_bp.route('/users', methods=['GET'])
def get_users():
    query = "SELECT User_ID as user_id, Username as username, Role as role, Name as name, Email as email FROM Users"
    users = query_db(query)
    return jsonify(users if users else [])

@admin_bp.route('/user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute('DELETE FROM Users WHERE User_ID = ?', (user_id,))
        if cur.rowcount == 0:
            return jsonify({'error': 'User not found'}), 404
        conn.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
        cur.close()

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
