-- ============================================================================
-- AURELIA STUDENT MANAGEMENT SYSTEM — PRODUCTION DATABASE SCHEMA
-- Version: 2.0.0
-- Platform: Supabase PostgreSQL (PostgreSQL 15+)
-- Description: Complete production-ready database schema including tables,
--              constraints, foreign keys, triggers, RLS policies, and views.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. CORE INSTITUTION & USER TABLES
-- ----------------------------------------------------------------------------

-- Institution Global Settings
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

-- Profiles (Linked to auth.users for Supabase Auth and Role-Based Access Control)
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

-- Departments
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

-- Faculty Members
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

-- Degree Courses
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

-- Academic Years
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academic Terms (Semesters)
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

-- Curriculum Subjects
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

-- ----------------------------------------------------------------------------
-- 3. STUDENTS & GUARDIANS TABLES
-- ----------------------------------------------------------------------------

-- Students (Dossier records)
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

-- Normalized Guardians Table
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

-- Student Enrollments
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

-- Faculty Subject Assignments
CREATE TABLE IF NOT EXISTS public.faculty_subject_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    academic_year VARCHAR(50) NOT NULL,
    semester INT NOT NULL CHECK (semester > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_faculty_subject_term UNIQUE (faculty_id, subject_id, academic_year, semester)
);

-- Class Sessions (Weekly Timetable)
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

-- ----------------------------------------------------------------------------
-- 4. ATTENDANCE MODULE
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 5. EXAMINATIONS & EVALUATIONS MODULE
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 6. FEES & PAYMENTS MODULE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fee_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- ----------------------------------------------------------------------------
-- 7. ACADEMIC EVENTS, NOTIFICATIONS & AUDIT
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 8. INDEXES FOR QUERIES & FILTERING
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 9. FUNCTIONS & AUTOMATED TRIGGERS
-- ----------------------------------------------------------------------------

-- Updated-At Timestamp Trigger Function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach Updated-At Triggers
DO $$
BEGIN
    CREATE TRIGGER trg_institution_settings_updated_at BEFORE UPDATE ON public.institution_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    CREATE TRIGGER trg_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    CREATE TRIGGER trg_faculty_updated_at BEFORE UPDATE ON public.faculty FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    CREATE TRIGGER trg_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    CREATE TRIGGER trg_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    CREATE TRIGGER trg_guardians_updated_at BEFORE UPDATE ON public.guardians FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    CREATE TRIGGER trg_attendance_records_updated_at BEFORE UPDATE ON public.attendance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    CREATE TRIGGER trg_examinations_updated_at BEFORE UPDATE ON public.examinations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    CREATE TRIGGER trg_examination_results_updated_at BEFORE UPDATE ON public.examination_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    CREATE TRIGGER trg_fee_structures_updated_at BEFORE UPDATE ON public.fee_structures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    CREATE TRIGGER trg_student_fees_updated_at BEFORE UPDATE ON public.student_fees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    CREATE TRIGGER trg_academic_events_updated_at BEFORE UPDATE ON public.academic_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Role Identification Helper (Security Definer with isolated search_path)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
DECLARE
    v_role VARCHAR;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN 'Admin';
    END IF;

    SELECT role INTO v_role
    FROM public.profiles
    WHERE auth_user_id = auth.uid() OR id = auth.uid()
    LIMIT 1;

    RETURN COALESCE(v_role, 'Staff');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Role verification utilities
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        (auth.jwt() ->> 'role') = 'service_role' OR
        public.get_current_user_role() = 'Admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        public.is_admin() OR
        public.get_current_user_role() = 'Teacher'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_accountant()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        public.is_admin() OR
        public.get_current_user_role() = 'Accountant'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.uid() IS NOT NULL AND
        public.get_current_user_role() IN ('Admin', 'Teacher', 'Accountant', 'Staff')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Supabase Auth Signup Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name VARCHAR(150);
    v_role VARCHAR(50);
BEGIN
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'Staff');
    IF v_role NOT IN ('Admin', 'Teacher', 'Accountant', 'Staff') THEN
        v_role := 'Staff';
    END IF;

    INSERT INTO public.profiles (
        id,
        auth_user_id,
        email,
        full_name,
        role,
        avatar_url
    ) VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        v_full_name,
        v_role,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (email) DO UPDATE
    SET auth_user_id = EXCLUDED.auth_user_id,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
EXCEPTION WHEN insufficient_privilege THEN
    NULL;
END $$;

-- Student Fee Balance Calculation Trigger
CREATE OR REPLACE FUNCTION public.sync_student_fee_payment()
RETURNS TRIGGER AS $$
DECLARE
    target_fee_id UUID;
    total_paid NUMERIC(10,2);
    net_amount NUMERIC(10,2);
    rem_balance NUMERIC(10,2);
    new_status VARCHAR(20);
    all_payments JSONB;
BEGIN
    target_fee_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.student_fee_id ELSE NEW.student_fee_id END;

    SELECT COALESCE(SUM(amount), 0.00) INTO total_paid
    FROM public.payments
    WHERE student_fee_id = target_fee_id;

    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', p.id,
                'student_fee_id', p.student_fee_id,
                'receipt_number', p.receipt_number,
                'amount', p.amount,
                'payment_date', p.payment_date,
                'payment_method', p.payment_method,
                'notes', p.notes,
                'recorded_by', p.recorded_by
            ) ORDER BY p.payment_date DESC
        ), '[]'::jsonb
    ) INTO all_payments
    FROM public.payments p
    WHERE p.student_fee_id = target_fee_id;

    SELECT net_payable INTO net_amount
    FROM public.student_fees
    WHERE id = target_fee_id;

    IF net_amount IS NOT NULL THEN
        rem_balance := GREATEST(0.00, net_amount - total_paid);
        new_status := CASE 
            WHEN rem_balance = 0.00 THEN 'Paid'
            WHEN total_paid > 0.00 THEN 'Partial'
            ELSE 'Pending'
        END;

        UPDATE public.student_fees
        SET paid_amount = total_paid,
            balance_amount = rem_balance,
            status = new_status,
            payments = all_payments,
            updated_at = NOW()
        WHERE id = target_fee_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$
BEGIN
    DROP TRIGGER IF EXISTS trg_payment_sync_fee ON public.payments;
    CREATE TRIGGER trg_payment_sync_fee
        AFTER INSERT OR UPDATE OR DELETE ON public.payments
        FOR EACH ROW EXECUTE FUNCTION public.sync_student_fee_payment();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Student Attendance Percentage Sync Trigger
CREATE OR REPLACE FUNCTION public.sync_student_attendance_rate()
RETURNS TRIGGER AS $$
DECLARE
    target_student_id UUID;
    total_sessions INT;
    present_sessions INT;
    calculated_rate NUMERIC(5,2);
BEGIN
    target_student_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.student_id ELSE NEW.student_id END;

    SELECT COUNT(*),
           COUNT(*) FILTER (WHERE status IN ('Present', 'Late'))
    INTO total_sessions, present_sessions
    FROM public.attendance_records
    WHERE student_id = target_student_id;

    IF total_sessions > 0 THEN
        calculated_rate := ROUND((present_sessions::NUMERIC / total_sessions::NUMERIC) * 100.0, 1);
    ELSE
        calculated_rate := 100.00;
    END IF;

    UPDATE public.students
    SET attendance_rate = calculated_rate,
        updated_at = NOW()
    WHERE id = target_student_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$
BEGIN
    DROP TRIGGER IF EXISTS trg_attendance_sync_student ON public.attendance_records;
    CREATE TRIGGER trg_attendance_sync_student
        AFTER INSERT OR UPDATE OR DELETE ON public.attendance_records
        FOR EACH ROW EXECUTE FUNCTION public.sync_student_attendance_rate();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Student Guardian Sync Trigger
CREATE OR REPLACE FUNCTION public.sync_student_guardian()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.guardian IS NOT NULL AND (NEW.guardian->>'name') IS NOT NULL AND trim(NEW.guardian->>'name') != '' THEN
        INSERT INTO public.guardians (
            student_id,
            name,
            relation,
            phone,
            email,
            occupation
        ) VALUES (
            NEW.id,
            NEW.guardian->>'name',
            COALESCE(NEW.guardian->>'relation', 'Guardian'),
            COALESCE(NEW.guardian->>'phone', 'N/A'),
            NEW.guardian->>'email',
            NEW.guardian->>'occupation'
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$
BEGIN
    DROP TRIGGER IF EXISTS trg_student_sync_guardian ON public.students;
    CREATE TRIGGER trg_student_sync_guardian
        AFTER INSERT OR UPDATE OF guardian ON public.students
        FOR EACH ROW EXECUTE FUNCTION public.sync_student_guardian();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.institution_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examination_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examination_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Settings
DROP POLICY IF EXISTS "Settings readable by everyone" ON public.institution_settings;
CREATE POLICY "Settings readable by everyone" ON public.institution_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Settings modifiable by Admins only" ON public.institution_settings;
CREATE POLICY "Settings modifiable by Admins only" ON public.institution_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Profiles
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert any profile" ON public.profiles;
CREATE POLICY "Admins can insert any profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can update own profile without role escalation" ON public.profiles;
CREATE POLICY "Users can update own profile without role escalation" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin() OR auth.uid() = auth_user_id) WITH CHECK (public.is_admin() OR (auth.uid() = auth_user_id AND role = (SELECT p.role FROM public.profiles p WHERE p.id = profiles.id)));

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin());

-- Departments & Faculty
DROP POLICY IF EXISTS "Departments readable by everyone" ON public.departments;
CREATE POLICY "Departments readable by everyone" ON public.departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Departments manageable by Admins only" ON public.departments;
CREATE POLICY "Departments manageable by Admins only" ON public.departments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Faculty readable by authenticated users" ON public.faculty;
CREATE POLICY "Faculty readable by authenticated users" ON public.faculty FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Faculty manageable by Admins only" ON public.faculty;
CREATE POLICY "Faculty manageable by Admins only" ON public.faculty FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Courses, Academic Terms & Subjects
DROP POLICY IF EXISTS "Courses readable by everyone" ON public.courses;
CREATE POLICY "Courses readable by everyone" ON public.courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Courses manageable by Admins only" ON public.courses;
CREATE POLICY "Courses manageable by Admins only" ON public.courses FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Academic periods readable by authenticated users" ON public.academic_years;
CREATE POLICY "Academic periods readable by authenticated users" ON public.academic_years FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Academic periods manageable by Admins only" ON public.academic_years;
CREATE POLICY "Academic periods manageable by Admins only" ON public.academic_years FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Terms readable by authenticated users" ON public.academic_terms;
CREATE POLICY "Terms readable by authenticated users" ON public.academic_terms FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Terms manageable by Admins only" ON public.academic_terms;
CREATE POLICY "Terms manageable by Admins only" ON public.academic_terms FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Subjects readable by authenticated users" ON public.subjects;
CREATE POLICY "Subjects readable by authenticated users" ON public.subjects FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Subjects manageable by Admin and Teacher" ON public.subjects;
CREATE POLICY "Subjects manageable by Admin and Teacher" ON public.subjects FOR ALL TO authenticated USING (public.is_teacher()) WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Timetable readable by authenticated users" ON public.class_sessions;
CREATE POLICY "Timetable readable by authenticated users" ON public.class_sessions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Timetable manageable by Admin and Teacher" ON public.class_sessions;
CREATE POLICY "Timetable manageable by Admin and Teacher" ON public.class_sessions FOR ALL TO authenticated USING (public.is_teacher()) WITH CHECK (public.is_teacher());

-- Students & Guardians
DROP POLICY IF EXISTS "Students readable by staff members" ON public.students;
CREATE POLICY "Students readable by staff members" ON public.students FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Students creatable by Admin and Staff" ON public.students;
CREATE POLICY "Students creatable by Admin and Staff" ON public.students FOR INSERT TO authenticated WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Students updatable by Admin, Staff, and Teachers" ON public.students;
CREATE POLICY "Students updatable by Admin, Staff, and Teachers" ON public.students FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Students deletable by Admin only" ON public.students;
CREATE POLICY "Students deletable by Admin only" ON public.students FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Guardians readable by staff" ON public.guardians;
CREATE POLICY "Guardians readable by staff" ON public.guardians FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Guardians manageable by Admin and Staff" ON public.guardians;
CREATE POLICY "Guardians manageable by Admin and Staff" ON public.guardians FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Enrollments readable by staff" ON public.enrollments;
CREATE POLICY "Enrollments readable by staff" ON public.enrollments FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Enrollments manageable by Admin only" ON public.enrollments;
CREATE POLICY "Enrollments manageable by Admin only" ON public.enrollments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Faculty assignments viewable" ON public.faculty_subject_assignments;
CREATE POLICY "Faculty assignments viewable" ON public.faculty_subject_assignments FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Faculty assignments manageable by Admin only" ON public.faculty_subject_assignments;
CREATE POLICY "Faculty assignments manageable by Admin only" ON public.faculty_subject_assignments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Attendance
DROP POLICY IF EXISTS "Attendance records viewable by staff" ON public.attendance_records;
CREATE POLICY "Attendance records viewable by staff" ON public.attendance_records FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Attendance records creatable by Admin and Teacher" ON public.attendance_records;
CREATE POLICY "Attendance records creatable by Admin and Teacher" ON public.attendance_records FOR INSERT TO authenticated WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Attendance records updatable by Admin and Teacher" ON public.attendance_records;
CREATE POLICY "Attendance records updatable by Admin and Teacher" ON public.attendance_records FOR UPDATE TO authenticated USING (public.is_teacher()) WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Attendance records deletable by Admin only" ON public.attendance_records;
CREATE POLICY "Attendance records deletable by Admin only" ON public.attendance_records FOR DELETE TO authenticated USING (public.is_admin());

-- Examinations & Results
DROP POLICY IF EXISTS "Examinations viewable by staff" ON public.examinations;
CREATE POLICY "Examinations viewable by staff" ON public.examinations FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Examinations manageable by Admin and Teacher" ON public.examinations;
CREATE POLICY "Examinations manageable by Admin and Teacher" ON public.examinations FOR ALL TO authenticated USING (public.is_teacher()) WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Exam subjects viewable by staff" ON public.examination_subjects;
CREATE POLICY "Exam subjects viewable by staff" ON public.examination_subjects FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Exam subjects manageable by Admin and Teacher" ON public.examination_subjects;
CREATE POLICY "Exam subjects manageable by Admin and Teacher" ON public.examination_subjects FOR ALL TO authenticated USING (public.is_teacher()) WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Exam results viewable by staff" ON public.examination_results;
CREATE POLICY "Exam results viewable by staff" ON public.examination_results FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Exam results insertable by Admin and Teacher" ON public.examination_results;
CREATE POLICY "Exam results insertable by Admin and Teacher" ON public.examination_results FOR INSERT TO authenticated WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Exam results updatable by Admin and Teacher" ON public.examination_results;
CREATE POLICY "Exam results updatable by Admin and Teacher" ON public.examination_results FOR UPDATE TO authenticated USING (public.is_teacher()) WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Exam results deletable by Admin only" ON public.examination_results;
CREATE POLICY "Exam results deletable by Admin only" ON public.examination_results FOR DELETE TO authenticated USING (public.is_admin());

-- Fees & Payments (Accountant & Admin only)
DROP POLICY IF EXISTS "Fee categories viewable by staff" ON public.fee_categories;
CREATE POLICY "Fee categories viewable by staff" ON public.fee_categories FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Fee categories manageable by Admin and Accountant" ON public.fee_categories;
CREATE POLICY "Fee categories manageable by Admin and Accountant" ON public.fee_categories FOR ALL TO authenticated USING (public.is_accountant()) WITH CHECK (public.is_accountant());

DROP POLICY IF EXISTS "Fee structures viewable by staff" ON public.fee_structures;
CREATE POLICY "Fee structures viewable by staff" ON public.fee_structures FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Fee structures manageable by Admin and Accountant" ON public.fee_structures;
CREATE POLICY "Fee structures manageable by Admin and Accountant" ON public.fee_structures FOR ALL TO authenticated USING (public.is_accountant()) WITH CHECK (public.is_accountant());

DROP POLICY IF EXISTS "Student fees viewable by staff" ON public.student_fees;
CREATE POLICY "Student fees viewable by staff" ON public.student_fees FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Student fees manageable by Admin and Accountant" ON public.student_fees;
CREATE POLICY "Student fees manageable by Admin and Accountant" ON public.student_fees FOR ALL TO authenticated USING (public.is_accountant()) WITH CHECK (public.is_accountant());

DROP POLICY IF EXISTS "Payments viewable by staff" ON public.payments;
CREATE POLICY "Payments viewable by staff" ON public.payments FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Payments creatable by Admin and Accountant" ON public.payments;
CREATE POLICY "Payments creatable by Admin and Accountant" ON public.payments FOR INSERT TO authenticated WITH CHECK (public.is_accountant());

DROP POLICY IF EXISTS "Payments updatable by Admin and Accountant" ON public.payments;
CREATE POLICY "Payments updatable by Admin and Accountant" ON public.payments FOR UPDATE TO authenticated USING (public.is_accountant()) WITH CHECK (public.is_accountant());

DROP POLICY IF EXISTS "Payments deletable by Admin only" ON public.payments;
CREATE POLICY "Payments deletable by Admin only" ON public.payments FOR DELETE TO authenticated USING (public.is_admin());

-- Events, Notifications, and Audit Logs
DROP POLICY IF EXISTS "Academic events readable by everyone" ON public.academic_events;
CREATE POLICY "Academic events readable by everyone" ON public.academic_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Academic events manageable by Admin and Teachers" ON public.academic_events;
CREATE POLICY "Academic events manageable by Admin and Teachers" ON public.academic_events FOR ALL TO authenticated USING (public.is_teacher()) WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Notifications viewable by target user or campus wide" ON public.notifications;
CREATE POLICY "Notifications viewable by target user or campus wide" ON public.notifications FOR SELECT TO authenticated USING (user_id IS NULL OR user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Notifications manageable by Admin or Creator" ON public.notifications;
CREATE POLICY "Notifications manageable by Admin or Creator" ON public.notifications FOR ALL TO authenticated USING (public.is_admin() OR user_id = auth.uid()) WITH CHECK (public.is_admin() OR user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "Audit logs viewable by Admins only" ON public.audit_logs;
CREATE POLICY "Audit logs viewable by Admins only" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Audit logs insertable by system and staff" ON public.audit_logs;
CREATE POLICY "Audit logs insertable by system and staff" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_staff());

-- ----------------------------------------------------------------------------
-- 11. ANALYTICAL & REPORTING VIEWS
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.view_institution_stats AS
SELECT
    (SELECT COUNT(*) FROM public.students) AS total_students,
    (SELECT COUNT(*) FROM public.students WHERE status = 'Active') AS active_students,
    (SELECT COUNT(*) FROM public.faculty WHERE is_active = TRUE) AS total_faculty,
    (SELECT COUNT(*) FROM public.courses WHERE status = 'Active') AS active_courses,
    (SELECT COUNT(*) FROM public.departments) AS total_departments,
    (
        SELECT COALESCE(ROUND(AVG(attendance_rate), 1), 94.6)
        FROM public.students
        WHERE status = 'Active'
    ) AS average_attendance_rate,
    (
        SELECT COALESCE(SUM(net_payable), 0.00)
        FROM public.student_fees
    ) AS total_fees_billed,
    (
        SELECT COALESCE(SUM(paid_amount), 0.00)
        FROM public.student_fees
    ) AS total_fees_collected,
    (
        SELECT COALESCE(SUM(balance_amount), 0.00)
        FROM public.student_fees
    ) AS total_fees_outstanding;

CREATE OR REPLACE VIEW public.view_department_analytics AS
SELECT 
    d.id AS department_id,
    d.code AS department_code,
    d.name AS department_name,
    d.head_of_department,
    COUNT(DISTINCT c.id) AS active_courses_count,
    COUNT(DISTINCT s.id) AS enrolled_students_count,
    COALESCE(ROUND(AVG(s.gpa), 2), 0.00) AS average_gpa,
    COALESCE(ROUND(AVG(s.attendance_rate), 1), 0.0) AS average_attendance_rate
FROM public.departments d
LEFT JOIN public.courses c ON c.department_id = d.id AND c.status = 'Active'
LEFT JOIN public.students s ON s.department_id = d.id AND s.status = 'Active'
GROUP BY d.id, d.code, d.name, d.head_of_department;

CREATE OR REPLACE VIEW public.view_student_dossier_summary AS
SELECT 
    s.id AS student_uuid,
    s.student_id,
    s.full_name,
    s.email,
    s.phone,
    s.gender,
    s.date_of_birth,
    s.department_name,
    s.course_name,
    s.academic_year,
    s.semester,
    s.enrollment_date,
    s.status,
    s.attendance_rate,
    s.gpa,
    s.blood_group,
    s.avatar_url,
    f.total_fee,
    f.paid_amount AS fee_paid,
    f.balance_amount AS fee_balance,
    f.status AS fee_status,
    g.name AS guardian_name,
    g.phone AS guardian_phone,
    g.relation AS guardian_relation
FROM public.students s
LEFT JOIN public.student_fees f ON f.student_id = s.id AND f.academic_year = s.academic_year AND f.semester = s.semester
LEFT JOIN public.guardians g ON g.student_id = s.id;

CREATE OR REPLACE VIEW public.view_course_performance AS
SELECT 
    c.id AS course_id,
    c.code AS course_code,
    c.name AS course_name,
    c.department_name,
    c.duration_years,
    c.credits,
    c.faculty_coordinator,
    COUNT(DISTINCT s.id) AS current_enrolled_count,
    COALESCE(ROUND(AVG(r.percentage), 2), 0.00) AS average_exam_percentage,
    COALESCE(ROUND(AVG(r.gpa), 2), 0.00) AS average_course_gpa
FROM public.courses c
LEFT JOIN public.students s ON s.course_id = c.id AND s.status = 'Active'
LEFT JOIN public.examination_results r ON r.course_id = c.id
GROUP BY c.id, c.code, c.name, c.department_name, c.duration_years, c.credits, c.faculty_coordinator;

CREATE OR REPLACE VIEW public.view_monthly_attendance_trends AS
SELECT 
    TO_CHAR(date, 'Mon YYYY') AS month_label,
    DATE_TRUNC('month', date) AS month_date,
    COUNT(*) AS total_recorded_sessions,
    COUNT(*) FILTER (WHERE status = 'Present') AS present_count,
    COUNT(*) FILTER (WHERE status = 'Late') AS late_count,
    COUNT(*) FILTER (WHERE status = 'Absent') AS absent_count,
    COUNT(*) FILTER (WHERE status = 'Excused') AS excused_count,
    ROUND(
        (COUNT(*) FILTER (WHERE status IN ('Present', 'Late'))::NUMERIC / NULLIF(COUNT(*), 0)::NUMERIC) * 100.0,
        1
    ) AS attendance_rate_percentage
FROM public.attendance_records
GROUP BY DATE_TRUNC('month', date), TO_CHAR(date, 'Mon YYYY')
ORDER BY month_date ASC;

CREATE OR REPLACE VIEW public.view_fee_collection_summary AS
SELECT 
    sf.academic_year,
    sf.semester,
    COUNT(*) AS total_fee_records,
    SUM(sf.total_fee) AS gross_billed,
    SUM(sf.discount) AS total_scholarship_waivers,
    SUM(sf.net_payable) AS net_billed,
    SUM(sf.paid_amount) AS total_settled,
    SUM(sf.balance_amount) AS total_arrears,
    ROUND((SUM(sf.paid_amount) / NULLIF(SUM(sf.net_payable), 0)) * 100.0, 1) AS collection_efficiency_percentage
FROM public.student_fees sf
GROUP BY sf.academic_year, sf.semester;
