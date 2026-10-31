-- ============================================================================
-- AURELIA STUDENT MANAGEMENT SYSTEM — MIGRATION 04: REPORTING & ANALYTIC VIEWS
-- Description: Optimized database views for academic performance, attendance,
--              department-wise cohorts, and financial collections.
-- ============================================================================

-- 1. High-Level Institutional Executive Summary View
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

-- 2. Departmental Analytical Breakdown
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

-- 3. Comprehensive Scholar Dossier Summary View
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

-- 4. Course Performance and Cohort Metrics
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

-- 5. Monthly Attendance Aggregation
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

-- 6. Fee Collection Overview View
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

