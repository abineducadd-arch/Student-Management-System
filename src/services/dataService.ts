import { 
  Student, 
  Department, 
  Course, 
  Subject, 
  AttendanceRecord, 
  Examination, 
  ExamResult, 
  StudentFee, 
  Payment,
  AcademicEvent, 
  InstitutionSettings,
  NotificationItem,
  UserRole
} from '@/types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_DEPARTMENTS, 
  INITIAL_COURSES, 
  INITIAL_SUBJECTS, 
  INITIAL_ATTENDANCE_RECORDS, 
  INITIAL_EXAMS, 
  INITIAL_EXAM_RESULTS, 
  INITIAL_STUDENT_FEES, 
  INITIAL_EVENTS, 
  INITIAL_SETTINGS, 
  INITIAL_NOTIFICATIONS 
} from './seedData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const STORAGE_KEYS = {
  STUDENTS: 'aurelia_students_v1',
  DEPARTMENTS: 'aurelia_departments_v1',
  COURSES: 'aurelia_courses_v1',
  SUBJECTS: 'aurelia_subjects_v1',
  ATTENDANCE: 'aurelia_attendance_v1',
  EXAMS: 'aurelia_exams_v1',
  EXAM_RESULTS: 'aurelia_exam_results_v1',
  FEES: 'aurelia_fees_v1',
  EVENTS: 'aurelia_events_v1',
  SETTINGS: 'aurelia_settings_v1',
  NOTIFICATIONS: 'aurelia_notifications_v1',
  CURRENT_ROLE: 'aurelia_current_role_v1',
};

// Simple event emitter for reactive updates
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function emitChange() {
  listeners.forEach(fn => fn());
}

export function subscribeToDataChanges(callback: Listener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

// Local Storage Helpers
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    emitChange();
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

// Global active role (defaults to 'Admin')
let currentRole: UserRole = (localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE) as UserRole) || 'Admin';

export const dataService = {
  // Current user role
  getCurrentRole(): UserRole {
    return currentRole;
  },
  setCurrentRole(role: UserRole) {
    currentRole = role;
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
    emitChange();
  },

  // STUDENTS
  getStudents(): Student[] {
    return loadFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },

  getStudentById(id: string): Student | undefined {
    const students = this.getStudents();
    return students.find(s => s.id === id || s.student_id === id);
  },

  createStudent(studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Student {
    const students = this.getStudents();
    const newStudent: Student = {
      ...studentData,
      id: `s-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newStudent, ...students];
    saveToStorage(STORAGE_KEYS.STUDENTS, updated);

    // Sync to Supabase if connected
    if (isSupabaseConfigured() && supabase) {
      supabase.from('students').insert([newStudent]).then(({ error }) => {
        if (error) console.error('Supabase student insert error:', error);
      });
    }

    return newStudent;
  },

  updateStudent(id: string, updates: Partial<Student>): Student | null {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === id || s.student_id === id);
    if (index === -1) return null;

    const updatedStudent: Student = {
      ...students[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    students[index] = updatedStudent;
    saveToStorage(STORAGE_KEYS.STUDENTS, students);

    // Sync to Supabase
    if (isSupabaseConfigured() && supabase) {
      supabase.from('students').update(updates).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase student update error:', error);
      });
    }

    return updatedStudent;
  },

  deleteStudent(id: string): boolean {
    const students = this.getStudents();
    const filtered = students.filter(s => s.id !== id && s.student_id !== id);
    if (filtered.length === students.length) return false;
    saveToStorage(STORAGE_KEYS.STUDENTS, filtered);

    if (isSupabaseConfigured() && supabase) {
      supabase.from('students').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase student delete error:', error);
      });
    }

    return true;
  },

  getNextStudentId(): string {
    const students = this.getStudents();
    let maxNum = 0;
    students.forEach(s => {
      const match = s.student_id.match(/STU(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = (maxNum + 1).toString().padStart(3, '0');
    return `STU${nextNum}`;
  },

  // DEPARTMENTS
  getDepartments(): Department[] {
    return loadFromStorage<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  },

  // COURSES
  getCourses(): Course[] {
    return loadFromStorage<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  },

  createCourse(courseData: Omit<Course, 'id'>): Course {
    const courses = this.getCourses();
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
    };
    saveToStorage(STORAGE_KEYS.COURSES, [newCourse, ...courses]);
    return newCourse;
  },

  updateCourse(id: string, updates: Partial<Course>): Course | null {
    const courses = this.getCourses();
    const idx = courses.findIndex(c => c.id === id);
    if (idx === -1) return null;
    courses[idx] = { ...courses[idx], ...updates };
    saveToStorage(STORAGE_KEYS.COURSES, courses);
    return courses[idx];
  },

  // SUBJECTS
  getSubjects(): Subject[] {
    return loadFromStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  },

  getSubjectsByCourse(courseId: string): Subject[] {
    const subjects = this.getSubjects();
    return subjects.filter(s => s.course_id === courseId);
  },

  createSubject(subjectData: Omit<Subject, 'id'>): Subject {
    const subjects = this.getSubjects();
    const newSubject: Subject = {
      ...subjectData,
      id: `sub-${Date.now()}`,
    };
    saveToStorage(STORAGE_KEYS.SUBJECTS, [...subjects, newSubject]);
    return newSubject;
  },

  // ATTENDANCE
  getAttendanceRecords(): AttendanceRecord[] {
    return loadFromStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE_RECORDS);
  },

  saveAttendanceBatch(records: Omit<AttendanceRecord, 'id'>[]): void {
    const current = this.getAttendanceRecords();
    const newRecords: AttendanceRecord[] = records.map((r, i) => ({
      ...r,
      id: `att-${Date.now()}-${i}`,
    }));
    // Remove existing records for same student, course, date, session
    const filtered = current.filter(c => 
      !records.some(r => r.student_id === c.student_id && r.date === c.date && r.session === c.session)
    );
    saveToStorage(STORAGE_KEYS.ATTENDANCE, [...newRecords, ...filtered]);

    // Recalculate attendance rates for students
    this.recalculateStudentAttendanceRates();
  },

  recalculateStudentAttendanceRates(): void {
    const students = this.getStudents();
    const attendance = this.getAttendanceRecords();

    const updatedStudents = students.map(st => {
      const records = attendance.filter(a => a.student_id === st.id || a.student_code === st.student_id);
      if (records.length === 0) return st;
      const presentCount = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
      const rate = Number(((presentCount / records.length) * 100).toFixed(1));
      return { ...st, attendance_rate: rate };
    });

    saveToStorage(STORAGE_KEYS.STUDENTS, updatedStudents);
  },

  // EXAMINATIONS
  getExaminations(): Examination[] {
    return loadFromStorage<Examination[]>(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
  },

  createExamination(examData: Omit<Examination, 'id'>): Examination {
    const exams = this.getExaminations();
    const newExam: Examination = {
      ...examData,
      id: `exam-${Date.now()}`,
    };
    saveToStorage(STORAGE_KEYS.EXAMS, [newExam, ...exams]);
    return newExam;
  },

  getExamResults(): ExamResult[] {
    return loadFromStorage<ExamResult[]>(STORAGE_KEYS.EXAM_RESULTS, INITIAL_EXAM_RESULTS);
  },

  saveExamResult(resultData: Omit<ExamResult, 'id'>): ExamResult {
    const results = this.getExamResults();
    const existingIdx = results.findIndex(
      r => r.examination_id === resultData.examination_id && (r.student_id === resultData.student_id || r.student_code === resultData.student_code)
    );
    const newResult: ExamResult = {
      ...resultData,
      id: existingIdx >= 0 ? results[existingIdx].id : `res-${Date.now()}`,
    };
    if (existingIdx >= 0) {
      results[existingIdx] = newResult;
      saveToStorage(STORAGE_KEYS.EXAM_RESULTS, results);
    } else {
      saveToStorage(STORAGE_KEYS.EXAM_RESULTS, [newResult, ...results]);
    }
    return newResult;
  },

  // FEES
  getStudentFees(): StudentFee[] {
    return loadFromStorage<StudentFee[]>(STORAGE_KEYS.FEES, INITIAL_STUDENT_FEES);
  },

  recordPayment(studentFeeId: string, paymentData: Omit<Payment, 'id' | 'receipt_number'>): Payment | null {
    const fees = this.getStudentFees();
    const feeIndex = fees.findIndex(f => f.id === studentFeeId);
    if (feeIndex === -1) return null;

    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      receipt_number: receiptNumber,
    };

    const fee = fees[feeIndex];
    const newPaidAmount = fee.paid_amount + paymentData.amount;
    const newBalance = Math.max(0, fee.net_payable - newPaidAmount);
    const newStatus = newBalance === 0 ? 'Paid' : newPaidAmount > 0 ? 'Partial' : 'Pending';

    fees[feeIndex] = {
      ...fee,
      paid_amount: newPaidAmount,
      balance_amount: newBalance,
      status: newStatus,
      payments: [newPayment, ...fee.payments],
    };

    saveToStorage(STORAGE_KEYS.FEES, fees);
    return newPayment;
  },

  // EVENTS
  getEvents(): AcademicEvent[] {
    return loadFromStorage<AcademicEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  },

  createEvent(eventData: Omit<AcademicEvent, 'id'>): AcademicEvent {
    const events = this.getEvents();
    const newEvent: AcademicEvent = {
      ...eventData,
      id: `ev-${Date.now()}`,
    };
    saveToStorage(STORAGE_KEYS.EVENTS, [newEvent, ...events]);
    return newEvent;
  },

  deleteEvent(id: string): void {
    const events = this.getEvents().filter(e => e.id !== id);
    saveToStorage(STORAGE_KEYS.EVENTS, events);
  },

  // NOTIFICATIONS
  getNotifications(): NotificationItem[] {
    return loadFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  markNotificationAsRead(id: string): void {
    const notifs = this.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },

  markAllNotificationsAsRead(): void {
    const notifs = this.getNotifications().map(n => ({ ...n, read: true }));
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },

  // SETTINGS
  getSettings(): InstitutionSettings {
    return loadFromStorage<InstitutionSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  updateSettings(updates: Partial<InstitutionSettings>): InstitutionSettings {
    const settings = this.getSettings();
    const updated = { ...settings, ...updates };
    saveToStorage(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // Reset to original seed data
  resetToSeedData(): void {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.DEPARTMENTS);
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.EXAMS);
    localStorage.removeItem(STORAGE_KEYS.EXAM_RESULTS);
    localStorage.removeItem(STORAGE_KEYS.FEES);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    emitChange();
  }
};

