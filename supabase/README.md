# AURELIA — Production Supabase Database Documentation

Welcome to the **AURELIA** Student Management System database guide. This directory contains the complete, normalized, production-ready PostgreSQL database architecture designed specifically for AURELIA.

---

## Architecture Overview

AURELIA features a 24-table relational database engine running on Supabase PostgreSQL (PostgreSQL 15+). It matches all features, components, and data structures in the AURELIA application:

- **Entity Normalization:** Clear separation of concerns between Departments, Courses, Subjects, Students, Faculty, Guardians, Timetables, Attendance, Examinations, and Fees.
- **Dual-Engine Compatibility:** Supports both normalized relational queries and JSONB aggregations for instantaneous zero-latency frontend hydration.
- **Row Level Security (RLS):** Complete role-based access control (Admin, Teacher, Accountant, Staff) with zero recursive policy calls.
- **Automatic Calculation Triggers:** Real-time calculation of fee balances, payment aggregation, attendance rates, and guardian records upon data mutation.
- **Analytical Reporting Views:** 6 optimized SQL views powering executive dashboards and regulatory reporting.

---

## Directory Structure

```text
supabase/
├── schema.sql                         # Consolidated fresh-install script (Tables, Triggers, RLS, Views)
├── seed.sql                           # Comprehensive idempotent seed dataset
├── functions.sql                      # Standalone triggers, role helpers, and security functions
├── rls_policies.sql                   # Standalone Row Level Security policies
├── README.md                          # This documentation file
└── migrations/
    ├── 20261031000001_initial_schema.sql       # 24 core tables, constraints, foreign keys, indexes
    ├── 20261031000002_functions_triggers.sql   # Security definer helpers, sync triggers, updated_at
    ├── 20261031000003_rls_policies.sql         # Granular RLS policies for 4 roles
    └── 20261031000004_reporting_views.sql      # 6 analytical reporting & aggregation views
```

---

## Quick Setup Guide

### Method A: Single-Step Setup via Supabase SQL Editor (Recommended)

1. Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** in the left sidebar.
3. Open `supabase/schema.sql`, copy all contents, paste into the SQL Editor, and click **Run**.
4. Open `supabase/seed.sql`, copy all contents, paste into the SQL Editor, and click **Run**.
5. Your database is now fully initialized with all tables, constraints, triggers, security policies, and sample data.

### Method B: Ordered Migration Execution

If you prefer applying discrete migrations or using Supabase CLI:

```bash
# 1. Core tables, constraints, foreign keys, and indexes
supabase/migrations/20261031000001_initial_schema.sql

# 2. Automated triggers, role helpers, and fee/attendance synchronizers
supabase/migrations/20261031000002_functions_triggers.sql

# 3. Row Level Security policies
supabase/migrations/20261031000003_rls_policies.sql

# 4. Analytical reporting views
supabase/migrations/20261031000004_reporting_views.sql

# 5. Seed data (Idempotent, ON CONFLICT DO NOTHING)
supabase/seed.sql
```

---

## Connecting AURELIA to Supabase

### 1. Retrieve API Keys from Supabase
From your Supabase project dashboard:
- Go to **Project Settings** > **API**.
- Copy the **Project URL** (e.g., `https://xyzcompany.supabase.co`).
- Copy the `anon` `public` key.

### 2. Configure in AURELIA
You can connect AURELIA using either method:

#### Option A: In-App UI Configuration (Instant)
1. Start the application: `npm run dev`
2. Click **Settings** in the sidebar.
3. In the **Cloud Database** card, click **Connect Supabase**.
4. Paste your **Supabase URL** and **Anon Public Key**.
5. Click **Save & Connect**. The application will test connectivity, display an active status badge, and synchronize records.

#### Option B: Environment Variables
Create or edit `.env` in the project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Authentication & Role-Based Access Control

AURELIA integrates with Supabase Auth (`auth.users`) linked directly to `public.profiles`.

### User Roles

| Role | Responsibilities & Permissions |
| :--- | :--- |
| **Admin** | Full system read and write access across all entities, settings, faculty, courses, examinations, and financial ledgers. |
| **Teacher** | Can manage class sessions, record student attendance, and record/publish examination marks. Read access to student profiles, departments, and courses. No access to fee ledgers. |
| **Accountant** | Full financial ledger management: create fee structures, update student fees, and log payment receipts. Read access to students and courses. No access to marks or attendance recording. |
| **Staff** | Read-only access to academic timetables, events, departments, and course rosters for day-to-day administrative coordination. |

### Creating Test Users in Supabase

To create authenticated users for testing each role:

1. In Supabase Dashboard, go to **Authentication** > **Users**.
2. Click **Add User** > **Create User**.
3. Create users with the emails below (or your own emails):
   - Admin: `admin@aurelia.edu`
   - Teacher: `eleanor.vance@aurelia.edu`
   - Accountant: `accountant@aurelia.edu`
   - Staff: `staff@aurelia.edu`
4. The database trigger `public.handle_new_user()` will automatically create a matching record in `public.profiles`.
5. To explicitly verify or set their role in SQL:

```sql
UPDATE public.profiles
SET role = 'Admin'
WHERE email = 'admin@aurelia.edu';

UPDATE public.profiles
SET role = 'Teacher'
WHERE email = 'eleanor.vance@aurelia.edu';

UPDATE public.profiles
SET role = 'Accountant'
WHERE email = 'accountant@aurelia.edu';
```

---

## Automated Triggers & Calculations

The database includes intelligent procedural PL/pgSQL triggers:

1. **`sync_student_fee_payment` on `payments`**:
   - Executes after `INSERT`, `UPDATE`, or `DELETE`.
   - Computes total payments for the associated `student_fees` record.
   - Updates `paid_amount` and `balance_amount`.
   - Updates `status` automatically to `'Paid'`, `'Partial'`, or `'Pending'`.
   - Aggregates payment receipts into the `payments` JSONB column for high-speed client-side rendering.

2. **`sync_student_attendance_rate` on `attendance_records`**:
   - Executes after `INSERT`, `UPDATE`, or `DELETE`.
   - Recalculates student's cumulative attendance percentage based on `Present` and `Late` session counts vs total sessions.
   - Updates `students.attendance_rate` automatically.

3. **`sync_student_guardian` on `students`**:
   - Synchronizes embedded `guardian` JSON object from frontend forms into the normalized `public.guardians` table.

4. **`update_updated_at_column`**:
   - Ensures `updated_at` timestamps accurately reflect real-world modification times across all critical tables.

---

## Analytical Reporting Views

AURELIA provides 6 pre-built reporting views:

1. **`view_institution_overview`**: Aggregate active counts for students, faculty, courses, departments, average GPA, overall attendance rate, and total fees collected.
2. **`view_department_analytics`**: Department-level student distribution, faculty roster count, active courses, and average GPA.
3. **`view_student_dossier`**: Comprehensive single-row student record combining personal details, course info, fee status, and guardian contacts.
4. **`view_course_performance`**: Course-level enrolled headcount, average examination percentage, and course GPA.
5. **`view_monthly_attendance_trends`**: Monthly aggregation of total sessions, present, late, absent, excused counts, and net percentage.
6. **`view_fee_collection_summary`**: Gross billing, scholarship waivers, net fees, collections, arrears, and efficiency percentage.

Example query:
```sql
SELECT * FROM public.view_institution_overview;
```

---

## Safe Reset / Clean Re-seed

If you need to reset sample records in development without dropping your table schema:

```sql
TRUNCATE TABLE 
    public.payments,
    public.student_fees,
    public.fee_structures,
    public.examination_results,
    public.examination_subjects,
    public.examinations,
    public.attendance_records,
    public.class_sessions,
    public.faculty_subject_assignments,
    public.enrollments,
    public.guardians,
    public.students,
    public.subjects,
    public.courses,
    public.faculty,
    public.academic_terms,
    public.academic_years,
    public.departments,
    public.fee_categories,
    public.academic_events,
    public.notifications
RESTART IDENTITY CASCADE;

-- Then re-run supabase/seed.sql
```
