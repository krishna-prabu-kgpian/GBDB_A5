import psycopg2
from psycopg2 import sql
from pathlib import Path


def run_sql_file(
    sql_file_path: str,
    *,
    host: str,
    port: int,
    dbname: str,
    user: str,
    password: str,
):
    # Read SQL file
    sql_path = Path(sql_file_path)
    if not sql_path.exists():
        raise FileNotFoundError(f"SQL file not found: {sql_file_path}")

    sql_commands = sql_path.read_text()

    conn = None
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            dbname=dbname,
            user=user,
            password=password,
        )
        conn.autocommit = False  # safer default

        with conn.cursor() as cursor:
            cursor.execute(sql_commands)

        conn.commit()
        print("SQL file executed successfully.")

    except Exception as e:
        if conn:
            conn.rollback()
        raise RuntimeError(f"Error executing SQL file: {e}") from e

    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    DB_HOST = "10.5.18.103"
    DB_PORT = "5432"
    DB_NAME = "23CS30027"
    DB_USER = "23CS30027"
    DB_PASSWORD = "23CS30027"
    
    run_sql_file(
        "seed_db.sql",
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )
