export type UserRole = 'Admin' | 'Teacher' | 'Accountant' | 'Staff';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar_url?: string;
}

export type StudentStatus = 'Active' | 'Inactive' | 'Graduated' | 'Suspended';
export type Gender = 'Male' | 'Female' | 'Other';

export interface Guardian {
  name: string;
  relation: string;
  phone: string;
  email?: string;
  occupation?: string;
}

export interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  gender: Gender;
  date_of_birth: string;
  department_id: string;
  department_name: string;
  course_id: string;
  course_name: string;
  academic_year: string;
  semester: number;
  enrollment_date: string;
  status: StudentStatus;
  avatar_url?: string;
  address?: string;
  blood_group?: string;
  guardian: Guardian;
  attendance_rate?: number;
  gpa?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  head_of_department: string;
  description: string;
  student_count: number;
  course_count: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department_id: string;
  department_name: string;
  duration_years: number;
  total_semesters: number;
  credits: number;
  faculty_coordinator: string;
  enrolled_students: number;
  color_accent: 'sage' | 'lavender' | 'sand' | 'forest';
  status: 'Active' | 'Archived';
  description?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  course_id: string;
  course_name?: string;
  semester: number;
  credits: number;
  max_marks: number;
  faculty_name: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  student_code: string;
  course_id: string;
  course_name: string;
  subject_id?: string;
  subject_name?: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  session: 'Morning' | 'Afternoon' | 'Full Day';
  remarks?: string;
  recorded_by?: string;
}

export interface Examination {
  id: string;
  title: string;
  course_id: string;
  course_name: string;
  academic_year: string;
  semester: number;
  start_date: string;
  end_date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Results Published';
}

export interface SubjectMark {
  subject_id: string;
  subject_name: string;
  max_marks: number;
  marks_obtained: number;
  grade: string;
}

export interface ExamResult {
  id: string;
  examination_id: string;
  examination_title: string;
  student_id: string;
  student_name: string;
  student_code: string;
  course_id: string;
  course_name: string;
  semester: number;
  subjects: SubjectMark[];
  total_marks: number;
  total_max_marks: number;
  percentage: number;
  gpa: number;
  overall_grade: string;
  published_date: string;
  remarks?: string;
}

export interface FeeStructure {
  id: string;
  course_id: string;
  course_name: string;
  academic_year: string;
  semester: number;
  tuition_fee: number;
  lab_fee: number;
  library_fee: number;
  exam_fee: number;
  total_amount: number;
}

export type FeeStatus = 'Paid' | 'Partial' | 'Pending' | 'Overdue';

export interface Payment {
  id: string;
  student_fee_id: string;
  receipt_number: string;
  amount: number;
  payment_date: string;
  payment_method: 'Cash' | 'Card' | 'Bank Transfer' | 'Online Gateway';
  notes?: string;
  recorded_by: string;
}

export interface StudentFee {
  id: string;
  student_id: string;
  student_name: string;
  student_code: string;
  course_id: string;
  course_name: string;
  academic_year: string;
  semester: number;
  total_fee: number;
  discount: number;
  net_payable: number;
  paid_amount: number;
  balance_amount: number;
  due_date: string;
  status: FeeStatus;
  payments: Payment[];
}

export interface AcademicEvent {
  id: string;
  title: string;
  category: 'Exam' | 'Meeting' | 'Fee' | 'Holiday' | 'Lecture' | 'Workshop';
  date: string; // YYYY-MM-DD
  time?: string;
  description: string;
  audience: string;
  color_accent: 'sage' | 'lavender' | 'sand' | 'forest';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface GradingScaleTier {
  grade: string;
  min_score: number;
  max_score: number;
  gpa: number;
  description: string;
}

export interface InstitutionSettings {
  institution_name: string;
  tagline: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  current_academic_year: string;
  current_term: string;
  attendance_threshold: number; // e.g. 75%
  grading_scale: GradingScaleTier[];
}

