from flask import Flask
from flask_cors import CORS
from .config import Config

app = Flask(__name__)
app.config.from_object(Config)
app.config.from_object(Config)
CORS(app) # Default allows all origins for all routes

from .database_connection import close_db

@app.teardown_appcontext
def teardown_db(error):
    close_db(error)

@app.route('/')
def index():
    return {"message": "CMS API is running"}

# Import blueprints
from .routes.auth import auth_bp
from .routes.student import student_bp
from .routes.instructor import instructor_bp
from .routes.admin import admin_bp
from .routes.analyst import analyst_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(student_bp, url_prefix='/student')
app.register_blueprint(instructor_bp, url_prefix='/instructor')
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(analyst_bp, url_prefix='/analyst')

if __name__ == '__main__':
    app.run(debug=True, port=5001)
