-- Seed Data

-- Users
-- Password 'pass' for all for simplicity in demo
INSERT INTO Users (Username, Password, Role, Name, Email) VALUES
('admin', 'pass', 'Administrator', 'Admin User', 'admin@cms.com'),
('inst1', 'pass', 'Instructor', 'Dr. Smith', 'smith@cms.com'),
('inst2', 'pass', 'Instructor', 'Prof. Johnson', 'johnson@cms.com'),
('stud1', 'pass', 'Student', 'Alice', 'alice@cms.com'),
('stud2', 'pass', 'Student', 'Bob', 'bob@cms.com'),
('stud3', 'pass', 'Student', 'Charlie', 'charlie@cms.com'),
('analyst1', 'pass', 'Data_Analyst', 'John Doe', 'analyst@cms.com');

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
((SELECT User_ID FROM Users WHERE Username='stud1'), 1, '2023-01-01', 85.5),
((SELECT User_ID FROM Users WHERE Username='stud1'), 2, '2023-02-15', 90.0),
((SELECT User_ID FROM Users WHERE Username='stud2'), 1, '2023-01-05', 78.0),
((SELECT User_ID FROM Users WHERE Username='stud3'), 3, '2023-03-10', 88.0);

-- Teaches
INSERT INTO Teaches (Instructor_ID, Course_ID) VALUES
((SELECT User_ID FROM Users WHERE Username='inst1'), 1),
((SELECT User_ID FROM Users WHERE Username='inst1'), 3),
((SELECT User_ID FROM Users WHERE Username='inst2'), 2),
((SELECT User_ID FROM Users WHERE Username='inst2'), 4);

-- Course Content and Includes
INSERT INTO Course_Content (URL, Type) VALUES
('http://video.com/dbms_intro', 'Video'),
('http://pdf.com/dbms_syllabus', 'PDF'),
('http://video.com/react_intro', 'Video');

INSERT INTO Includes (Course_ID, Content_ID) VALUES
(1, 1),
(1, 2),
(2, 3);
