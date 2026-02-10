from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from database import execute_query, execute_single
from auth import (
    generate_token, token_required, role_required, 
    verify_password, hash_password
)
import os
from datetime import datetime

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ============================================
# AUTH ROUTES
# ============================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        role = data.get('role')
        name = data.get('name')
        email = data.get('email')
        
        # Additional data based on role
        country = data.get('country')
        category = data.get('category')
        skill_level = data.get('skill_level')
        age = data.get('age')
        experience = data.get('experience')
        
        if not all([username, password, role, name, email]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if username or email already exists
        check_query = "SELECT User_ID FROM Users WHERE Username = %s OR Email = %s"
        existing = execute_single(check_query, (username, email))
        if existing:
            return jsonify({'error': 'Username or email already exists'}), 400
        
        # Generate user ID based on role
        if role == 'Student':
            # Get max student ID
            max_id_query = "SELECT Student_ID FROM Student ORDER BY Student_ID DESC LIMIT 1"
            max_id = execute_single(max_id_query)
            if max_id and max_id['student_id']:
                num = int(max_id['student_id'][3:]) + 1
            else:
                num = 1
            user_id = f"STU{num:03d}"
        elif role == 'Instructor':
            max_id_query = "SELECT Instructor_ID FROM Instructor ORDER BY Instructor_ID DESC LIMIT 1"
            max_id = execute_single(max_id_query)
            if max_id and max_id['instructor_id']:
                num = int(max_id['instructor_id'][3:]) + 1
            else:
                num = 1
            user_id = f"INS{num:03d}"
        elif role == 'Data_Analyst':
            max_id_query = "SELECT Analyst_ID FROM Data_Analyst ORDER BY Analyst_ID DESC LIMIT 1"
            max_id = execute_single(max_id_query)
            if max_id and max_id['analyst_id']:
                num = int(max_id['analyst_id'][3:]) + 1
            else:
                num = 1
            user_id = f"ANA{num:03d}"
        elif role == 'Administrator':
            max_id_query = "SELECT Admin_ID FROM Administrator ORDER BY Admin_ID DESC LIMIT 1"
            max_id = execute_single(max_id_query)
            if max_id and max_id['admin_id']:
                num = int(max_id['admin_id'][3:]) + 1
            else:
                num = 1
            user_id = f"ADM{num:03d}"
        else:
            return jsonify({'error': 'Invalid role'}), 400
        
        # Hash password
        hashed_password = hash_password(password)
        
        # Insert into Users table
        insert_user_query = """
            INSERT INTO Users (User_ID, Username, Password, Role, Name, Email)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        execute_query(insert_user_query, (user_id, username, hashed_password, role, name, email), fetch=False)
        
        # Insert into role-specific table
        if role == 'Student':
            insert_student_query = """
                INSERT INTO Student (Student_ID, Country, Category, Skill_Level, Age)
                VALUES (%s, %s, %s, %s, %s)
            """
            execute_query(insert_student_query, (user_id, country, category, skill_level, age), fetch=False)
        elif role == 'Instructor':
            insert_instructor_query = "INSERT INTO Instructor (Instructor_ID, Experience) VALUES (%s, %s)"
            execute_query(insert_instructor_query, (user_id, experience or 0), fetch=False)
        elif role == 'Data_Analyst':
            insert_analyst_query = "INSERT INTO Data_Analyst (Analyst_ID) VALUES (%s)"
            execute_query(insert_analyst_query, (user_id,), fetch=False)
        elif role == 'Administrator':
            insert_admin_query = "INSERT INTO Administrator (Admin_ID) VALUES (%s)"
            execute_query(insert_admin_query, (user_id,), fetch=False)
        
        # Generate token
        token = generate_token(user_id, role)
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'user_id': user_id,
                'username': username,
                'role': role,
                'name': name,
                'email': email
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        user = verify_password(username, password)
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        token = generate_token(user['user_id'], user['role'])
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# STUDENT ROUTES
# ============================================

@app.route('/api/student/courses', methods=['GET'])
@token_required
@role_required(['Student'])
def get_all_courses_student():
    """Get all courses for students with optional search"""
    try:
        search = request.args.get('search', '')
        
        if search:
            query = """
                SELECT c.*, 
                       CASE WHEN e.Student_ID IS NOT NULL THEN true ELSE false END as is_enrolled
                FROM Course c
                LEFT JOIN Enrollment e ON c.Course_ID = e.Course_ID AND e.Student_ID = %s
                WHERE LOWER(c.Name) LIKE LOWER(%s)
                ORDER BY c.Name
            """
            courses = execute_query(query, (request.user_id, f'%{search}%'))
        else:
            query = """
                SELECT c.*, 
                       CASE WHEN e.Student_ID IS NOT NULL THEN true ELSE false END as is_enrolled
                FROM Course c
                LEFT JOIN Enrollment e ON c.Course_ID = e.Course_ID AND e.Student_ID = %s
                ORDER BY c.Name
            """
            courses = execute_query(query, (request.user_id,))
        
        return jsonify(courses), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/student/courses/<course_id>', methods=['GET'])
@token_required
@role_required(['Student'])
def get_course_details_student(course_id):
    """Get detailed course information including content"""
    try:
        # Get course details
        course_query = """
            SELECT c.*, 
                   CASE WHEN e.Student_ID IS NOT NULL THEN true ELSE false END as is_enrolled,
                   e.Score as my_score,
                   e.Enrollment_Date
            FROM Course c
            LEFT JOIN Enrollment e ON c.Course_ID = e.Course_ID AND e.Student_ID = %s
            WHERE c.Course_ID = %s
        """
        course = execute_single(course_query, (request.user_id, course_id))
        
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        # Get course content
        content_query = """
            SELECT cc.* FROM Course_content cc
            JOIN Includes i ON cc.Content_ID = i.Content_ID
            WHERE i.Course_ID = %s
            ORDER BY cc.Content_ID
        """
        content = execute_query(content_query, (course_id,))
        
        # Get topics
        topics_query = """
            SELECT t.* FROM Topic t
            JOIN Covers cv ON t.Topic_ID = cv.Topic_ID
            WHERE cv.Course_ID = %s
        """
        topics = execute_query(topics_query, (course_id,))
        
        # Get textbooks
        textbooks_query = """
            SELECT tb.* FROM Textbook tb
            JOIN Reference r ON tb.ISBN = r.ISBN
            WHERE r.Course_ID = %s
        """
        textbooks = execute_query(textbooks_query, (course_id,))
        
        # Get instructors
        instructors_query = """
            SELECT u.Name, u.Email, i.Experience
            FROM Users u
            JOIN Instructor i ON u.User_ID = i.Instructor_ID
            JOIN Teaches t ON i.Instructor_ID = t.Instructor_ID
            WHERE t.Course_ID = %s
        """
        instructors = execute_query(instructors_query, (course_id,))
        
        course['content'] = content
        course['topics'] = topics
        course['textbooks'] = textbooks
        course['instructors'] = instructors
        
        return jsonify(course), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/student/enroll/<course_id>', methods=['POST'])
@token_required
@role_required(['Student'])
def enroll_course(course_id):
    """Enroll in a course"""
    try:
        # Check if already enrolled
        check_query = "SELECT * FROM Enrollment WHERE Student_ID = %s AND Course_ID = %s"
        existing = execute_single(check_query, (request.user_id, course_id))
        
        if existing:
            return jsonify({'error': 'Already enrolled in this course'}), 400
        
        # Enroll
        enroll_query = """
            INSERT INTO Enrollment (Student_ID, Course_ID, Enrollment_Date, Score)
            VALUES (%s, %s, %s, NULL)
        """
        execute_query(enroll_query, (request.user_id, course_id, datetime.now().date()), fetch=False)
        
        return jsonify({'message': 'Enrolled successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/student/unenroll/<course_id>', methods=['DELETE'])
@token_required
@role_required(['Student'])
def unenroll_course(course_id):
    """Unenroll from a course"""
    try:
        delete_query = "DELETE FROM Enrollment WHERE Student_ID = %s AND Course_ID = %s"
        execute_query(delete_query, (request.user_id, course_id), fetch=False)
        
        return jsonify({'message': 'Unenrolled successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/student/my-courses', methods=['GET'])
@token_required
@role_required(['Student'])
def get_my_courses():
    """Get student's enrolled courses"""
    try:
        query = """
            SELECT c.*, e.Score, e.Enrollment_Date
            FROM Course c
            JOIN Enrollment e ON c.Course_ID = e.Course_ID
            WHERE e.Student_ID = %s
            ORDER BY e.Enrollment_Date DESC
        """
        courses = execute_query(query, (request.user_id,))
        return jsonify(courses), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/student/programs', methods=['GET'])
@token_required
@role_required(['Student'])
def get_programs():
    """Get all programs with their courses"""
    try:
        # Get all programs
        programs_query = "SELECT * FROM Program ORDER BY Name"
        programs = execute_query(programs_query)
        
        # For each program, get its courses
        for program in programs:
            courses_query = """
                SELECT c.Course_ID, c.Name, c.Duration, c.Fees,
                       EXISTS(SELECT 1 FROM Enrollment WHERE Student_ID = %s AND Course_ID = c.Course_ID) as is_enrolled
                FROM Course c
                JOIN Part_of p ON c.Course_ID = p.Course_ID
                WHERE p.Program_ID = %s
                ORDER BY c.Name
            """
            program['courses'] = execute_query(courses_query, (request.user_id, program['program_id']))
        
        return jsonify(programs), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# INSTRUCTOR ROUTES
# ============================================

@app.route('/api/instructor/courses', methods=['GET'])
@token_required
@role_required(['Instructor'])
def get_all_courses_instructor():
    """Get all courses"""
    try:
        query = """
            SELECT c.*,
                   CASE WHEN t.Instructor_ID IS NOT NULL THEN true ELSE false END as is_teaching
            FROM Course c
            LEFT JOIN Teaches t ON c.Course_ID = t.Course_ID AND t.Instructor_ID = %s
            ORDER BY c.Name
        """
        courses = execute_query(query, (request.user_id,))
        return jsonify(courses), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/instructor/my-courses', methods=['GET'])
@token_required
@role_required(['Instructor'])
def get_my_courses_instructor():
    """Get courses taught by instructor"""
    try:
        query = """
            SELECT c.*, 
                   COUNT(DISTINCT e.Student_ID) as enrolled_students
            FROM Course c
            JOIN Teaches t ON c.Course_ID = t.Course_ID
            LEFT JOIN Enrollment e ON c.Course_ID = e.Course_ID
            WHERE t.Instructor_ID = %s
            GROUP BY c.Course_ID, c.Name, c.Duration, c.Fees, c.Description
            ORDER BY c.Name
        """
        courses = execute_query(query, (request.user_id,))
        return jsonify(courses), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/instructor/course/<course_id>', methods=['GET'])
@token_required
@role_required(['Instructor'])
def get_course_details_instructor(course_id):
    """Get course details for instructor"""
    try:
        # Check if instructor teaches this course
        check_query = "SELECT * FROM Teaches WHERE Instructor_ID = %s AND Course_ID = %s"
        teaches = execute_single(check_query, (request.user_id, course_id))
        
        if not teaches:
            return jsonify({'error': 'You do not teach this course'}), 403
        
        # Get course details
        course_query = "SELECT * FROM Course WHERE Course_ID = %s"
        course = execute_single(course_query, (course_id,))
        
        # Get content
        content_query = """
            SELECT cc.* FROM Course_content cc
            JOIN Includes i ON cc.Content_ID = i.Content_ID
            WHERE i.Course_ID = %s
        """
        content = execute_query(content_query, (course_id,))
        
        # Get enrolled students
        students_query = """
            SELECT u.User_ID, u.Name, u.Email, s.Country, s.Skill_Level, e.Score, e.Enrollment_Date
            FROM Users u
            JOIN Student s ON u.User_ID = s.Student_ID
            JOIN Enrollment e ON s.Student_ID = e.Student_ID
            WHERE e.Course_ID = %s
            ORDER BY u.Name
        """
        students = execute_query(students_query, (course_id,))
        
        # Get co-instructors
        instructors_query = """
            SELECT u.User_ID, u.Name, u.Email, i.Experience
            FROM Users u
            JOIN Instructor i ON u.User_ID = i.Instructor_ID
            JOIN Teaches t ON i.Instructor_ID = t.Instructor_ID
            WHERE t.Course_ID = %s
        """
        instructors = execute_query(instructors_query, (course_id,))
        
        course['content'] = content
        course['students'] = students
        course['instructors'] = instructors
        
        return jsonify(course), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/instructor/course/<course_id>', methods=['PUT'])
@token_required
@role_required(['Instructor'])
def update_course(course_id):
    """Update course details"""
    try:
        # Check if instructor teaches this course
        check_query = "SELECT * FROM Teaches WHERE Instructor_ID = %s AND Course_ID = %s"
        teaches = execute_single(check_query, (request.user_id, course_id))
        
        if not teaches:
            return jsonify({'error': 'You do not teach this course'}), 403
        
        data = request.json
        name = data.get('name')
        duration = data.get('duration')
        fees = data.get('fees')
        description = data.get('description', '')
        
        update_query = """
            UPDATE Course 
            SET Name = %s, Duration = %s, Fees = %s, Description = %s
            WHERE Course_ID = %s
        """
        execute_query(update_query, (name, duration, fees, description, course_id), fetch=False)
        
        return jsonify({'message': 'Course updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/instructor/course', methods=['POST'])
@token_required
@role_required(['Instructor'])
def create_course():
    """Create a new course"""
    try:
        data = request.json
        name = data.get('name')
        duration = data.get('duration')
        fees = data.get('fees')
        description = data.get('description', '')
        collaborators = data.get('collaborators', [])  # List of instructor IDs
        
        if not all([name, duration, fees]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Generate course ID
        max_id_query = "SELECT Course_ID FROM Course ORDER BY Course_ID DESC LIMIT 1"
        max_id = execute_single(max_id_query)
        if max_id and max_id['course_id']:
            num = int(max_id['course_id'][3:]) + 1
        else:
            num = 1
        course_id = f"CRS{num:03d}"
        
        # Create course
        create_query = """
            INSERT INTO Course (Course_ID, Name, Duration, Fees, Description)
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(create_query, (course_id, name, duration, fees, description), fetch=False)
        
        # Add creator as instructor
        teach_query = "INSERT INTO Teaches (Instructor_ID, Course_ID) VALUES (%s, %s)"
        execute_query(teach_query, (request.user_id, course_id), fetch=False)
        
        # Add collaborators
        for collab_id in collaborators:
            execute_query(teach_query, (collab_id, course_id), fetch=False)
        
        return jsonify({
            'message': 'Course created successfully',
            'course_id': course_id
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/instructor/list', methods=['GET'])
@token_required
@role_required(['Instructor'])
def get_all_instructors():
    """Get list of all instructors for collaboration"""
    try:
        query = """
            SELECT u.User_ID, u.Name, u.Email, i.Experience
            FROM Users u
            JOIN Instructor i ON u.User_ID = i.Instructor_ID
            WHERE u.User_ID != %s
            ORDER BY u.Name
        """
        instructors = execute_query(query, (request.user_id,))
        return jsonify(instructors), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/instructor/course/<course_id>', methods=['DELETE'])
@token_required
@role_required(['Instructor'])
def delete_course_instructor(course_id):
    """Delete a course (only if instructor teaches it)"""
    try:
        # Check if instructor teaches this course
        check_query = "SELECT * FROM Teaches WHERE Instructor_ID = %s AND Course_ID = %s"
        teaches = execute_single(check_query, (request.user_id, course_id))
        
        if not teaches:
            return jsonify({'error': 'You do not teach this course'}), 403
        
        delete_query = "DELETE FROM Course WHERE Course_ID = %s"
        execute_query(delete_query, (course_id,), fetch=False)
        
        return jsonify({'message': 'Course deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/instructor/course/<course_id>/content', methods=['POST'])
@token_required
@role_required(['Instructor'])
def add_course_content(course_id):
    """Add content to a course"""
    try:
        # Check if instructor teaches this course
        check_query = "SELECT * FROM Teaches WHERE Instructor_ID = %s AND Course_ID = %s"
        teaches = execute_single(check_query, (request.user_id, course_id))
        
        if not teaches:
            return jsonify({'error': 'You do not teach this course'}), 403
        
        data = request.json
        url = data.get('url')
        content_type = data.get('type')
        
        # Generate content ID
        max_id_query = "SELECT Content_ID FROM Course_content ORDER BY Content_ID DESC LIMIT 1"
        max_id = execute_single(max_id_query)
        if max_id and max_id['content_id']:
            num = int(max_id['content_id'][3:]) + 1
        else:
            num = 1
        content_id = f"CNT{num:03d}"
        
        # Create content
        create_query = """
            INSERT INTO Course_content (Content_ID, URL, Type)
            VALUES (%s, %s, %s)
        """
        execute_query(create_query, (content_id, url, content_type), fetch=False)
        
        # Link to course
        link_query = "INSERT INTO Includes (Course_ID, Content_ID) VALUES (%s, %s)"
        execute_query(link_query, (course_id, content_id), fetch=False)
        
        return jsonify({'message': 'Content added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# INSTRUCTOR: PROGRAM MANAGEMENT
# ============================================

@app.route('/api/instructor/programs', methods=['GET'])
@token_required
@role_required(['Instructor'])
def get_programs_instructor():
    """Get all programs"""
    try:
        programs_query = """
            SELECT p.*, COUNT(DISTINCT po.Course_ID) as course_count
            FROM Program p
            LEFT JOIN Part_of po ON p.Program_ID = po.Program_ID
            GROUP BY p.Program_ID, p.Name, p.Prog_Type, p.Duration
            ORDER BY p.Name
        """
        programs = execute_query(programs_query)
        
        for program in programs:
            courses_query = """
                SELECT c.Course_ID, c.Name, c.Duration, c.Fees
                FROM Course c
                JOIN Part_of po ON c.Course_ID = po.Course_ID
                WHERE po.Program_ID = %s
                ORDER BY c.Name
            """
            program['courses'] = execute_query(courses_query, (program['program_id'],))
        
        return jsonify(programs), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/instructor/course/<course_id>/programs', methods=['GET'])
@token_required
@role_required(['Instructor'])
def get_course_programs(course_id):
    """Get programs a course belongs to"""
    try:
        # Check if instructor teaches this course
        check_query = "SELECT * FROM Teaches WHERE Instructor_ID = %s AND Course_ID = %s"
        teaches = execute_single(check_query, (request.user_id, course_id))
        
        if not teaches:
            return jsonify({'error': 'You do not teach this course'}), 403
        
        # Get programs this course is part of
        programs_query = """
            SELECT p.* FROM Program p
            JOIN Part_of po ON p.Program_ID = po.Program_ID
            WHERE po.Course_ID = %s
            ORDER BY p.Name
        """
        programs = execute_query(programs_query, (course_id,))
        
        # Get all programs for selection
        all_programs_query = "SELECT * FROM Program ORDER BY Name"
        all_programs = execute_query(all_programs_query)
        
        return jsonify({'course_programs': programs, 'all_programs': all_programs}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/instructor/course/<course_id>/programs', methods=['POST'])
@token_required
@role_required(['Instructor'])
def add_course_to_program_instructor(course_id):
    """Add a course to a program"""
    try:
        # Check if instructor teaches this course
        check_query = "SELECT * FROM Teaches WHERE Instructor_ID = %s AND Course_ID = %s"
        teaches = execute_single(check_query, (request.user_id, course_id))
        
        if not teaches:
            return jsonify({'error': 'You do not teach this course'}), 403
        
        data = request.json
        program_id = data.get('program_id')
        
        if not program_id:
            return jsonify({'error': 'Program ID required'}), 400
        
        # Check if already in program
        check_query = "SELECT * FROM Part_of WHERE Course_ID = %s AND Program_ID = %s"
        existing = execute_single(check_query, (course_id, program_id))
        if existing:
            return jsonify({'error': 'Course already in this program'}), 400
        
        insert_query = "INSERT INTO Part_of (Course_ID, Program_ID) VALUES (%s, %s)"
        execute_query(insert_query, (course_id, program_id), fetch=False)
        
        return jsonify({'message': 'Course added to program successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/instructor/course/<course_id>/programs/<program_id>', methods=['DELETE'])
@token_required
@role_required(['Instructor'])
def remove_course_from_program_instructor(course_id, program_id):
    """Remove a course from a program"""
    try:
        # Check if instructor teaches this course
        check_query = "SELECT * FROM Teaches WHERE Instructor_ID = %s AND Course_ID = %s"
        teaches = execute_single(check_query, (request.user_id, course_id))
        
        if not teaches:
            return jsonify({'error': 'You do not teach this course'}), 403
        
        delete_query = "DELETE FROM Part_of WHERE Course_ID = %s AND Program_ID = %s"
        execute_query(delete_query, (course_id, program_id), fetch=False)
        
        return jsonify({'message': 'Course removed from program'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# DATA ANALYST ROUTES
# ============================================

@app.route('/api/analyst/statistics', methods=['GET'])
@token_required
@role_required(['Data_Analyst'])
def get_statistics():
    """Get comprehensive statistics"""
    try:
        stats = {}
        
        # Total counts
        stats['total_students'] = execute_single("SELECT COUNT(*) as count FROM Student")['count']
        stats['total_instructors'] = execute_single("SELECT COUNT(*) as count FROM Instructor")['count']
        stats['total_courses'] = execute_single("SELECT COUNT(*) as count FROM Course")['count']
        stats['total_enrollments'] = execute_single("SELECT COUNT(*) as count FROM Enrollment")['count']
        
        # Student demographics by country
        country_query = """
            SELECT Country, COUNT(*) as count
            FROM Student
            GROUP BY Country
            ORDER BY count DESC
        """
        stats['students_by_country'] = execute_query(country_query)
        
        # Student demographics by skill level
        skill_query = """
            SELECT Skill_Level, COUNT(*) as count
            FROM Student
            GROUP BY Skill_Level
            ORDER BY count DESC
        """
        stats['students_by_skill'] = execute_query(skill_query)
        
        # Student demographics by category
        category_query = """
            SELECT Category, COUNT(*) as count
            FROM Student
            GROUP BY Category
            ORDER BY count DESC
        """
        stats['students_by_category'] = execute_query(category_query)
        
        # Age distribution
        age_query = """
            SELECT 
                CASE 
                    WHEN Age < 20 THEN 'Under 20'
                    WHEN Age BETWEEN 20 AND 25 THEN '20-25'
                    WHEN Age BETWEEN 26 AND 30 THEN '26-30'
                    ELSE 'Over 30'
                END as age_group,
                COUNT(*) as count
            FROM Student
            GROUP BY 1
            ORDER BY 1
        """
        stats['age_distribution'] = execute_query(age_query)
        
        # Average score by skill level
        avg_score_query = """
            SELECT s.Skill_Level, AVG(e.Score) as avg_score, COUNT(*) as enrollments
            FROM Student s
            JOIN Enrollment e ON s.Student_ID = e.Student_ID
            WHERE e.Score IS NOT NULL
            GROUP BY s.Skill_Level
            ORDER BY avg_score DESC
        """
        stats['avg_score_by_skill'] = execute_query(avg_score_query)
        
        # Top performing students
        top_students_query = """
            SELECT u.Name, AVG(e.Score) as avg_score, COUNT(*) as courses_taken
            FROM Users u
            JOIN Student s ON u.User_ID = s.Student_ID
            JOIN Enrollment e ON s.Student_ID = e.Student_ID
            WHERE e.Score IS NOT NULL
            GROUP BY u.User_ID, u.Name
            HAVING COUNT(*) >= 1
            ORDER BY avg_score DESC
            LIMIT 10
        """
        stats['top_students'] = execute_query(top_students_query)
        
        # Most popular courses
        popular_courses_query = """
            SELECT c.Name, COUNT(e.Student_ID) as enrollment_count, AVG(e.Score) as avg_score
            FROM Course c
            LEFT JOIN Enrollment e ON c.Course_ID = e.Course_ID
            GROUP BY c.Course_ID, c.Name
            ORDER BY enrollment_count DESC
            LIMIT 10
        """
        stats['popular_courses'] = execute_query(popular_courses_query)
        
        # Revenue by course
        revenue_query = """
            SELECT c.Name, c.Fees, COUNT(e.Student_ID) as enrollments,
                   (c.Fees * COUNT(e.Student_ID)) as total_revenue
            FROM Course c
            LEFT JOIN Enrollment e ON c.Course_ID = e.Course_ID
            GROUP BY c.Course_ID, c.Name, c.Fees
            ORDER BY total_revenue DESC
            LIMIT 10
        """
        stats['revenue_by_course'] = execute_query(revenue_query)
        
        # Total revenue
        total_revenue_query = """
            SELECT SUM(c.Fees) as total_revenue
            FROM Course c
            JOIN Enrollment e ON c.Course_ID = e.Course_ID
        """
        stats['total_revenue'] = execute_single(total_revenue_query)['total_revenue'] or 0
        
        # Enrollment trends by month
        enrollment_trends_query = """
            SELECT 
                TO_CHAR(Enrollment_Date, 'YYYY-MM') as month,
                COUNT(*) as enrollments
            FROM Enrollment
            WHERE Enrollment_Date IS NOT NULL
            GROUP BY month
            ORDER BY month DESC
            LIMIT 12
        """
        stats['enrollment_trends'] = execute_query(enrollment_trends_query)
        
        # Course completion rate (students with scores vs total enrollments)
        completion_query = """
            SELECT 
                COUNT(CASE WHEN Score IS NOT NULL THEN 1 END) as completed,
                COUNT(*) as total,
                ROUND(COUNT(CASE WHEN Score IS NOT NULL THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) as completion_rate
            FROM Enrollment
        """
        stats['completion_stats'] = execute_single(completion_query)
        
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# ADMIN ROUTES
# ============================================

@app.route('/api/admin/users', methods=['GET'])
@token_required
@role_required(['Administrator'])
def get_all_users():
    """Get all users"""
    try:
        query = """
            SELECT User_ID, Username, Role, Name, Email
            FROM Users
            ORDER BY Role, Name
        """
        users = execute_query(query)
        return jsonify(users), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
@token_required
@role_required(['Administrator'])
def delete_user(user_id):
    """Delete a user"""
    try:
        # Prevent admin from deleting themselves
        if user_id == request.user_id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        delete_query = "DELETE FROM Users WHERE User_ID = %s"
        execute_query(delete_query, (user_id,), fetch=False)
        
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<user_id>/password', methods=['PUT'])
@token_required
@role_required(['Administrator'])
def change_user_password(user_id):
    """Change user password"""
    try:
        data = request.json
        new_password = data.get('password')
        
        if not new_password:
            return jsonify({'error': 'Password required'}), 400
        
        hashed_password = hash_password(new_password)
        
        update_query = "UPDATE Users SET Password = %s WHERE User_ID = %s"
        execute_query(update_query, (hashed_password, user_id), fetch=False)
        
        return jsonify({'message': 'Password changed successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/courses', methods=['GET'])
@token_required
@role_required(['Administrator'])
def get_all_courses_admin():
    """Get all courses with details"""
    try:
        query = """
            SELECT c.*, 
                   COUNT(DISTINCT e.Student_ID) as enrolled_students,
                   COUNT(DISTINCT t.Instructor_ID) as instructor_count
            FROM Course c
            LEFT JOIN Enrollment e ON c.Course_ID = e.Course_ID
            LEFT JOIN Teaches t ON c.Course_ID = t.Course_ID
            GROUP BY c.Course_ID, c.Name, c.Duration, c.Fees, c.Description
            ORDER BY c.Name
        """
        courses = execute_query(query)
        return jsonify(courses), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/courses/<course_id>', methods=['DELETE'])
@token_required
@role_required(['Administrator'])
def delete_course(course_id):
    """Delete a course"""
    try:
        delete_query = "DELETE FROM Course WHERE Course_ID = %s"
        execute_query(delete_query, (course_id,), fetch=False)
        
        return jsonify({'message': 'Course deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/courses', methods=['POST'])
@token_required
@role_required(['Administrator'])
def create_course_admin():
    """Create a new course as admin"""
    try:
        data = request.json
        name = data.get('name')
        duration = data.get('duration')
        fees = data.get('fees')
        description = data.get('description', '')
        instructors = data.get('instructors', [])
        
        if not all([name, duration, fees]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Generate course ID
        max_id_query = "SELECT Course_ID FROM Course ORDER BY Course_ID DESC LIMIT 1"
        max_id = execute_single(max_id_query)
        if max_id and max_id['course_id']:
            num = int(max_id['course_id'][3:]) + 1
        else:
            num = 1
        course_id = f"CRS{num:03d}"
        
        # Create course
        create_query = """
            INSERT INTO Course (Course_ID, Name, Duration, Fees, Description)
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(create_query, (course_id, name, duration, fees, description), fetch=False)
        
        # Add instructors
        teach_query = "INSERT INTO Teaches (Instructor_ID, Course_ID) VALUES (%s, %s)"
        for instructor_id in instructors:
            execute_query(teach_query, (instructor_id, course_id), fetch=False)
        
        return jsonify({
            'message': 'Course created successfully',
            'course_id': course_id
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users', methods=['POST'])
@token_required
@role_required(['Administrator'])
def create_user_admin():
    """Create a new user as admin"""
    try:
        # Reuse the register logic but without authentication
        data = request.json
        username = data.get('username')
        password = data.get('password')
        role = data.get('role')
        name = data.get('name')
        email = data.get('email')
        
        # Additional data based on role
        country = data.get('country')
        category = data.get('category')
        skill_level = data.get('skill_level')
        age = data.get('age')
        experience = data.get('experience')
        
        if not all([username, password, role, name, email]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if username or email already exists
        check_query = "SELECT User_ID FROM Users WHERE Username = %s OR Email = %s"
        existing = execute_single(check_query, (username, email))
        if existing:
            return jsonify({'error': 'Username or email already exists'}), 400
        
        # Generate user ID based on role
        if role == 'Student':
            max_id_query = "SELECT Student_ID FROM Student ORDER BY Student_ID DESC LIMIT 1"
            max_id = execute_single(max_id_query)
            if max_id and max_id['student_id']:
                num = int(max_id['student_id'][3:]) + 1
            else:
                num = 1
            user_id = f"STU{num:03d}"
        elif role == 'Instructor':
            max_id_query = "SELECT Instructor_ID FROM Instructor ORDER BY Instructor_ID DESC LIMIT 1"
            max_id = execute_single(max_id_query)
            if max_id and max_id['instructor_id']:
                num = int(max_id['instructor_id'][3:]) + 1
            else:
                num = 1
            user_id = f"INS{num:03d}"
        elif role == 'Data_Analyst':
            max_id_query = "SELECT Analyst_ID FROM Data_Analyst ORDER BY Analyst_ID DESC LIMIT 1"
            max_id = execute_single(max_id_query)
            if max_id and max_id['analyst_id']:
                num = int(max_id['analyst_id'][3:]) + 1
            else:
                num = 1
            user_id = f"ANA{num:03d}"
        elif role == 'Administrator':
            max_id_query = "SELECT Admin_ID FROM Administrator ORDER BY Admin_ID DESC LIMIT 1"
            max_id = execute_single(max_id_query)
            if max_id and max_id['admin_id']:
                num = int(max_id['admin_id'][3:]) + 1
            else:
                num = 1
            user_id = f"ADM{num:03d}"
        else:
            return jsonify({'error': 'Invalid role'}), 400
        
        # Hash password
        hashed_password = hash_password(password)
        
        # Insert into Users table
        insert_user_query = """
            INSERT INTO Users (User_ID, Username, Password, Role, Name, Email)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        execute_query(insert_user_query, (user_id, username, hashed_password, role, name, email), fetch=False)
        
        # Insert into role-specific table
        if role == 'Student':
            insert_student_query = """
                INSERT INTO Student (Student_ID, Country, Category, Skill_Level, Age)
                VALUES (%s, %s, %s, %s, %s)
            """
            execute_query(insert_student_query, (user_id, country, category, skill_level, age), fetch=False)
        elif role == 'Instructor':
            insert_instructor_query = "INSERT INTO Instructor (Instructor_ID, Experience) VALUES (%s, %s)"
            execute_query(insert_instructor_query, (user_id, experience or 0), fetch=False)
        elif role == 'Data_Analyst':
            insert_analyst_query = "INSERT INTO Data_Analyst (Analyst_ID) VALUES (%s)"
            execute_query(insert_analyst_query, (user_id,), fetch=False)
        elif role == 'Administrator':
            insert_admin_query = "INSERT INTO Administrator (Admin_ID) VALUES (%s)"
            execute_query(insert_admin_query, (user_id,), fetch=False)
        
        return jsonify({
            'message': 'User created successfully',
            'user_id': user_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/instructors', methods=['GET'])
@token_required
@role_required(['Administrator'])
def get_all_instructors_admin():
    """Get all instructors for admin"""
    try:
        query = """
            SELECT u.User_ID, u.Name, u.Email, i.Experience,
                   COUNT(DISTINCT t.Course_ID) as courses_teaching
            FROM Users u
            JOIN Instructor i ON u.User_ID = i.Instructor_ID
            LEFT JOIN Teaches t ON i.Instructor_ID = t.Instructor_ID
            GROUP BY u.User_ID, u.Name, u.Email, i.Experience
            ORDER BY u.Name
        """
        instructors = execute_query(query)
        return jsonify(instructors), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# ADMIN: COURSE DETAIL & MANAGEMENT
# ============================================

@app.route('/api/admin/courses/<course_id>', methods=['GET'])
@token_required
@role_required(['Administrator'])
def get_course_details_admin(course_id):
    """Get detailed course info including students and instructors"""
    try:
        course_query = "SELECT * FROM Course WHERE Course_ID = %s"
        course = execute_single(course_query, (course_id,))
        
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        # Get instructors
        instructors_query = """
            SELECT u.User_ID, u.Name, u.Email, i.Experience
            FROM Users u
            JOIN Instructor i ON u.User_ID = i.Instructor_ID
            JOIN Teaches t ON i.Instructor_ID = t.Instructor_ID
            WHERE t.Course_ID = %s
        """
        course['instructors'] = execute_query(instructors_query, (course_id,))
        
        # Get enrolled students
        students_query = """
            SELECT u.User_ID, u.Name, u.Email, s.Country, s.Skill_Level,
                   e.Score, e.Enrollment_Date
            FROM Users u
            JOIN Student s ON u.User_ID = s.Student_ID
            JOIN Enrollment e ON s.Student_ID = e.Student_ID
            WHERE e.Course_ID = %s
            ORDER BY u.Name
        """
        course['students'] = execute_query(students_query, (course_id,))
        
        # Get content
        content_query = """
            SELECT cc.* FROM Course_content cc
            JOIN Includes i ON cc.Content_ID = i.Content_ID
            WHERE i.Course_ID = %s
            ORDER BY cc.Content_ID
        """
        course['content'] = execute_query(content_query, (course_id,))
        
        # Get topics
        topics_query = """
            SELECT t.* FROM Topic t
            JOIN Covers cv ON t.Topic_ID = cv.Topic_ID
            WHERE cv.Course_ID = %s
        """
        course['topics'] = execute_query(topics_query, (course_id,))
        
        # Get textbooks
        textbooks_query = """
            SELECT tb.* FROM Textbook tb
            JOIN Reference r ON tb.ISBN = r.ISBN
            WHERE r.Course_ID = %s
        """
        course['textbooks'] = execute_query(textbooks_query, (course_id,))
        
        # Get partner universities
        universities_query = """
            SELECT pu.* FROM Partner_University pu
            JOIN Offers o ON pu.University_ID = o.University_ID
            WHERE o.Course_ID = %s
        """
        course['universities'] = execute_query(universities_query, (course_id,))
        
        # Get programs
        programs_query = """
            SELECT p.* FROM Program p
            JOIN Part_of po ON p.Program_ID = po.Program_ID
            WHERE po.Course_ID = %s
        """
        course['programs'] = execute_query(programs_query, (course_id,))
        
        return jsonify(course), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/courses/<course_id>/instructors', methods=['POST'])
@token_required
@role_required(['Administrator'])
def assign_instructor(course_id):
    """Assign an instructor to a course"""
    try:
        data = request.json
        instructor_id = data.get('instructor_id')
        
        if not instructor_id:
            return jsonify({'error': 'Instructor ID required'}), 400
        
        # Check if already assigned
        check_query = "SELECT * FROM Teaches WHERE Instructor_ID = %s AND Course_ID = %s"
        existing = execute_single(check_query, (instructor_id, course_id))
        if existing:
            return jsonify({'error': 'Instructor already assigned to this course'}), 400
        
        insert_query = "INSERT INTO Teaches (Instructor_ID, Course_ID) VALUES (%s, %s)"
        execute_query(insert_query, (instructor_id, course_id), fetch=False)
        
        return jsonify({'message': 'Instructor assigned successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/courses/<course_id>/instructors/<instructor_id>', methods=['DELETE'])
@token_required
@role_required(['Administrator'])
def remove_instructor(course_id, instructor_id):
    """Remove an instructor from a course"""
    try:
        delete_query = "DELETE FROM Teaches WHERE Instructor_ID = %s AND Course_ID = %s"
        execute_query(delete_query, (instructor_id, course_id), fetch=False)
        
        return jsonify({'message': 'Instructor removed successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/courses/<course_id>/students', methods=['POST'])
@token_required
@role_required(['Administrator'])
def admin_enroll_student(course_id):
    """Enroll a student in a course (admin)"""
    try:
        data = request.json
        student_id = data.get('student_id')
        
        if not student_id:
            return jsonify({'error': 'Student ID required'}), 400
        
        # Check if already enrolled
        check_query = "SELECT * FROM Enrollment WHERE Student_ID = %s AND Course_ID = %s"
        existing = execute_single(check_query, (student_id, course_id))
        if existing:
            return jsonify({'error': 'Student already enrolled in this course'}), 400
        
        enroll_query = """
            INSERT INTO Enrollment (Student_ID, Course_ID, Enrollment_Date, Score)
            VALUES (%s, %s, %s, NULL)
        """
        execute_query(enroll_query, (student_id, course_id, datetime.now().date()), fetch=False)
        
        return jsonify({'message': 'Student enrolled successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/courses/<course_id>/students/<student_id>', methods=['DELETE'])
@token_required
@role_required(['Administrator'])
def admin_unenroll_student(course_id, student_id):
    """Remove a student from a course (admin)"""
    try:
        delete_query = "DELETE FROM Enrollment WHERE Student_ID = %s AND Course_ID = %s"
        execute_query(delete_query, (student_id, course_id), fetch=False)
        
        return jsonify({'message': 'Student removed successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/students', methods=['GET'])
@token_required
@role_required(['Administrator'])
def get_all_students_admin():
    """Get all students for admin"""
    try:
        query = """
            SELECT u.User_ID, u.Name, u.Email, s.Country, s.Category, s.Skill_Level, s.Age
            FROM Users u
            JOIN Student s ON u.User_ID = s.Student_ID
            ORDER BY u.Name
        """
        students = execute_query(query)
        return jsonify(students), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# ADMIN: UNIVERSITY MANAGEMENT
# ============================================

@app.route('/api/admin/universities', methods=['GET'])
@token_required
@role_required(['Administrator'])
def get_all_universities():
    """Get all partner universities with course counts"""
    try:
        query = """
            SELECT pu.*, COUNT(DISTINCT o.Course_ID) as course_count
            FROM Partner_University pu
            LEFT JOIN Offers o ON pu.University_ID = o.University_ID
            GROUP BY pu.University_ID, pu.Name
            ORDER BY pu.Name
        """
        universities = execute_query(query)
        
        # Get courses for each university
        for uni in universities:
            courses_query = """
                SELECT c.Course_ID, c.Name
                FROM Course c
                JOIN Offers o ON c.Course_ID = o.Course_ID
                WHERE o.University_ID = %s
                ORDER BY c.Name
            """
            uni['courses'] = execute_query(courses_query, (uni['university_id'],))
        
        return jsonify(universities), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/universities', methods=['POST'])
@token_required
@role_required(['Administrator'])
def create_university():
    """Create a partner university"""
    try:
        data = request.json
        name = data.get('name')
        
        if not name:
            return jsonify({'error': 'University name required'}), 400
        
        # Generate ID
        max_id_query = "SELECT University_ID FROM Partner_University ORDER BY University_ID DESC LIMIT 1"
        max_id = execute_single(max_id_query)
        if max_id and max_id['university_id']:
            num = int(max_id['university_id'][3:]) + 1
        else:
            num = 1
        university_id = f"UNI{num:03d}"
        
        insert_query = "INSERT INTO Partner_University (University_ID, Name) VALUES (%s, %s)"
        execute_query(insert_query, (university_id, name), fetch=False)
        
        return jsonify({'message': 'University created successfully', 'university_id': university_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/universities/<university_id>', methods=['DELETE'])
@token_required
@role_required(['Administrator'])
def delete_university(university_id):
    """Delete a partner university"""
    try:
        delete_query = "DELETE FROM Partner_University WHERE University_ID = %s"
        execute_query(delete_query, (university_id,), fetch=False)
        
        return jsonify({'message': 'University deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/universities/<university_id>/courses', methods=['POST'])
@token_required
@role_required(['Administrator'])
def assign_course_to_university(university_id):
    """Assign a course to a university (Offers)"""
    try:
        data = request.json
        course_id = data.get('course_id')
        
        if not course_id:
            return jsonify({'error': 'Course ID required'}), 400
        
        check_query = "SELECT * FROM Offers WHERE University_ID = %s AND Course_ID = %s"
        existing = execute_single(check_query, (university_id, course_id))
        if existing:
            return jsonify({'error': 'Course already offered by this university'}), 400
        
        insert_query = "INSERT INTO Offers (University_ID, Course_ID) VALUES (%s, %s)"
        execute_query(insert_query, (university_id, course_id), fetch=False)
        
        return jsonify({'message': 'Course assigned to university successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/universities/<university_id>/courses/<course_id>', methods=['DELETE'])
@token_required
@role_required(['Administrator'])
def remove_course_from_university(university_id, course_id):
    """Remove a course from a university"""
    try:
        delete_query = "DELETE FROM Offers WHERE University_ID = %s AND Course_ID = %s"
        execute_query(delete_query, (university_id, course_id), fetch=False)
        
        return jsonify({'message': 'Course removed from university'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# ADMIN: PROGRAM MANAGEMENT
# ============================================

@app.route('/api/admin/programs', methods=['GET'])
@token_required
@role_required(['Administrator'])
def get_all_programs_admin():
    """Get all programs with their courses"""
    try:
        programs_query = """
            SELECT p.*, COUNT(DISTINCT po.Course_ID) as course_count
            FROM Program p
            LEFT JOIN Part_of po ON p.Program_ID = po.Program_ID
            GROUP BY p.Program_ID, p.Name, p.Prog_Type, p.Duration
            ORDER BY p.Name
        """
        programs = execute_query(programs_query)
        
        for program in programs:
            courses_query = """
                SELECT c.Course_ID, c.Name, c.Duration, c.Fees
                FROM Course c
                JOIN Part_of po ON c.Course_ID = po.Course_ID
                WHERE po.Program_ID = %s
                ORDER BY c.Name
            """
            program['courses'] = execute_query(courses_query, (program['program_id'],))
        
        return jsonify(programs), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/programs', methods=['POST'])
@token_required
@role_required(['Administrator'])
def create_program():
    """Create a new program"""
    try:
        data = request.json
        name = data.get('name')
        prog_type = data.get('prog_type')
        duration = data.get('duration')
        
        if not all([name, prog_type, duration]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Generate ID
        max_id_query = "SELECT Program_ID FROM Program ORDER BY Program_ID DESC LIMIT 1"
        max_id = execute_single(max_id_query)
        if max_id and max_id['program_id']:
            num = int(max_id['program_id'][3:]) + 1
        else:
            num = 1
        program_id = f"PRG{num:03d}"
        
        insert_query = """
            INSERT INTO Program (Program_ID, Name, Prog_Type, Duration)
            VALUES (%s, %s, %s, %s)
        """
        execute_query(insert_query, (program_id, name, prog_type, duration), fetch=False)
        
        return jsonify({'message': 'Program created successfully', 'program_id': program_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/programs/<program_id>', methods=['DELETE'])
@token_required
@role_required(['Administrator'])
def delete_program(program_id):
    """Delete a program"""
    try:
        delete_query = "DELETE FROM Program WHERE Program_ID = %s"
        execute_query(delete_query, (program_id,), fetch=False)
        
        return jsonify({'message': 'Program deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/programs/<program_id>/courses', methods=['POST'])
@token_required
@role_required(['Administrator'])
def add_course_to_program(program_id):
    """Add a course to a program"""
    try:
        data = request.json
        course_id = data.get('course_id')
        
        if not course_id:
            return jsonify({'error': 'Course ID required'}), 400
        
        check_query = "SELECT * FROM Part_of WHERE Course_ID = %s AND Program_ID = %s"
        existing = execute_single(check_query, (course_id, program_id))
        if existing:
            return jsonify({'error': 'Course already in this program'}), 400
        
        insert_query = "INSERT INTO Part_of (Course_ID, Program_ID) VALUES (%s, %s)"
        execute_query(insert_query, (course_id, program_id), fetch=False)
        
        return jsonify({'message': 'Course added to program successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/programs/<program_id>/courses/<course_id>', methods=['DELETE'])
@token_required
@role_required(['Administrator'])
def remove_course_from_program(program_id, course_id):
    """Remove a course from a program"""
    try:
        delete_query = "DELETE FROM Part_of WHERE Course_ID = %s AND Program_ID = %s"
        execute_query(delete_query, (course_id, program_id), fetch=False)
        
        return jsonify({'message': 'Course removed from program'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# INSTRUCTOR: SCORE MANAGEMENT
# ============================================

@app.route('/api/instructor/course/<course_id>/score', methods=['PUT'])
@token_required
@role_required(['Instructor'])
def update_student_score(course_id):
    """Update a student's score in a course"""
    try:
        # Check if instructor teaches this course
        check_query = "SELECT * FROM Teaches WHERE Instructor_ID = %s AND Course_ID = %s"
        teaches = execute_single(check_query, (request.user_id, course_id))
        
        if not teaches:
            return jsonify({'error': 'You do not teach this course'}), 403
        
        data = request.json
        student_id = data.get('student_id')
        score = data.get('score')
        
        if not student_id or score is None:
            return jsonify({'error': 'Student ID and score required'}), 400
        
        if not (0 <= int(score) <= 100):
            return jsonify({'error': 'Score must be between 0 and 100'}), 400
        
        update_query = """
            UPDATE Enrollment SET Score = %s
            WHERE Student_ID = %s AND Course_ID = %s
        """
        execute_query(update_query, (int(score), student_id, course_id), fetch=False)
        
        return jsonify({'message': 'Score updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# HEALTH CHECK
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)