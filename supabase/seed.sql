-- ============================================================
-- AURELIA SEED SCRIPT FOR SUPABASE
-- ============================================================

INSERT INTO institution_settings (
  institution_name, tagline, email, phone, website, address, current_academic_year, current_term, attendance_threshold
) VALUES (
  'Aurelia Institute of Technology & Humanities',
  'Education is not just about learning. It''s about building a better tomorrow.',
  'admissions@aurelia.edu',
  '+1 (555) 789-2000',
  'https://aurelia.edu',
  '400 Chancellor Walk, Cambridge, MA 02138',
  '2025-2026',
  'Fall Term (Semester 3)',
  75.00
);

-- Seed Departments
INSERT INTO departments (id, code, name, head_of_department, description) VALUES
('b1111111-1111-1111-1111-111111111111', 'CS', 'Computer Science & Engineering', 'Dr. Eleanor Vance', 'Pioneering computation, artificial intelligence, and software craftsmanship with ethical foundations.'),
('b2222222-2222-2222-2222-222222222222', 'IT', 'Information Technology', 'Prof. Marcus Chen', 'Empowering future architects of enterprise networks, cloud systems, and data security.'),
('b3333333-3333-3333-3333-333333333333', 'ECE', 'Electronics & Communication', 'Dr. Sunita Raman', 'Bridging physical hardware, embedded intelligence, and next-generation signal transmission.'),
('b4444444-4444-4444-4444-444444444444', 'BA', 'Business Administration', 'Dean Arthur Pendelton', 'Nurturing visionary leaders, ethical managers, and global economic strategists.'),
('b5555555-5555-5555-5555-555555555555', 'ME', 'Mechanical Engineering', 'Prof. Henrik Lindqvist', 'Integrating sustainable thermodynamics, precision robotics, and green energy machines.');

-- Seed Courses
INSERT INTO courses (id, code, name, department_id, duration_years, total_semesters, credits, faculty_coordinator, color_accent, status, description) VALUES
('c1111111-1111-1111-1111-111111111111', 'CS-BTECH', 'Computer Science', 'b1111111-1111-1111-1111-111111111111', 4, 8, 160, 'Dr. Eleanor Vance', 'sage', 'Active', 'Core Bachelor of Technology in Computer Science and Engineering with AI specialization.'),
('c2222222-2222-2222-2222-222222222222', 'IT-BTECH', 'Information Technology', 'b2222222-2222-2222-2222-222222222222', 4, 8, 155, 'Prof. Marcus Chen', 'lavender', 'Active', 'Comprehensive software development, distributed systems, and cyber-defense systems.'),
('c3333333-3333-3333-3333-333333333333', 'ECE-BTECH', 'Electronics & Communication', 'b3333333-3333-3333-3333-333333333333', 4, 8, 158, 'Dr. Sunita Raman', 'sand', 'Active', 'VLSI design, embedded microcontrollers, and modern wireless telecommunication.'),
('c4444444-4444-4444-4444-444444444444', 'BBA-INT', 'Business Administration', 'b4444444-4444-4444-4444-444444444444', 3, 6, 120, 'Dean Arthur Pendelton', 'forest', 'Active', 'International business strategy, financial management, and organizational leadership.'),
('c5555555-5555-5555-5555-555555555555', 'ME-BTECH', 'Mechanical Engineering', 'b5555555-5555-5555-5555-555555555555', 4, 8, 162, 'Prof. Henrik Lindqvist', 'sage', 'Active', 'Advanced solid mechanics, robotic automation, and additive materials manufacturing.');

-- Seed Students
INSERT INTO students (id, student_id, first_name, last_name, full_name, email, phone, gender, date_of_birth, department_id, department_name, course_id, course_name, academic_year, semester, enrollment_date, status, avatar_url, attendance_rate, gpa, notes) VALUES
('d1111111-1111-1111-1111-111111111111', 'STU001', 'Aarav', 'Nair', 'Aarav Nair', 'aarav.nair@aurelia.edu', '+1 (555) 234-5678', 'Male', '2004-03-14', 'b1111111-1111-1111-1111-111111111111', 'Computer Science & Engineering', 'c1111111-1111-1111-1111-111111111111', 'Computer Science', '2025-2026', 3, '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80', 96.2, 3.88, 'Exhibits outstanding algorithmic aptitude; leading the campus competitive coding collective.'),
('d2222222-2222-2222-2222-222222222222', 'STU002', 'Diya', 'Menon', 'Diya Menon', 'diya.menon@aurelia.edu', '+1 (555) 345-6789', 'Female', '2004-07-22', 'b2222222-2222-2222-2222-222222222222', 'Information Technology', 'c2222222-2222-2222-2222-222222222222', 'Information Technology', '2025-2026', 3, '2023-08-16', 'Active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 94.8, 3.92, 'Co-founded the Open Education web initiative. Passionate about human-computer interaction.'),
('d3333333-3333-3333-3333-333333333333', 'STU003', 'Rohan', 'Mathew', 'Rohan Mathew', 'rohan.mathew@aurelia.edu', '+1 (555) 456-7890', 'Male', '2003-11-09', 'b3333333-3333-3333-3333-333333333333', 'Electronics & Communication', 'c3333333-3333-3333-3333-333333333333', 'Electronics & Communication', '2025-2026', 3, '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 91.5, 3.65, 'Specializing in satellite signal propagation and hardware acceleration research.'),
('d4444444-4444-4444-4444-444444444444', 'STU004', 'Sneha', 'Thomas', 'Sneha Thomas', 'sneha.thomas@aurelia.edu', '+1 (555) 567-8901', 'Female', '2004-01-18', 'b4444444-4444-4444-4444-444444444444', 'Business Administration', 'c4444444-4444-4444-4444-444444444444', 'Business Administration', '2025-2026', 3, '2023-08-18', 'Active', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', 98.0, 3.96, 'Elected Student Senate Treasurer; outstanding leadership in collegiate financial debate.'),
('d5555555-5555-5555-5555-555555555555', 'STU005', 'Arjun', 'Pillai', 'Arjun Pillai', 'arjun.pillai@aurelia.edu', '+1 (555) 678-9012', 'Male', '2003-09-30', 'b5555555-5555-5555-5555-555555555555', 'Mechanical Engineering', 'c5555555-5555-5555-5555-555555555555', 'Mechanical Engineering', '2025-2026', 3, '2023-08-15', 'Inactive', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', 68.4, 2.95, 'Medical leave approved for semester hiatus.');

-- Seed Academic Events
INSERT INTO academic_events (title, category, date, time, description, audience, color_accent) VALUES
('Mid Term Exam', 'Exam', '2025-10-29', '09:30 AM', 'Comprehensive mid-term evaluations for 3rd semester undergraduate cohorts.', 'Computer Science • Sem 3', 'sage'),
('Parent Meeting', 'Meeting', '2025-10-31', '02:00 PM', 'Bi-annual parental and faculty academic consultative forum.', 'All Departments', 'lavender'),
('Fee Payment Due', 'Fee', '2025-11-02', '11:59 PM', 'Final deadline for Fall 2025 semester tuition balance settlement.', 'Academic Year 2025-26', 'sand');

