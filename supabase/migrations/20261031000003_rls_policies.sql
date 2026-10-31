-- ============================================================================
-- AURELIA STUDENT MANAGEMENT SYSTEM — MIGRATION 03: ROW LEVEL SECURITY POLICIES
-- Description: Non-recursive, granular role-based access control policies
--              covering Admin, Teacher, Accountant, and Staff roles.
-- ============================================================================

-- 1. Enable RLS on all tables
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

-- ----------------------------------------------------------------------------
-- 2. Institution Settings Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Settings readable by everyone" ON public.institution_settings;
CREATE POLICY "Settings readable by everyone" ON public.institution_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Settings modifiable by Admins only" ON public.institution_settings;
CREATE POLICY "Settings modifiable by Admins only" ON public.institution_settings
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. Profiles Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can insert any profile" ON public.profiles;
CREATE POLICY "Admins can insert any profile" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin() OR auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can update own profile without role escalation" ON public.profiles;
CREATE POLICY "Users can update own profile without role escalation" ON public.profiles
    FOR UPDATE TO authenticated
    USING (public.is_admin() OR auth.uid() = auth_user_id)
    WITH CHECK (
        public.is_admin() OR 
        (auth.uid() = auth_user_id AND role = (SELECT p.role FROM public.profiles p WHERE p.id = profiles.id))
    );

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" ON public.profiles
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. Departments & Faculty Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Departments readable by everyone" ON public.departments;
CREATE POLICY "Departments readable by everyone" ON public.departments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Departments manageable by Admins only" ON public.departments;
CREATE POLICY "Departments manageable by Admins only" ON public.departments
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Faculty readable by authenticated users" ON public.faculty;
CREATE POLICY "Faculty readable by authenticated users" ON public.faculty
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Faculty manageable by Admins only" ON public.faculty;
CREATE POLICY "Faculty manageable by Admins only" ON public.faculty
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. Courses, Academic Years, Terms, and Subjects Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Courses readable by everyone" ON public.courses;
CREATE POLICY "Courses readable by everyone" ON public.courses
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Courses manageable by Admins only" ON public.courses;
CREATE POLICY "Courses manageable by Admins only" ON public.courses
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Academic periods readable by authenticated users" ON public.academic_years;
CREATE POLICY "Academic periods readable by authenticated users" ON public.academic_years
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Academic periods manageable by Admins only" ON public.academic_years;
CREATE POLICY "Academic periods manageable by Admins only" ON public.academic_years
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Terms readable by authenticated users" ON public.academic_terms;
CREATE POLICY "Terms readable by authenticated users" ON public.academic_terms
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Terms manageable by Admins only" ON public.academic_terms;
CREATE POLICY "Terms manageable by Admins only" ON public.academic_terms
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Subjects readable by authenticated users" ON public.subjects;
CREATE POLICY "Subjects readable by authenticated users" ON public.subjects
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Subjects manageable by Admin and Teacher" ON public.subjects;
CREATE POLICY "Subjects manageable by Admin and Teacher" ON public.subjects
    FOR ALL TO authenticated
    USING (public.is_teacher())
    WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Timetable readable by authenticated users" ON public.class_sessions;
CREATE POLICY "Timetable readable by authenticated users" ON public.class_sessions
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Timetable manageable by Admin and Teacher" ON public.class_sessions;
CREATE POLICY "Timetable manageable by Admin and Teacher" ON public.class_sessions
    FOR ALL TO authenticated
    USING (public.is_teacher())
    WITH CHECK (public.is_teacher());

-- ----------------------------------------------------------------------------
-- 6. Students & Guardians Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students readable by staff members" ON public.students;
CREATE POLICY "Students readable by staff members" ON public.students
    FOR SELECT TO authenticated
    USING (public.is_staff());

DROP POLICY IF EXISTS "Students creatable by Admin and Staff" ON public.students;
CREATE POLICY "Students creatable by Admin and Staff" ON public.students
    FOR INSERT TO authenticated
    WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Students updatable by Admin, Staff, and Teachers" ON public.students;
CREATE POLICY "Students updatable by Admin, Staff, and Teachers" ON public.students
    FOR UPDATE TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Students deletable by Admin only" ON public.students;
CREATE POLICY "Students deletable by Admin only" ON public.students
    FOR DELETE TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Guardians readable by staff" ON public.guardians;
CREATE POLICY "Guardians readable by staff" ON public.guardians
    FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Guardians manageable by Admin and Staff" ON public.guardians;
CREATE POLICY "Guardians manageable by Admin and Staff" ON public.guardians
    FOR ALL TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Enrollments readable by staff" ON public.enrollments;
CREATE POLICY "Enrollments readable by staff" ON public.enrollments
    FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Enrollments manageable by Admin only" ON public.enrollments;
CREATE POLICY "Enrollments manageable by Admin only" ON public.enrollments
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Faculty assignments viewable" ON public.faculty_subject_assignments;
CREATE POLICY "Faculty assignments viewable" ON public.faculty_subject_assignments
    FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Faculty assignments manageable by Admin only" ON public.faculty_subject_assignments;
CREATE POLICY "Faculty assignments manageable by Admin only" ON public.faculty_subject_assignments
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. Attendance Records Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Attendance records viewable by staff" ON public.attendance_records;
CREATE POLICY "Attendance records viewable by staff" ON public.attendance_records
    FOR SELECT TO authenticated
    USING (public.is_staff());

DROP POLICY IF EXISTS "Attendance records creatable by Admin and Teacher" ON public.attendance_records;
CREATE POLICY "Attendance records creatable by Admin and Teacher" ON public.attendance_records
    FOR INSERT TO authenticated
    WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Attendance records updatable by Admin and Teacher" ON public.attendance_records;
CREATE POLICY "Attendance records updatable by Admin and Teacher" ON public.attendance_records
    FOR UPDATE TO authenticated
    USING (public.is_teacher())
    WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Attendance records deletable by Admin only" ON public.attendance_records;
CREATE POLICY "Attendance records deletable by Admin only" ON public.attendance_records
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. Examinations & Results Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Examinations viewable by staff" ON public.examinations;
CREATE POLICY "Examinations viewable by staff" ON public.examinations
    FOR SELECT TO authenticated
    USING (public.is_staff());

DROP POLICY IF EXISTS "Examinations manageable by Admin and Teacher" ON public.examinations;
CREATE POLICY "Examinations manageable by Admin and Teacher" ON public.examinations
    FOR ALL TO authenticated
    USING (public.is_teacher())
    WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Exam subjects viewable by staff" ON public.examination_subjects;
CREATE POLICY "Exam subjects viewable by staff" ON public.examination_subjects
    FOR SELECT TO authenticated
    USING (public.is_staff());

DROP POLICY IF EXISTS "Exam subjects manageable by Admin and Teacher" ON public.examination_subjects;
CREATE POLICY "Exam subjects manageable by Admin and Teacher" ON public.examination_subjects
    FOR ALL TO authenticated
    USING (public.is_teacher())
    WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Exam results viewable by staff" ON public.examination_results;
CREATE POLICY "Exam results viewable by staff" ON public.examination_results
    FOR SELECT TO authenticated
    USING (public.is_staff());

DROP POLICY IF EXISTS "Exam results insertable by Admin and Teacher" ON public.examination_results;
CREATE POLICY "Exam results insertable by Admin and Teacher" ON public.examination_results
    FOR INSERT TO authenticated
    WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Exam results updatable by Admin and Teacher" ON public.examination_results;
CREATE POLICY "Exam results updatable by Admin and Teacher" ON public.examination_results
    FOR UPDATE TO authenticated
    USING (public.is_teacher())
    WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Exam results deletable by Admin only" ON public.examination_results;
CREATE POLICY "Exam results deletable by Admin only" ON public.examination_results
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 9. Fees & Payments Policies (Restricted from Teachers)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Fee categories viewable by staff" ON public.fee_categories;
CREATE POLICY "Fee categories viewable by staff" ON public.fee_categories
    FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Fee categories manageable by Admin and Accountant" ON public.fee_categories;
CREATE POLICY "Fee categories manageable by Admin and Accountant" ON public.fee_categories
    FOR ALL TO authenticated
    USING (public.is_accountant())
    WITH CHECK (public.is_accountant());

DROP POLICY IF EXISTS "Fee structures viewable by staff" ON public.fee_structures;
CREATE POLICY "Fee structures viewable by staff" ON public.fee_structures
    FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Fee structures manageable by Admin and Accountant" ON public.fee_structures;
CREATE POLICY "Fee structures manageable by Admin and Accountant" ON public.fee_structures
    FOR ALL TO authenticated
    USING (public.is_accountant())
    WITH CHECK (public.is_accountant());

DROP POLICY IF EXISTS "Student fees viewable by staff" ON public.student_fees;
CREATE POLICY "Student fees viewable by staff" ON public.student_fees
    FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Student fees manageable by Admin and Accountant" ON public.student_fees;
CREATE POLICY "Student fees manageable by Admin and Accountant" ON public.student_fees
    FOR ALL TO authenticated
    USING (public.is_accountant())
    WITH CHECK (public.is_accountant());

DROP POLICY IF EXISTS "Payments viewable by staff" ON public.payments;
CREATE POLICY "Payments viewable by staff" ON public.payments
    FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Payments creatable by Admin and Accountant" ON public.payments;
CREATE POLICY "Payments creatable by Admin and Accountant" ON public.payments
    FOR INSERT TO authenticated
    WITH CHECK (public.is_accountant());

DROP POLICY IF EXISTS "Payments updatable by Admin and Accountant" ON public.payments;
CREATE POLICY "Payments updatable by Admin and Accountant" ON public.payments
    FOR UPDATE TO authenticated
    USING (public.is_accountant())
    WITH CHECK (public.is_accountant());

DROP POLICY IF EXISTS "Payments deletable by Admin only" ON public.payments;
CREATE POLICY "Payments deletable by Admin only" ON public.payments
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 10. Academic Events & Notifications Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Academic events readable by everyone" ON public.academic_events;
CREATE POLICY "Academic events readable by everyone" ON public.academic_events
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Academic events manageable by Admin and Teachers" ON public.academic_events;
CREATE POLICY "Academic events manageable by Admin and Teachers" ON public.academic_events
    FOR ALL TO authenticated
    USING (public.is_teacher())
    WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Notifications viewable by target user or campus wide" ON public.notifications;
CREATE POLICY "Notifications viewable by target user or campus wide" ON public.notifications
    FOR SELECT TO authenticated
    USING (user_id IS NULL OR user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Notifications manageable by Admin or Creator" ON public.notifications;
CREATE POLICY "Notifications manageable by Admin or Creator" ON public.notifications
    FOR ALL TO authenticated
    USING (public.is_admin() OR user_id = auth.uid())
    WITH CHECK (public.is_admin() OR user_id = auth.uid() OR user_id IS NULL);

-- ----------------------------------------------------------------------------
-- 11. Audit Logs Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Audit logs viewable by Admins only" ON public.audit_logs;
CREATE POLICY "Audit logs viewable by Admins only" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Audit logs insertable by system and staff" ON public.audit_logs;
CREATE POLICY "Audit logs insertable by system and staff" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (public.is_staff());

