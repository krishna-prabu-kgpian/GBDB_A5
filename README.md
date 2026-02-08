# Course Management System (CMS)

## 🚀 Quick Start Guide

### 1. Backend Setup (Flask)
```bash
# Navigate to root
cd FINAL_PRJDBMS

# Set up virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Initialize Database (PostgreSQL)
# Ensure Postgres service is running
createdb cms_db
psql -d cms_db -f database/schema_postgres.sql
psql -d cms_db -f database/seed_postgres.sql

# Run Server
python -m backend.app
```
*   Backend runs on: `http://127.0.0.1:5001`

### 1b. Database Setup (PostgreSQL)
1.  **Install & Start PostgreSQL**
    ```bash
    brew install postgresql@14
    brew services start postgresql@14
    ```

2.  **Create Database & Seed Data**
    ```bash
    createdb cms_db
    psql -d cms_db -f database/schema_postgres.sql
    psql -d cms_db -f database/seed_postgres.sql
    ```

4.  **Reset Database (Optional)**
    To wipe the database and restore seed data:
    ```bash
    python reset_db.py
    ```

5.  **Deploy to Cloud (`migrate_db.py`)**
    To push your local schema and data to a remote Postgres database (e.g., Neon, Supabase):
    ```bash
    # 1. Get your connection string from the cloud provider
    # 2. Run the migration script
    python migrate_db.py
    # 3. Paste the connection string when prompted
    ```

### 3. Key Features
- **Premium UI**: Modern card-based layouts for Students and Instructors.
- **Role-Based Dashboards**: tailored views for Students, Instructors, Admins, and Analysts.
- **Secure Authentication**: JWT-based login with role protection.
- **PostgreSQL**: Robust database backend.



### 2. Frontend Setup (React)
```bash
# Open a new terminal
cd client

# Install dependencies
npm install

# Run Frontend
npm run dev
```
*   Frontend runs on: `http://localhost:5173`

### 3. Default Credentials
*   **Admin**: `admin` / `pass`
*   **Instructor**: `inst1` / `pass`
*   **Student**: `stud1` / `pass`
*   **Analyst**: `analyst1` / `pass`

---

## Work Division
1. Rahul responsible for frontend involving Student and Analyst (READ API CALLS OF GLOBAL, STUDENT AND ANALYST)
2. Arnav responsible for frontend involving Admin and Instructor (READ API CALLS OF GLOBAL, ADMIN AND INSTRUCTOR)
3. Krishna responsible for interfacing frontend calls with database related functions (READ BOTH)
4. Shreeraj responsible for database related functions (CRUD) (READ ALL BACKEND FUNCTIONS BELOW THE API CALLS)
5. Ketan responsible for populating database, maintaining it, etc. (READ ER DIAGRAM) 

> **Roles (Naming Convention):** `ADMIN`, `STUDENT`, `INSTRUCTOR`, `ANALYST`  
> **Response Convention:**  
> - Success: `{ "data": … , "meta": ... }` (object or list depending on the endpoint)  
> - Error: `{ "error": "<string>" }`  
> **HTTP Codes:**  
> - `200` OK  
> - `400` validation / malformed inputs  
> - `401` unauthenticated  
> - `403` authenticated but not allowed  
> - `404` not found  
> - `409` conflict (duplicate links, already enrolled, etc.)  
> - `500` unexpected  

---

## API Endpoints

### 1. Authentication
*   **POST** `/auth/login` - Login user (Returns JWT token)
*   **POST** `/auth/register` - Register new user

### 2. Student
*   **GET** `/student/courses` - List all available courses (supports search)
*   **POST** `/student/enroll` - Enroll in a course
*   **GET** `/student/my-courses/<student_id>` - List enrolled courses

### 3. Instructor
*   **GET** `/instructor/my-courses/<instructor_id>` - List courses taught by instructor
*   **POST** `/instructor/add-content` - Add content URL to a course

### 4. Administrator
*   **GET** `/admin/users` - List all users
*   **DELETE** `/admin/user/<user_id>` - Delete a user
*   **POST** `/admin/assign-teacher` - Assign instructor to a course
*   **GET** `/admin/instructors` - List all instructors
*   **GET** `/admin/courses` - List all courses

### 5. Data Analyst
*   **GET** `/analyst/stats` - Get course statistics (enrollment counts, average scores)

---

## Startup Behavior
1.  Frontend checks for JWT token in `localStorage`.
2.  If present and valid, user is redirected to role-specific dashboard.
3.  If missing or expired, user is redirected to `/login`.

---


