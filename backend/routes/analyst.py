from flask import Blueprint, jsonify
from ..database_connection import query_db

analyst_bp = Blueprint('analyst', __name__)

@analyst_bp.route('/stats', methods=['GET'])
def get_stats():
    # Example stat: Number of students per course
    query = """
        SELECT c.Name as name, COUNT(e.Student_ID) as student_count, AVG(e.Score) as avg_score
        FROM Course c
        LEFT JOIN Enrollment e ON c.Course_ID = e.Course_ID
        GROUP BY c.Course_ID, c.Name
    """
    stats = query_db(query)
    return jsonify(stats if stats else [])
