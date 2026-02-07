# Lab Assignment IV: Web Based Information System Design
## Online Course Management Platform

**Group Members:**
- [Your Name] (Roll No: [Your Roll No])
- [Partner Name] (Roll No: [Partner Roll No])

---

### b. ER Diagram
*Please refer to the conceptual ER Diagram provided in the assignment description. The Table Schema below implements this design.*

---

### c. Table Schema
The database is implemented in **PostgreSQL**. The schema includes the following tables supporting the IS-A relationships and interactions defined in the ERD.

#### Core Hierarchy (IS-A Users)
- **Users**: `User_ID` (PK), `Username`, `Password`, `Role`, `Name`, `Email`
- **Student**: `Student_ID` (PK, FK), `Country`, `Category`, `Skill_Level`, `Age`
- **Instructor**: `Instructor_ID` (PK, FK), `Experience`
- **Administrator**: `Admin_ID` (PK, FK)
- **Data_Analyst**: `Analyst_ID` (PK, FK)

#### Course Management
- **Course**: `Course_ID` (PK), `Name`, `Duration`, `Fees`
- **Enrollment**: `Student_ID`, `Course_ID`, `Enrollment_Date`, `Score`
- **Teaches**: `Instructor_ID`, `Course_ID`
- **Course_Content**: `Content_ID`, `Course_ID`, `URL`, `Type`
- **Includes**: `Course_ID`, `Content_ID` (Associative)

*(See full SQL in `database/schema.sql`)*

---

### d. List of Functionalities Implemented

1.  **User Authentication & Role Management**:
    - Unified Login system for Students, Instructors, Administrators, and Data Analysts.
    - JWT-based session management.
    - Role-based redirection to specific Dashboards.

2.  **Student Features**:
    - **View Courses**: Search and view available courses.
    - **Enrollment**: Register for courses securely (preventing duplicate enrollments).
    - **My Courses**: View enrolled courses and performance scores.

3.  **Instructor Features**:
    - **Course Management**: View courses assigned to the instructor.
    - **Content Creation**: Add multimedia content (Video, PDF, etc.) to specific courses.

4.  **System Administration**:
    - **Teacher Assignment**: Assign instructors to specific courses.
    - *(User Management is supported via the database seed/registration API)*.

5.  **Data Analytics**:
    - **Course Statistics**: View aggregated data such as student enrollment counts and average scores per course.

---

### e. List of Front-End Tools Used

1.  **React (Vite)**: For building a fast, component-based Single Page Application (SPA).
2.  **React Router DOM**: For handling client-side routing and navigation between Login and Role-based Dashboards.
3.  **Axios**: For making HTTP requests to the Flask Backend.
4.  **JWT-Decode**: For parsing JSON Web Tokens to manage user sessions and permissions securely in the frontend.
5.  **Vanilla CSS**: Used for styling to ensure a lightweight and custom interface as per minimal requirements.

