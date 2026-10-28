import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Course, Subject, Student, AttendanceStatus } from '@/types';
import { dataService } from '@/services/dataService';
import { Check, CheckCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MarkAttendanceModal: React.FC<MarkAttendanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState<'Morning' | 'Afternoon' | 'Full Day'>('Morning');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const crss = dataService.getCourses();
      setCourses(crss);
      const defaultCourse = crss[0]?.id || '';
      setSelectedCourseId(defaultCourse);

      const allSubjs = dataService.getSubjects();
      setSubjects(allSubjs);
      const courseSubjs = allSubjs.filter(s => s.course_id === defaultCourse);
      setSelectedSubjectId(courseSubjs[0]?.id || '');

      loadStudentsForCourse(defaultCourse);
    }
  }, [isOpen]);

  const loadStudentsForCourse = (courseId: string) => {
    const all = dataService.getStudents();
    const enrolled = all.filter(s => !courseId || s.course_id === courseId);
    setStudents(enrolled);

    // Initialize all to Present
    const map: Record<string, AttendanceStatus> = {};
    enrolled.forEach(s => {
      map[s.id] = 'Present';
    });
    setAttendanceMap(map);
  };

  const handleCourseChange = (cId: string) => {
    setSelectedCourseId(cId);
    const courseSubjs = subjects.filter(s => s.course_id === cId);
    setSelectedSubjectId(courseSubjs[0]?.id || '');
    loadStudentsForCourse(cId);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const handleRemarkChange = (studentId: string, remark: string) => {
    setRemarksMap(prev => ({ ...prev, [studentId]: remark }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find(c => c.id === selectedCourseId);
    const subject = subjects.find(s => s.id === selectedSubjectId);

    const records = students.map(st => ({
      student_id: st.id,
      student_name: st.full_name,
      student_code: st.student_id,
      course_id: selectedCourseId,
      course_name: course?.name || 'Undergraduate Cohort',
      subject_id: selectedSubjectId,
      subject_name: subject?.name || 'General Lecture',
      date,
      session,
      status: attendanceMap[st.id] || 'Present',
      remarks: remarksMap[st.id] || '',
      recorded_by: 'Academic Registrar Desk',
    }));

    dataService.saveAttendanceBatch(records);

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#4F7757', '#D9E2C6', '#263329'],
    });

    onSuccess?.();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Attendance Register"
      subtitle="Log session attendance records. All calculations reflect directly onto student dossiers."
      maxWidth="3xl"
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Filters bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-porcelain/60 border border-border">
          <div>
            <label className="block text-[11px] font-semibold text-ink uppercase tracking-wider mb-1">Course</label>
            <select
              value={selectedCourseId}
              onChange={e => handleCourseChange(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink uppercase tracking-wider mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
            >
              {subjects
                .filter(s => !selectedCourseId || s.course_id === selectedCourseId)
                .map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink uppercase tracking-wider mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink uppercase tracking-wider mb-1">Session</label>
            <select
              value={session}
              onChange={e => setSession(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
            >
              <option value="Morning">Morning Session</option>
              <option value="Afternoon">Afternoon Session</option>
              <option value="Full Day">Full Day</option>
            </select>
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-ink-muted">
            Enrolled Scholars: <strong className="text-forest">{students.length}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMarkAll('Present')}
              className="px-3 py-1.5 rounded-lg bg-[#EBF2DE] text-[#3E5C38] border border-[#CFDCBA] hover:bg-[#D9E2C6] font-semibold transition-colors flex items-center gap-1 text-xs"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('Absent')}
              className="px-3 py-1.5 rounded-lg bg-[#FCECE9] text-[#8C3A2E] border border-[#F2C7C1] hover:bg-black/5 font-medium transition-colors text-xs"
            >
              <span>Mark All Absent</span>
            </button>
          </div>
        </div>

        {/* Scholars Register Table */}
        <div className="border border-border rounded-xl overflow-hidden bg-surface max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-porcelain border-b border-border text-ink-muted font-semibold uppercase tracking-wider text-[10px] sticky top-0 z-10">
              <tr>
                <th className="p-3">Scholar</th>
                <th className="p-3">Student ID</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Session Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-ink-muted">
                    No active scholars found in this course.
                  </td>
                </tr>
              ) : (
                students.map(st => {
                  const currentStatus = attendanceMap[st.id] || 'Present';
                  return (
                    <tr key={st.id} className="hover:bg-porcelain/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={st.full_name} src={st.avatar_url} size="sm" />
                          <span className="font-semibold text-ink">{st.full_name}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-ink-muted">{st.student_id}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          {(['Present', 'Absent', 'Late', 'Excused'] as AttendanceStatus[]).map(stOption => {
                            const isSelected = currentStatus === stOption;
                            return (
                              <button
                                key={stOption}
                                type="button"
                                onClick={() => handleStatusChange(st.id, stOption)}
                                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                                  isSelected
                                    ? stOption === 'Present'
                                      ? 'bg-forest text-surface shadow-warm-sm'
                                      : stOption === 'Absent'
                                      ? 'bg-[#C85A48] text-surface shadow-warm-sm'
                                      : stOption === 'Late'
                                      ? 'bg-[#D48B38] text-surface shadow-warm-sm'
                                      : 'bg-[#553E6B] text-surface shadow-warm-sm'
                                    : 'bg-porcelain text-ink-muted hover:bg-black/5 border border-border/70'
                                }`}
                              >
                                {stOption}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={remarksMap[st.id] || ''}
                          onChange={e => handleRemarkChange(st.id, e.target.value)}
                          placeholder="Optional remark..."
                          className="w-full px-2 py-1 rounded border border-border/70 bg-transparent text-xs focus:bg-surface focus:outline-none"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
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
            Save Register Entries
          </button>
        </div>
      </form>
    </Modal>
  );
};
