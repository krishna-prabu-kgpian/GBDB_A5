## Work Division
1. Rahul responsible for frontend involving Student and Analyst (READ API CALLS OF GLOBAL, STUDENT AND ANALYST)
2. Arnav responsible for frontend involving Admin and Instructor (READ API CALLS OF GLOBAL, ADMIN AND INSTRUCTOR)
3. Krishna responsible for interfacing frontend calls with database related functions (READ BOTH)
4. Shreeraj responsible for database related functions (CRUD) (READ ALL BACKEND FUNCTIONS BELOW THE API CALLS)
5. Ketan responsible for populating database, maintaining it, etc. (READ ER DIAGRAM) 

> **Roles (Naming Convention):** `ADMIN`, `STUDENT`, `INSTRUCTOR`, `ANALYST`  
> **Response Convention:**  
> - Success: `{ "data": … , "meta": ... }` (object or list depending on the endpoint)  
> - Error: `{ "error": { "code": "<STRING>", "message": "<STRING>", "details": <Object optional> } }`  
> **HTTP Codes:**  
> - `200` OK  
> - `400` validation / malformed inputs  
> - `401` unauthenticated  
> - `403` authenticated but not allowed  
> - `404` not found  
> - `409` conflict (duplicate links, already enrolled, etc.)  
> - `500` unexpected  

---

## Startup behavior (React + Flask session)

On startup:
1. React calls **`GET /api/v1/me`**.
2. Backend checks whether auth cookie/session/token is present/valid.
   - If **present**: backend returns `200` with user context; React uses it to render the correct role UI.
   - If **not present/invalid**: backend returns `401 UNAUTHENTICATED`; React shows the login page.
3. After user submits login:
   - React calls **`POST /api/v1/auth/login`** with `{username,password}`.
   - Backend validates credentials. If valid, it returns `200` and sets a cookie with the session (session-based auth).
   - React then calls **`GET /api/v1/me`** again; it succeeds and React now knows the role + profile IDs.
4. React calls **`GET /api/v1/entry`** to get the role menu (nav options) to display.

> Notes:
> - The backend is the source of truth for authentication and authorization.
> - The frontend uses `/me` for *identity* and `/entry` for *UI menu configuration*.

---

# GLOBAL ENDPOINTS (All authenticated users)

These are used by *any* logged-in role.

---

## G1) POST /api/v1/auth/login
**Purpose:** authenticate and return token/session context (session cookie) + user context.  
**Used in React:** Login page form submit.  
**Request body:** `{ "username": "<string>", "password": "<string>" }`  
**Success (`200`) data:**
- `token: string` *(optional if you are purely session-cookie based; include if you later support JWT)*
- `user: { userId, username, role, name, email }`
- `profileIds: { studentId?, instructorId?, adminId?, analystId? }`

**Errors**
- `401 INVALID_CREDENTIALS`
- `400 VALIDATION_ERROR` (missing/invalid fields)

---

## G2) GET /api/v1/me
**Purpose:** returns who is logged in + profile IDs for routing (My Courses, My Teaching, etc.).  
**Used in React:** App bootstrap; cached globally.  
**Success (`200`) data:** `{ userId, role, name, email, profileIds }`  
**Errors**
- `401 UNAUTHENTICATED` (no/invalid cookie/session/token)

---

## G3) GET /api/v1/entry
**Purpose:** returns **role menu configuration** for navbar/sidebar.  
**Used in React:** after `/me`, to render navigation options.  
**Success (`200`) data:**
- `role: "ADMIN"|"STUDENT"|"INSTRUCTOR"|"ANALYST"`
- `menu: Array<{ key, label, path }>`
**Errors**
- `401 UNAUTHENTICATED`

---

## G4) GET /api/v1/courses
**Purpose:** Browse/search courses.  
**Used in React:** `CourseCatalogPage` (search bar + filters).  
**Query params (optional):**
- `q` (course name search)
- `topicId` (ERD: `Covers`)
- `programId` (ERD: `Part_of`)
- `universityId` (ERD: `Offers`)
- `minFees`, `maxFees`
- `page`, `pageSize`

**Success (`200`) data (example):**
```json
{
  "data": [
    { "courseId": 10, "name": "DBMS", "duration": 12, "fees": 100 }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 1 }
}
```

**Errors**
- `401 UNAUTHENTICATED`
- `400 VALIDATION_ERROR` (bad pagination/filter types)

---

## G5) GET /api/v1/courses/{courseId}
**Purpose:** Display one course with all linked info from ERD:
- topics via `Covers`
- programs via `Part_of`
- universities via `Offers`
- instructors via `Teaches`
- content via `Includes` + `Course_content`
- textbooks via `Reference` + `Textbook`

**Used in React:** `CourseDetailPage`  
**Path param:** `courseId`

**Success (`200`) data (example):**
```json
{
  "data": {
    "course": { "courseId": 10, "name": "DBMS", "duration": 12, "fees": 100 },
    "topics": [{ "topicId": 1, "name": "ER Modeling" }],
    "programs": [{ "programId": 2, "name": "CS", "progType": "Degree", "duration": 48 }],
    "universities": [{ "universityId": 3, "name": "Partner Uni" }],
    "instructors": [{ "instructorId": 7, "name": "Dr X", "experience": 5 }],
    "textbooks": [{ "isbn": 111, "title": "DB Book", "author": "Author A" }],
    "content": [{ "contentId": 55, "url": "https://...", "type": "video" }]
  }
}
```

**Errors**
- `401 UNAUTHENTICATED`
- `404 COURSE_NOT_FOUND`

---

## G6) GET /api/v1/topics | /programs | /universities | /textbooks
**Purpose:** Provide lists for filters and admin linking dropdowns (ERD entity tables).  
**Used in React:** course filters; admin forms/panels.  
**Success (`200`) data:**
- `/topics` → `[{ topicId, name }]`
- `/programs` → `[{ programId, name, progType, duration }]`
- `/universities` → `[{ universityId, name }]`
- `/textbooks` → `[{ isbn, title, author }]`

**Errors**
- `401 UNAUTHENTICATED`

---

# ROLE-SPECIFIC ENDPOINTS

## STUDENT endpoints

### S0) POST /api/v1/auth/signup  ✅ Student-only signup
**Purpose:** Allow only **students** to sign up. Instructors/admins/analysts cannot self-sign-up.  
**Used in React:** `StudentSignupPage` (only student-facing).  
**Request body:**
- base user fields: `{ username, password, name, email }`
- student profile fields (ERD: `Student`): `{ country, category, skillLevel, age }`

**Success (`200`) data:**
- `user: { userId, username, role:"STUDENT", name, email }`
- `profileIds: { studentId }`
- (optional) `token` if you want to auto-login; OR just return success and require login.

**Errors**
- `400 VALIDATION_ERROR`
- `409 USERNAME_TAKEN`

> **Important:** This endpoint MUST force role=`STUDENT` regardless of what the client sends.

---

### S1) POST /api/v1/courses/{courseId}/enroll
**Purpose:** Student registers themself (ERD: `Enrollment`).  
**Used in React:** `CourseDetailPage` → “Enroll” button.  
**Path param:** `courseId`  
**Body (optional):** `{ enrollmentDate?: "YYYY-MM-DD" }` (otherwise backend sets today)

**Success (`200`) data:**
```json
{ "data": { "studentId": 42, "courseId": 10, "enrollmentDate": "2026-02-06", "score": null } }
```

**Errors**
- `401 UNAUTHENTICATED`
- `403 FORBIDDEN_ROLE`
- `404 COURSE_NOT_FOUND`
- `409 ALREADY_ENROLLED`

> NOTE (optional): pricing check can be added later if time permits, but it is not required.

---

### S2) GET /api/v1/students/{studentId}/enrollments
**Purpose:** Student sees “My Courses” (Enrollment + Course join).  
**Used in React:** `StudentMyCoursesPage`.  
**Path param:** `studentId` (must equal `/me.profileIds.studentId`).

**Success (`200`) data:**
```json
{
  "data": [
    { "courseId": 10, "courseName": "DBMS", "enrollmentDate": "2026-02-06", "score": null }
  ]
}
```

**Errors**
- `401 UNAUTHENTICATED`
- `403 FORBIDDEN_RESOURCE` (student trying to access someone else)
- `404 STUDENT_NOT_FOUND`

---

## INSTRUCTOR endpoints

### I1) GET /api/v1/instructors/{instructorId}/courses
**Purpose:** Instructor dashboard listing teaching courses (ERD: `Teaches`).  
**Used in React:** `InstructorMyCoursesPage`.  
**Path param:** `instructorId` (must equal `/me.profileIds.instructorId`).

**Success (`200`) data:**
```json
{
  "data": [
    { "courseId": 10, "name": "DBMS", "duration": 12, "fees": 100 }
  ]
}
```

**Errors**
- `401 UNAUTHENTICATED`
- `403 FORBIDDEN_RESOURCE`
- `404 INSTRUCTOR_NOT_FOUND`

---

### I2) POST /api/v1/courses/{courseId}/content
**Purpose:** Add content to a course taught by this instructor (ERD: `Course_content` + `Includes`).  
**Used in React:** `InstructorCourseContentPanel`.  
**Path param:** `courseId`  
**Body:** `{ url: string, type: string }`

**Success (`200`) data:**
```json
{ "data": { "contentId": 55, "courseId": 10, "url": "https://...", "type": "video" } }
```

**Errors**
- `401 UNAUTHENTICATED`
- `403 FORBIDDEN_ROLE`
- `403 NOT_TEACHING_COURSE`
- `404 COURSE_NOT_FOUND`
- `400 VALIDATION_ERROR`

---

### I3) DELETE /api/v1/courses/{courseId}/content/{contentId}
**Purpose:** Remove content association for that course (delete from `Includes`; optional orphan cleanup).  
**Used in React:** `InstructorCourseContentPanel` delete action.  
**Path params:** `courseId`, `contentId`

**Success (`200`) data:** `{ "data": "deleted" }`

**Errors**
- `401 UNAUTHENTICATED`
- `403 FORBIDDEN_ROLE`
- `403 NOT_TEACHING_COURSE`
- `404 COURSE_NOT_FOUND`
- `404 CONTENT_NOT_FOUND`
- `404 CONTENT_LINK_NOT_FOUND`

---

## ANALYST endpoints (with filtering)

> Analyst endpoints MUST support filtering via query params (date range + entity filters).

### A1) GET /api/v1/stats/overview
**Purpose:** Dashboard KPIs with optional date filtering. Aggregates over `Course`, `Student`, `Enrollment`.  
**Used in React:** `AnalystDashboardPage` KPI cards.  
**Query params (optional):**
- `from` (ISODate) — include enrollments on/after
- `to` (ISODate) — include enrollments on/before
- `programId` (restrict courses via `Part_of`)
- `topicId` (restrict courses via `Covers`)
- `universityId` (restrict courses via `Offers`)
- `courseId` (restrict to one course)

**Success (`200`) data:**
```json
{
  "data": {
    "totalCourses": 120,
    "totalStudents": 5000,
    "totalEnrollments": 23000
  }
}
```

**Errors**
- `401 UNAUTHENTICATED`
- `403 FORBIDDEN_ROLE`
- `400 VALIDATION_ERROR` (invalid dates/range)

---

### A2) GET /api/v1/stats/enrollments/by-course
**Purpose:** Enrollment counts grouped by course with filters.  
**Used in React:** analyst chart/table “Enrollments by Course”.  
**Query params (optional):**
- `from`, `to` (ISODate)
- `top` (int)
- `topicId` / `programId` / `universityId` (limits which courses are included)
- `minEnrollments`, `maxEnrollments` (optional)

**Success (`200`) data:**
```json
{
  "data": [
    { "courseId": 10, "courseName": "DBMS", "enrollments": 340 }
  ]
}
```

**Errors**
- `401 UNAUTHENTICATED`
- `403 FORBIDDEN_ROLE`
- `400 VALIDATION_ERROR`

---

### A3) GET /api/v1/stats/enrollments/by-topic
**Purpose:** Enrollment counts grouped by topic (`Enrollment` joined to `Covers`).  
**Used in React:** analyst “Enrollments by Topic”.  
**Query params (optional):**
- `from`, `to`
- `top`
- `programId` (restrict courses via `Part_of`)
- `universityId` (restrict courses via `Offers`)
- `courseId` (restrict to one course)

**Success (`200`) data:**
```json
{ "data": [ { "topicId": 1, "topicName": "ER Modeling", "enrollments": 500 } ] }
```

**Errors**
- `401 UNAUTHENTICATED`
- `403 FORBIDDEN_ROLE`
- `400 VALIDATION_ERROR`

---

### A4) GET /api/v1/stats/enrollments/by-university
**Purpose:** Enrollment counts grouped by partner university (`Offers` joined to `Enrollment`).  
**Used in React:** analyst “Enrollments by University”.  
**Query params (optional):**
- `from`, `to`
- `top`
- `topicId` (restrict courses via `Covers`)
- `programId` (restrict via `Part_of`)
- `courseId`

**Success (`200`) data:**
```json
{ "data": [ { "universityId": 3, "universityName": "Partner Uni", "enrollments": 700 } ] }
```

**Errors**
- `401 UNAUTHENTICATED`
- `403 FORBIDDEN_ROLE`
- `400 VALIDATION_ERROR`

---

## ADMIN endpoints (corrected and complete)

### AD1) POST /api/v1/admin/users  ✅ appoint ADMIN / ANALYST / INSTRUCTOR
**Purpose:** Admin appoints new users for roles `ADMIN`, `ANALYST`, `INSTRUCTOR` (and optionally creates students).  
**Used in React:** `AdminCreateUserPage`.  
**Body:**
- `{ username, password, name, email, role }` where `role ∈ {ADMIN, ANALYST, INSTRUCTOR}` *(optional STUDENT)*
- role profile:
  - `INSTRUCTOR`: `{ experience }`
  - `ADMIN`: `{}`
  - `ANALYST`: `{}`
  - `STUDENT` (optional): `{ country, category, skillLevel, age }`

**Success (`200`) data:**
```json
{
  "data": {
    "userId": 99,
    "role": "INSTRUCTOR",
    "profileIds": { "instructorId": 7 }
  }
}
```

**Errors**
- `401 UNAUTHENTICATED`
- `403 FORBIDDEN_ROLE`
- `400 VALIDATION_ERROR`
- `409 USERNAME_TAKEN`

---

### AD2) GET /api/v1/admin/users
**Purpose:** Admin searches users to populate dropdowns/panels (assign instructor, add student).  
**Used in React:** admin panels.  
**Query params (optional):** `role`, `q`, `page`, `pageSize`

**Success (`200`) data:**
```json
{
  "data": [
    { "userId": 99, "name": "Dr X", "role": "INSTRUCTOR", "profileIds": { "instructorId": 7 } }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 1 }
}
```

**Errors**
- `401 UNAUTHENTICATED`
- `403 FORBIDDEN_ROLE`
- `400 VALIDATION_ERROR`

---

### AD3) POST /api/v1/admin/courses
**Purpose:** Create course (`Course`).  
**Used in React:** admin course creation.  
**Body:** `{ name, duration, fees }`  
**Success:** `{ "data": { "courseId": 10 } }`  
**Errors:** `401`, `403`, `400`

---

### AD4) POST /api/v1/admin/programs
**Purpose:** Create program (`Program`).  
**Body:** `{ name, progType, duration }`  
**Success:** `{ "data": { "programId": 2 } }`  
**Errors:** `401`, `403`, `400`

---

### AD5) POST /api/v1/admin/topics
**Purpose:** Create topic (`Topic`).  
**Body:** `{ name }`  
**Success:** `{ "data": { "topicId": 1 } }`  
**Errors:** `401`, `403`, `400`, optional `409 DUPLICATE_NAME`

---

### AD6) POST /api/v1/admin/universities
**Purpose:** Create partner university (`Partner_University`).  
**Body:** `{ name }`  
**Success:** `{ "data": { "universityId": 3 } }`  
**Errors:** `401`, `403`, `400`, optional `409 DUPLICATE_NAME`

---

### AD7) POST /api/v1/admin/textbooks
**Purpose:** Create textbook (`Textbook`).  
**Body:** `{ isbn, title, author }`  
**Success:** `{ "data": { "isbn": 111 } }`  
**Errors:** `401`, `403`, `400`, `409 ISBN_EXISTS`

---

### AD8) POST /api/v1/admin/courses/{courseId}/instructors
**Purpose:** Assign instructor to course (`Teaches`) — requirement (iv).  
**Body:** `{ instructorId }`  
**Success:** `{ "data": { "courseId": 10, "instructorId": 7 } }`  
**Errors:** `401`, `403`, `400`, `404 COURSE_NOT_FOUND`, `404 INSTRUCTOR_NOT_FOUND`, `409 ALREADY_ASSIGNED`

---

### AD9) DELETE /api/v1/admin/courses/{courseId}/instructors/{instructorId}
**Purpose:** Unassign instructor from course (delete `Teaches`).  
**Success:** `{ "data": "deleted" }`  
**Errors:** `401`, `403`, `404 ASSIGNMENT_NOT_FOUND`

---

### AD10) POST /api/v1/admin/courses/{courseId}/enrollments
**Purpose:** Admin adds student to course (`Enrollment`) — requirement (iv).  
**Body:** `{ studentId, enrollmentDate? }`  
**Success:** `{ "data": { "studentId": 42, "courseId": 10, "enrollmentDate": "2026-02-06", "score": null } }`  
**Errors:** `401`, `403`, `400`, `404 COURSE_NOT_FOUND`, `404 STUDENT_NOT_FOUND`, `409 ALREADY_ENROLLED`

---

### AD11) DELETE /api/v1/admin/students/{studentId}/enrollments/{courseId}
**Purpose:** Admin deletes student from course (`Enrollment`) — requirement (iv).  
**Success:** `{ "data": "deleted" }`  
**Errors:** `401`, `403`, `404 ENROLLMENT_NOT_FOUND`

---

### AD12) POST /api/v1/admin/courses/{courseId}/topics
**Purpose:** Link course ↔ topic (`Covers`).  
**Body:** `{ topicId }`  
**Success:** `{ "data": { "courseId": 10, "topicId": 1 } }`  
**Errors:** `401`, `403`, `400`, `404 COURSE_NOT_FOUND`, `404 TOPIC_NOT_FOUND`, `409 ALREADY_LINKED`

### AD13) DELETE /api/v1/admin/courses/{courseId}/topics/{topicId}
**Purpose:** Unlink course ↔ topic (`Covers`).  
**Success:** `{ "data": "deleted" }`  
**Errors:** `401`, `403`, `404 LINK_NOT_FOUND`

---

### AD14) POST /api/v1/admin/courses/{courseId}/programs
**Purpose:** Link course ↔ program (`Part_of`).  
**Body:** `{ programId }`  
**Success:** `{ "data": { "courseId": 10, "programId": 2 } }`  
**Errors:** `401`, `403`, `400`, `404 COURSE_NOT_FOUND`, `404 PROGRAM_NOT_FOUND`, `409 ALREADY_LINKED`

### AD15) DELETE /api/v1/admin/courses/{courseId}/programs/{programId}
**Purpose:** Unlink course ↔ program (`Part_of`).  
**Success:** `{ "data": "deleted" }`  
**Errors:** `401`, `403`, `404 LINK_NOT_FOUND`

---

### AD16) POST /api/v1/admin/courses/{courseId}/universities
**Purpose:** Link course ↔ university (`Offers`).  
**Body:** `{ universityId }`  
**Success:** `{ "data": { "courseId": 10, "universityId": 3 } }`  
**Errors:** `401`, `403`, `400`, `404 COURSE_NOT_FOUND`, `404 UNIVERSITY_NOT_FOUND`, `409 ALREADY_LINKED`

### AD17) DELETE /api/v1/admin/courses/{courseId}/universities/{universityId}
**Purpose:** Unlink course ↔ university (`Offers`).  
**Success:** `{ "data": "deleted" }`  
**Errors:** `401`, `403`, `404 LINK_NOT_FOUND`

---

### AD18) POST /api/v1/admin/courses/{courseId}/textbooks
**Purpose:** Link course ↔ textbook (`Reference`).  
**Body:** `{ isbn }`  
**Success:** `{ "data": { "courseId": 10, "isbn": 111 } }`  
**Errors:** `401`, `403`, `400`, `404 COURSE_NOT_FOUND`, `404 TEXTBOOK_NOT_FOUND`, `409 ALREADY_LINKED`

### AD19) DELETE /api/v1/admin/courses/{courseId}/textbooks/{isbn}
**Purpose:** Unlink course ↔ textbook (`Reference`).  
**Success:** `{ "data": "deleted" }`  
**Errors:** `401`, `403`, `404 LINK_NOT_FOUND`

---

# Backend Function Templates (Inputs → Outputs)

## Types
- `Role = "ADMIN" | "STUDENT" | "INSTRUCTOR" | "ANALYST"`
- `ActorContext = { userId:int, role:Role, profileIds:{ studentId?:int, instructorId?:int, adminId?:int, analystId?:int } }`

---

## AuthService

### login
- `login(username:str, password:str) -> { userId:int, role:Role, name:str, email:str, profileIds:dict }`

### signup_student
- `signup_student(payload:{ username:str, password:str, name:str, email:str, country:str, category:str, skillLevel:str, age:int }) -> { userId:int, role:"STUDENT", profileIds:{ studentId:int } }`

---

## UserRepo (User table)

- `get_by_username(username:str) -> { userId:int, username:str, passwordHash:str, role:Role, name:str, email:str } | None`
- `get_by_id(userId:int) -> { userId:int, username:str, role:Role, name:str, email:str } | None`
- `username_exists(username:str) -> bool`
- `insert_user(payload:{ username:str, passwordHash:str, role:Role, name:str, email:str }) -> userId:int`
- `list_users(filters:{ role?:Role, q?:str }, page:int, pageSize:int) -> { items:list[{ userId:int, username:str, name:str, role:Role }], total:int }`

---

## StudentRepo (Student table)

- `insert_student(userId:int, payload:{ country:str, category:str, skillLevel:str, age:int }) -> studentId:int`
- `get_by_userId(userId:int) -> { studentId:int, userId:int, country:str, category:str, skillLevel:str, age:int } | None`
- `get_by_id(studentId:int) -> { studentId:int, userId:int, country:str, category:str, skillLevel:str, age:int } | None`

---

## InstructorRepo (Instructor table)

- `insert_instructor(userId:int, payload:{ experience:int }) -> instructorId:int`
- `get_by_userId(userId:int) -> { instructorId:int, userId:int, experience:int } | None`
- `get_by_id(instructorId:int) -> { instructorId:int, userId:int, experience:int } | None`

---

## AdminRepo (Administrator table)

- `insert_admin(userId:int) -> adminId:int`
- `get_by_userId(userId:int) -> { adminId:int, userId:int } | None`

---

## AnalystRepo (Data_Analyst table)

- `insert_analyst(userId:int) -> analystId:int`
- `get_by_userId(userId:int) -> { analystId:int, userId:int } | None`

---

## ProfileRepo (helper)

- `get_profile_ids(userId:int, role:Role) -> { studentId?:int, instructorId?:int, adminId?:int, analystId?:int }`

---

## CourseRepo (Course table)

- `insert_course(payload:{ name:str, duration:int, fees:float }) -> courseId:int`
- `get_by_id(courseId:int) -> { courseId:int, name:str, duration:int, fees:float } | None`
- `search(filters:{ q?:str, topicId?:int, programId?:int, universityId?:int, minFees?:float, maxFees?:float }, page:int, pageSize:int) -> { items:list[{ courseId:int, name:str, duration:int, fees:float }], total:int }`

---

## TopicRepo (Topic table)

- `insert_topic(payload:{ name:str }) -> topicId:int`
- `get_by_id(topicId:int) -> { topicId:int, name:str } | None`
- `list_all() -> list[{ topicId:int, name:str }]`

---

## ProgramRepo (Program table)

- `insert_program(payload:{ name:str, progType:str, duration:int }) -> programId:int`
- `get_by_id(programId:int) -> { programId:int, name:str, progType:str, duration:int } | None`
- `list_all() -> list[{ programId:int, name:str, progType:str, duration:int }]`

---

## UniversityRepo (Partner_University table)

- `insert_university(payload:{ name:str }) -> universityId:int`
- `get_by_id(universityId:int) -> { universityId:int, name:str } | None`
- `list_all() -> list[{ universityId:int, name:str }]`

---

## TextbookRepo (Textbook table)

- `insert_textbook(payload:{ isbn:int, title:str, author:str }) -> isbn:int`
- `get_by_isbn(isbn:int) -> { isbn:int, title:str, author:str } | None`
- `list_all() -> list[{ isbn:int, title:str, author:str }]`

---

## EnrollmentRepo (Enrollment table)

- `exists(studentId:int, courseId:int) -> bool`
- `insert(studentId:int, courseId:int, enrollmentDate:str) -> { studentId:int, courseId:int, enrollmentDate:str, score:float|None }`
- `delete(studentId:int, courseId:int) -> bool`
- `list_by_student(studentId:int) -> list[{ courseId:int, courseName:str, enrollmentDate:str, score:float|None }]`

---

## TeachesRepo (Teaches table)

- `exists(instructorId:int, courseId:int) -> bool`
- `insert(instructorId:int, courseId:int) -> bool`
- `delete(instructorId:int, courseId:int) -> bool`
- `list_courses_by_instructor(instructorId:int) -> list[{ courseId:int, name:str, duration:int, fees:float }]`
- `list_instructors_by_course(courseId:int) -> list[{ instructorId:int, name:str, experience:int }]`

---

## ContentRepo (Course_content table)

- `insert_content(payload:{ url:str, type:str }) -> contentId:int`
- `get_by_id(contentId:int) -> { contentId:int, url:str, type:str } | None`

---

## IncludesRepo (Includes table)

- `link(courseId:int, contentId:int) -> bool`
- `unlink(courseId:int, contentId:int) -> bool`
- `list_content(courseId:int) -> list[{ contentId:int, url:str, type:str }]`

---

## CoversRepo (Covers table)

- `link(courseId:int, topicId:int) -> bool`
- `unlink(courseId:int, topicId:int) -> bool`
- `list_topics(courseId:int) -> list[{ topicId:int, name:str }]`

---

## PartOfRepo (Part_of table)

- `link(courseId:int, programId:int) -> bool`
- `unlink(courseId:int, programId:int) -> bool`
- `list_programs(courseId:int) -> list[{ programId:int, name:str, progType:str, duration:int }]`

---

## OffersRepo (Offers table)

- `link(courseId:int, universityId:int) -> bool`
- `unlink(courseId:int, universityId:int) -> bool`
- `list_universities(courseId:int) -> list[{ universityId:int, name:str }]`

---

## ReferenceRepo (Reference table)

- `link(courseId:int, isbn:int) -> bool`
- `unlink(courseId:int, isbn:int) -> bool`
- `list_textbooks(courseId:int) -> list[{ isbn:int, title:str, author:str }]`

---

## CourseReadService (composed reads)

- `get_course_detail(courseId:int) -> { course:dict, topics:list, programs:list, universities:list, instructors:list, textbooks:list, content:list }`

---

## StudentService

- `enroll_self(actor:ActorContext, courseId:int, enrollmentDate?:str) -> { studentId:int, courseId:int, enrollmentDate:str, score:float|None }`
- `list_my_enrollments(actor:ActorContext, studentId:int) -> list[{ courseId:int, courseName:str, enrollmentDate:str, score:float|None }]`

---

## InstructorService

- `list_my_courses(actor:ActorContext, instructorId:int) -> list[{ courseId:int, name:str, duration:int, fees:float }]`
- `add_course_content(actor:ActorContext, courseId:int, payload:{ url:str, type:str }) -> { contentId:int, courseId:int, url:str, type:str }`
- `delete_course_content(actor:ActorContext, courseId:int, contentId:int) -> "deleted"`

---

## AdminService

- `create_user(actor:ActorContext, payload:{ username:str, password:str, name:str, email:str, role:Role, profile?:dict }) -> { userId:int, role:Role, profileIds:dict }`
- `list_users(actor:ActorContext, filters:{ role?:Role, q?:str }, page:int, pageSize:int) -> { items:list[dict], total:int }`
- `create_course(actor:ActorContext, payload:{ name:str, duration:int, fees:float }) -> { courseId:int }`
- `create_program(actor:ActorContext, payload:{ name:str, progType:str, duration:int }) -> { programId:int }`
- `create_topic(actor:ActorContext, payload:{ name:str }) -> { topicId:int }`
- `create_university(actor:ActorContext, payload:{ name:str }) -> { universityId:int }`
- `create_textbook(actor:ActorContext, payload:{ isbn:int, title:str, author:str }) -> { isbn:int }`
- `assign_instructor(actor:ActorContext, courseId:int, instructorId:int) -> { courseId:int, instructorId:int }`
- `unassign_instructor(actor:ActorContext, courseId:int, instructorId:int) -> "deleted"`
- `add_student_to_course(actor:ActorContext, courseId:int, studentId:int, enrollmentDate?:str) -> { studentId:int, courseId:int, enrollmentDate:str, score:float|None }`
- `remove_student_from_course(actor:ActorContext, studentId:int, courseId:int) -> "deleted"`
- `link_course_topic(actor:ActorContext, courseId:int, topicId:int) -> { courseId:int, topicId:int }`
- `unlink_course_topic(actor:ActorContext, courseId:int, topicId:int) -> "deleted"`
- `link_course_program(actor:ActorContext, courseId:int, programId:int) -> { courseId:int, programId:int }`
- `unlink_course_program(actor:ActorContext, courseId:int, programId:int) -> "deleted"`
- `link_course_university(actor:ActorContext, courseId:int, universityId:int) -> { courseId:int, universityId:int }`
- `unlink_course_university(actor:ActorContext, courseId:int, universityId:int) -> "deleted"`
- `link_course_textbook(actor:ActorContext, courseId:int, isbn:int) -> { courseId:int, isbn:int }`
- `unlink_course_textbook(actor:ActorContext, courseId:int, isbn:int) -> "deleted"`
- `admin_add_enrollment(actor:ActorContext, courseId:int, studentId:int, enrollmentDate?:str) -> { studentId:int, courseId:int, enrollmentDate:str, score:float|None }`
- `admin_delete_enrollment(actor:ActorContext, studentId:int, courseId:int) -> "deleted"`

---

## StatsService (Analyst)

- `overview(actor:ActorContext, filters:{ from?:str, to?:str, programId?:int, topicId?:int, universityId?:int, courseId?:int }) -> { totalCourses:int, totalStudents:int, totalEnrollments:int }`
- `enrollments_by_course(actor:ActorContext, filters:{ from?:str, to?:str, top?:int, topicId?:int, programId?:int, universityId?:int, minEnrollments?:int, maxEnrollments?:int }) -> list[{ courseId:int, courseName:str, enrollments:int }]`
- `enrollments_by_topic(actor:ActorContext, filters:{ from?:str, to?:str, top?:int, programId?:int, universityId?:int, courseId?:int }) -> list[{ topicId:int, topicName:str, enrollments:int }]`
- `enrollments_by_university(actor:ActorContext, filters:{ from?:str, to?:str, top?:int, topicId?:int, programId?:int, courseId?:int }) -> list[{ universityId:int, universityName:str, enrollments:int }]`

---
