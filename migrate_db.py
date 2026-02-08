import psycopg2
import os
import sys

# Load environment variables if needed (e.g., from .env file)
# from dotenv import load_dotenv
# load_dotenv()

def get_db_url():
    url = os.getenv('DATABASE_URL')
    if not url:
        print("DATABASE_URL not found in environment variables.")
        url = input("Please paste your Postgres connection string (e.g., postgres://user:pass@host:port/db): ").strip()
    return url

def migrate_database():
    try:
        db_url = get_db_url()
        if not db_url:
            print("No connection string provided. Aborting.")
            return

        print(f"Connecting to database...")
        # Start connection
        conn = psycopg2.connect(db_url, sslmode='require')
        cur = conn.cursor()
        print("Connected successfully.")

        # Confirm before wiping
        confirm = input("WARNING: This will DROP ALL TABLES and RESET data in the target database. Continue? (y/n): ")
        if confirm.lower() != 'y':
            print("Aborted.")
            return

        # Drop tables - using lowercase names based on previous fixes
        tables = [
            'reference', 'textbook', 'covers', 'topic', 'includes', 'course_content',
            'teaches', 'enrollment', 'part_of', 'program', 'offers', 'partner_university',
            'course', 'data_analyst', 'administrator', 'instructor', 'student', 'users'
        ]

        print("Dropping existing tables...")
        for table in tables:
            cur.execute(f'DROP TABLE IF EXISTS {table} CASCADE')
        
        conn.commit()
        print("Tables dropped.")

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
        print("\nMigration Complete! 🚀")
        print("You can now connect your backend to this database by setting DATABASE_URL in your environment.")

    except Exception as e:
        print(f"\nError during migration: {e}")
        if 'conn' in locals() and conn:
            conn.rollback()
            conn.close()

if __name__ == '__main__':
    migrate_database()
