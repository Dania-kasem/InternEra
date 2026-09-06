-- ============================================================
--  InternEra - FINAL PostgreSQL Database Schema
--  Yarmouk University | Information Systems Project
--  9 Tables | Clean & Understandable Version
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- CLEAN START
-- This drops everything first so we start with zero tables
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS cv_analyses        CASCADE;
DROP TABLE IF EXISTS messages           CASCADE;
DROP TABLE IF EXISTS saved_internships  CASCADE;
DROP TABLE IF EXISTS applications       CASCADE;
DROP TABLE IF EXISTS review             CASCADE;
DROP TABLE IF EXISTS internship         CASCADE;
DROP TABLE IF EXISTS company            CASCADE;
DROP TABLE IF EXISTS student            CASCADE;
DROP TABLE IF EXISTS users              CASCADE;


-- ============================================================
-- TABLE 1: users
-- ============================================================
-- WHY: Every person who logs into the system needs an account.
--      This table handles login for ALL roles (student, company, admin).
--      Think of it as the "door key" for the whole system.
-- WHO USES IT: Everyone
-- ============================================================
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,       -- unique number for each user (auto generated)
    email           VARCHAR(100) NOT NULL UNIQUE, -- used to log in, must be unique
    password_hash   VARCHAR(255) NOT NULL,    -- password stored encrypted (never plain text)
    role            VARCHAR(20)  NOT NULL CHECK (role IN ('student', 'company', 'admin')), -- what type of user
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,  -- FALSE = account is disabled
    deactivated_at  TIMESTAMP,               -- when account was deactivated (used for 30-day auto-reactivation)
    is_approved     BOOLEAN      NOT NULL DEFAULT FALSE, -- admin must approve new accounts
    failed_attempts INTEGER      NOT NULL DEFAULT 0,     -- counts wrong password attempts
    locked_until    TIMESTAMP,               -- account locked until this time after 5 failed attempts
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()  -- when the account was created
);


-- ============================================================
-- TABLE 2: student
-- ============================================================
-- WHY: Stores all personal information about a student.
--      Also stores their CV file path so we know where their CV is saved.
-- WHO USES IT: Students, Companies (to view student info), Admin
-- LINKS TO: users table (user_id)
-- ============================================================
CREATE TABLE student (
    std_id          SERIAL PRIMARY KEY,       -- unique number for each student
    user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE, -- links to login account
    f_name          VARCHAR(100) NOT NULL,    -- first name
    l_name          VARCHAR(100) NOT NULL,    -- last name
    std_email       VARCHAR(100) NOT NULL UNIQUE, -- student university email
    major           VARCHAR(100) NOT NULL,    -- e.g. Information Systems, Computer Science
    status          VARCHAR(50)  NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'inactive', 'graduated')), -- current academic status
    cv_path         VARCHAR(500),             -- path to uploaded CV file e.g. uploads/cvs/sara_cv.pdf
    cv_uploaded_at  TIMESTAMP                -- when the CV was last uploaded
);


-- ============================================================
-- TABLE 3: company
-- ============================================================
-- WHY: Stores all information about a company.
--      Companies post internships and review student applications.
-- WHO USES IT: Companies, Admin
-- LINKS TO: users table (user_id)
-- ============================================================
CREATE TABLE company (
    company_id      SERIAL PRIMARY KEY,       -- unique number for each company
    user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE, -- links to login account
    company_name    VARCHAR(200) NOT NULL,    -- official company name
    location        VARCHAR(200),             -- city and country e.g. Amman, Jordan
    phone_number    VARCHAR(20),              -- contact phone number
    company_email   VARCHAR(100) NOT NULL UNIQUE, -- official company email
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE -- TRUE = admin has verified this company is real
);


-- ============================================================
-- TABLE 4: internship
-- ============================================================
-- WHY: Stores all internship postings created by companies.
--      Students search and apply to these internships.
-- WHO USES IT: Companies (create/edit), Students (search/apply), Admin
-- LINKS TO: company table (company_id)
-- ============================================================
CREATE TABLE internship (
    internship_id   SERIAL PRIMARY KEY,       -- unique number for each internship
    company_id      INTEGER NOT NULL REFERENCES company(company_id) ON DELETE CASCADE, -- which company posted it
    title           VARCHAR(200) NOT NULL,    -- job title e.g. Frontend Developer Intern
    type            VARCHAR(50)  NOT NULL CHECK (type IN ('remote', 'onsite', 'hybrid')), -- work type
    duration        VARCHAR(100) NOT NULL,    -- how long e.g. 3 months
    field_of_study  VARCHAR(100),             -- which major is suitable e.g. Computer Science
    location        VARCHAR(200),             -- where is the internship located
    description     TEXT,                     -- full description of the internship
    required_skills TEXT,                     -- skills needed e.g. Python, React, SQL
    status          VARCHAR(20)  NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open', 'closed', 'draft')), -- open = accepting applications
    deadline        DATE,                     -- last date to apply
    created_at      TIMESTAMP NOT NULL DEFAULT NOW() -- when the internship was posted
);


-- ============================================================
-- TABLE 5: applications
-- ============================================================
-- WHY: When a student applies for an internship, this table records it.
--      It tracks the status of every application and stores the AI match score.
-- WHO USES IT: Students (apply), Companies (accept/reject), Admin
-- LINKS TO: student table (std_id), internship table (internship_id)
-- NOTE: One student cannot apply to the same internship twice (UNIQUE constraint)
-- ============================================================
CREATE TABLE applications (
    application_id   SERIAL PRIMARY KEY,      -- unique number for each application
    std_id           INTEGER NOT NULL REFERENCES student(std_id) ON DELETE CASCADE, -- which student applied
    internship_id    INTEGER NOT NULL REFERENCES internship(internship_id) ON DELETE CASCADE, -- which internship
    status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')), -- current status
    rejection_reason TEXT,                    -- if rejected, company writes the reason here
    ai_match_score   DECIMAL(5,2),            -- AI score from 0 to 100 showing how well CV matches internship
    applied_at       TIMESTAMP NOT NULL DEFAULT NOW(), -- when the student applied
    UNIQUE(std_id, internship_id)             -- prevents applying to same internship twice
);


-- ============================================================
-- TABLE 6: review
-- ============================================================
-- WHY: Records when a company has viewed/reviewed a student profile.
--      This helps track which companies have seen which students.
-- WHO USES IT: Companies, Admin
-- LINKS TO: company table (company_id), student table (std_id)
-- ============================================================
CREATE TABLE review (
    review_id   SERIAL PRIMARY KEY,           -- unique number for each review
    company_id  INTEGER NOT NULL REFERENCES company(company_id) ON DELETE CASCADE, -- which company reviewed
    std_id      INTEGER NOT NULL REFERENCES student(std_id) ON DELETE CASCADE,     -- which student was reviewed
    reviewed_at TIMESTAMP NOT NULL DEFAULT NOW(), -- when the review happened
    UNIQUE(company_id, std_id)               -- one review record per company per student
);


-- ============================================================
-- TABLE 7: saved_internships
-- ============================================================
-- WHY: Students can save internships they like to their dashboard
--      so they can come back and apply later.
-- WHO USES IT: Students
-- LINKS TO: student table (std_id), internship table (internship_id)
-- FROM USE CASE: 6.2.5 "Save Internship in Dashboard"
-- ============================================================
CREATE TABLE saved_internships (
    id            SERIAL PRIMARY KEY,         -- unique number for each saved record
    std_id        INTEGER NOT NULL REFERENCES student(std_id) ON DELETE CASCADE,        -- which student saved it
    internship_id INTEGER NOT NULL REFERENCES internship(internship_id) ON DELETE CASCADE, -- which internship
    saved_at      TIMESTAMP NOT NULL DEFAULT NOW(), -- when it was saved
    UNIQUE(std_id, internship_id)            -- student can only save same internship once
);


-- ============================================================
-- TABLE 8: messages
-- ============================================================
-- WHY: Allows companies and students to communicate with each other
--      about a specific application (e.g. interview invitation).
-- WHO USES IT: Companies, Students
-- LINKS TO: applications table (application_id), users table (sender_id, receiver_id)
-- FROM USE CASE: 6.2.11 "Communicate with Student"
-- ============================================================
CREATE TABLE messages (
    message_id  SERIAL PRIMARY KEY,           -- unique number for each message
    application_id INTEGER NOT NULL REFERENCES applications(application_id) ON DELETE CASCADE, -- related application
    sender_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,   -- who sent the message
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,   -- who receives the message
    content     TEXT NOT NULL,                -- the message text
    is_read     BOOLEAN NOT NULL DEFAULT FALSE, -- FALSE = message not read yet
    sent_at     TIMESTAMP NOT NULL DEFAULT NOW() -- when it was sent
);


-- ============================================================
-- TABLE 9: cv_analyses
-- ============================================================
-- WHY: When the AI reads a student CV, it extracts information
--      and saves the results here. Used for smart matching and recommendations.
-- WHO USES IT: AI service, Students (to see their analysis), Companies
-- LINKS TO: student table (std_id)
-- ============================================================
CREATE TABLE cv_analyses (
    analysis_id          SERIAL PRIMARY KEY,  -- unique number for each analysis
    std_id               INTEGER NOT NULL REFERENCES student(std_id) ON DELETE CASCADE, -- which student
    extracted_skills     TEXT,                -- skills found in CV e.g. Python, SQL, React
    extracted_education  TEXT,                -- education found in CV e.g. IS, Yarmouk, Year 3
    extracted_experience TEXT,                -- work experience found in CV
    matched_internships  TEXT,                -- list of internships that match this student
    analysis_summary     TEXT,                -- overall AI summary of the student profile
    analysed_at          TIMESTAMP NOT NULL DEFAULT NOW() -- when the AI ran the analysis
);


-- ────────────────────────────────────────────────────────────
-- INDEXES
-- These make searches faster - like a book index
-- ────────────────────────────────────────────────────────────
CREATE INDEX idx_student_user           ON student(user_id);
CREATE INDEX idx_company_user           ON company(user_id);
CREATE INDEX idx_internship_company     ON internship(company_id);
CREATE INDEX idx_applications_student   ON applications(std_id);
CREATE INDEX idx_applications_internship ON applications(internship_id);
CREATE INDEX idx_applications_status    ON applications(status);
CREATE INDEX idx_saved_student          ON saved_internships(std_id);
CREATE INDEX idx_messages_application   ON messages(application_id);
CREATE INDEX idx_messages_receiver      ON messages(receiver_id);
CREATE INDEX idx_cv_analyses_student    ON cv_analyses(std_id);


-- ────────────────────────────────────────────────────────────
-- SEED DATA
-- Default admin account created automatically
-- Password: admin123
-- ────────────────────────────────────────────────────────────
INSERT INTO users (email, password_hash, role, is_active, is_approved)
VALUES (
    'admin@internera.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJbekRShaNLAHnUYh9wQNqKS',
    'admin',
    TRUE,
    TRUE
);


-- ────────────────────────────────────────────────────────────
-- VERIFY - should show exactly 9 table names
-- ────────────────────────────────────────────────────────────
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
