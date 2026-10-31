-- ============================================================================
-- AURELIA — UNLOCK ANON READ/WRITE ACCESS & RLS ROLE RESOLUTION
-- Description: Updates get_current_user_role() and table policies so that
--              AURELIA frontend can read and mutate data using the Supabase API key
--              both when unauthenticated (Demo/Admin mode) and when authenticated.
-- ============================================================================

-- 1. Update Role Helper to permit Admin privileges for unauthenticated API requests
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
DECLARE
    v_role VARCHAR;
BEGIN
    -- When unauthenticated (using anon/publishable API key), grant Admin access for seamless operation
    IF auth.uid() IS NULL THEN
        RETURN 'Admin';
    END IF;

    -- When authenticated with Supabase Auth, enforce assigned profile role
    SELECT role INTO v_role
    FROM public.profiles
    WHERE auth_user_id = auth.uid() OR id = auth.uid()
    LIMIT 1;

    RETURN COALESCE(v_role, 'Staff');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper role checkers
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_current_user_role() = 'Admin';
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_current_user_role() IN ('Admin', 'Teacher');
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.is_accountant()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_current_user_role() IN ('Admin', 'Accountant');
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_current_user_role() IN ('Admin', 'Teacher', 'Accountant', 'Staff');
END;
$$ LANGUAGE plpgsql STABLE;

-- 2. Open SELECT on all application tables to everyone
DROP POLICY IF EXISTS "Settings readable by everyone" ON public.institution_settings;
CREATE POLICY "Settings readable by everyone" ON public.institution_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Departments readable by everyone" ON public.departments;
CREATE POLICY "Departments readable by everyone" ON public.departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Faculty readable by authenticated users" ON public.faculty;
DROP POLICY IF EXISTS "Faculty readable by everyone" ON public.faculty;
CREATE POLICY "Faculty readable by everyone" ON public.faculty FOR SELECT USING (true);

DROP POLICY IF EXISTS "Courses readable by everyone" ON public.courses;
CREATE POLICY "Courses readable by everyone" ON public.courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Academic periods readable by authenticated users" ON public.academic_years;
DROP POLICY IF EXISTS "Academic periods readable by everyone" ON public.academic_years;
CREATE POLICY "Academic periods readable by everyone" ON public.academic_years FOR SELECT USING (true);

DROP POLICY IF EXISTS "Terms readable by authenticated users" ON public.academic_terms;
DROP POLICY IF EXISTS "Terms readable by everyone" ON public.academic_terms;
CREATE POLICY "Terms readable by everyone" ON public.academic_terms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Subjects readable by authenticated users" ON public.subjects;
DROP POLICY IF EXISTS "Subjects readable by everyone" ON public.subjects;
CREATE POLICY "Subjects readable by everyone" ON public.subjects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Timetable readable by authenticated users" ON public.class_sessions;
DROP POLICY IF EXISTS "Timetable readable by everyone" ON public.class_sessions;
CREATE POLICY "Timetable readable by everyone" ON public.class_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students readable by staff members" ON public.students;
DROP POLICY IF EXISTS "Students readable by everyone" ON public.students;
CREATE POLICY "Students readable by everyone" ON public.students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Guardians readable by staff" ON public.guardians;
DROP POLICY IF EXISTS "Guardians readable by everyone" ON public.guardians;
CREATE POLICY "Guardians readable by everyone" ON public.guardians FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enrollments readable by staff" ON public.enrollments;
DROP POLICY IF EXISTS "Enrollments readable by everyone" ON public.enrollments;
CREATE POLICY "Enrollments readable by everyone" ON public.enrollments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Faculty assignments viewable" ON public.faculty_subject_assignments;
DROP POLICY IF EXISTS "Faculty assignments viewable by everyone" ON public.faculty_subject_assignments;
CREATE POLICY "Faculty assignments viewable by everyone" ON public.faculty_subject_assignments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Attendance records viewable by staff" ON public.attendance_records;
DROP POLICY IF EXISTS "Attendance records viewable by everyone" ON public.attendance_records;
CREATE POLICY "Attendance records viewable by everyone" ON public.attendance_records FOR SELECT USING (true);

DROP POLICY IF EXISTS "Examinations viewable by staff" ON public.examinations;
DROP POLICY IF EXISTS "Examinations viewable by everyone" ON public.examinations;
CREATE POLICY "Examinations viewable by everyone" ON public.examinations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Exam subjects viewable by staff" ON public.examination_subjects;
DROP POLICY IF EXISTS "Exam subjects viewable by everyone" ON public.examination_subjects;
CREATE POLICY "Exam subjects viewable by everyone" ON public.examination_subjects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Exam results viewable by staff" ON public.examination_results;
DROP POLICY IF EXISTS "Exam results viewable by everyone" ON public.examination_results;
CREATE POLICY "Exam results viewable by everyone" ON public.examination_results FOR SELECT USING (true);

DROP POLICY IF EXISTS "Fee categories viewable by staff" ON public.fee_categories;
DROP POLICY IF EXISTS "Fee categories viewable by everyone" ON public.fee_categories;
CREATE POLICY "Fee categories viewable by everyone" ON public.fee_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Fee structures viewable by staff" ON public.fee_structures;
DROP POLICY IF EXISTS "Fee structures viewable by everyone" ON public.fee_structures;
CREATE POLICY "Fee structures viewable by everyone" ON public.fee_structures FOR SELECT USING (true);

DROP POLICY IF EXISTS "Student fees viewable by staff" ON public.student_fees;
DROP POLICY IF EXISTS "Student fees viewable by everyone" ON public.student_fees;
CREATE POLICY "Student fees viewable by everyone" ON public.student_fees FOR SELECT USING (true);

DROP POLICY IF EXISTS "Payments viewable by staff" ON public.payments;
DROP POLICY IF EXISTS "Payments viewable by everyone" ON public.payments;
CREATE POLICY "Payments viewable by everyone" ON public.payments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Academic events readable by everyone" ON public.academic_events;
CREATE POLICY "Academic events readable by everyone" ON public.academic_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Notifications viewable by target user or campus wide" ON public.notifications;
DROP POLICY IF EXISTS "Notifications viewable by everyone" ON public.notifications;
CREATE POLICY "Notifications viewable by everyone" ON public.notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Audit logs viewable by Admins only" ON public.audit_logs;
DROP POLICY IF EXISTS "Audit logs viewable by everyone" ON public.audit_logs;
CREATE POLICY "Audit logs viewable by everyone" ON public.audit_logs FOR SELECT USING (true);

-- 3. Update Mutation Policies to allow operations based on is_staff/is_admin (without restricting to authenticated role)
DROP POLICY IF EXISTS "Students creatable by Admin and Staff" ON public.students;
CREATE POLICY "Students creatable by Admin and Staff" ON public.students FOR INSERT WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Students updatable by Admin, Staff, and Teachers" ON public.students;
CREATE POLICY "Students updatable by Admin, Staff, and Teachers" ON public.students FOR UPDATE USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Students deletable by Admin only" ON public.students;
CREATE POLICY "Students deletable by Admin only" ON public.students FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Attendance records creatable by Admin and Teacher" ON public.attendance_records;
CREATE POLICY "Attendance records creatable by Admin and Teacher" ON public.attendance_records FOR INSERT WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Attendance records updatable by Admin and Teacher" ON public.attendance_records;
CREATE POLICY "Attendance records updatable by Admin and Teacher" ON public.attendance_records FOR UPDATE USING (public.is_teacher()) WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Attendance records deletable by Admin only" ON public.attendance_records;
CREATE POLICY "Attendance records deletable by Admin only" ON public.attendance_records FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Exam results insertable by Admin and Teacher" ON public.examination_results;
CREATE POLICY "Exam results insertable by Admin and Teacher" ON public.examination_results FOR INSERT WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Exam results updatable by Admin and Teacher" ON public.examination_results;
CREATE POLICY "Exam results updatable by Admin and Teacher" ON public.examination_results FOR UPDATE USING (public.is_teacher()) WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Exam results deletable by Admin only" ON public.examination_results;
CREATE POLICY "Exam results deletable by Admin only" ON public.examination_results FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Payments creatable by Admin and Accountant" ON public.payments;
CREATE POLICY "Payments creatable by Admin and Accountant" ON public.payments FOR INSERT WITH CHECK (public.is_accountant());

DROP POLICY IF EXISTS "Payments updatable by Admin and Accountant" ON public.payments;
CREATE POLICY "Payments updatable by Admin and Accountant" ON public.payments FOR UPDATE USING (public.is_accountant()) WITH CHECK (public.is_accountant());

DROP POLICY IF EXISTS "Payments deletable by Admin only" ON public.payments;
CREATE POLICY "Payments deletable by Admin only" ON public.payments FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Student fees manageable by Admin and Accountant" ON public.student_fees;
CREATE POLICY "Student fees manageable by Admin and Accountant" ON public.student_fees FOR ALL USING (public.is_accountant()) WITH CHECK (public.is_accountant());
