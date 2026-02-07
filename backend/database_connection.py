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
