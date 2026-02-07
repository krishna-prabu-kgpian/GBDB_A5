import sqlite3
import psycopg2
import psycopg2.extras
from flask import g
from .config import Config

def get_db():
    if 'db' not in g:
        if Config.DATABASE_TYPE == 'postgres':
            g.db = psycopg2.connect(
                dbname=Config.DB_NAME,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                host=Config.DB_HOST,
                port=Config.DB_PORT
            )
        else:
            g.db = sqlite3.connect(
                Config.DATABASE,
                detect_types=sqlite3.PARSE_DECLTYPES
            )
            g.db.row_factory = sqlite3.Row
            g.db.execute("PRAGMA foreign_keys = ON")

    return g.db

def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()

def _prepare_query(query):
    """Replaces ? with %s if using Postgres"""
    if Config.DATABASE_TYPE == 'postgres':
        return query.replace('?', '%s')
    return query

def query_db(query, args=(), one=False):
    db = get_db()
    query = _prepare_query(query)
    
    if Config.DATABASE_TYPE == 'postgres':
        cur = db.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cur.execute(query, args)
        if query.strip().upper().startswith('SELECT') or 'RETURNING' in query.upper():
            rv = cur.fetchall()
        else:
            rv = []
            db.commit()
        cur.close()
        
        def to_dict(row):
             return dict(row) if row else None
             
        if one:
            return to_dict(rv[0] if rv else None)
        return [to_dict(r) for r in rv] if rv else []
        
    else:
        # SQLite
        cur = db.execute(query, args)
        rv = cur.fetchall()
        cur.close()
        if not query.strip().upper().startswith('SELECT'):
            db.commit()
        
        def to_dict(row):
            return dict(row) if row else None

        if one:
            return to_dict(rv[0] if rv else None)
        return [to_dict(r) for r in rv] if rv else []

def execute_insert(query, args=()):
    """
    Executes an INSERT and checks for LAST_INSERT_ID mechanism.
    For Postgres: Appends RETURNING id (if pk is predictable) or returns None if complex.
    For SQLite: Uses cursor.lastrowid
    
    This helper assumes the Primary Key is the first column or we act generic.
    Actually, to be safe, we should rewrite queries in interfacing to use this specific helper 
    that knows how to fetch the ID.
    
    We will modify the query to append 'RETURNING <PK>' for Postgres if we know the PK name,
    but that's hard generic.
    
    Alternative: The caller passes the PK name if they need the ID back.
    """
    db = get_db()
    query = _prepare_query(query)
    
    if Config.DATABASE_TYPE == 'postgres':
        cur = db.cursor()
        # Heuristic: if we need ID, the caller usually expects it. 
        # But we can't easily auto-append RETURNING without parsing.
        # So we will rely on the caller to NOT use this if they don't need ID, 
        # or we update interfacing to be smarter.
        
        # ACTUALLY, simpler approach:
        # We will require the caller to provide the PK name if they want the ID.
        # But for now, let's just execute.
        cur.execute(query, args)
        db.commit()
        cur.close()
        return None # Postgres doesn't give lastrowid easily without RETURNING
    else:
        cur = db.execute(query, args)
        last_id = cur.lastrowid
        db.commit()
        cur.close()
        return last_id

def execute_insert_returning_id(query, args=(), pk_name='id'):
    """
    Executes INSERT and returns the new ID, handling DB differences.
    """
    db = get_db()
    
    if Config.DATABASE_TYPE == 'postgres':
        query = _prepare_query(query)
        if 'RETURNING' not in query.upper():
            query += f' RETURNING {pk_name}'
            
        cur = db.cursor()
        cur.execute(query, args)
        new_id = cur.fetchone()[0]
        db.commit()
        cur.close()
        return new_id
    else:
        # SQLite
        # SQLite doesn't support RETURNING in older versions, but `execute` + `lastrowid` works.
        query = _prepare_query(query)
        cur = db.execute(query, args)
        new_id = cur.lastrowid
        db.commit()
        cur.close()
        return new_id
