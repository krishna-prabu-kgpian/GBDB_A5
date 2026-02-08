-- Course_Reference (renamed from Reference)
-- INSERT INTO Course_Reference (Course_ID, ISBN) VALUES ...
-- (No data for this table in original seed, but updating comment/potential structure)
-- Original seed file ended at line 63 without Reference inserts.
-- Adding a dummy insert if needed, or just ensuring consistency if future data is added.
-- But wait, the file verification showed it ends at line 63 with Includes.
-- If there are no inserts for Reference, then I don't need to change anything in seed
-- UNLESS I want to add some for testing.
-- Actually, the user's error was in SCHEMA, not SEED.
-- But I should check if I missed any Reference inserts in previous reads.
-- Line 63 was end of file.
-- Okay, I will just add a comment to clarify or do nothing if no inserts.
-- Let's double check if I missed content. The view_file output showed lines 1-63.
-- It seems `Reference` inserts were NOT in screen.
-- Ah, `view_file` showed "Total Lines: 63".
-- So `Reference` table was empty in seed?
-- Then `seed_postgres.sql` needs no changes regarding `Reference` table name if it's not used.
-- BUT, I should verify if `backend/routes/student.py` query actually returns anything?
-- If table is empty, it returns nothing.
-- The query I updated in `student.py` was `FROM Course_Reference`.
-- If I don't change seed, it's fine as long as no `INSERT INTO Reference` exists.
-- But wait! schema ended at line 131. seed ended at 63.
-- I'll check `seed_postgres.sql` content again to be 101% sure no `Reference` text exists.
-- The previous `view_file` output (Step 1927) showed lines 1-63.
-- It ends with `INSERT INTO Includes`.
-- So `Time` to relax on seed.
-- I will just notifying the user.

-- Users
-- Password 'pass' for all for simplicity in demo
INSERT INTO Users (Username, Password, Role, Name, Email) VALUES
('admin', 'scrypt:32768:8:1$6ub8B8OgfJfMfV3O$658eb953c0936554b56f1b90ca65e7e8a3bb81d6a615cc428b7d47f5a7f4cec409f3ab85dfa65307df389086257cb57cb494d235386d7b3413f42a3d4d780ecc', 'Administrator', 'Admin User', 'admin@cms.com'),
('inst1', 'scrypt:32768:8:1$6ub8B8OgfJfMfV3O$658eb953c0936554b56f1b90ca65e7e8a3bb81d6a615cc428b7d47f5a7f4cec409f3ab85dfa65307df389086257cb57cb494d235386d7b3413f42a3d4d780ecc', 'Instructor', 'Dr. Smith', 'smith@cms.com'),
('inst2', 'scrypt:32768:8:1$6ub8B8OgfJfMfV3O$658eb953c0936554b56f1b90ca65e7e8a3bb81d6a615cc428b7d47f5a7f4cec409f3ab85dfa65307df389086257cb57cb494d235386d7b3413f42a3d4d780ecc', 'Instructor', 'Prof. Johnson', 'johnson@cms.com'),
('stud1', 'scrypt:32768:8:1$6ub8B8OgfJfMfV3O$658eb953c0936554b56f1b90ca65e7e8a3bb81d6a615cc428b7d47f5a7f4cec409f3ab85dfa65307df389086257cb57cb494d235386d7b3413f42a3d4d780ecc', 'Student', 'Alice', 'alice@cms.com'),
('stud2', 'scrypt:32768:8:1$6ub8B8OgfJfMfV3O$658eb953c0936554b56f1b90ca65e7e8a3bb81d6a615cc428b7d47f5a7f4cec409f3ab85dfa65307df389086257cb57cb494d235386d7b3413f42a3d4d780ecc', 'Student', 'Bob', 'bob@cms.com'),
('stud3', 'scrypt:32768:8:1$6ub8B8OgfJfMfV3O$658eb953c0936554b56f1b90ca65e7e8a3bb81d6a615cc428b7d47f5a7f4cec409f3ab85dfa65307df389086257cb57cb494d235386d7b3413f42a3d4d780ecc', 'Student', 'Charlie', 'charlie@cms.com'),
('analyst1', 'scrypt:32768:8:1$6ub8B8OgfJfMfV3O$658eb953c0936554b56f1b90ca65e7e8a3bb81d6a615cc428b7d47f5a7f4cec409f3ab85dfa65307df389086257cb57cb494d235386d7b3413f42a3d4d780ecc', 'Data_Analyst', 'John Doe', 'analyst@cms.com');

-- Role specific tables
INSERT INTO Administrator (Admin_ID) VALUES ((SELECT User_ID FROM Users WHERE Username='admin'));

INSERT INTO Instructor (Instructor_ID, Experience) VALUES 
((SELECT User_ID FROM Users WHERE Username='inst1'), 10),
((SELECT User_ID FROM Users WHERE Username='inst2'), 15);

INSERT INTO Student (Student_ID, Country, Category, Skill_Level, Age) VALUES 
((SELECT User_ID FROM Users WHERE Username='stud1'), 'USA', 'Undergrad', 'Intermediate', 20),
((SELECT User_ID FROM Users WHERE Username='stud2'), 'Canada', 'Grad', 'Beginner', 24),
((SELECT User_ID FROM Users WHERE Username='stud3'), 'UK', 'Undergrad', 'Advanced', 21);

INSERT INTO Data_Analyst (Analyst_ID) VALUES ((SELECT User_ID FROM Users WHERE Username='analyst1'));

-- Courses
INSERT INTO Course (Name, Duration, Fees) VALUES
('Database Management Systems', 12, 100.00),
('Web Development', 10, 150.00),
('Machine Learning', 14, 200.00),
('Data Structures', 12, 120.00);

-- Enrollment
INSERT INTO Enrollment (Student_ID, Course_ID, Enrollment_Date, Score) VALUES
((SELECT User_ID FROM Users WHERE Username='stud1'), (SELECT Course_ID FROM Course WHERE Name='Database Management Systems'), '2023-01-01', 85.5),
((SELECT User_ID FROM Users WHERE Username='stud1'), (SELECT Course_ID FROM Course WHERE Name='Web Development'), '2023-02-15', 90.0),
((SELECT User_ID FROM Users WHERE Username='stud2'), (SELECT Course_ID FROM Course WHERE Name='Database Management Systems'), '2023-01-05', 78.0),
((SELECT User_ID FROM Users WHERE Username='stud3'), (SELECT Course_ID FROM Course WHERE Name='Machine Learning'), '2023-03-10', 88.0);

-- Teaches
INSERT INTO Teaches (Instructor_ID, Course_ID) VALUES
((SELECT User_ID FROM Users WHERE Username='inst1'), (SELECT Course_ID FROM Course WHERE Name='Database Management Systems')),
((SELECT User_ID FROM Users WHERE Username='inst1'), (SELECT Course_ID FROM Course WHERE Name='Machine Learning')),
((SELECT User_ID FROM Users WHERE Username='inst2'), (SELECT Course_ID FROM Course WHERE Name='Web Development')),
((SELECT User_ID FROM Users WHERE Username='inst2'), (SELECT Course_ID FROM Course WHERE Name='Data Structures'));

-- Course Content and Includes
-- Note: Subqueries for content IDs are tricky if they are not named. 
-- We will assume sequential IDs 1, 2, 3 as they are inserted in order. 
-- Or insert explicitly with ID if supported, but SERIAL doesn't like that unless sequence is updated.
-- Better to use RETURNING in a script, but for plain SQL seed, we rely on order or values.
INSERT INTO Course_Content (URL, Type) VALUES
('http://video.com/dbms_intro', 'Video'),
('http://pdf.com/dbms_syllabus', 'PDF'),
('http://video.com/react_intro', 'Video');

INSERT INTO Includes (Course_ID, Content_ID) VALUES
((SELECT Course_ID FROM Course WHERE Name='Database Management Systems'), 1),
((SELECT Course_ID FROM Course WHERE Name='Database Management Systems'), 2),
((SELECT Course_ID FROM Course WHERE Name='Web Development'), 3);
