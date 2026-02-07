import psycopg2
import os

# Database Configuration
# Using default env vars or hardcoded fallbacks matching config.py
DB_NAME = os.getenv('DB_NAME', 'cms_db')
DB_USER = os.getenv('DB_USER', 'shreerajkalbande')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')

def get_db_connection():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    return conn

def reset_database():
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        print("Connected to database.")

        # Drop tables in reverse order of dependencies logic (or just bruteforce with CASCADE)
        # Postgres stores unquoted names as lowercase. 
        tables = [
            'reference', 'textbook', 'covers', 'topic', 'includes', 'course_content',
            'teaches', 'enrollment', 'part_of', 'program', 'offers', 'partner_university',
            'course', 'data_analyst', 'administrator', 'instructor', 'student', 'users'
        ]

        print("Dropping tables...")
        for table in tables:
            # Using CASCADE to handle dependencies
            cur.execute(f'DROP TABLE IF EXISTS {table} CASCADE')
        
        conn.commit()
        print("All tables dropped.")

        # Read and execute schema
        print("Applying schema...")
        with open('database/schema_postgres.sql', 'r') as f:
            schema_sql = f.read()
            cur.execute(schema_sql)
        conn.commit()
        print("Schema applied.")

        # Read and execute seed
        print("Seeding database...")
        with open('database/seed_postgres.sql', 'r') as f:
            seed_sql = f.read()
            cur.execute(seed_sql)
        conn.commit()
        print("Database seeded successfully.")

        cur.close()
        conn.close()

    except Exception as e:
        print(f"Error resetting database: {e}")
        if 'conn' in locals() and conn:
            conn.rollback()
            conn.close()

if __name__ == '__main__':
    reset_database()
