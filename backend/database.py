import psycopg2
from psycopg2.extras import RealDictCursor
from config import Config

def get_db_connection():
    """Get database connection"""
    conn = psycopg2.connect(Config.DATABASE_URL)
    return conn

def execute_query(query, params=None, fetch=True):
    """Execute a query and return results"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(query, params)
        
        if fetch:
            result = cur.fetchall()
            conn.close()
            return result
        else:
            conn.commit()
            conn.close()
            return True
    except Exception as e:
        conn.rollback()
        conn.close()
        raise e

def execute_single(query, params=None):
    """Execute a query and return single result"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(query, params)
        result = cur.fetchone()
        conn.close()
        return result
    except Exception as e:
        conn.close()
        raise e