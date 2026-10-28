-- ============================================================
-- AURELIA STUDENT MANAGEMENT SYSTEM — POSTGRESQL & SUPABASE SCHEMA
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if re-running
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS academic_events CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS student_fees CASCADE;
DROP TABLE IF EXISTS fee_structures CASCADE;
DROP TABLE IF EXISTS examination_results CASCADE;
DROP TABLE IF EXISTS examination_subjects CASCADE;
DROP TABLE IF EXISTS examinations CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS class_sessions CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS guardians CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS institution_settings CASCADE;

-- 1. Institution Settings
CREATE TABLE institution_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_name VARCHAR(255) NOT NULL,
    tagline TEXT,
    email VARCHAR(150),
    phone VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    current_academic_year VARCHAR(50) NOT NULL DEFAULT '2025-2026',
    current_term VARCHAR(50) NOT NULL DEFAULT 'Fall Term',
    attendance_threshold NUMERIC(5,2) DEFAULT 75.00,
    grading_scale JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles (Users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'Staff' CHECK (role IN ('Admin', 'Teacher', 'Accountant', 'Staff')),
    department VARCHAR(100),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    head_of_department VARCHAR(150),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Faculty Members
CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(50),
    designation VARCHAR(100),
    qualification VARCHAR(100),
    joining_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Courses
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    duration_years INT NOT NULL DEFAULT 4,
    total_semesters INT NOT NULL DEFAULT 8,
    credits INT NOT NULL DEFAULT 160,
    faculty_coordinator VARCHAR(150),
    color_accent VARCHAR(20) DEFAULT 'sage',
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Archived')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Subjects
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    semester INT NOT NULL CHECK (semester > 0),
    credits INT NOT NULL DEFAULT 4,
    max_marks INT NOT NULL DEFAULT 100,
    faculty_name VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_course_subject_code UNIQUE (course_id, code)
);

-- 7. Students
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(50),
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
    date_of_birth DATE,
    department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
    department_name VARCHAR(150),
    course_id UUID REFERENCES courses(id) ON DELETE RESTRICT,
    course_name VARCHAR(150),
    academic_year VARCHAR(50) NOT NULL DEFAULT '2025-2026',
    semester INT NOT NULL DEFAULT 1,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Graduated', 'Suspended')),
    avatar_url TEXT,
    address TEXT,
    blood_group VARCHAR(10),
    attendance_rate NUMERIC(5,2) DEFAULT 100.00,
    gpa NUMERIC(4,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Guardians
CREATE TABLE guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    relation VARCHAR(50) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    occupation VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Enrollments
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    academic_year VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    status VARCHAR(30) DEFAULT 'Enrolled' CHECK (status IN ('Enrolled', 'Completed', 'Dropped')),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_course_year UNIQUE (student_id, course_id, academic_year, semester)
);

-- 10. Class Sessions & Timetables
CREATE TABLE class_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(50),
    faculty_id UUID REFERENCES faculty(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Attendance Records
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    session VARCHAR(20) NOT NULL DEFAULT 'Morning' CHECK (session IN ('Morning', 'Afternoon', 'Full Day')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Excused')),
    remarks TEXT,
    recorded_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_attendance_entry UNIQUE (student_id, date, session)
);

-- 12. Examinations
CREATE TABLE examinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    academic_year VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Results Published')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Examination Subjects
CREATE TABLE examination_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    examination_id UUID NOT NULL REFERENCES examinations(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    exam_date DATE,
    start_time TIME,
    duration_minutes INT DEFAULT 180,
    max_marks INT NOT NULL DEFAULT 100,
    pass_marks INT NOT NULL DEFAULT 40,
    CONSTRAINT uq_exam_subject UNIQUE (examination_id, subject_id)
);

-- 14. Examination Results
CREATE TABLE examination_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    examination_id UUID NOT NULL REFERENCES examinations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subjects_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_marks NUMERIC(7,2) NOT NULL DEFAULT 0.00,
    total_max_marks NUMERIC(7,2) NOT NULL DEFAULT 100.00,
    percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    gpa NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    overall_grade VARCHAR(10) NOT NULL DEFAULT 'F',
    remarks TEXT,
    published_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_exam_student_result UNIQUE (examination_id, student_id)
);

-- 15. Fee Structures
CREATE TABLE fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    academic_year VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    tuition_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    lab_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    library_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    exam_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Student Fees
CREATE TABLE student_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    academic_year VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    total_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    net_payable NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    balance_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Paid', 'Partial', 'Pending', 'Overdue')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_fee_sem UNIQUE (student_id, academic_year, semester)
);

-- 17. Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_fee_id UUID NOT NULL REFERENCES student_fees(id) ON DELETE CASCADE,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('Cash', 'Card', 'Bank Transfer', 'Online Gateway')),
    notes TEXT,
    recorded_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Academic Events
CREATE TABLE academic_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Exam', 'Meeting', 'Fee', 'Holiday', 'Lecture', 'Workshop')),
    date DATE NOT NULL,
    time VARCHAR(50),
    description TEXT,
    audience VARCHAR(100) NOT NULL DEFAULT 'Campus-wide',
    color_accent VARCHAR(20) DEFAULT 'sage',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'alert')),
    read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    user_name VARCHAR(150),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR HIGH-EFFICIENCY LOOKUPS & REPORTING
-- ============================================================
CREATE INDEX idx_students_dept ON students(department_id);
CREATE INDEX idx_students_course ON students(course_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_attendance_date ON attendance_records(date);
CREATE INDEX idx_attendance_student ON attendance_records(student_id);
CREATE INDEX idx_student_fees_status ON student_fees(status);
CREATE INDEX idx_exam_results_student ON examination_results(student_id);
CREATE INDEX idx_events_date ON academic_events(date);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE examination_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated and anon users for read-only queries
CREATE POLICY "Public Read Access for General Catalog" ON departments FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Events" ON academic_events FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read on students" ON students FOR SELECT USING (true);
CREATE POLICY "Allow authenticated modifications on students" ON students FOR ALL USING (true);
CREATE POLICY "Allow authenticated read on attendance" ON attendance_records FOR SELECT USING (true);
CREATE POLICY "Allow authenticated modifications on attendance" ON attendance_records FOR ALL USING (true);
CREATE POLICY "Allow authenticated read on examinations" ON examinations FOR SELECT USING (true);
CREATE POLICY "Allow authenticated modifications on examinations" ON examinations FOR ALL USING (true);
CREATE POLICY "Allow authenticated read on results" ON examination_results FOR SELECT USING (true);
CREATE POLICY "Allow authenticated modifications on results" ON examination_results FOR ALL USING (true);
CREATE POLICY "Allow authenticated access on fees" ON student_fees FOR ALL USING (true);
CREATE POLICY "Allow authenticated access on payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow authenticated access on notifications" ON notifications FOR ALL USING (true);
