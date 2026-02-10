DROP TABLE IF EXISTS Users, Student, Instructor, Data_Analyst, Administrator, Partner_University, Program,
Course, Topic, Textbook, Course_content, Enrollment, Teaches, Offers, Part_of, Reference, Covers, Includes;

CREATE TABLE Users (
    User_ID VARCHAR(20) PRIMARY KEY,
    Username VARCHAR(255) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE Student (
    Student_ID VARCHAR(20) PRIMARY KEY,
    Country VARCHAR(100),
    Category VARCHAR(100),
    Skill_Level VARCHAR(50),
    Age INT,
    FOREIGN KEY (Student_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
);

CREATE TABLE Instructor (
    Instructor_ID VARCHAR(20) PRIMARY KEY,
    Experience INT,
    FOREIGN KEY (Instructor_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
);

CREATE TABLE Data_Analyst (
    Analyst_ID VARCHAR(20) PRIMARY KEY,
    FOREIGN KEY (Analyst_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
);

CREATE TABLE Administrator (
    Admin_ID VARCHAR(20) PRIMARY KEY,
    FOREIGN KEY (Admin_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
);

CREATE TABLE Partner_University (
    University_ID VARCHAR(20) PRIMARY KEY,
    Name VARCHAR(255) NOT NULL
);

CREATE TABLE Program (
    Program_ID VARCHAR(20) PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Prog_Type VARCHAR(100),
    Duration INT
);

CREATE TABLE Course (
    Course_ID VARCHAR(20) PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Duration INT,
    Fees INT,
    Description VARCHAR(500)
);

CREATE TABLE Topic (
    Topic_ID VARCHAR(20) PRIMARY KEY,
    Name VARCHAR(255) NOT NULL
);

CREATE TABLE Textbook (
    ISBN VARCHAR(20) PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Author VARCHAR(255)
);

CREATE TABLE Course_content (
    Content_ID VARCHAR(20) PRIMARY KEY,
    URL VARCHAR(255),
    Type VARCHAR(50)
);

-- Student enrolls in Course
CREATE TABLE Enrollment (
    Student_ID VARCHAR(20),
    Course_ID VARCHAR(20),
    Enrollment_Date DATE,
    Score INT CHECK (Score >= 0 AND Score <= 100),
    PRIMARY KEY (Student_ID, Course_ID),
    FOREIGN KEY (Student_ID) REFERENCES Student(Student_ID) ON DELETE CASCADE,
    FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID) ON DELETE CASCADE
);

-- Instructor teaches Course
CREATE TABLE Teaches (
    Instructor_ID VARCHAR(20),
    Course_ID VARCHAR(20),
    PRIMARY KEY (Instructor_ID, Course_ID),
    FOREIGN KEY (Instructor_ID) REFERENCES Instructor(Instructor_ID) ON DELETE CASCADE,
    FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID) ON DELETE CASCADE
);

-- Partner_University offers Course
CREATE TABLE Offers (
    University_ID VARCHAR(20),
    Course_ID VARCHAR(20),
    PRIMARY KEY (University_ID, Course_ID),
    FOREIGN KEY (University_ID) REFERENCES Partner_University(University_ID) ON DELETE CASCADE,
    FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID) ON DELETE CASCADE
);

-- Course is part of Program
CREATE TABLE Part_of (
    Course_ID VARCHAR(20),
    Program_ID VARCHAR(20),
    PRIMARY KEY (Course_ID, Program_ID),
    FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID) ON DELETE CASCADE,
    FOREIGN KEY (Program_ID) REFERENCES Program(Program_ID) ON DELETE CASCADE
);

-- Course uses Reference (Textbook)
CREATE TABLE Reference (
    Course_ID VARCHAR(20),
    ISBN VARCHAR(20),
    PRIMARY KEY (Course_ID, ISBN),
    FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID) ON DELETE CASCADE,
    FOREIGN KEY (ISBN) REFERENCES Textbook(ISBN) ON DELETE CASCADE
);

-- Course covers Topic
CREATE TABLE Covers (
    Course_ID VARCHAR(20),
    Topic_ID VARCHAR(20),
    PRIMARY KEY (Course_ID, Topic_ID),
    FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID) ON DELETE CASCADE,
    FOREIGN KEY (Topic_ID) REFERENCES Topic(Topic_ID) ON DELETE CASCADE
);

-- Course includes Course_content
CREATE TABLE Includes (
    Course_ID VARCHAR(20),
    Content_ID VARCHAR(20),
    PRIMARY KEY (Course_ID, Content_ID),
    FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID) ON DELETE CASCADE,
    FOREIGN KEY (Content_ID) REFERENCES Course_content(Content_ID) ON DELETE CASCADE
);