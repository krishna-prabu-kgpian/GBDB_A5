import sqlite3
from flask import g
from .config import Config

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            Config.DATABASE,
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON") # Important for relational integrity

    return g.db

def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    db = get_db()
    cur = db.execute(query, args)
    rv = cur.fetchall()
    cur.close()
    # For INSERT/UPDATE/DELETE, commit changes. SELECTs don't need commit.
    # SQLite's execute on connection object auto-commits for DML if not in transaction,
    # but explicit commit is safer if multiple operations are part of a single logical unit.
    # For simplicity, we'll commit after every query here, assuming each query is a standalone transaction.
    # If you need explicit transaction control, you'd manage it differently.
    if not query.strip().upper().startswith('SELECT'):
        db.commit()
    
    # helper to convert Row to dict
    def to_dict(row):
        return dict(row) if row else None

    if one:
        return to_dict(rv[0] if rv else None)
    return [to_dict(r) for r in rv] if rv else []


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
