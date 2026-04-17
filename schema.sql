-- =========================================
-- 1. DEPARTMENT
-- =========================================
CREATE TABLE Department (
    dept_id INT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL
);

-- =========================================
-- 2. STUDENT
-- =========================================
CREATE TABLE Student (
    student_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cgpa FLOAT,
    dept_id INT,
    password VARCHAR(255) NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES Department(dept_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- =========================================
-- 3. COMPANY
-- =========================================
CREATE TABLE Company (
    company_id INT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    location VARCHAR(150)
);

-- =========================================
-- 4. RECRUITER
-- =========================================
CREATE TABLE Recruiter (
    recruiter_id INT PRIMARY KEY,
    recruiter_name VARCHAR(100) NOT NULL,
    company_id INT,
    password VARCHAR(255) NOT NULL,
    FOREIGN KEY (company_id) REFERENCES Company(company_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================
-- 5. INTERNSHIP
-- =========================================
CREATE TABLE Internship (
    internship_id INT PRIMARY KEY,
    company_id INT,
    duration_months INT,
    stipend INT,
    FOREIGN KEY (company_id) REFERENCES Company(company_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================
-- 6. APPLICATION
-- =========================================
CREATE TABLE Application (
    application_id INT PRIMARY KEY,
    student_id INT,
    company_id INT,
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (company_id) REFERENCES Company(company_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================
-- 7. INTERVIEW
-- =========================================
CREATE TABLE Interview (
    interview_id INT PRIMARY KEY,
    application_id INT,
    recruiter_id INT,
    round_no INT,
    result VARCHAR(50),
    FOREIGN KEY (application_id) REFERENCES Application(application_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES Recruiter(recruiter_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================
-- 8. PLACEMENT
-- =========================================
CREATE TABLE Placement (
    placement_id INT PRIMARY KEY,
    company_id INT,
    role VARCHAR(100),
    ctc INT,
    FOREIGN KEY (company_id) REFERENCES Company(company_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================
-- 9. PLACEMENT_RESULT
-- =========================================
CREATE TABLE Placement_Result (
    result_id INT PRIMARY KEY,
    student_id INT,
    placement_id INT,
    status VARCHAR(50),
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (placement_id) REFERENCES Placement(placement_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================
-- 10. SKILL
-- =========================================
CREATE TABLE Skill (
    skill_id INT PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL
);

-- =========================================
-- 11. PLACEMENT_SKILL (Junction Table)
-- =========================================
CREATE TABLE Placement_Skill (
    placement_id INT,
    skill_id INT,
    PRIMARY KEY (placement_id, skill_id),
    FOREIGN KEY (placement_id) REFERENCES Placement(placement_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skill(skill_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- =========================================
-- INSERT DATA
-- =========================================

INSERT INTO Department VALUES
(1,'Computer Science'),
(2,'Information Technology'),
(3,'Electronics'),
(4,'Mechanical'),
(5,'Civil'),
(6,'Electrical'),
(7,'Artificial Intelligence'),
(8,'Data Science'),
(9,'Chemical'),
(10,'Aerospace');

-- NOTE: Passwords below are plain text for SQL submission purposes.
-- In the actual web app, these are stored as bcrypt hashes.
-- Plain text password for all students: student123

INSERT INTO Student VALUES
(101,'Aarav Shah',8.7,1,'student123'),
(102,'Riya Mehta',9.1,2,'student123'),
(103,'Kabir Patel',7.8,3,'student123'),
(104,'Diya Joshi',8.5,4,'student123'),
(105,'Arjun Nair',7.9,5,'student123'),
(106,'Sneha Iyer',9.0,6,'student123'),
(107,'Rahul Gupta',8.1,7,'student123'),
(108,'Neha Verma',8.6,8,'student123'),
(109,'Kunal Shah',7.5,9,'student123'),
(110,'Ananya Rao',9.2,10,'student123');

INSERT INTO Company VALUES
(201,'TCS','Mumbai'),
(202,'Infosys','Bangalore'),
(203,'Wipro','Pune'),
(204,'Accenture','Hyderabad'),
(205,'Capgemini','Mumbai'),
(206,'Google','Hyderabad'),
(207,'Microsoft','Bangalore'),
(208,'Amazon','Hyderabad'),
(209,'IBM','Pune'),
(210,'Oracle','Bangalore');

-- Plain text password for all recruiters: recruiter123

INSERT INTO Recruiter VALUES
(301,'Raj Malhotra',201,'recruiter123'),
(302,'Neha Sharma',202,'recruiter123'),
(303,'Amit Singh',203,'recruiter123'),
(304,'Priya Kapoor',204,'recruiter123'),
(305,'Rohit Verma',205,'recruiter123'),
(306,'Sanjay Kumar',206,'recruiter123'),
(307,'Meera Nair',207,'recruiter123'),
(308,'Anil Joshi',208,'recruiter123'),
(309,'Ritika Shah',209,'recruiter123'),
(310,'Vikas Gupta',210,'recruiter123');

INSERT INTO Internship VALUES
(401,201,6,20000),
(402,202,3,15000),
(403,203,4,18000),
(404,204,6,25000),
(405,205,3,12000),
(406,206,6,35000),
(407,207,6,30000),
(408,208,4,25000),
(409,209,5,20000),
(410,210,3,22000);

INSERT INTO Application VALUES
(501,101,201),
(502,102,202),
(503,103,203),
(504,104,204),
(505,105,205),
(506,106,206),
(507,107,207),
(508,108,208),
(509,109,209),
(510,110,210);

INSERT INTO Interview VALUES
(601,501,301,1,'Pass'),
(602,502,302,1,'Pass'),
(603,503,303,1,'Fail'),
(604,504,304,2,'Pass'),
(605,505,305,1,'Pass'),
(606,506,306,1,'Pass'),
(607,507,307,2,'Pass'),
(608,508,308,1,'Fail'),
(609,509,309,1,'Pass'),
(610,510,310,2,'Pass');

INSERT INTO Placement VALUES
(701,201,'Software Engineer',800000),
(702,202,'System Analyst',700000),
(703,203,'Developer',650000),
(704,204,'Consultant',900000),
(705,205,'Programmer',600000),
(706,206,'Cloud Engineer',1500000),
(707,207,'Software Developer',1400000),
(708,208,'Data Engineer',1300000),
(709,209,'Backend Developer',1000000),
(710,210,'Database Engineer',950000);

INSERT INTO Placement_Result VALUES
(801,101,701,'Selected'),
(802,102,702,'Selected'),
(803,103,703,'Rejected'),
(804,104,704,'Selected'),
(805,105,705,'Selected'),
(806,106,706,'Selected'),
(807,107,707,'Rejected'),
(808,108,708,'Selected'),
(809,109,709,'Selected'),
(810,110,710,'Selected');

INSERT INTO Skill VALUES
(901,'Java'),
(902,'Python'),
(903,'SQL'),
(904,'Data Structures'),
(905,'Cloud Computing'),
(906,'Machine Learning'),
(907,'Web Development'),
(908,'Cyber Security'),
(909,'Networking'),
(910,'Operating Systems');

INSERT INTO Placement_Skill VALUES
(701,901),
(702,902),
(703,903),
(704,904),
(705,907),
(706,905),
(707,901),
(708,906),
(709,903),
(710,910);
