from .database_connection import query_db, execute_insert_returning_id

def get_user_by_username_db(username):
    return query_db('SELECT User_ID as user_id, Username as username, Password as password, Role as role, Name as name FROM Users WHERE Username = ?', (username,), one=True)

def enroll_student_db(student_id, course_id):
    existing = query_db('SELECT * FROM Enrollment WHERE Student_ID = ? AND Course_ID = ?', 
                        (student_id, course_id), one=True)
    if existing:
        return False, 'Already enrolled'
        
    try:
        query_db('INSERT INTO Enrollment (Student_ID, Course_ID, Score) VALUES (?, ?, NULL)', 
                 (student_id, course_id))
        return True, 'Enrolled successfully'
    except Exception as e:
        return False, str(e)

def assign_instructor_db(instructor_id, course_id):
    existing = query_db('SELECT * FROM Teaches WHERE Instructor_ID = ? AND Course_ID = ?', 
                        (instructor_id, course_id), one=True)
    if existing:
        return False, 'Instructor already assigned to this course'

    try:
        query_db('INSERT INTO Teaches (Instructor_ID, Course_ID) VALUES (?, ?)',
                 (instructor_id, course_id))
        return True, 'Instructor assigned'
    except Exception as e:
        return False, str(e)

def delete_user_db(user_id):
    try:
        query_db('DELETE FROM Users WHERE User_ID = ?', (user_id,))
        return True, 'User deleted successfully'
    except Exception as e:
        return False, str(e)

def add_course_content_db(course_id, url, content_type):
    try:
        content_id = execute_insert_returning_id(
            'INSERT INTO Course_Content (URL, Type) VALUES (?, ?)', 
            (url, content_type),
            pk_name='Content_ID'
        )
        
        if content_id is None:
            return False, 'Failed to generate Content ID'

        query_db('INSERT INTO Includes (Course_ID, Content_ID) VALUES (?, ?)', (course_id, content_id))
        return True, 'Content added successfully'
    except Exception as e:
        return False, str(e)

def register_user_db(username, password, role, name, email, additional_data):
    try:
        user_id = execute_insert_returning_id(
            'INSERT INTO Users (Username, Password, Role, Name, Email) VALUES (?, ?, ?, ?, ?)',
            (username, password, role, name, email),
            pk_name='User_ID'
        )
        
        if user_id is None:
            return False, 'Failed to generate User ID'
        
        if role == 'Student':
            query_db('INSERT INTO Student (Student_ID, Age, Country) VALUES (?, ?, ?)', 
                       (user_id, additional_data.get('age'), additional_data.get('country')))
        elif role == 'Instructor':
            query_db('INSERT INTO Instructor (Instructor_ID, Experience) VALUES (?, ?)', 
                       (user_id, additional_data.get('experience', 0)))
        elif role == 'Administrator':
            query_db('INSERT INTO Administrator (Admin_ID) VALUES (?)', (user_id,))
        elif role == 'Data_Analyst':
            query_db('INSERT INTO Data_Analyst (Analyst_ID) VALUES (?)', (user_id,))
            
        return True, user_id
    except Exception as e:
        return False, str(e)
