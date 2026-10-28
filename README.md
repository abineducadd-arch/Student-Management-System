# AURELIA — Premium Student Management System

A production-quality Student Management System combining the elegance of an editorial magazine, the warmth of a botanical collegiate institution, and the usability of a high-performance modern web application.

---

## ✦ Visual Identity: Warm Porcelain & Botanical Editorial

- **Warm Porcelain (`#F4F0E8`)**: Dominant background creating a warm, paper-inspired reading atmosphere.
- **Forest Charcoal (`#263329`)**: Primary buttons, active navigation states, headings, and high-contrast accents.
- **Deep Ink (`#17221D`)**: High-legibility typography.
- **Sage Green (`#D9E2C6`)**, **Muted Lavender (`#DDD1EA`)**, **Warm Sand (`#E9D3B5`)**: Subtle category badges and accents.
- **Typography**:
  - *Cormorant Garamond*: Editorial serif headings, feature titles, and metrics.
  - *DM Sans*: Contemporary sans-serif for UI, forms, tables, and navigation.
  - *Caveat*: Delicate hand-drawn annotations ("Small steps Big dreams ✨", "Great minds grow here ✨").

---

## ✦ System Architecture & Features

### 1. Dashboard (Mockup-Identical)
- **Editorial Welcome Section**: Personalized greeting ("Good Morning, Abin"), hand-drawn annotations, and architectural campus clock tower illustration.
- **4 Live Metric Cards**: Total Students (1,284), Active Courses (24), Attendance Rate (94.6%), New Admissions (38) with real-time recalculation.
- **Featured Panel**: "Building Future Leaders" still-life composition with explore link.
- **Recent Students Table**: Complete with avatars, student IDs, courses, and statuses matching the reference design.
- **Interactive Monthly Calendar**: Day picker with event indicators and month switcher.
- **Quick Action Matrix**: Add Student, Mark Attendance, Add Course, Generate Report.
- **Upcoming Events Timeline**: Date blocks with category-specific palette colors.

### 2. Scholar Directory & Dossiers (`/students`)
- Gallery & Table views with responsive layout.
- Filter by department, course, academic year, and status (Active, Inactive, Graduated, Suspended).
- Search across name, student ID, email, and phone.
- Five-section enrollment modal: Personal Info, Academic Scope, Contact, Guardian, and Institutional Notes.
- Comprehensive Scholar Dossier modal with tabs for Overview, Attendance history, Examination marks, Tuition fee ledger, and Verified documents.
- CSV Export and Validated CSV Import with duplicate detection.

### 3. Academics & Curriculum (`/academics`)
- Program management for Degree Courses, Departments, Subjects, and Weekly Timetables.
- Create, edit, and archive courses with credit allocations, faculty coordinators, and category accents.

### 4. Attendance Register & Analytics (`/attendance`)
- Daily session register with course, subject, and date filters.
- Bulk actions ("Mark All Present" & "Mark All Absent").
- Dynamic calculation of attendance percentages.
- Automatic alert banner highlighting at-risk students below the configurable threshold (e.g. < 75%).
- CSV register export.

### 5. Examinations & Transcripts (`/examinations`)
- Examination cycle creation and schedules.
- Subject-wise maximum marks entry with validation.
- Automated percentage and GPA compilation based on configurable grading scale rules.
- Cryptographically verified, printable formal Academic Transcripts with institutional seal.

### 6. Fees, Tuition & Payments (`/fees`)
- Tuition fee assignments, balances, discounts, and payment history.
- Partial and full installment payment recording.
- Printable official transaction receipts with receipt numbers and cashier endorsement.
- Financial report CSV export.

### 7. Reports & Analytics (`/reports`)
- Responsive Recharts visualizations styled with the editorial botanical palette:
  - Monthly Cohort Attendance Trend (Area chart).
  - Departmental Enrollment Comparison (Bar chart).
  - Bell-curve Grade Distribution (Horizontal bar chart).
  - Tuition Fee Settlement vs Outstanding Ratio (Donut pie chart).

### 8. Institutional Settings & Governance (`/settings`)
- Institutional profile configuration (Name, tagline, contact, address).
- Academic year & term cycles.
- Real-time attendance threshold slider.
- Configurable grading scale rules (A+, A, B+, B, C, F with score bands and GPA values).
- Role-Based Access Control (RBAC) matrix (Admin, Teacher, Accountant, Staff) with one-click role switching in the profile menu.
- Supabase cloud configuration panel.

---

## ✦ Supabase PostgreSQL Database Setup

A complete PostgreSQL schema and seed dataset are included in the repository:

1. **`supabase/schema.sql`**: Contains 20 relational tables (`profiles`, `students`, `guardians`, `departments`, `courses`, `subjects`, `attendance_records`, `examinations`, `examination_results`, `student_fees`, `payments`, `academic_events`, `institution_settings`, etc.) with foreign keys, indexes, and Row Level Security (RLS) policies.
2. **`supabase/seed.sql`**: Populates initial departments, courses, students, and events.

### To Connect to Your Supabase Instance:
1. Open your project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` and `supabase/seed.sql` in the Supabase SQL Editor.
3. In Aurelia, click the **Supabase Status Pill** in the top header or navigate to **Settings > Supabase**.
4. Enter your **Supabase Project URL** and **Anon Key**.
5. All records synchronize live with your cloud PostgreSQL database.

*Note: If no Supabase credentials are provided, Aurelia automatically runs on its built-in reactive persistent local store, allowing all CRUD, grading, fee recording, and attendance operations to work out of the box with zero configuration!*

---

## ✦ Keyboard Shortcuts

- `⌘ K` or `Ctrl + K`: Opens the Global Academic Command Palette for searching scholars, executing quick actions, and navigating pages.
- `ESC`: Closes any active modal or command palette.

---

## ✦ Development & Build

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
