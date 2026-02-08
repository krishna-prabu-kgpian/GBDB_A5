-- ============================================
-- MINIMAL SEED DATA FOR EDUCATIONAL PLATFORM
-- ============================================

-- ============================================
-- USERS (12 users total)
-- All users have password: "pass"
-- ============================================

-- Students (5 users)
INSERT INTO Users (User_ID, Username, Password, Role, Name, Email) VALUES
('STU001', 'john.doe', 'scrypt:32768:8:1$hXyKmCTEEaGYpIWa$633919f2cbc81d5d9f49d74d4db9166e72e832a541d22c4a77d525203d97c324298a345cec30016aaa3155a05ba68b45a4a1e6bbeba162f78979e28c130be607', 'Student', 'John Doe', 'john.doe@email.com'),
('STU002', 'emma.wilson', 'scrypt:32768:8:1$hXyKmCTEEaGYpIWa$633919f2cbc81d5d9f49d74d4db9166e72e832a541d22c4a77d525203d97c324298a345cec30016aaa3155a05ba68b45a4a1e6bbeba162f78979e28c130be607', 'Student', 'Emma Wilson', 'emma.wilson@email.com'),
('STU003', 'raj.patel', 'scrypt:32768:8:1$hXyKmCTEEaGYpIWa$633919f2cbc81d5d9f49d74d4db9166e72e832a541d22c4a77d525203d97c324298a345cec30016aaa3155a05ba68b45a4a1e6bbeba162f78979e28c130be607', 'Student', 'Raj Patel', 'raj.patel@email.com'),
('STU004', 'maria.garcia', 'scrypt:32768:8:1$hXyKmCTEEaGYpIWa$633919f2cbc81d5d9f49d74d4db9166e72e832a541d22c4a77d525203d97c324298a345cec30016aaa3155a05ba68b45a4a1e6bbeba162f78979e28c130be607', 'Student', 'Maria Garcia', 'maria.garcia@email.com'),
('STU005', 'chen.wang', 'scrypt:32768:8:1$hXyKmCTEEaGYpIWa$633919f2cbc81d5d9f49d74d4db9166e72e832a541d22c4a77d525203d97c324298a345cec30016aaa3155a05ba68b45a4a1e6bbeba162f78979e28c130be607', 'Student', 'Chen Wang', 'chen.wang@email.com');

-- Instructors (3 users)
INSERT INTO Users (User_ID, Username, Password, Role, Name, Email) VALUES
('INS001', 'dr.smith', 'scrypt:32768:8:1$hXyKmCTEEaGYpIWa$633919f2cbc81d5d9f49d74d4db9166e72e832a541d22c4a77d525203d97c324298a345cec30016aaa3155a05ba68b45a4a1e6bbeba162f78979e28c130be607', 'Instructor', 'Dr. Robert Smith', 'robert.smith@university.edu'),
('INS002', 'prof.jones', 'scrypt:32768:8:1$hXyKmCTEEaGYpIWa$633919f2cbc81d5d9f49d74d4db9166e72e832a541d22c4a77d525203d97c324298a345cec30016aaa3155a05ba68b45a4a1e6bbeba162f78979e28c130be607', 'Instructor', 'Prof. Jennifer Jones', 'jennifer.jones@university.edu'),
('INS003', 'dr.kumar', 'scrypt:32768:8:1$hXyKmCTEEaGYpIWa$633919f2cbc81d5d9f49d74d4db9166e72e832a541d22c4a77d525203d97c324298a345cec30016aaa3155a05ba68b45a4a1e6bbeba162f78979e28c130be607', 'Instructor', 'Dr. Arun Kumar', 'arun.kumar@university.edu');

-- Data Analysts (2 users)
INSERT INTO Users (User_ID, Username, Password, Role, Name, Email) VALUES
('ANA001', 'analyst.james', 'scrypt:32768:8:1$hXyKmCTEEaGYpIWa$633919f2cbc81d5d9f49d74d4db9166e72e832a541d22c4a77d525203d97c324298a345cec30016aaa3155a05ba68b45a4a1e6bbeba162f78979e28c130be607', 'Data_Analyst', 'James Mitchell', 'james.mitchell@platform.com'),
('ANA002', 'analyst.sarah', 'scrypt:32768:8:1$hXyKmCTEEaGYpIWa$633919f2cbc81d5d9f49d74d4db9166e72e832a541d22c4a77d525203d97c324298a345cec30016aaa3155a05ba68b45a4a1e6bbeba162f78979e28c130be607', 'Data_Analyst', 'Sarah Thompson', 'sarah.thompson@platform.com');

-- Administrators (2 users)
INSERT INTO Users (User_ID, Username, Password, Role, Name, Email) VALUES
('ADM001', 'admin.chief', 'scrypt:32768:8:1$hXyKmCTEEaGYpIWa$633919f2cbc81d5d9f49d74d4db9166e72e832a541d22c4a77d525203d97c324298a345cec30016aaa3155a05ba68b45a4a1e6bbeba162f78979e28c130be607', 'Administrator', 'Katherine Peterson', 'katherine.peterson@platform.com'),
('ADM002', 'admin.tech', 'scrypt:32768:8:1$hXyKmCTEEaGYpIWa$633919f2cbc81d5d9f49d74d4db9166e72e832a541d22c4a77d525203d97c324298a345cec30016aaa3155a05ba68b45a4a1e6bbeba162f78979e28c130be607', 'Administrator', 'Thomas Wright', 'thomas.wright@platform.com');

-- ============================================
-- STUDENT DETAILS
-- ============================================
INSERT INTO Student (Student_ID, Country, Category, Skill_Level, Age) VALUES
('STU001', 'USA', 'Undergraduate', 'Beginner', 20),
('STU002', 'UK', 'Undergraduate', 'Intermediate', 21),
('STU003', 'India', 'Graduate', 'Advanced', 24),
('STU004', 'Spain', 'Undergraduate', 'Beginner', 19),
('STU005', 'China', 'Graduate', 'Intermediate', 23);

-- ============================================
-- INSTRUCTOR DETAILS
-- ============================================
INSERT INTO Instructor (Instructor_ID, Experience) VALUES
('INS001', 15),
('INS002', 12),
('INS003', 8);

-- ============================================
-- DATA ANALYST DETAILS
-- ============================================
INSERT INTO Data_Analyst (Analyst_ID) VALUES
('ANA001'),
('ANA002');

-- ============================================
-- ADMINISTRATOR DETAILS
-- ============================================
INSERT INTO Administrator (Admin_ID) VALUES
('ADM001'),
('ADM002');

-- ============================================
-- PARTNER UNIVERSITIES
-- ============================================
INSERT INTO Partner_University (University_ID, Name) VALUES
('UNI001', 'Massachusetts Institute of Technology'),
('UNI002', 'Stanford University'),
('UNI003', 'University of Cambridge');

-- ============================================
-- PROGRAMS
-- ============================================
INSERT INTO Program (Program_ID, Name, Prog_Type, Duration) VALUES
('PRG001', 'Computer Science Fundamentals', 'Certificate', 6),
('PRG002', 'Data Science Specialization', 'Certificate', 8),
('PRG003', 'Web Development Bootcamp', 'Bootcamp', 4);

-- ============================================
-- COURSES
-- ============================================
INSERT INTO Course (Course_ID, Name, Duration, Fees) VALUES
('CRS001', 'Introduction to Programming', 8, 199),
('CRS002', 'Data Structures and Algorithms', 10, 249),
('CRS003', 'Machine Learning Fundamentals', 12, 349),
('CRS004', 'Web Development with React', 8, 229),
('CRS005', 'Database Design and SQL', 6, 179);

-- ============================================
-- TOPICS
-- ============================================
INSERT INTO Topic (Topic_ID, Name) VALUES
('TOP001', 'Programming Basics'),
('TOP002', 'Data Structures'),
('TOP003', 'Machine Learning'),
('TOP004', 'Front-end Development'),
('TOP005', 'Database Management');

-- ============================================
-- TEXTBOOKS
-- ============================================
INSERT INTO Textbook (ISBN, Title, Author) VALUES
('ISBN-001-2023', 'Introduction to Programming with Python', 'John Zelle'),
('ISBN-002-2022', 'Data Structures and Algorithms in Java', 'Robert Lafore'),
('ISBN-003-2023', 'Machine Learning: A Probabilistic Perspective', 'Kevin Murphy'),
('ISBN-004-2023', 'Learning React', 'Alex Banks'),
('ISBN-005-2023', 'Database System Concepts', 'Abraham Silberschatz');

-- ============================================
-- COURSE CONTENT
-- ============================================
INSERT INTO Course_content (Content_ID, URL, Type) VALUES
('CNT001', 'https://platform.com/videos/intro-programming-1', 'Video'),
('CNT002', 'https://platform.com/docs/programming-basics.pdf', 'Document'),
('CNT003', 'https://platform.com/quizzes/programming-quiz-1', 'Quiz'),
('CNT004', 'https://platform.com/videos/data-structures-1', 'Video'),
('CNT005', 'https://platform.com/assignments/dsa-project-1', 'Assignment'),
('CNT006', 'https://platform.com/videos/ml-fundamentals-1', 'Video'),
('CNT007', 'https://platform.com/labs/ml-lab-1', 'Lab'),
('CNT008', 'https://platform.com/videos/react-basics', 'Video'),
('CNT009', 'https://platform.com/labs/react-lab-1', 'Lab'),
('CNT010', 'https://platform.com/videos/sql-basics', 'Video');

-- ============================================
-- ENROLLMENT
-- ============================================
INSERT INTO Enrollment (Student_ID, Course_ID, Enrollment_Date, Score) VALUES
('STU001', 'CRS001', '2024-01-15', 95),
('STU001', 'CRS002', '2024-02-10', 88),
('STU002', 'CRS001', '2024-01-20', 87),
('STU002', 'CRS004', '2024-02-15', 91),
('STU003', 'CRS003', '2024-01-10', 94),
('STU003', 'CRS005', '2024-02-05', 90),
('STU004', 'CRS001', '2024-01-25', 78),
('STU005', 'CRS003', '2024-01-15', 85);

-- ============================================
-- TEACHES
-- ============================================
INSERT INTO Teaches (Instructor_ID, Course_ID) VALUES
('INS001', 'CRS001'),
('INS001', 'CRS002'),
('INS002', 'CRS003'),
('INS002', 'CRS005'),
('INS003', 'CRS004');

-- ============================================
-- OFFERS
-- ============================================
INSERT INTO Offers (University_ID, Course_ID) VALUES
('UNI001', 'CRS001'),
('UNI001', 'CRS002'),
('UNI002', 'CRS003'),
('UNI002', 'CRS004'),
('UNI003', 'CRS005');

-- ============================================
-- PART_OF
-- ============================================
INSERT INTO Part_of (Course_ID, Program_ID) VALUES
('CRS001', 'PRG001'),
('CRS002', 'PRG001'),
('CRS003', 'PRG002'),
('CRS005', 'PRG002'),
('CRS004', 'PRG003');

-- ============================================
-- REFERENCE
-- ============================================
INSERT INTO Reference (Course_ID, ISBN) VALUES
('CRS001', 'ISBN-001-2023'),
('CRS002', 'ISBN-002-2022'),
('CRS003', 'ISBN-003-2023'),
('CRS004', 'ISBN-004-2023'),
('CRS005', 'ISBN-005-2023');

-- ============================================
-- COVERS
-- ============================================
INSERT INTO Covers (Course_ID, Topic_ID) VALUES
('CRS001', 'TOP001'),
('CRS002', 'TOP002'),
('CRS003', 'TOP003'),
('CRS004', 'TOP004'),
('CRS005', 'TOP005');

-- ============================================
-- INCLUDES
-- ============================================
INSERT INTO Includes (Course_ID, Content_ID) VALUES
('CRS001', 'CNT001'),
('CRS001', 'CNT002'),
('CRS001', 'CNT003'),
('CRS002', 'CNT004'),
('CRS002', 'CNT005'),
('CRS003', 'CNT006'),
('CRS003', 'CNT007'),
('CRS004', 'CNT008'),
('CRS004', 'CNT009'),
('CRS005', 'CNT010');

-- ============================================
-- END OF MINIMAL SEED DATA
-- ============================================