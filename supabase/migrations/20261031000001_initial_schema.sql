-- ============================================================================
-- AURELIA STUDENT MANAGEMENT SYSTEM — MIGRATION 01: INITIAL SCHEMA
-- Description: Core tables, foreign keys, constraints, and indexes.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Institution Settings Table
CREATE TABLE IF NOT EXISTS public.institution_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_name VARCHAR(255) NOT NULL,
    tagline TEXT,
    email VARCHAR(150),
    phone VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    logo_url TEXT,
    current_academic_year VARCHAR(50) NOT NULL DEFAULT '2025-2026',
    current_term VARCHAR(50) NOT NULL DEFAULT 'Fall Term (Semester 3)',
    attendance_threshold NUMERIC(5,2) DEFAULT 75.00 CHECK (attendance_threshold BETWEEN 0 AND 100),
    grading_scale JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles (User Accounts & Roles linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 3. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    head_of_department VARCHAR(150),
    description TEXT,
    student_count INT DEFAULT 0 CHECK (student_count >= 0),
    course_count INT DEFAULT 0 CHECK (course_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Faculty Table
CREATE TABLE IF NOT EXISTS public.faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id VARCHAR(50) UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(50),
    designation VARCHAR(100),
    qualification VARCHAR(100),
    avatar_url TEXT,
    joining_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    department_name VARCHAR(150),
    duration_years INT NOT NULL DEFAULT 4 CHECK (duration_years > 0),
    total_semesters INT NOT NULL DEFAULT 8 CHECK (total_semesters > 0),
    credits INT NOT NULL DEFAULT 160 CHECK (credits > 0),
    faculty_coordinator VARCHAR(150),
    faculty_coordinator_id UUID REFERENCES public.faculty(id) ON DELETE SET NULL,
    enrolled_students INT DEFAULT 0 CHECK (enrolled_students >= 0),
    color_accent VARCHAR(20) DEFAULT 'sage' CHECK (color_accent IN ('sage', 'lavender', 'sand', 'forest')),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Archived')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Academic Years Table
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Academic Terms Table
CREATE TABLE IF NOT EXISTS public.academic_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    term_type VARCHAR(50) DEFAULT 'Semester',
    semester_number INT CHECK (semester_number BETWEEN 1 AND 12),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    course_name VARCHAR(150),
    semester INT NOT NULL CHECK (semester > 0),
    credits INT NOT NULL DEFAULT 4 CHECK (credits > 0),
    max_marks INT NOT NULL DEFAULT 100 CHECK (max_marks > 0),
    pass_marks INT NOT NULL DEFAULT 40 CHECK (pass_marks >= 0 AND pass_marks <= max_marks),
    faculty_name VARCHAR(150),
    faculty_id UUID REFERENCES public.faculty(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_course_subject_code UNIQUE (course_id, code)
);

-- 9. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(50),
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
    date_of_birth DATE,
    department_id UUID REFERENCES public.departments(id) ON DELETE RESTRICT,
    department_name VARCHAR(150),
    course_id UUID REFERENCES public.courses(id) ON DELETE RESTRICT,
    course_name VARCHAR(150),
    academic_year VARCHAR(50) NOT NULL DEFAULT '2025-2026',
    semester INT NOT NULL DEFAULT 1 CHECK (semester > 0),
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Graduated', 'Suspended')),
    avatar_url TEXT,
    address TEXT,
    blood_group VARCHAR(10),
    attendance_rate NUMERIC(5,2) DEFAULT 100.00 CHECK (attendance_rate BETWEEN 0 AND 100),
    gpa NUMERIC(4,2) DEFAULT 0.00 CHECK (gpa BETWEEN 0 AND 4.00),
    guardian JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Guardians Table (Normalized table)
CREATE TABLE IF NOT EXISTS public.guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    relation VARCHAR(50) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    occupation VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Student Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    academic_year VARCHAR(50) NOT NULL,
    semester INT NOT NULL CHECK (semester > 0),
    status VARCHAR(30) DEFAULT 'Enrolled' CHECK (status IN ('Enrolled', 'Completed', 'Dropped')),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_course_year UNIQUE (student_id, course_id, academic_year, semester)
);

-- 12. Faculty Subject Assignments Table
CREATE TABLE IF NOT EXISTS public.faculty_subject_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    academic_year VARCHAR(50) NOT NULL,
    semester INT NOT NULL CHECK (semester > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_faculty_subject_term UNIQUE (faculty_id, subject_id, academic_year, semester)
);

-- 13. Class Sessions Table (Weekly Timetable)
CREATE TABLE IF NOT EXISTS public.class_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(50),
    faculty_id UUID REFERENCES public.faculty(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Attendance Records Table
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(200),
    student_code VARCHAR(50),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    course_name VARCHAR(150),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject_name VARCHAR(150),
    date DATE NOT NULL,
    session VARCHAR(20) NOT NULL DEFAULT 'Morning' CHECK (session IN ('Morning', 'Afternoon', 'Full Day')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Excused')),
    remarks TEXT,
    recorded_by VARCHAR(150),
    recorded_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_attendance_entry UNIQUE (student_id, date, session)
);

-- 15. Examinations Table
CREATE TABLE IF NOT EXISTS public.examinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    exam_type VARCHAR(50) DEFAULT 'Mid Term' CHECK (exam_type IN ('Mid Term', 'Final Exam', 'Quiz', 'Assignment', 'Practical', 'Unit Test')),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    course_name VARCHAR(150),
    academic_year VARCHAR(50) NOT NULL,
    semester INT NOT NULL CHECK (semester > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Results Published')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Examination Subjects Table
CREATE TABLE IF NOT EXISTS public.examination_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    examination_id UUID NOT NULL REFERENCES public.examinations(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    exam_date DATE,
    start_time TIME,
    duration_minutes INT DEFAULT 180 CHECK (duration_minutes > 0),
    max_marks NUMERIC(6,2) NOT NULL DEFAULT 100.00 CHECK (max_marks > 0),
    pass_marks NUMERIC(6,2) NOT NULL DEFAULT 40.00 CHECK (pass_marks >= 0 AND pass_marks <= max_marks),
    CONSTRAINT uq_exam_subject UNIQUE (examination_id, subject_id)
);

-- 17. Examination Results Table
CREATE TABLE IF NOT EXISTS public.examination_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    examination_id UUID NOT NULL REFERENCES public.examinations(id) ON DELETE CASCADE,
    examination_title VARCHAR(200),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(200),
    student_code VARCHAR(50),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    course_name VARCHAR(150),
    semester INT NOT NULL CHECK (semester > 0),
    subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_marks NUMERIC(7,2) NOT NULL DEFAULT 0.00 CHECK (total_marks >= 0),
    total_max_marks NUMERIC(7,2) NOT NULL DEFAULT 100.00 CHECK (total_max_marks > 0),
    percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (percentage BETWEEN 0 AND 100),
    gpa NUMERIC(4,2) NOT NULL DEFAULT 0.00 CHECK (gpa BETWEEN 0 AND 4.00),
    overall_grade VARCHAR(10) NOT NULL DEFAULT 'F',
    remarks TEXT,
    published_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_exam_student_result UNIQUE (examination_id, student_id)
);

-- 18. Fee Categories Table
CREATE TABLE IF NOT EXISTS public.fee_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Fee Structures Table
CREATE TABLE IF NOT EXISTS public.fee_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    course_name VARCHAR(150),
    academic_year VARCHAR(50) NOT NULL,
    semester INT NOT NULL CHECK (semester > 0),
    tuition_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (tuition_fee >= 0),
    lab_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (lab_fee >= 0),
    library_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (library_fee >= 0),
    exam_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (exam_fee >= 0),
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_course_fee_term UNIQUE (course_id, academic_year, semester)
);

-- 20. Student Fees Table
CREATE TABLE IF NOT EXISTS public.student_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(200),
    student_code VARCHAR(50),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    course_name VARCHAR(150),
    academic_year VARCHAR(50) NOT NULL,
    semester INT NOT NULL CHECK (semester > 0),
    total_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (total_fee >= 0),
    discount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    net_payable NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (net_payable >= 0),
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    balance_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (balance_amount >= 0),
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Paid', 'Partial', 'Pending', 'Overdue')),
    payments JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_fee_sem UNIQUE (student_id, academic_year, semester)
);

-- 21. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_fee_id UUID NOT NULL REFERENCES public.student_fees(id) ON DELETE CASCADE,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('Cash', 'Card', 'Bank Transfer', 'Online Gateway')),
    notes TEXT,
    recorded_by VARCHAR(150),
    recorded_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Academic Events Table
CREATE TABLE IF NOT EXISTS public.academic_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Exam', 'Meeting', 'Fee', 'Holiday', 'Lecture', 'Workshop')),
    date DATE NOT NULL,
    time VARCHAR(50),
    description TEXT,
    audience VARCHAR(100) NOT NULL DEFAULT 'Campus-wide',
    color_accent VARCHAR(20) DEFAULT 'sage' CHECK (color_accent IN ('sage', 'lavender', 'sand', 'forest')),
    location VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'alert')),
    read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name VARCHAR(150),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PERFORMANCE & FILTER INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_departments_code ON public.departments(code);

CREATE INDEX IF NOT EXISTS idx_faculty_department ON public.faculty(department_id);
CREATE INDEX IF NOT EXISTS idx_faculty_email ON public.faculty(email);

CREATE INDEX IF NOT EXISTS idx_courses_department ON public.courses(department_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);

CREATE INDEX IF NOT EXISTS idx_subjects_course ON public.subjects(course_id);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON public.subjects(semester);

CREATE INDEX IF NOT EXISTS idx_students_dept ON public.students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_course ON public.students(course_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON public.students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);
CREATE INDEX IF NOT EXISTS idx_students_attendance_rate ON public.students(attendance_rate);

CREATE INDEX IF NOT EXISTS idx_guardians_student ON public.guardians(student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course ON public.attendance_records(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance_records(status);

CREATE INDEX IF NOT EXISTS idx_examinations_course ON public.examinations(course_id);
CREATE INDEX IF NOT EXISTS idx_examinations_status ON public.examinations(status);

CREATE INDEX IF NOT EXISTS idx_exam_results_exam ON public.examination_results(examination_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON public.examination_results(student_id);

CREATE INDEX IF NOT EXISTS idx_student_fees_student ON public.student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_status ON public.student_fees(status);
CREATE INDEX IF NOT EXISTS idx_student_fees_due_date ON public.student_fees(due_date);

CREATE INDEX IF NOT EXISTS idx_payments_student_fee ON public.payments(student_fee_id);
CREATE INDEX IF NOT EXISTS idx_payments_receipt ON public.payments(receipt_number);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);

CREATE INDEX IF NOT EXISTS idx_events_date ON public.academic_events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.academic_events(category);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
