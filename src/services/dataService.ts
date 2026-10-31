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

// UUID Mapping Helper for Backward Compatibility with Offline Mock IDs
const ID_TO_UUID: Record<string, string> = {
  // Departments
  'dept-cs': 'b1111111-1111-1111-1111-111111111111',
  'dept-it': 'b2222222-2222-2222-2222-222222222222',
  'dept-ec': 'b3333333-3333-3333-3333-333333333333',
  'dept-ba': 'b4444444-4444-4444-4444-444444444444',
  'dept-me': 'b5555555-5555-5555-5555-555555555555',

  // Courses
  'course-cs101': 'c1111111-1111-1111-1111-111111111111',
  'course-it101': 'c2222222-2222-2222-2222-222222222222',
  'course-ec101': 'c3333333-3333-3333-3333-333333333333',
  'course-ba101': 'c4444444-4444-4444-4444-444444444444',
  'course-me101': 'c5555555-5555-5555-5555-555555555555',

  // Students
  's-1': 'd1111111-1111-1111-1111-111111111111',
  's-2': 'd2222222-2222-2222-2222-222222222222',
  's-3': 'd3333333-3333-3333-3333-333333333333',
  's-4': 'd4444444-4444-4444-4444-444444444444',
  's-5': 'd5555555-5555-5555-5555-555555555555',
  's-6': 'd6666666-6666-6666-6666-666666666666',
  's-7': 'd7777777-7777-7777-7777-777777777777',
  's-8': 'd8888888-8888-8888-8888-888888888888',

  // Subjects
  'sub-1': 'e1111111-1111-1111-1111-111111111111',
  'sub-2': 'e2222222-2222-2222-2222-222222222222',
  'sub-3': 'e3333333-3333-3333-3333-333333333333',
  'sub-4': 'e4444444-4444-4444-4444-444444444444',
  'sub-5': 'e5555555-5555-5555-5555-555555555555',
  'sub-6': 'e6666666-6666-6666-6666-666666666666',
  'sub-7': 'e7777777-7777-7777-7777-777777777777',
  'sub-8': 'e8888888-8888-8888-8888-888888888888',

  // Exams
  'exam-1': '71111111-1111-1111-1111-111111111111',
  'exam-2': '72222222-2222-2222-2222-222222222222',
  'exam-3': '73333333-3333-3333-3333-333333333333',
  'exam-4': '74444444-4444-4444-4444-444444444444',

  // Exam Results
  'res-1': '81111111-1111-1111-1111-111111111111',
  'res-2': '82222222-2222-2222-2222-222222222222',
  'res-3': '83333333-3333-3333-3333-333333333333',

  // Fees
  'fee-1': '91111111-1111-1111-1111-111111111111',
  'fee-2': '92222222-2222-2222-2222-222222222222',
  'fee-3': '93333333-3333-3333-3333-333333333333',
  'fee-4': '94444444-4444-4444-4444-444444444444',
  'fee-5': '95555555-5555-5555-5555-555555555555',
};

const isUuid = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const ensureUuid = (id?: string): string => {
  if (!id) return generateUUID();
  if (isUuid(id)) return id;
  if (ID_TO_UUID[id]) return ID_TO_UUID[id];
  return generateUUID();
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

  // --------------------------------------------------------------------------
  // ASYNCHRONOUS INITIALIZATION FROM SUPABASE
  // --------------------------------------------------------------------------
  async initializeSupabaseData(): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
      return false;
    }

    try {
      const [
        studentsRes,
        departmentsRes,
        coursesRes,
        subjectsRes,
        attendanceRes,
        examsRes,
        examResultsRes,
        feesRes,
        eventsRes,
        settingsRes,
        notificationsRes
      ] = await Promise.allSettled([
        supabase.from('students').select('*').order('created_at', { ascending: false }),
        supabase.from('departments').select('*'),
        supabase.from('courses').select('*'),
        supabase.from('subjects').select('*'),
        supabase.from('attendance_records').select('*').order('date', { ascending: false }),
        supabase.from('examinations').select('*'),
        supabase.from('examination_results').select('*'),
        supabase.from('student_fees').select('*'),
        supabase.from('academic_events').select('*').order('date', { ascending: true }),
        supabase.from('institution_settings').select('*').limit(1).maybeSingle(),
        supabase.from('notifications').select('*').order('created_at', { ascending: false })
      ]);

      let hasChanges = false;

      if (studentsRes.status === 'fulfilled' && studentsRes.value.data && studentsRes.value.data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(studentsRes.value.data));
        hasChanges = true;
      }
      if (departmentsRes.status === 'fulfilled' && departmentsRes.value.data && departmentsRes.value.data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departmentsRes.value.data));
        hasChanges = true;
      }
      if (coursesRes.status === 'fulfilled' && coursesRes.value.data && coursesRes.value.data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(coursesRes.value.data));
        hasChanges = true;
      }
      if (subjectsRes.status === 'fulfilled' && subjectsRes.value.data && subjectsRes.value.data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjectsRes.value.data));
        hasChanges = true;
      }
      if (attendanceRes.status === 'fulfilled' && attendanceRes.value.data && attendanceRes.value.data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRes.value.data));
        hasChanges = true;
      }
      if (examsRes.status === 'fulfilled' && examsRes.value.data && examsRes.value.data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(examsRes.value.data));
        hasChanges = true;
      }
      if (examResultsRes.status === 'fulfilled' && examResultsRes.value.data && examResultsRes.value.data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.EXAM_RESULTS, JSON.stringify(examResultsRes.value.data));
        hasChanges = true;
      }
      if (feesRes.status === 'fulfilled' && feesRes.value.data && feesRes.value.data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(feesRes.value.data));
        hasChanges = true;
      }
      if (eventsRes.status === 'fulfilled' && eventsRes.value.data && eventsRes.value.data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(eventsRes.value.data));
        hasChanges = true;
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value.data) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsRes.value.data));
        hasChanges = true;
      }
      if (notificationsRes.status === 'fulfilled' && notificationsRes.value.data && notificationsRes.value.data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notificationsRes.value.data));
        hasChanges = true;
      }

      if (hasChanges) {
        emitChange();
      }

      return true;
    } catch (err) {
      console.warn('Failed to initialize Supabase remote data:', err);
      return false;
    }
  },

  // --------------------------------------------------------------------------
  // STUDENTS
  // --------------------------------------------------------------------------
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
      id: generateUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newStudent, ...students];
    saveToStorage(STORAGE_KEYS.STUDENTS, updated);

    // Sync to Supabase if connected
    if (isSupabaseConfigured() && supabase) {
      const dbPayload = {
        ...newStudent,
        id: ensureUuid(newStudent.id),
        department_id: ensureUuid(newStudent.department_id),
        course_id: ensureUuid(newStudent.course_id),
      };
      supabase.from('students').insert([dbPayload]).then(({ error }) => {
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
      const targetUuid = ensureUuid(updatedStudent.id);
      const dbUpdates: Record<string, any> = { ...updates };
      if (dbUpdates.department_id) dbUpdates.department_id = ensureUuid(dbUpdates.department_id);
      if (dbUpdates.course_id) dbUpdates.course_id = ensureUuid(dbUpdates.course_id);
      delete dbUpdates.id;

      supabase
        .from('students')
        .update(dbUpdates)
        .or(`id.eq.${targetUuid},student_id.eq.${updatedStudent.student_id}`)
        .then(({ error }) => {
          if (error) console.error('Supabase student update error:', error);
        });
    }

    return updatedStudent;
  },

  deleteStudent(id: string): boolean {
    const students = this.getStudents();
    const studentToDelete = students.find(s => s.id === id || s.student_id === id);
    const filtered = students.filter(s => s.id !== id && s.student_id !== id);
    if (filtered.length === students.length) return false;
    saveToStorage(STORAGE_KEYS.STUDENTS, filtered);

    if (isSupabaseConfigured() && supabase && studentToDelete) {
      const targetUuid = ensureUuid(studentToDelete.id);
      supabase
        .from('students')
        .delete()
        .or(`id.eq.${targetUuid},student_id.eq.${studentToDelete.student_id}`)
        .then(({ error }) => {
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

  // --------------------------------------------------------------------------
  // DEPARTMENTS
  // --------------------------------------------------------------------------
  getDepartments(): Department[] {
    return loadFromStorage<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  },

  // --------------------------------------------------------------------------
  // COURSES
  // --------------------------------------------------------------------------
  getCourses(): Course[] {
    return loadFromStorage<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  },

  createCourse(courseData: Omit<Course, 'id'>): Course {
    const courses = this.getCourses();
    const newCourse: Course = {
      ...courseData,
      id: generateUUID(),
    };
    saveToStorage(STORAGE_KEYS.COURSES, [newCourse, ...courses]);

    if (isSupabaseConfigured() && supabase) {
      const dbPayload = {
        ...newCourse,
        id: ensureUuid(newCourse.id),
        department_id: ensureUuid(newCourse.department_id),
      };
      supabase.from('courses').insert([dbPayload]).then(({ error }) => {
        if (error) console.error('Supabase course insert error:', error);
      });
    }

    return newCourse;
  },

  updateCourse(id: string, updates: Partial<Course>): Course | null {
    const courses = this.getCourses();
    const idx = courses.findIndex(c => c.id === id);
    if (idx === -1) return null;
    courses[idx] = { ...courses[idx], ...updates };
    saveToStorage(STORAGE_KEYS.COURSES, courses);

    if (isSupabaseConfigured() && supabase) {
      const targetUuid = ensureUuid(id);
      const dbUpdates: Record<string, any> = { ...updates };
      if (dbUpdates.department_id) dbUpdates.department_id = ensureUuid(dbUpdates.department_id);
      delete dbUpdates.id;

      supabase.from('courses').update(dbUpdates).eq('id', targetUuid).then(({ error }) => {
        if (error) console.error('Supabase course update error:', error);
      });
    }

    return courses[idx];
  },

  // --------------------------------------------------------------------------
  // SUBJECTS
  // --------------------------------------------------------------------------
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
      id: generateUUID(),
    };
    saveToStorage(STORAGE_KEYS.SUBJECTS, [...subjects, newSubject]);

    if (isSupabaseConfigured() && supabase) {
      const dbPayload = {
        ...newSubject,
        id: ensureUuid(newSubject.id),
        course_id: ensureUuid(newSubject.course_id),
      };
      supabase.from('subjects').insert([dbPayload]).then(({ error }) => {
        if (error) console.error('Supabase subject insert error:', error);
      });
    }

    return newSubject;
  },

  // --------------------------------------------------------------------------
  // ATTENDANCE
  // --------------------------------------------------------------------------
  getAttendanceRecords(): AttendanceRecord[] {
    return loadFromStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE_RECORDS);
  },

  saveAttendanceBatch(records: Omit<AttendanceRecord, 'id'>[]): void {
    const current = this.getAttendanceRecords();
    const newRecords: AttendanceRecord[] = records.map(r => ({
      ...r,
      id: generateUUID(),
    }));
    
    // Remove existing records for same student, course, date, session
    const filtered = current.filter(c => 
      !records.some(r => (r.student_id === c.student_id || r.student_code === c.student_code) && r.date === c.date && r.session === c.session)
    );
    saveToStorage(STORAGE_KEYS.ATTENDANCE, [...newRecords, ...filtered]);

    // Recalculate attendance rates for students
    this.recalculateStudentAttendanceRates();

    // Sync to Supabase
    if (isSupabaseConfigured() && supabase) {
      const dbRecords = newRecords.map(r => ({
        ...r,
        id: ensureUuid(r.id),
        student_id: ensureUuid(r.student_id),
        course_id: ensureUuid(r.course_id),
        subject_id: r.subject_id ? ensureUuid(r.subject_id) : null,
      }));
      supabase
        .from('attendance_records')
        .upsert(dbRecords, { onConflict: 'student_id,date,session' })
        .then(({ error }) => {
          if (error) console.error('Supabase attendance batch upsert error:', error);
        });
    }
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

  // --------------------------------------------------------------------------
  // EXAMINATIONS
  // --------------------------------------------------------------------------
  getExaminations(): Examination[] {
    return loadFromStorage<Examination[]>(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
  },

  createExamination(examData: Omit<Examination, 'id'>): Examination {
    const exams = this.getExaminations();
    const newExam: Examination = {
      ...examData,
      id: generateUUID(),
    };
    saveToStorage(STORAGE_KEYS.EXAMS, [newExam, ...exams]);

    if (isSupabaseConfigured() && supabase) {
      const dbPayload = {
        ...newExam,
        id: ensureUuid(newExam.id),
        course_id: ensureUuid(newExam.course_id),
      };
      supabase.from('examinations').insert([dbPayload]).then(({ error }) => {
        if (error) console.error('Supabase examination insert error:', error);
      });
    }

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
      id: existingIdx >= 0 ? results[existingIdx].id : generateUUID(),
    };
    if (existingIdx >= 0) {
      results[existingIdx] = newResult;
      saveToStorage(STORAGE_KEYS.EXAM_RESULTS, results);
    } else {
      saveToStorage(STORAGE_KEYS.EXAM_RESULTS, [newResult, ...results]);
    }

    if (isSupabaseConfigured() && supabase) {
      const dbPayload = {
        ...newResult,
        id: ensureUuid(newResult.id),
        examination_id: ensureUuid(newResult.examination_id),
        student_id: ensureUuid(newResult.student_id),
        course_id: ensureUuid(newResult.course_id),
      };
      supabase.from('examination_results').upsert([dbPayload], { onConflict: 'examination_id,student_id' }).then(({ error }) => {
        if (error) console.error('Supabase exam result upsert error:', error);
      });
    }

    return newResult;
  },

  // --------------------------------------------------------------------------
  // FEES & PAYMENTS
  // --------------------------------------------------------------------------
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
      id: generateUUID(),
      receipt_number: receiptNumber,
    };

    const fee = fees[feeIndex];
    const newPaidAmount = fee.paid_amount + paymentData.amount;
    const newBalance = Math.max(0, fee.net_payable - newPaidAmount);
    const newStatus = newBalance === 0 ? 'Paid' : newPaidAmount > 0 ? 'Partial' : 'Pending';

    const updatedFee: StudentFee = {
      ...fee,
      paid_amount: newPaidAmount,
      balance_amount: newBalance,
      status: newStatus,
      payments: [newPayment, ...fee.payments],
    };
    fees[feeIndex] = updatedFee;

    saveToStorage(STORAGE_KEYS.FEES, fees);

    // Sync to Supabase payments table
    const client = supabase;
    if (isSupabaseConfigured() && client) {
      const targetFeeUuid = ensureUuid(studentFeeId);
      const dbPayment = {
        id: ensureUuid(newPayment.id),
        student_fee_id: targetFeeUuid,
        receipt_number: newPayment.receipt_number,
        amount: newPayment.amount,
        payment_date: newPayment.payment_date,
        payment_method: newPayment.payment_method,
        notes: newPayment.notes,
        recorded_by: newPayment.recorded_by,
      };
      
      client.from('payments').insert([dbPayment]).then(({ error }) => {
        if (error) {
          console.error('Supabase payment insert error, attempting direct fee update fallback:', error);
          // Fallback: update student_fees directly
          client.from('student_fees').update({
            paid_amount: updatedFee.paid_amount,
            balance_amount: updatedFee.balance_amount,
            status: updatedFee.status,
            payments: updatedFee.payments,
          }).eq('id', targetFeeUuid).then(({ error: feeError }) => {
            if (feeError) console.error('Supabase student_fees update fallback error:', feeError);
          });
        }
      });
    }

    return newPayment;
  },

  // --------------------------------------------------------------------------
  // ACADEMIC EVENTS
  // --------------------------------------------------------------------------
  getEvents(): AcademicEvent[] {
    return loadFromStorage<AcademicEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  },

  createEvent(eventData: Omit<AcademicEvent, 'id'>): AcademicEvent {
    const events = this.getEvents();
    const newEvent: AcademicEvent = {
      ...eventData,
      id: generateUUID(),
    };
    saveToStorage(STORAGE_KEYS.EVENTS, [newEvent, ...events]);

    if (isSupabaseConfigured() && supabase) {
      supabase.from('academic_events').insert([{ ...newEvent, id: ensureUuid(newEvent.id) }]).then(({ error }) => {
        if (error) console.error('Supabase event insert error:', error);
      });
    }

    return newEvent;
  },

  deleteEvent(id: string): void {
    const events = this.getEvents().filter(e => e.id !== id);
    saveToStorage(STORAGE_KEYS.EVENTS, events);

    if (isSupabaseConfigured() && supabase) {
      supabase.from('academic_events').delete().eq('id', ensureUuid(id)).then(({ error }) => {
        if (error) console.error('Supabase event delete error:', error);
      });
    }
  },

  // --------------------------------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------------------------------
  getNotifications(): NotificationItem[] {
    return loadFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  markNotificationAsRead(id: string): void {
    const notifs = this.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);

    if (isSupabaseConfigured() && supabase) {
      supabase.from('notifications').update({ read: true }).eq('id', ensureUuid(id)).then(({ error }) => {
        if (error) console.error('Supabase notification update error:', error);
      });
    }
  },

  markAllNotificationsAsRead(): void {
    const notifs = this.getNotifications().map(n => ({ ...n, read: true }));
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);

    if (isSupabaseConfigured() && supabase) {
      supabase.from('notifications').update({ read: true }).neq('id', '00000000-0000-0000-0000-000000000000').then(({ error }) => {
        if (error) console.error('Supabase mark all notifications error:', error);
      });
    }
  },

  // --------------------------------------------------------------------------
  // SETTINGS
  // --------------------------------------------------------------------------
  getSettings(): InstitutionSettings {
    return loadFromStorage<InstitutionSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  updateSettings(updates: Partial<InstitutionSettings>): InstitutionSettings {
    const settings = this.getSettings();
    const updated = { ...settings, ...updates };
    saveToStorage(STORAGE_KEYS.SETTINGS, updated);

    if (isSupabaseConfigured() && supabase) {
      supabase.from('institution_settings').update(updates).eq('id', '00000000-0000-0000-0000-000000000001').then(({ error }) => {
        if (error) console.error('Supabase settings update error:', error);
      });
    }

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
