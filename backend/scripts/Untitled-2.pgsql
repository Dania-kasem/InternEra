-- ============================================================
--  InternEra - FINAL Test Data
--  Matches internera_schema_FINAL.sql (9 tables)
--  Run this AFTER internera_schema_FINAL.sql
--  Yarmouk University | Information Systems Project
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- TABLE 1: users
-- All passwords are: Test@1234 (stored encrypted)
-- user id 1 = admin (already created in schema file)
-- user id 2,3,4 = students
-- user id 5,6,7 = companies
-- ────────────────────────────────────────────────────────────
INSERT INTO users (email, password_hash, role, is_active, is_approved) VALUES
('sara.ali@student.yu.edu.jo',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJbekRShaNLAHnUYh9wQNqKS', 'student', TRUE, TRUE),
('ahmad.hassan@student.yu.edu.jo', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJbekRShaNLAHnUYh9wQNqKS', 'student', TRUE, TRUE),
('lina.omar@student.yu.edu.jo',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJbekRShaNLAHnUYh9wQNqKS', 'student', TRUE, TRUE),
('hr@softech.jo',                  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJbekRShaNLAHnUYh9wQNqKS', 'company', TRUE, TRUE),
('careers@datalink.jo',            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJbekRShaNLAHnUYh9wQNqKS', 'company', TRUE, TRUE),
('jobs@techwave.jo',               '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJbekRShaNLAHnUYh9wQNqKS', 'company', TRUE, TRUE);


-- ────────────────────────────────────────────────────────────
-- TABLE 2: student
-- ────────────────────────────────────────────────────────────
INSERT INTO student (user_id, f_name, l_name, std_email, major, status, cv_path, cv_uploaded_at) VALUES
(2, 'Sara',  'Ali',    'sara.ali@student.yu.edu.jo',     'Information Systems',  'active', 'uploads/cvs/sara_ali_cv.pdf',     NOW()),
(3, 'Ahmad', 'Hassan', 'ahmad.hassan@student.yu.edu.jo', 'Computer Science',     'active', 'uploads/cvs/ahmad_hassan_cv.pdf', NOW()),
(4, 'Lina',  'Omar',   'lina.omar@student.yu.edu.jo',    'Software Engineering', 'active', 'uploads/cvs/lina_omar_cv.pdf',    NOW());


-- ────────────────────────────────────────────────────────────
-- TABLE 3: company
-- ────────────────────────────────────────────────────────────
INSERT INTO company (user_id, company_name, location, phone_number, company_email, is_verified) VALUES
(5, 'SofTech Jordan',   'Amman, Jordan', '+962 6 123 4567', 'hr@softech.jo',       TRUE),
(6, 'DataLink Systems', 'Irbid, Jordan', '+962 2 987 6543', 'careers@datalink.jo', TRUE),
(7, 'TechWave',         'Zarqa, Jordan', '+962 5 456 7890', 'jobs@techwave.jo',    FALSE);


-- ────────────────────────────────────────────────────────────
-- TABLE 4: internship
-- ────────────────────────────────────────────────────────────
INSERT INTO internship (company_id, title, type, duration, field_of_study, location, description, required_skills, status, deadline) VALUES
(1, 'Frontend Developer Intern',  'onsite', '3 months', 'Computer Science',     'Amman',  'Work on React web apps',       'React, HTML, CSS, JavaScript',     'open',   '2026-06-01'),
(1, 'Backend Developer Intern',   'remote', '2 months', 'Information Systems',  'Remote', 'Build REST APIs using Python',  'Python, FastAPI, PostgreSQL',       'open',   '2026-06-15'),
(2, 'Data Analyst Intern',        'hybrid', '3 months', 'Information Systems',  'Irbid',  'Analyze business data',         'Excel, SQL, Power BI',              'open',   '2026-05-30'),
(2, 'Mobile App Intern',          'onsite', '4 months', 'Software Engineering', 'Irbid',  'Develop Android/iOS apps',      'Flutter, Dart, Firebase',           'open',   '2026-07-01'),
(3, 'UI/UX Design Intern',        'remote', '2 months', 'Computer Science',     'Remote', 'Design user interfaces',        'Figma, Adobe XD, Prototyping',      'open',   '2026-06-20'),
(3, 'Cybersecurity Intern',       'onsite', '3 months', 'Information Systems',  'Zarqa',  'Learn network security basics', 'Networking, Linux, Security Tools', 'closed', '2026-04-01');


-- ────────────────────────────────────────────────────────────
-- TABLE 5: applications
-- ────────────────────────────────────────────────────────────
INSERT INTO applications (std_id, internship_id, status, rejection_reason, ai_match_score) VALUES
(1, 1, 'pending',   NULL,                             85.50),
(1, 2, 'accepted',  NULL,                             92.00),
(2, 2, 'rejected',  'Missing required Python skills', 60.25),
(2, 3, 'reviewing', NULL,                             78.00),
(3, 4, 'pending',   NULL,                             88.75),
(3, 5, 'accepted',  NULL,                             95.00);


-- ────────────────────────────────────────────────────────────
-- TABLE 6: review
-- ────────────────────────────────────────────────────────────
INSERT INTO review (company_id, std_id, reviewed_at) VALUES
(1, 1, NOW()),
(1, 2, NOW()),
(2, 2, NOW()),
(2, 3, NOW()),
(3, 3, NOW());


-- ────────────────────────────────────────────────────────────
-- TABLE 7: saved_internships
-- ────────────────────────────────────────────────────────────
INSERT INTO saved_internships (std_id, internship_id, saved_at) VALUES
(1, 3, NOW()),
(1, 4, NOW()),
(2, 1, NOW()),
(2, 5, NOW()),
(3, 2, NOW()),
(3, 6, NOW());


-- ────────────────────────────────────────────────────────────
-- TABLE 8: messages
-- application_id 2 = Sara accepted at SofTech Backend
-- application_id 6 = Lina accepted at TechWave UI/UX
-- ────────────────────────────────────────────────────────────
INSERT INTO messages (application_id, sender_id, receiver_id, content, is_read, sent_at) VALUES
(2, 5, 2, 'Congratulations Sara! You have been accepted. Please confirm your start date.', TRUE,  NOW()),
(2, 2, 5, 'Thank you so much! I can start on the 1st of next month.',                      TRUE,  NOW()),
(2, 5, 2, 'Perfect! We will send you the onboarding details by email.',                    FALSE, NOW()),
(6, 7, 4, 'Hi Lina, we loved your portfolio. Can you come for an interview this week?',    TRUE,  NOW()),
(6, 4, 7, 'Hello! Yes I am available on Wednesday or Thursday.',                           FALSE, NOW());


-- ────────────────────────────────────────────────────────────
-- TABLE 9: cv_analyses
-- ────────────────────────────────────────────────────────────
INSERT INTO cv_analyses (std_id, extracted_skills, extracted_education, extracted_experience, matched_internships, analysis_summary) VALUES
(1,
 'Python, SQL, React, HTML, CSS, JavaScript',
 'Information Systems - Yarmouk University - Year 3 - GPA 3.5',
 'Part-time web developer at local startup (6 months)',
 'Frontend Developer Intern at SofTech, Backend Developer Intern at SofTech',
 'Strong technical profile with web development skills. Good match for frontend and backend positions.'
),
(2,
 'Java, C++, SQL, Linux, Networking',
 'Computer Science - Yarmouk University - Year 4 - GPA 3.2',
 'No prior work experience',
 'Data Analyst Intern at DataLink, Mobile App Intern at DataLink',
 'Solid programming foundation. Recommended to strengthen Python and mobile development skills.'
),
(3,
 'Flutter, Dart, Figma, Firebase, UI/UX Design',
 'Software Engineering - Yarmouk University - Year 3 - GPA 3.8',
 'Freelance mobile app designer (1 year)',
 'Mobile App Intern at DataLink, UI/UX Design Intern at TechWave',
 'Excellent design and mobile development skills. Strong match for UI/UX and mobile positions.'
);


-- ────────────────────────────────────────────────────────────
-- VERIFY - check row count in all 9 tables
-- ────────────────────────────────────────────────────────────
SELECT 'users'             AS table_name, COUNT(*) AS total_rows FROM users
UNION ALL
SELECT 'student',           COUNT(*) FROM student
UNION ALL
SELECT 'company',           COUNT(*) FROM company
UNION ALL
SELECT 'internship',        COUNT(*) FROM internship
UNION ALL
SELECT 'applications',      COUNT(*) FROM applications
UNION ALL
SELECT 'review',            COUNT(*) FROM review
UNION ALL
SELECT 'saved_internships', COUNT(*) FROM saved_internships
UNION ALL
SELECT 'messages',          COUNT(*) FROM messages
UNION ALL
SELECT 'cv_analyses',       COUNT(*) FROM cv_analyses
ORDER BY table_name;
