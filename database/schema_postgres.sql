-- Database Schema for Course Management System (PostgreSQL)
-- Based on the provided ER Diagram

-- Users (Base Table)
CREATE TABLE Users (
    User_ID SERIAL PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL, -- Should store hashed passwords
    Role VARCHAR(20) NOT NULL CHECK (Role IN ('Student', 'Instructor', 'Administrator', 'Data_Analyst')),
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL
);

-- Student (Inherits from User)
CREATE TABLE Student (
    Student_ID INTEGER PRIMARY KEY REFERENCES Users(User_ID) ON DELETE CASCADE,
    Country VARCHAR(50),
    Category VARCHAR(50),
    Skill_Level VARCHAR(50),
    Age INTEGER
);

-- Instructor (Inherits from User)
CREATE TABLE Instructor (
    Instructor_ID INTEGER PRIMARY KEY REFERENCES Users(User_ID) ON DELETE CASCADE,
    Experience INTEGER -- Years of experience
);

-- Administrator (Inherits from User)
CREATE TABLE Administrator (
    Admin_ID INTEGER PRIMARY KEY REFERENCES Users(User_ID) ON DELETE CASCADE
);

-- Data Analyst (Inherits from User)
CREATE TABLE Data_Analyst (
    Analyst_ID INTEGER PRIMARY KEY REFERENCES Users(User_ID) ON DELETE CASCADE
);

-- Course
CREATE TABLE Course (
    Course_ID SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Duration INTEGER, -- In weeks or hours
    Fees DECIMAL(10, 2)
);

-- Partner University
CREATE TABLE Partner_University (
    University_ID SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL
);

-- Offers (Relationship between University and Course)
CREATE TABLE Offers (
    University_ID INTEGER REFERENCES Partner_University(University_ID) ON DELETE CASCADE,
    Course_ID INTEGER REFERENCES Course(Course_ID) ON DELETE CASCADE,
    PRIMARY KEY (University_ID, Course_ID)
);

-- Programs
CREATE TABLE Program (
    Program_ID SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Prog_Type VARCHAR(50),
    Duration INTEGER
);

-- Part_of (Relationship between Course and Program)
CREATE TABLE Part_of (
    Course_ID INTEGER REFERENCES Course(Course_ID) ON DELETE CASCADE,
    Program_ID INTEGER REFERENCES Program(Program_ID) ON DELETE CASCADE,
    PRIMARY KEY (Course_ID, Program_ID)
);

-- Enrollment (Relationship between Student and Course)
CREATE TABLE Enrollment (
    Student_ID INTEGER REFERENCES Student(Student_ID) ON DELETE CASCADE,
    Course_ID INTEGER REFERENCES Course(Course_ID) ON DELETE CASCADE,
    Enrollment_Date DATE DEFAULT CURRENT_DATE,
    Score DECIMAL(5, 2) CHECK (Score >= 0 AND Score <= 100),
    PRIMARY KEY (Student_ID, Course_ID)
);

-- Teaches (Relationship between Instructor and Course)
CREATE TABLE Teaches (
    Instructor_ID INTEGER REFERENCES Instructor(Instructor_ID) ON DELETE CASCADE,
    Course_ID INTEGER REFERENCES Course(Course_ID) ON DELETE CASCADE,
    PRIMARY KEY (Instructor_ID, Course_ID)
);

-- Course Content
CREATE TABLE Course_Content (
    Content_ID SERIAL PRIMARY KEY,
    URL TEXT,
    Type VARCHAR(50) -- e.g., 'Video', 'PDF'
);

-- Includes (Relationship between Course and Content)
CREATE TABLE Includes (
    Course_ID INTEGER REFERENCES Course(Course_ID) ON DELETE CASCADE,
    Content_ID INTEGER REFERENCES Course_Content(Content_ID) ON DELETE CASCADE,
    PRIMARY KEY (Course_ID, Content_ID)
);

-- Topic
CREATE TABLE Topic (
    Topic_ID SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL
);

-- Covers (Relationship between Course and Topic)
CREATE TABLE Covers (
    Course_ID INTEGER REFERENCES Course(Course_ID) ON DELETE CASCADE,
    Topic_ID INTEGER REFERENCES Topic(Topic_ID) ON DELETE CASCADE,
    PRIMARY KEY (Course_ID, Topic_ID)
);

-- Textbook
CREATE TABLE Textbook (
    ISBN VARCHAR(20) PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Author VARCHAR(100)
);

-- Course_Reference (Relationship between Course and Textbook)
CREATE TABLE Course_Reference (
    Course_ID INTEGER REFERENCES Course(Course_ID) ON DELETE CASCADE,
    ISBN VARCHAR(20) REFERENCES Textbook(ISBN) ON DELETE CASCADE,
    PRIMARY KEY (Course_ID, ISBN)
);
