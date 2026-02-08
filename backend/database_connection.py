import psycopg2
import psycopg2.extras
from flask import g
from .config import Config

def get_db():
    if 'db' not in g:
        if Config.DATABASE_URL:
            g.db = psycopg2.connect(Config.DATABASE_URL, sslmode='require')
        else:
            g.db = psycopg2.connect(
                dbname=Config.DB_NAME,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                host=Config.DB_HOST,
                port=Config.DB_PORT
            )
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def _prepare_query(query):
    return query.replace('?', '%s')

def query_db(query, args=(), one=False):
    db = get_db()
    query = _prepare_query(query)
    
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

def execute_insert_returning_id(query, args=(), pk_name='id'):
    db = get_db()
    query = _prepare_query(query)
    
    if 'RETURNING' not in query.upper():
        query += f' RETURNING {pk_name}'
        
    cur = db.cursor()
    cur.execute(query, args)
    new_id = cur.fetchone()[0]
    db.commit()
    cur.close()
    return new_id
