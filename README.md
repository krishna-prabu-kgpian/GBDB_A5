# Educational Platform

A modern full-stack educational platform for managing courses, students, instructors, and analytics.

## Tech Stack

- **Frontend**: React 18, React Router, Recharts
- **Backend**: Flask 3.0, JWT Authentication
- **Database**: PostgreSQL (NeonDB)

## Features

- **Students**: Browse programs/courses, enroll, track progress
- **Instructors**: Create/manage courses, add content, view student performance
- **Data Analysts**: View comprehensive platform analytics
- **Administrators**: Manage users and courses

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- PostgreSQL database (NeonDB)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database credentials
python app.py
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

Frontend runs on `http://localhost:3000`

## Test Credentials

All test users have password: `pass`

- **Student**: john.doe, emma.wilson, raj.patel
- **Instructor**: dr.smith, prof.jones, dr.kumar
- **Data Analyst**: analyst.james, analyst.sarah
- **Administrator**: admin.chief, admin.tech

See `TEST_CREDENTIALS.md` for complete list.

## Project Structure

```
├── backend/
│   ├── app.py           # Main Flask app
│   ├── auth.py          # JWT authentication
│   ├── database.py      # DB utilities
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/       # Dashboard pages
│   │   ├── services/    # API calls
│   │   └── context/     # Auth context
│   └── package.json
└── database/
    ├── schema_db.sql    # Database schema
    └── seed_db.sql      # Sample data
```

## Key Highlights

- **Light Theme**: Clean, modern UI with light backgrounds
- **Programs & Courses**: Browse courses organized by programs
- **Role-Based Access**: Different dashboards for each user role
- **Real-time Analytics**: Comprehensive statistics for analysts
- **Secure Authentication**: JWT-based auth with role permissions

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=postgresql://user:pass@host/db
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```