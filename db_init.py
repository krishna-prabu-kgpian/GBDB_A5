from backend.db import get_db, close_db
from backend.app import app

def init_db():
    with app.app_context():
        db = get_db()
        if db is None:
            print("Could not connect to database. Please check your config.")
            return

        cursor = db.cursor()
        
        # Read schema.sql
        try:
            with open('database/schema.sql', 'r') as f:
                schema_sql = f.read()
            cursor.executescript(schema_sql)
            print("Schema initialized.")
        except Exception as e:
            print(f"Error initializing schema: {e}")

        # Read seed.sql
        try:
            with open('database/seed.sql', 'r') as f:
                seed_sql = f.read()
            cursor.executescript(seed_sql)
            print("Seed data initialized.")
        except Exception as e:
            print(f"Error seeding data: {e}")

        db.commit()
        cursor.close()
        close_db()

if __name__ == '__main__':
    init_db()
