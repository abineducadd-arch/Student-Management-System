import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Student, Department, Course, Gender, StudentStatus } from '@/types';
import { dataService } from '@/services/dataService';
import confetti from 'canvas-confetti';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
  onSuccess?: (student: Student) => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
  onSuccess,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'contact' | 'guardian' | 'notes'>('personal');

  // Form State
  const [studentId, setStudentId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [dob, setDob] = useState('2004-01-01');
  const [departmentId, setDepartmentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [semester, setSemester] = useState(1);
  const [enrollmentDate, setEnrollmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<StudentStatus>('Active');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('Father');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianOccupation, setGuardianOccupation] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const depts = dataService.getDepartments();
      const crss = dataService.getCourses();
      setDepartments(depts);
      setCourses(crss);

      if (studentToEdit) {
        setStudentId(studentToEdit.student_id);
        setFirstName(studentToEdit.first_name);
        setLastName(studentToEdit.last_name);
        setEmail(studentToEdit.email);
        setPhone(studentToEdit.phone);
        setGender(studentToEdit.gender);
        setDob(studentToEdit.date_of_birth);
        setDepartmentId(studentToEdit.department_id);
        setCourseId(studentToEdit.course_id);
        setAcademicYear(studentToEdit.academic_year);
        setSemester(studentToEdit.semester);
        setEnrollmentDate(studentToEdit.enrollment_date);
        setStatus(studentToEdit.status);
        setAvatarUrl(studentToEdit.avatar_url || '');
        setAddress(studentToEdit.address || '');
        setBloodGroup(studentToEdit.blood_group || 'O+');
        setGuardianName(studentToEdit.guardian.name);
        setGuardianRelation(studentToEdit.guardian.relation);
        setGuardianPhone(studentToEdit.guardian.phone);
        setGuardianEmail(studentToEdit.guardian.email || '');
        setGuardianOccupation(studentToEdit.guardian.occupation || '');
        setNotes(studentToEdit.notes || '');
      } else {
        // New student default
        const nextId = dataService.getNextStudentId();
        setStudentId(nextId);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setGender('Male');
        setDob('2004-05-15');
        setDepartmentId(depts[0]?.id || '');
        setCourseId(crss[0]?.id || '');
        setAcademicYear('2025-2026');
        setSemester(1);
        setEnrollmentDate(new Date().toISOString().split('T')[0]);
        setStatus('Active');
        setAvatarUrl('');
        setAddress('');
        setBloodGroup('O+');
        setGuardianName('');
        setGuardianRelation('Father');
        setGuardianPhone('');
        setGuardianEmail('');
        setGuardianOccupation('');
        setNotes('');
      }
      setActiveTab('personal');
      setErrors({});
    }
  }, [isOpen, studentToEdit]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'First name is required';
    if (!lastName.trim()) errs.lastName = 'Last name is required';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid institutional email is required';
    if (!phone.trim()) errs.phone = 'Contact phone number is required';
    if (!guardianName.trim()) errs.guardianName = 'Guardian name is required';
    if (!guardianPhone.trim()) errs.guardianPhone = 'Guardian phone is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const selectedDept = departments.find(d => d.id === departmentId);
    const selectedCourse = courses.find(c => c.id === courseId);

    const payload = {
      student_id: studentId,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      full_name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      phone: phone.trim(),
      gender,
      date_of_birth: dob,
      department_id: departmentId,
      department_name: selectedDept?.name || 'Computer Science & Engineering',
      course_id: courseId,
      course_name: selectedCourse?.name || 'Computer Science',
      academic_year: academicYear,
      semester,
      enrollment_date: enrollmentDate,
      status,
      avatar_url: avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      address,
      blood_group: bloodGroup,
      attendance_rate: studentToEdit?.attendance_rate ?? 98.0,
      gpa: studentToEdit?.gpa ?? 3.8,
      guardian: {
        name: guardianName.trim(),
        relation: guardianRelation,
        phone: guardianPhone.trim(),
        email: guardianEmail.trim(),
        occupation: guardianOccupation.trim(),
      },
      notes,
    };

    let result: Student;
    if (studentToEdit) {
      result = dataService.updateStudent(studentToEdit.id, payload)!;
    } else {
      result = dataService.createStudent(payload);
      // Confetti burst for new student
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#263329', '#D9E2C6', '#E9D3B5', '#DDD1EA'],
      });
    }

    onSuccess?.(result);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? `Edit Dossier: ${studentToEdit.full_name}` : 'Enroll New Scholar'}
      subtitle={studentToEdit ? `Student Identifier: ${studentToEdit.student_id}` : 'Complete the five academic dossier sections to record student enrollment.'}
      maxWidth="3xl"
    >
      {/* Step Tabs Navigation */}
      <div className="flex border-b border-border gap-1 overflow-x-auto pb-1 mb-6 text-xs font-medium">
        {[
          { id: 'personal', label: '1. Personal Info' },
          { id: 'academic', label: '2. Academic Scope' },
          { id: 'contact', label: '3. Contact & Residence' },
          { id: 'guardian', label: '4. Guardian / Parent' },
          { id: 'notes', label: '5. Institutional Notes' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 rounded-t-lg transition-colors shrink-0 ${
              activeTab === tab.id
                ? 'bg-forest text-surface font-semibold shadow-warm-sm'
                : 'text-ink-muted hover:text-forest hover:bg-black/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: PERSONAL INFORMATION */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Student ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-porcelain font-mono text-sm text-forest font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  First Name <span className="text-botanical-terracotta">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="e.g. Eleanor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                />
                {errors.firstName && <p className="text-xs text-botanical-terracotta mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Last Name <span className="text-botanical-terracotta">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="e.g. Vance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                />
                {errors.lastName && <p className="text-xs text-botanical-terracotta mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as Gender)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Profile Avatar URL (Optional)
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 2: ACADEMIC SCOPE */}
        {activeTab === 'academic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <select
                  value={departmentId}
                  onChange={e => setDepartmentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                >
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Course of Study
                </label>
                <select
                  value={courseId}
                  onChange={e => setCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                  placeholder="2025-2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Current Semester
                </label>
                <select
                  value={semester}
                  onChange={e => setSemester(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Enrollment Date
                </label>
                <input
                  type="date"
                  value={enrollmentDate}
                  onChange={e => setEnrollmentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as StudentStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTACT & RESIDENCE */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Student Email <span className="text-botanical-terracotta">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="scholar@aurelia.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                />
                {errors.email && <p className="text-xs text-botanical-terracotta mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-botanical-terracotta">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                />
                {errors.phone && <p className="text-xs text-botanical-terracotta mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Permanent Residential Address
              </label>
              <textarea
                rows={3}
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Residential hall, street address, town, state & postal code"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* TAB 4: GUARDIAN INFORMATION */}
        {activeTab === 'guardian' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Guardian / Parent Full Name <span className="text-botanical-terracotta">*</span>
                </label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={e => setGuardianName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                />
                {errors.guardianName && <p className="text-xs text-botanical-terracotta mt-1">{errors.guardianName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Relationship
                </label>
                <select
                  value={guardianRelation}
                  onChange={e => setGuardianRelation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Legal Guardian">Legal Guardian</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Guardian Phone <span className="text-botanical-terracotta">*</span>
                </label>
                <input
                  type="tel"
                  value={guardianPhone}
                  onChange={e => setGuardianPhone(e.target.value)}
                  placeholder="+1 (555) 987-6543"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                />
                {errors.guardianPhone && <p className="text-xs text-botanical-terracotta mt-1">{errors.guardianPhone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Guardian Email
                </label>
                <input
                  type="email"
                  value={guardianEmail}
                  onChange={e => setGuardianEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Occupation
                </label>
                <input
                  type="text"
                  value={guardianOccupation}
                  onChange={e => setGuardianOccupation(e.target.value)}
                  placeholder="e.g. Pediatric Physician"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: INSTITUTIONAL NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Academic Dossier Notes & Special Honors
              </label>
              <textarea
                rows={5}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Include academic distinctions, scholarship awards, disciplinary annotations, or medical conditions..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-xs text-ink-muted">
            All fields marked with <span className="text-botanical-terracotta">*</span> are mandatory.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-ink hover:bg-black/5 transition-colors border border-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-forest px-6 py-2 rounded-xl text-sm font-medium shadow-warm-sm"
            >
              {studentToEdit ? 'Save Changes' : 'Enroll Scholar'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
