-- ============================================================================
-- AURELIA STUDENT MANAGEMENT SYSTEM — COMPREHENSIVE SEED SCRIPT
-- Version: 2.0.1 (Strict Hexadecimal RFC 4122 UUID compliant)
-- Platform: Supabase PostgreSQL (PostgreSQL 15+)
-- Description: Idempotent seed data for all 24 tables with deterministic UUIDs.
--              Safe for repeated execution (uses ON CONFLICT DO NOTHING).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. INSTITUTION SETTINGS
-- ----------------------------------------------------------------------------
INSERT INTO public.institution_settings (
    id,
    institution_name,
    tagline,
    email,
    phone,
    website,
    address,
    logo_url,
    current_academic_year,
    current_term,
    attendance_threshold,
    grading_scale
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Aurelia Institute of Technology & Humanities',
    'Education is not just about learning. It''s about building a better tomorrow.',
    'admissions@aurelia.edu',
    '+1 (555) 789-2000',
    'https://aurelia.edu',
    '400 Chancellor Walk, Cambridge, MA 02138',
    'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=200&q=80',
    '2025-2026',
    'Fall Term (Semester 3)',
    75.00,
    '[
        {"grade": "A+", "min_score": 90, "max_score": 100, "gpa": 4.0, "description": "Outstanding Distinction"},
        {"grade": "A", "min_score": 80, "max_score": 89, "gpa": 3.7, "description": "Excellent Mastery"},
        {"grade": "B+", "min_score": 70, "max_score": 79, "gpa": 3.3, "description": "Very Good Performance"},
        {"grade": "B", "min_score": 60, "max_score": 69, "gpa": 3.0, "description": "Good Standing"},
        {"grade": "C", "min_score": 50, "max_score": 59, "gpa": 2.0, "description": "Satisfactory"},
        {"grade": "F", "min_score": 0, "max_score": 49, "gpa": 0.0, "description": "Needs Remediation"}
    ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. SAMPLE PROFILES (Linked with default user roles)
-- ----------------------------------------------------------------------------
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    department,
    phone,
    is_active
) VALUES
('10000000-0000-0000-0000-000000000001', 'admin@aurelia.edu', 'Abin R Dasan', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 'Admin', 'Institutional Administration', '+1 (555) 019-2831', true),
('10000000-0000-0000-0000-000000000002', 'eleanor.vance@aurelia.edu', 'Dr. Eleanor Vance', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', 'Teacher', 'Computer Science & Engineering', '+1 (555) 123-4567', true),
('10000000-0000-0000-0000-000000000003', 'accountant@aurelia.edu', 'David Miller', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 'Accountant', 'Finance & Bursar Office', '+1 (555) 456-7892', true),
('10000000-0000-0000-0000-000000000004', 'staff@aurelia.edu', 'Clara Oswald', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', 'Staff', 'Registrar & Student Affairs', '+1 (555) 789-0125', true)
ON CONFLICT (email) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. FEE CATEGORIES
-- ----------------------------------------------------------------------------
INSERT INTO public.fee_categories (id, name, description) VALUES
('fc111111-1111-1111-1111-111111111111', 'Tuition Fee', 'Core pedagogical, lecture, and academic instruction fees.'),
('fc222222-2222-2222-2222-222222222222', 'Laboratory & Computing Fee', 'Access to high-performance computing clusters, engineering workshops, and electronics labs.'),
('fc333333-3333-3333-3333-333333333333', 'Library & Digital Subscriptions', 'University library facilities, IEEE, ACM, and international journal database licenses.'),
('fc444444-4444-4444-4444-444444444444', 'Examination & Assessment Fee', 'Semester question paper generation, proctoring, evaluation, and transcript archiving.')
ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. DEPARTMENTS
-- ----------------------------------------------------------------------------
INSERT INTO public.departments (id, code, name, head_of_department, description, student_count, course_count) VALUES
('b1111111-1111-1111-1111-111111111111', 'CS', 'Computer Science & Engineering', 'Dr. Eleanor Vance', 'Pioneering computation, artificial intelligence, and software craftsmanship with ethical foundations.', 420, 6),
('b2222222-2222-2222-2222-222222222222', 'IT', 'Information Technology', 'Prof. Marcus Chen', 'Empowering future architects of enterprise networks, cloud systems, and data security.', 310, 5),
('b3333333-3333-3333-3333-333333333333', 'ECE', 'Electronics & Communication', 'Dr. Sunita Raman', 'Bridging physical hardware, embedded intelligence, and next-generation signal transmission.', 245, 4),
('b4444444-4444-4444-4444-444444444444', 'BA', 'Business Administration', 'Dean Arthur Pendelton', 'Nurturing visionary leaders, ethical managers, and global economic strategists.', 195, 5),
('b5555555-5555-5555-5555-555555555555', 'ME', 'Mechanical Engineering', 'Prof. Henrik Lindqvist', 'Integrating sustainable thermodynamics, precision robotics, and green energy machines.', 114, 4)
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. FACULTY
-- ----------------------------------------------------------------------------
INSERT INTO public.faculty (id, faculty_id, department_id, full_name, email, phone, designation, qualification, avatar_url, is_active) VALUES
('f1111111-1111-1111-1111-111111111111', 'FAC001', 'b1111111-1111-1111-1111-111111111111', 'Dr. Eleanor Vance', 'eleanor.vance@aurelia.edu', '+1 (555) 123-4567', 'Professor & Dean of Computing', 'Ph.D. in Computer Science (MIT)', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', true),
('f2222222-2222-2222-2222-222222222222', 'FAC002', 'b2222222-2222-2222-2222-222222222222', 'Prof. Marcus Chen', 'marcus.chen@aurelia.edu', '+1 (555) 234-5679', 'Associate Professor', 'M.S. in Computer Systems (Stanford)', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', true),
('f3333333-3333-3333-3333-333333333333', 'FAC003', 'b3333333-3333-3333-3333-333333333333', 'Dr. Sunita Raman', 'sunita.raman@aurelia.edu', '+1 (555) 345-6780', 'Professor & Department Head', 'Ph.D. in Microelectronics (Berkeley)', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80', true),
('f4444444-4444-4444-4444-444444444444', 'FAC004', 'b4444444-4444-4444-4444-444444444444', 'Dean Arthur Pendelton', 'arthur.pendelton@aurelia.edu', '+1 (555) 456-7891', 'Dean of Management Studies', 'Ph.D. in Strategic Management (Harvard)', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', true),
('f5555555-5555-5555-5555-555555555555', 'FAC005', 'b5555555-5555-5555-5555-555555555555', 'Prof. Henrik Lindqvist', 'henrik.lindqvist@aurelia.edu', '+1 (555) 567-8902', 'Professor of Robotics', 'D.Sc. in Mechanical Design (KTH Stockholm)', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80', true),
('f6666666-6666-6666-6666-666666666666', 'FAC006', 'b1111111-1111-1111-1111-111111111111', 'Prof. Alan Turing', 'alan.turing@aurelia.edu', '+1 (555) 678-9013', 'Distinguished Chair of Computation', 'Ph.D. in Mathematical Logic (Princeton)', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', true),
('f7777777-7777-7777-7777-777777777777', 'FAC007', 'b1111111-1111-1111-1111-111111111111', 'Dr. Grace Hopper', 'grace.hopper@aurelia.edu', '+1 (555) 789-0124', 'Professor of Software Systems', 'Ph.D. in Mathematics (Yale)', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', true),
('f8888888-8888-8888-8888-888888888888', 'FAC008', 'b2222222-2222-2222-2222-222222222222', 'Dr. Linus Torvalds', 'linus.torvalds@aurelia.edu', '+1 (555) 890-1235', 'Adjunct Professor of Systems Engineering', 'M.S. in Computer Science (Univ of Helsinki)', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80', true)
ON CONFLICT (email) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. COURSES
-- ----------------------------------------------------------------------------
INSERT INTO public.courses (
    id, code, name, department_id, department_name, duration_years, total_semesters, credits,
    faculty_coordinator, faculty_coordinator_id, enrolled_students, color_accent, status, description
) VALUES
('c1111111-1111-1111-1111-111111111111', 'CS-BTECH', 'Computer Science', 'b1111111-1111-1111-1111-111111111111', 'Computer Science & Engineering', 4, 8, 160, 'Dr. Eleanor Vance', 'f1111111-1111-1111-1111-111111111111', 420, 'sage', 'Active', 'Core Bachelor of Technology in Computer Science and Engineering with AI specialization.'),
('c2222222-2222-2222-2222-222222222222', 'IT-BTECH', 'Information Technology', 'b2222222-2222-2222-2222-222222222222', 'Information Technology', 4, 8, 155, 'Prof. Marcus Chen', 'f2222222-2222-2222-2222-222222222222', 310, 'lavender', 'Active', 'Comprehensive software development, distributed systems, and cyber-defense systems.'),
('c3333333-3333-3333-3333-333333333333', 'ECE-BTECH', 'Electronics & Communication', 'b3333333-3333-3333-3333-333333333333', 'Electronics & Communication', 4, 8, 158, 'Dr. Sunita Raman', 'f3333333-3333-3333-3333-333333333333', 245, 'sand', 'Active', 'VLSI design, embedded microcontrollers, and modern wireless telecommunication.'),
('c4444444-4444-4444-4444-444444444444', 'BBA-INT', 'Business Administration', 'b4444444-4444-4444-4444-444444444444', 'Business Administration', 3, 6, 120, 'Dean Arthur Pendelton', 'f4444444-4444-4444-4444-444444444444', 195, 'forest', 'Active', 'International business strategy, financial management, and organizational leadership.'),
('c5555555-5555-5555-5555-555555555555', 'ME-BTECH', 'Mechanical Engineering', 'b5555555-5555-5555-5555-555555555555', 'Mechanical Engineering', 4, 8, 162, 'Prof. Henrik Lindqvist', 'f5555555-5555-5555-5555-555555555555', 114, 'sage', 'Active', 'Advanced solid mechanics, robotic automation, and additive materials manufacturing.')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. ACADEMIC YEARS & TERMS
-- ----------------------------------------------------------------------------
INSERT INTO public.academic_years (id, name, start_date, end_date, is_current) VALUES
('a1111111-1111-1111-1111-111111111111', '2025-2026', '2025-08-01', '2026-05-31', true),
('a2222222-2222-2222-2222-222222222222', '2024-2025', '2024-08-01', '2025-05-31', false)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.academic_terms (id, academic_year_id, name, term_type, semester_number, start_date, end_date, is_current) VALUES
('a3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Fall Term (Semester 3)', 'Semester', 3, '2025-08-15', '2025-12-20', true),
('a4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', 'Spring Term (Semester 2)', 'Semester', 2, '2025-01-10', '2025-05-30', false)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 8. SUBJECTS
-- ----------------------------------------------------------------------------
INSERT INTO public.subjects (
    id, code, name, course_id, course_name, semester, credits, max_marks, pass_marks, faculty_name, faculty_id
) VALUES
('e1111111-1111-1111-1111-111111111111', 'CS301', 'Data Structures & Algorithms', 'c1111111-1111-1111-1111-111111111111', 'Computer Science', 3, 4, 100, 40, 'Dr. Eleanor Vance', 'f1111111-1111-1111-1111-111111111111'),
('e2222222-2222-2222-2222-222222222222', 'CS302', 'Database Management Systems', 'c1111111-1111-1111-1111-111111111111', 'Computer Science', 3, 4, 100, 40, 'Prof. Alan Turing', 'f6666666-6666-6666-6666-666666666666'),
('e3333333-3333-3333-3333-333333333333', 'CS303', 'Computer Architecture & Org', 'c1111111-1111-1111-1111-111111111111', 'Computer Science', 3, 3, 100, 40, 'Dr. Grace Hopper', 'f7777777-7777-7777-7777-777777777777'),
('e4444444-4444-4444-4444-444444444444', 'IT301', 'Web Architectures & Cloud', 'c2222222-2222-2222-2222-222222222222', 'Information Technology', 3, 4, 100, 40, 'Prof. Marcus Chen', 'f2222222-2222-2222-2222-222222222222'),
('e5555555-5555-5555-5555-555555555555', 'IT302', 'Operating Systems & Kernels', 'c2222222-2222-2222-2222-222222222222', 'Information Technology', 3, 4, 100, 40, 'Dr. Linus Torvalds', 'f8888888-8888-8888-8888-888888888888'),
('e6666666-6666-6666-6666-666666666666', 'EC301', 'Digital Signal Processing', 'c3333333-3333-3333-3333-333333333333', 'Electronics & Communication', 3, 4, 100, 40, 'Dr. Sunita Raman', 'f3333333-3333-3333-3333-333333333333'),
('e7777777-7777-7777-7777-777777777777', 'BA301', 'Corporate Financial Strategy', 'c4444444-4444-4444-4444-444444444444', 'Business Administration', 3, 3, 100, 40, 'Dean Arthur Pendelton', 'f4444444-4444-4444-4444-444444444444'),
('e8888888-8888-8888-8888-888888888888', 'ME301', 'Thermodynamics & Heat Transfer', 'c5555555-5555-5555-5555-555555555555', 'Mechanical Engineering', 3, 4, 100, 40, 'Prof. Henrik Lindqvist', 'f5555555-5555-5555-5555-555555555555')
ON CONFLICT (course_id, code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 9. STUDENTS
-- ----------------------------------------------------------------------------
INSERT INTO public.students (
    id, student_id, first_name, last_name, full_name, email, phone, gender, date_of_birth,
    department_id, department_name, course_id, course_name, academic_year, semester,
    enrollment_date, status, avatar_url, address, blood_group, attendance_rate, gpa, guardian, notes
) VALUES
(
    'd1111111-1111-1111-1111-111111111111', 'STU001', 'Aarav', 'Nair', 'Aarav Nair', 'aarav.nair@aurelia.edu', '+1 (555) 234-5678', 'Male', '2004-03-14',
    'b1111111-1111-1111-1111-111111111111', 'Computer Science & Engineering', 'c1111111-1111-1111-1111-111111111111', 'Computer Science', '2025-2026', 3,
    '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    '14 Elmwood Terrace, Cambridge, MA', 'O+', 96.2, 3.88,
    '{"name": "Ramesh Nair", "relation": "Father", "phone": "+1 (555) 987-6543", "email": "ramesh.nair@example.com", "occupation": "Senior Systems Architect"}'::jsonb,
    'Exhibits outstanding algorithmic aptitude; leading the campus competitive coding collective.'
),
(
    'd2222222-2222-2222-2222-222222222222', 'STU002', 'Diya', 'Menon', 'Diya Menon', 'diya.menon@aurelia.edu', '+1 (555) 345-6789', 'Female', '2004-07-22',
    'b2222222-2222-2222-2222-222222222222', 'Information Technology', 'c2222222-2222-2222-2222-222222222222', 'Information Technology', '2025-2026', 3,
    '2023-08-16', 'Active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    '88 Heritage Lane, Boston, MA', 'A+', 94.8, 3.92,
    '{"name": "Meera Menon", "relation": "Mother", "phone": "+1 (555) 876-5432", "email": "meera.m@example.com", "occupation": "Pediatric Surgeon"}'::jsonb,
    'Co-founded the Open Education web initiative. Passionate about human-computer interaction.'
),
(
    'd3333333-3333-3333-3333-333333333333', 'STU003', 'Rohan', 'Mathew', 'Rohan Mathew', 'rohan.mathew@aurelia.edu', '+1 (555) 456-7890', 'Male', '2003-11-09',
    'b3333333-3333-3333-3333-333333333333', 'Electronics & Communication', 'c3333333-3333-3333-3333-333333333333', 'Electronics & Communication', '2025-2026', 3,
    '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    '42 Meadowbrook Rd, Somerville, MA', 'B+', 91.5, 3.65,
    '{"name": "George Mathew", "relation": "Father", "phone": "+1 (555) 765-4321", "email": "george.mathew@example.com", "occupation": "Civil Engineer"}'::jsonb,
    'Specializing in satellite signal propagation and hardware acceleration research.'
),
(
    'd4444444-4444-4444-4444-444444444444', 'STU004', 'Sneha', 'Thomas', 'Sneha Thomas', 'sneha.thomas@aurelia.edu', '+1 (555) 567-8901', 'Female', '2004-01-18',
    'b4444444-4444-4444-4444-444444444444', 'Business Administration', 'c4444444-4444-4444-4444-444444444444', 'Business Administration', '2025-2026', 3,
    '2023-08-18', 'Active', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    '305 Beacon Street, Boston, MA', 'AB+', 98.0, 3.96,
    '{"name": "Thomas Varghese", "relation": "Father", "phone": "+1 (555) 654-3210", "email": "thomas.v@example.com", "occupation": "Investment Director"}'::jsonb,
    'Elected Student Senate Treasurer; outstanding leadership in collegiate financial debate.'
),
(
    'd5555555-5555-5555-5555-555555555555', 'STU005', 'Arjun', 'Pillai', 'Arjun Pillai', 'arjun.pillai@aurelia.edu', '+1 (555) 678-9012', 'Male', '2003-09-30',
    'b5555555-5555-5555-5555-555555555555', 'Mechanical Engineering', 'c5555555-5555-5555-5555-555555555555', 'Mechanical Engineering', '2025-2026', 3,
    '2023-08-15', 'Inactive', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    '77 Concord Ave, Cambridge, MA', 'O-', 68.4, 2.95,
    '{"name": "Gopal Pillai", "relation": "Father", "phone": "+1 (555) 543-2109", "email": "gopal.pillai@example.com", "occupation": "Industrial Consultant"}'::jsonb,
    'Medical leave approved for semester hiatus. Anticipating return next academic spring.'
),
(
    'd6666666-6666-6666-6666-666666666666', 'STU006', 'Maya', 'Al-Mansoor', 'Maya Al-Mansoor', 'maya.mansoor@aurelia.edu', '+1 (555) 789-0123', 'Female', '2004-05-12',
    'b1111111-1111-1111-1111-111111111111', 'Computer Science & Engineering', 'c1111111-1111-1111-1111-111111111111', 'Computer Science', '2025-2026', 3,
    '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    '12 University Road, Cambridge, MA', 'A-', 97.5, 3.94,
    '{"name": "Tariq Al-Mansoor", "relation": "Father", "phone": "+1 (555) 432-1098", "email": "tariq.m@example.com", "occupation": "Diplomat"}'::jsonb,
    'Published a research preprint on neural symbolic verification in high-concurrency kernels.'
),
(
    'd7777777-7777-7777-7777-777777777777', 'STU007', 'Julian', 'Vance', 'Julian Vance', 'julian.vance@aurelia.edu', '+1 (555) 890-1234', 'Male', '2003-12-04',
    'b2222222-2222-2222-2222-222222222222', 'Information Technology', 'c2222222-2222-2222-2222-222222222222', 'Information Technology', '2025-2026', 3,
    '2023-08-16', 'Active', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    '91 Charles Street, Boston, MA', 'B-', 93.0, 3.72,
    '{"name": "Catherine Vance", "relation": "Mother", "phone": "+1 (555) 321-0987", "email": "catherine.v@example.com", "occupation": "Architectural Historian"}'::jsonb,
    'High performer in distributed ledger architecture and security protocols.'
),
(
    'd8888888-8888-8888-8888-888888888888', 'STU008', 'Priya', 'Reddy', 'Priya Reddy', 'priya.reddy@aurelia.edu', '+1 (555) 901-2345', 'Female', '2004-09-17',
    'b3333333-3333-3333-3333-333333333333', 'Electronics & Communication', 'c3333333-3333-3333-3333-333333333333', 'Electronics & Communication', '2025-2026', 3,
    '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    '54 Harvard Yard, Cambridge, MA', 'O+', 95.1, 3.85,
    '{"name": "Suresh Reddy", "relation": "Father", "phone": "+1 (555) 210-9876", "email": "suresh.r@example.com", "occupation": "Software Executive"}'::jsonb,
    'Chairperson of the Institute Robotics Guild; developing autonomous solar drone firmware.'
)
ON CONFLICT (student_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 10. GUARDIANS (Normalized records - populated if not already created by trigger)
-- ----------------------------------------------------------------------------
INSERT INTO public.guardians (id, student_id, name, relation, phone, email, occupation)
SELECT '61111111-1111-1111-1111-111111111111'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, 'Ramesh Nair', 'Father', '+1 (555) 987-6543', 'ramesh.nair@example.com', 'Senior Systems Architect'
WHERE NOT EXISTS (SELECT 1 FROM public.guardians WHERE student_id = 'd1111111-1111-1111-1111-111111111111'::uuid);

INSERT INTO public.guardians (id, student_id, name, relation, phone, email, occupation)
SELECT '62222222-2222-2222-2222-222222222222'::uuid, 'd2222222-2222-2222-2222-222222222222'::uuid, 'Meera Menon', 'Mother', '+1 (555) 876-5432', 'meera.m@example.com', 'Pediatric Surgeon'
WHERE NOT EXISTS (SELECT 1 FROM public.guardians WHERE student_id = 'd2222222-2222-2222-2222-222222222222'::uuid);

INSERT INTO public.guardians (id, student_id, name, relation, phone, email, occupation)
SELECT '63333333-3333-3333-3333-333333333333'::uuid, 'd3333333-3333-3333-3333-333333333333'::uuid, 'George Mathew', 'Father', '+1 (555) 765-4321', 'george.mathew@example.com', 'Civil Engineer'
WHERE NOT EXISTS (SELECT 1 FROM public.guardians WHERE student_id = 'd3333333-3333-3333-3333-333333333333'::uuid);

INSERT INTO public.guardians (id, student_id, name, relation, phone, email, occupation)
SELECT '64444444-4444-4444-4444-444444444444'::uuid, 'd4444444-4444-4444-4444-444444444444'::uuid, 'Thomas Varghese', 'Father', '+1 (555) 654-3210', 'thomas.v@example.com', 'Investment Director'
WHERE NOT EXISTS (SELECT 1 FROM public.guardians WHERE student_id = 'd4444444-4444-4444-4444-444444444444'::uuid);

INSERT INTO public.guardians (id, student_id, name, relation, phone, email, occupation)
SELECT '65555555-5555-5555-5555-555555555555'::uuid, 'd5555555-5555-5555-5555-555555555555'::uuid, 'Gopal Pillai', 'Father', '+1 (555) 543-2109', 'gopal.pillai@example.com', 'Industrial Consultant'
WHERE NOT EXISTS (SELECT 1 FROM public.guardians WHERE student_id = 'd5555555-5555-5555-5555-555555555555'::uuid);

INSERT INTO public.guardians (id, student_id, name, relation, phone, email, occupation)
SELECT '66666666-6666-6666-6666-666666666666'::uuid, 'd6666666-6666-6666-6666-666666666666'::uuid, 'Tariq Al-Mansoor', 'Father', '+1 (555) 432-1098', 'tariq.m@example.com', 'Diplomat'
WHERE NOT EXISTS (SELECT 1 FROM public.guardians WHERE student_id = 'd6666666-6666-6666-6666-666666666666'::uuid);

INSERT INTO public.guardians (id, student_id, name, relation, phone, email, occupation)
SELECT '67777777-7777-7777-7777-777777777777'::uuid, 'd7777777-7777-7777-7777-777777777777'::uuid, 'Catherine Vance', 'Mother', '+1 (555) 321-0987', 'catherine.v@example.com', 'Architectural Historian'
WHERE NOT EXISTS (SELECT 1 FROM public.guardians WHERE student_id = 'd7777777-7777-7777-7777-777777777777'::uuid);

INSERT INTO public.guardians (id, student_id, name, relation, phone, email, occupation)
SELECT '68888888-8888-8888-8888-888888888888'::uuid, 'd8888888-8888-8888-8888-888888888888'::uuid, 'Suresh Reddy', 'Father', '+1 (555) 210-9876', 'suresh.r@example.com', 'Software Executive'
WHERE NOT EXISTS (SELECT 1 FROM public.guardians WHERE student_id = 'd8888888-8888-8888-8888-888888888888'::uuid);

-- ----------------------------------------------------------------------------
-- 11. ENROLLMENTS
-- ----------------------------------------------------------------------------
INSERT INTO public.enrollments (id, student_id, course_id, academic_year, semester, status) VALUES
('51111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '2025-2026', 3, 'Enrolled'),
('52222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', '2025-2026', 3, 'Enrolled'),
('53333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', '2025-2026', 3, 'Enrolled'),
('54444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', '2025-2026', 3, 'Enrolled'),
('55555555-5555-5555-5555-555555555555', 'd5555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555555', '2025-2026', 3, 'Enrolled'),
('56666666-6666-6666-6666-666666666666', 'd6666666-6666-6666-6666-666666666666', 'c1111111-1111-1111-1111-111111111111', '2025-2026', 3, 'Enrolled'),
('57777777-7777-7777-7777-777777777777', 'd7777777-7777-7777-7777-777777777777', 'c2222222-2222-2222-2222-222222222222', '2025-2026', 3, 'Enrolled'),
('58888888-8888-8888-8888-888888888888', 'd8888888-8888-8888-8888-888888888888', 'c3333333-3333-3333-3333-333333333333', '2025-2026', 3, 'Enrolled')
ON CONFLICT (student_id, course_id, academic_year, semester) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 12. FACULTY SUBJECT ASSIGNMENTS
-- ----------------------------------------------------------------------------
INSERT INTO public.faculty_subject_assignments (id, faculty_id, subject_id, academic_year, semester) VALUES
('41111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', '2025-2026', 3),
('42222222-2222-2222-2222-222222222222', 'f6666666-6666-6666-6666-666666666666', 'e2222222-2222-2222-2222-222222222222', '2025-2026', 3),
('43333333-3333-3333-3333-333333333333', 'f7777777-7777-7777-7777-777777777777', 'e3333333-3333-3333-3333-333333333333', '2025-2026', 3),
('44444444-4444-4444-4444-444444444444', 'f2222222-2222-2222-2222-222222222222', 'e4444444-4444-4444-4444-444444444444', '2025-2026', 3),
('45555555-5555-5555-5555-555555555555', 'f8888888-8888-8888-8888-888888888888', 'e5555555-5555-5555-5555-555555555555', '2025-2026', 3),
('46666666-6666-6666-6666-666666666666', 'f3333333-3333-3333-3333-333333333333', 'e6666666-6666-6666-6666-666666666666', '2025-2026', 3),
('47777777-7777-7777-7777-777777777777', 'f4444444-4444-4444-4444-444444444444', 'e7777777-7777-7777-7777-777777777777', '2025-2026', 3),
('48888888-8888-8888-8888-888888888888', 'f5555555-5555-5555-5555-555555555555', 'e8888888-8888-8888-8888-888888888888', '2025-2026', 3)
ON CONFLICT (faculty_id, subject_id, academic_year, semester) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 13. CLASS SESSIONS (Weekly Timetable)
-- ----------------------------------------------------------------------------
INSERT INTO public.class_sessions (id, course_id, subject_id, day_of_week, start_time, end_time, room_number, faculty_id) VALUES
('31111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Monday', '09:00:00', '10:30:00', 'Turing Amphitheatre 101', 'f1111111-1111-1111-1111-111111111111'),
('32222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'Tuesday', '11:00:00', '12:30:00', 'Hopper Hall 204', 'f6666666-6666-6666-6666-666666666666'),
('33333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'e4444444-4444-4444-4444-444444444444', 'Wednesday', '10:00:00', '11:30:00', 'Cloud Computing Lab 3', 'f2222222-2222-2222-2222-222222222222'),
('34444444-4444-4444-4444-444444444444', 'c3333333-3333-3333-3333-333333333333', 'e6666666-6666-6666-6666-666666666666', 'Thursday', '14:00:00', '15:30:00', 'Signal Transmission Lab B', 'f3333333-3333-3333-3333-333333333333'),
('35555555-5555-5555-5555-555555555555', 'c4444444-4444-4444-4444-444444444444', 'e7777777-7777-7777-7777-777777777777', 'Friday', '09:30:00', '11:00:00', 'Babbage Executive Suite', 'f4444444-4444-4444-4444-444444444444')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 14. ATTENDANCE RECORDS
-- ----------------------------------------------------------------------------
INSERT INTO public.attendance_records (
    id, student_id, student_name, student_code, course_id, course_name, subject_id, subject_name,
    date, session, status, remarks, recorded_by
) VALUES
('21111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Aarav Nair', 'STU001', 'c1111111-1111-1111-1111-111111111111', 'Computer Science', 'e1111111-1111-1111-1111-111111111111', 'Data Structures & Algorithms', '2025-10-28', 'Morning', 'Present', NULL, 'Dr. Eleanor Vance'),
('22222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'Diya Menon', 'STU002', 'c2222222-2222-2222-2222-222222222222', 'Information Technology', 'e4444444-4444-4444-4444-444444444444', 'Web Architectures & Cloud', '2025-10-28', 'Morning', 'Present', NULL, 'Prof. Marcus Chen'),
('23333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'Rohan Mathew', 'STU003', 'c3333333-3333-3333-3333-333333333333', 'Electronics & Communication', 'e6666666-6666-6666-6666-666666666666', 'Digital Signal Processing', '2025-10-28', 'Morning', 'Present', NULL, 'Dr. Sunita Raman'),
('24444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', 'Sneha Thomas', 'STU004', 'c4444444-4444-4444-4444-444444444444', 'Business Administration', 'e7777777-7777-7777-7777-777777777777', 'Corporate Financial Strategy', '2025-10-28', 'Morning', 'Present', NULL, 'Dean Arthur Pendelton'),
('25555555-5555-5555-5555-555555555555', 'd5555555-5555-5555-5555-555555555555', 'Arjun Pillai', 'STU005', 'c5555555-5555-5555-5555-555555555555', 'Mechanical Engineering', 'e8888888-8888-8888-8888-888888888888', 'Thermodynamics & Heat Transfer', '2025-10-28', 'Morning', 'Absent', 'Medical leave ongoing', 'Prof. Henrik Lindqvist'),
('26666666-6666-6666-6666-666666666666', 'd6666666-6666-6666-6666-666666666666', 'Maya Al-Mansoor', 'STU006', 'c1111111-1111-1111-1111-111111111111', 'Computer Science', 'e1111111-1111-1111-1111-111111111111', 'Data Structures & Algorithms', '2025-10-28', 'Morning', 'Present', NULL, 'Dr. Eleanor Vance'),
('27777777-7777-7777-7777-777777777777', 'd7777777-7777-7777-7777-777777777777', 'Julian Vance', 'STU007', 'c2222222-2222-2222-2222-222222222222', 'Information Technology', 'e4444444-4444-4444-4444-444444444444', 'Web Architectures & Cloud', '2025-10-28', 'Morning', 'Late', 'Delayed 15m', 'Prof. Marcus Chen'),
('28888888-8888-8888-8888-888888888888', 'd8888888-8888-8888-8888-888888888888', 'Priya Reddy', 'STU008', 'c3333333-3333-3333-3333-333333333333', 'Electronics & Communication', 'e6666666-6666-6666-6666-666666666666', 'Digital Signal Processing', '2025-10-28', 'Morning', 'Present', NULL, 'Dr. Sunita Raman')
ON CONFLICT (student_id, date, session) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 15. EXAMINATIONS
-- ----------------------------------------------------------------------------
INSERT INTO public.examinations (
    id, title, exam_type, course_id, course_name, academic_year, semester, start_date, end_date, status
) VALUES
('71111111-1111-1111-1111-111111111111', 'Mid Term Examination - Fall 2025', 'Mid Term', 'c1111111-1111-1111-1111-111111111111', 'Computer Science', '2025-2026', 3, '2025-10-29', '2025-11-06', 'Scheduled'),
('72222222-2222-2222-2222-222222222222', 'Mid Term Examination - Fall 2025', 'Mid Term', 'c2222222-2222-2222-2222-222222222222', 'Information Technology', '2025-2026', 3, '2025-10-30', '2025-11-07', 'Scheduled'),
('73333333-3333-3333-3333-333333333333', 'Semester 2 Final Examinations', 'Final Exam', 'c1111111-1111-1111-1111-111111111111', 'Computer Science', '2024-2025', 2, '2025-05-10', '2025-05-22', 'Results Published'),
('74444444-4444-4444-4444-444444444444', 'Semester 2 Final Examinations', 'Final Exam', 'c2222222-2222-2222-2222-222222222222', 'Information Technology', '2024-2025', 2, '2025-05-11', '2025-05-23', 'Results Published')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 16. EXAMINATION SUBJECTS
-- ----------------------------------------------------------------------------
INSERT INTO public.examination_subjects (id, examination_id, subject_id, exam_date, start_time, duration_minutes, max_marks, pass_marks) VALUES
('7a111111-1111-1111-1111-111111111111', '71111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', '2025-10-29', '09:30:00', 180, 100.00, 40.00),
('7a222222-2222-2222-2222-222222222222', '71111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', '2025-10-31', '09:30:00', 180, 100.00, 40.00),
('7a333333-3333-3333-3333-333333333333', '72222222-2222-2222-2222-222222222222', 'e4444444-4444-4444-4444-444444444444', '2025-10-30', '09:30:00', 180, 100.00, 40.00),
('7a444444-4444-4444-4444-444444444444', '73333333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', '2025-05-12', '09:30:00', 180, 100.00, 40.00)
ON CONFLICT (examination_id, subject_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 17. EXAMINATION RESULTS
-- ----------------------------------------------------------------------------
INSERT INTO public.examination_results (
    id, examination_id, examination_title, student_id, student_name, student_code,
    course_id, course_name, semester, subjects, total_marks, total_max_marks,
    percentage, gpa, overall_grade, remarks, published_date
) VALUES
(
    '81111111-1111-1111-1111-111111111111', '73333333-3333-3333-3333-333333333333', 'Semester 2 Final Examinations',
    'd1111111-1111-1111-1111-111111111111', 'Aarav Nair', 'STU001', 'c1111111-1111-1111-1111-111111111111', 'Computer Science', 2,
    '[
        {"subject_id": "e1111111-1111-1111-1111-111111111111", "subject_name": "Data Structures & Algorithms", "max_marks": 100, "marks_obtained": 95, "grade": "A+"},
        {"subject_id": "e2222222-2222-2222-2222-222222222222", "subject_name": "Database Management Systems", "max_marks": 100, "marks_obtained": 92, "grade": "A"},
        {"subject_id": "e3333333-3333-3333-3333-333333333333", "subject_name": "Computer Architecture & Org", "max_marks": 100, "marks_obtained": 88, "grade": "A"}
    ]'::jsonb,
    275.00, 300.00, 91.67, 3.88, 'A+', 'Dean''s Honor Roll recognition recipient.', '2025-06-15'
),
(
    '82222222-2222-2222-2222-222222222222', '73333333-3333-3333-3333-333333333333', 'Semester 2 Final Examinations',
    'd2222222-2222-2222-2222-222222222222', 'Diya Menon', 'STU002', 'c2222222-2222-2222-2222-222222222222', 'Information Technology', 2,
    '[
        {"subject_id": "e4444444-4444-4444-4444-444444444444", "subject_name": "Web Architectures & Cloud", "max_marks": 100, "marks_obtained": 97, "grade": "A+"},
        {"subject_id": "e5555555-5555-5555-5555-555555555555", "subject_name": "Operating Systems & Kernels", "max_marks": 100, "marks_obtained": 94, "grade": "A"}
    ]'::jsonb,
    191.00, 200.00, 95.50, 3.92, 'A+', 'Exemplary project architecture presentation.', '2025-06-15'
),
(
    '83333333-3333-3333-3333-333333333333', '73333333-3333-3333-3333-333333333333', 'Semester 2 Final Examinations',
    'd4444444-4444-4444-4444-444444444444', 'Sneha Thomas', 'STU004', 'c4444444-4444-4444-4444-444444444444', 'Business Administration', 2,
    '[
        {"subject_id": "e7777777-7777-7777-7777-777777777777", "subject_name": "Corporate Financial Strategy", "max_marks": 100, "marks_obtained": 98, "grade": "A+"}
    ]'::jsonb,
    98.00, 100.00, 98.00, 3.96, 'A+', 'Valedictorian nominee for business cohort.', '2025-06-15'
)
ON CONFLICT (examination_id, student_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 18. FEE STRUCTURES
-- ----------------------------------------------------------------------------
INSERT INTO public.fee_structures (
    id, course_id, course_name, academic_year, semester, tuition_fee, lab_fee, library_fee, exam_fee, total_amount
) VALUES
('9a111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Computer Science', '2025-2026', 3, 5000.00, 800.00, 400.00, 300.00, 6500.00),
('9a222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Information Technology', '2025-2026', 3, 4800.00, 700.00, 400.00, 300.00, 6200.00),
('9a333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'Electronics & Communication', '2025-2026', 3, 4900.00, 800.00, 400.00, 300.00, 6400.00),
('9a444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'Business Administration', '2025-2026', 3, 4600.00, 500.00, 400.00, 300.00, 5800.00),
('9a555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555555', 'Mechanical Engineering', '2025-2026', 3, 4900.00, 800.00, 400.00, 300.00, 6400.00)
ON CONFLICT (course_id, academic_year, semester) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 19. STUDENT FEES
-- ----------------------------------------------------------------------------
INSERT INTO public.student_fees (
    id, student_id, student_name, student_code, course_id, course_name, academic_year, semester,
    total_fee, discount, net_payable, paid_amount, balance_amount, due_date, status, payments
) VALUES
(
    '91111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Aarav Nair', 'STU001',
    'c1111111-1111-1111-1111-111111111111', 'Computer Science', '2025-2026', 3,
    6500.00, 500.00, 6000.00, 6000.00, 0.00, '2025-11-02', 'Paid', '[]'::jsonb
),
(
    '92222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'Diya Menon', 'STU002',
    'c2222222-2222-2222-2222-222222222222', 'Information Technology', '2025-2026', 3,
    6200.00, 0.00, 6200.00, 3200.00, 3000.00, '2025-11-02', 'Partial', '[]'::jsonb
),
(
    '93333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'Rohan Mathew', 'STU003',
    'c3333333-3333-3333-3333-333333333333', 'Electronics & Communication', '2025-2026', 3,
    6400.00, 0.00, 6400.00, 6400.00, 0.00, '2025-11-02', 'Paid', '[]'::jsonb
),
(
    '94444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', 'Sneha Thomas', 'STU004',
    'c4444444-4444-4444-4444-444444444444', 'Business Administration', '2025-2026', 3,
    5800.00, 800.00, 5000.00, 5000.00, 0.00, '2025-11-02', 'Paid', '[]'::jsonb
),
(
    '95555555-5555-5555-5555-555555555555', 'd5555555-5555-5555-5555-555555555555', 'Arjun Pillai', 'STU005',
    'c5555555-5555-5555-5555-555555555555', 'Mechanical Engineering', '2025-2026', 3,
    6400.00, 0.00, 6400.00, 0.00, 6400.00, '2025-11-02', 'Pending', '[]'::jsonb
)
ON CONFLICT (student_id, academic_year, semester) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 20. PAYMENTS (Receipts)
-- ----------------------------------------------------------------------------
INSERT INTO public.payments (
    id, student_fee_id, receipt_number, amount, payment_date, payment_method, notes, recorded_by
) VALUES
('99111111-1111-1111-1111-111111111111', '91111111-1111-1111-1111-111111111111', 'REC-2025-0814', 6000.00, '2025-08-14', 'Online Gateway', 'Full payment via wire transfer. Merit scholarship waiver accounted.', 'Accountant Finance Desk'),
('99222222-2222-2222-2222-222222222222', '92222222-2222-2222-2222-222222222222', 'REC-2025-0820', 3200.00, '2025-08-20', 'Bank Transfer', 'First installment cleared. Second installment due Nov 02.', 'Accountant Finance Desk'),
('99333333-3333-3333-3333-333333333333', '93333333-3333-3333-3333-333333333333', 'REC-2025-0819', 6400.00, '2025-08-19', 'Card', 'Annual terminal clearance completed.', 'Accountant Finance Desk'),
('99444444-4444-4444-4444-444444444444', '94444444-4444-4444-4444-444444444444', 'REC-2025-0815', 5000.00, '2025-08-15', 'Bank Transfer', 'Early payment discount honored.', 'Accountant Finance Desk')
ON CONFLICT (receipt_number) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 21. ACADEMIC EVENTS
-- ----------------------------------------------------------------------------
INSERT INTO public.academic_events (id, title, category, date, time, description, audience, color_accent, location) VALUES
('ee111111-1111-1111-1111-111111111111', 'Mid Term Exam', 'Exam', '2025-10-29', '09:30 AM', 'Comprehensive mid-term evaluations for 3rd semester undergraduate engineering cohorts.', 'Computer Science • Sem 3', 'sage', 'Amphitheatre 101'),
('ee222222-2222-2222-2222-222222222222', 'Parent Meeting', 'Meeting', '2025-10-31', '02:00 PM', 'Bi-annual parental and faculty academic consultative forum at the Aurelia Grand Hall.', 'All Departments', 'lavender', 'Aurelia Grand Hall'),
('ee333333-3333-3333-3333-333333333333', 'Fee Payment Due', 'Fee', '2025-11-02', '11:59 PM', 'Final deadline for Fall 2025 semester tuition balance settlement without late surcharge.', 'Academic Year 2025-26', 'sand', 'Bursar Online Portal'),
('ee444444-4444-4444-4444-444444444444', 'Guest Colloquium: Ethics in Generative AI', 'Lecture', '2025-11-08', '11:00 AM', 'Distinguished visiting professor talk on mathematical verifiability and societal alignment.', 'Computer Science & IT', 'forest', 'Deanery Auditorium'),
('ee555555-5555-5555-5555-555555555555', 'Annual Botanical & Science Fair', 'Workshop', '2025-11-14', '10:00 AM', 'Student engineering expositions held across the central quadrangle gardens.', 'Campus-wide', 'sage', 'Central Botanical Quad')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 22. NOTIFICATIONS
-- ----------------------------------------------------------------------------
INSERT INTO public.notifications (id, title, message, type, read, link) VALUES
('8a111111-1111-1111-1111-111111111111', 'Mid-Term Examinations Begin Tomorrow', 'Seating arrangements for Computer Science 3rd semester have been published.', 'info', false, '/examinations'),
('8a222222-2222-2222-2222-222222222222', 'Attendance Alert: 3 Students Below 75%', 'Attendance threshold warnings generated for mechanical engineering cohort.', 'warning', false, '/attendance'),
('8a333333-3333-3333-3333-333333333333', 'Fee Installment Received', 'Diya Menon (STU002) deposited payment receipt REC-2025-0820.', 'success', true, '/fees')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 23. AUDIT LOGS
-- ----------------------------------------------------------------------------
INSERT INTO public.audit_logs (id, user_name, action, entity_name, entity_id, details) VALUES
('0a111111-1111-1111-1111-111111111111', 'System Administrator', 'SYSTEM_INITIALIZE', 'institution_settings', '00000000-0000-0000-0000-000000000001', '{"action": "Bootstrap system database with Aurelia v2.0 schema and standard seed records"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
