from .database_connection import query_db, get_db

# Validations
def check_user_exists(username):
    user = query_db('SELECT User_ID FROM Users WHERE Username = ?', (username,), one=True)
    return user is not None

def get_user_by_username_db(username):
    return query_db('SELECT User_ID as user_id, Username as username, Password as password, Role as role, Name as name FROM Users WHERE Username = ?', (username,), one=True)


# Write Operations
def enroll_student_db(student_id, course_id):
    existing = query_db('SELECT * FROM Enrollment WHERE Student_ID = ? AND Course_ID = ?', 
                        (student_id, course_id), one=True)
    if existing:
        return False, 'Already enrolled'
        
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute('INSERT INTO Enrollment (Student_ID, Course_ID, Score) VALUES (?, ?, NULL)', 
                    (student_id, course_id))
        conn.commit()
        cur.close()
        return True, 'Enrolled successfully'
    except Exception as e:
        conn.rollback()
        return False, str(e)

def assign_instructor_db(instructor_id, course_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute('INSERT INTO Teaches (Instructor_ID, Course_ID) VALUES (?, ?)',
                    (instructor_id, course_id))
        conn.commit()
        cur.close()
        return True, 'Instructor assigned'
    except Exception as e:
        conn.rollback()
        return False, str(e)

def delete_user_db(user_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute('DELETE FROM Users WHERE User_ID = ?', (user_id,))
        if cur.rowcount == 0:
            conn.rollback()
            cur.close()
            return False, 'User not found'
        conn.commit()
        cur.close()
        return True, 'User deleted successfully'
    except Exception as e:
        conn.rollback()
        return False, str(e)

def add_course_content_db(course_id, url, content_type):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute('INSERT INTO Course_Content (URL, Type) VALUES (?, ?)', (url, content_type))
        content_id = cur.lastrowid
        cur.execute('INSERT INTO Includes (Course_ID, Content_ID) VALUES (?, ?)', (course_id, content_id))
        conn.commit()
        cur.close()
        return True, 'Content added successfully'
    except Exception as e:
        conn.rollback()
        return False, str(e)

def register_user_db(username, password, role, name, email, additional_data):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            'INSERT INTO Users (Username, Password, Role, Name, Email) VALUES (?, ?, ?, ?, ?)',
            (username, password, role, name, email)
        )
        user_id = cur.lastrowid
        
        if role == 'Student':
            cur.execute('INSERT INTO Student (Student_ID, Age, Country) VALUES (?, ?, ?)', 
                       (user_id, additional_data.get('age'), additional_data.get('country')))
        elif role == 'Instructor':
            cur.execute('INSERT INTO Instructor (Instructor_ID, Experience) VALUES (?, ?)', 
                       (user_id, additional_data.get('experience', 0)))
        elif role == 'Administrator':
            cur.execute('INSERT INTO Administrator (Admin_ID) VALUES (?)', (user_id,))
        elif role == 'Data_Analyst':
            cur.execute('INSERT INTO Data_Analyst (Analyst_ID) VALUES (?)', (user_id,))
            
        conn.commit()
        cur.close()
        return True, user_id
    except Exception as e:
        conn.rollback()
        return False, str(e)
