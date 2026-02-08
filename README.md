# Course Management System (CMS)

## 🚀 Quick Start Guide

### 1. Backend Setup (Flask)
#### Windows
```powershell
cd FINAL_PRJDBMS
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
# (Ensure Postgres is running)
createdb cms_db
psql -d cms_db -f database/schema_postgres.sql
psql -d cms_db -f database/seed_postgres.sql
python -m backend.app
```

#### Mac / Linux
```bash
cd FINAL_PRJDBMS
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
# (Ensure Postgres service is running: sudo service postgresql start)
createdb cms_db
psql -d cms_db -f database/schema_postgres.sql
psql -d cms_db -f database/seed_postgres.sql
python3 -m backend.app
```

### 2. Frontend Setup (React)
#### Windows / Mac / Linux
```bash
cd client
npm install
npm run dev
```

### 3. Database Management
#### Reset Local Database
```bash
python reset_db.py
```

#### Deploy to Cloud (Neon/Supabase)
```bash
python migrate_db.py
# Paste connection string when prompted
```

### 5. Default Credentials
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


