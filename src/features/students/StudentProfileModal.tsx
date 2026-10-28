import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Award, 
  Clock, 
  ShieldCheck, 
  Edit3, 
  Download, 
  CheckCircle2,
  FileCheck2,
  Printer
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Student, AttendanceRecord, ExamResult, StudentFee } from '@/types';
import { dataService } from '@/services/dataService';
import { formatCurrency } from '@/lib/utils';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onEditStudent: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  onEditStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'results' | 'fees' | 'documents'>('overview');

  if (!student) return null;

  // Retrieve student's specific records
  const allAttendance = dataService.getAttendanceRecords();
  const studentAttendance = allAttendance.filter(
    a => a.student_id === student.id || a.student_code === student.student_id
  );

  const allResults = dataService.getExamResults();
  const studentResults = allResults.filter(
    r => r.student_id === student.id || r.student_code === student.student_id
  );

  const allFees = dataService.getStudentFees();
  const studentFee = allFees.find(
    f => f.student_id === student.id || f.student_code === student.student_id
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scholar Academic Dossier"
      subtitle={`Official institutional record for ${student.full_name} (${student.student_id})`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Profile Dossier Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#FAF6EE] to-[#F4F0E8] border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-warm-sm">
          <div className="flex items-center gap-4">
            <Avatar
              name={student.full_name}
              src={student.avatar_url}
              size="xl"
              className="w-20 h-20 border-2 border-surface shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif text-2xl font-bold text-forest">{student.full_name}</h3>
                <Badge variant={student.status === 'Active' ? 'sage' : 'terracotta'}>
                  {student.status}
                </Badge>
              </div>
              <p className="text-xs font-mono text-ink-muted mt-0.5">ID: {student.student_id} • Year {student.academic_year}</p>
              <p className="text-xs text-forest font-medium mt-1">
                {student.course_name} • Semester {student.semester}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => {
                onClose();
                onEditStudent(student);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface border border-border text-forest hover:bg-black/5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Record</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-forest text-surface hover:bg-forest-dark transition-colors shadow-warm-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border gap-2 overflow-x-auto text-xs font-medium pb-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'attendance', label: `Attendance (${studentAttendance.length})` },
            { id: 'results', label: `Examinations (${studentResults.length})` },
            { id: 'fees', label: 'Fee Ledger' },
            { id: 'documents', label: 'Credentials & Docs' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg transition-colors shrink-0 ${
                activeTab === tab.id
                  ? 'bg-forest text-surface font-semibold shadow-warm-sm'
                  : 'text-ink-muted hover:text-forest hover:bg-black/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-surface border border-border">
                <span className="text-[11px] uppercase tracking-wider text-ink-muted font-bold block">Attendance</span>
                <span className="font-serif text-2xl font-bold text-forest mt-1 block">
                  {student.attendance_rate ?? 95}%
                </span>
                <span className="text-[10px] text-botanical-green font-medium">Standard Standing</span>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-border">
                <span className="text-[11px] uppercase tracking-wider text-ink-muted font-bold block">Cumulative GPA</span>
                <span className="font-serif text-2xl font-bold text-forest mt-1 block">
                  {student.gpa ? student.gpa.toFixed(2) : '3.85'}
                </span>
                <span className="text-[10px] text-forest font-medium">Out of 4.0 Scale</span>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-border">
                <span className="text-[11px] uppercase tracking-wider text-ink-muted font-bold block">Enrolled Date</span>
                <span className="font-serif text-xl font-bold text-forest mt-1 block">
                  {student.enrollment_date}
                </span>
                <span className="text-[10px] text-ink-muted font-medium">Term 1 Matriculation</span>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-border">
                <span className="text-[11px] uppercase tracking-wider text-ink-muted font-bold block">Tuition Status</span>
                <span className="font-serif text-xl font-bold text-forest mt-1 block">
                  {studentFee ? studentFee.status : 'Cleared'}
                </span>
                <span className="text-[10px] text-botanical-green font-medium">No holds active</span>
              </div>
            </div>

            {/* Detailed Grid: Contact & Guardian */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <h4 className="font-serif text-base font-semibold text-forest flex items-center gap-2">
                  <Mail className="w-4 h-4 text-ink-muted" />
                  <span>Student Communication Details</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-ink-muted">Official Email:</span>
                    <span className="font-medium text-ink">{student.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-ink-muted">Phone Number:</span>
                    <span className="font-medium text-ink">{student.phone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-ink-muted">Gender:</span>
                    <span className="font-medium text-ink">{student.gender}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-ink-muted">Date of Birth:</span>
                    <span className="font-medium text-ink">{student.date_of_birth}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-ink-muted">Residential Hall:</span>
                    <span className="font-medium text-ink text-right max-w-[200px]">{student.address || 'Camden Quadrangle, Hall 4'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <h4 className="font-serif text-base font-semibold text-forest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-ink-muted" />
                  <span>Guardian / Emergency Sponsor</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-ink-muted">Guardian Name:</span>
                    <span className="font-medium text-ink">{student.guardian.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-ink-muted">Relationship:</span>
                    <span className="font-medium text-ink">{student.guardian.relation}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-ink-muted">Emergency Phone:</span>
                    <span className="font-medium text-ink">{student.guardian.phone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-ink-muted">Occupation:</span>
                    <span className="font-medium text-ink">{student.guardian.occupation || 'Professional'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-ink-muted">Guardian Email:</span>
                    <span className="font-medium text-ink">{student.guardian.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Notes */}
            {student.notes && (
              <div className="p-4 rounded-xl bg-porcelain border border-border">
                <h5 className="text-xs font-bold text-forest uppercase tracking-wider mb-1">
                  Institutional Notes & Honors
                </h5>
                <p className="text-xs text-ink italic font-serif leading-relaxed">
                  "{student.notes}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ATTENDANCE HISTORY */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-muted font-medium">
                Overall Rate: <strong className="text-forest">{student.attendance_rate ?? 95}%</strong>
              </span>
              <span className="text-xs text-botanical-green font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Compliant with 75% Institutional Threshold
              </span>
            </div>

            <div className="border border-border rounded-xl overflow-hidden bg-surface">
              <table className="w-full text-left text-xs">
                <thead className="bg-porcelain border-b border-border text-ink-muted font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Subject / Course</th>
                    <th className="p-3">Session</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {studentAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-ink-muted">
                        No individual attendance absences or tardiness logged for this term.
                      </td>
                    </tr>
                  ) : (
                    studentAttendance.map(att => (
                      <tr key={att.id} className="hover:bg-porcelain/30">
                        <td className="p-3 font-mono font-medium">{att.date}</td>
                        <td className="p-3">{att.subject_name || student.course_name}</td>
                        <td className="p-3">{att.session}</td>
                        <td className="p-3">
                          <Badge
                            variant={
                              att.status === 'Present'
                                ? 'sage'
                                : att.status === 'Absent'
                                ? 'terracotta'
                                : att.status === 'Late'
                                ? 'sand'
                                : 'lavender'
                            }
                          >
                            {att.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-ink-muted italic">{att.remarks || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: EXAMINATION RESULTS */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            {studentResults.length === 0 ? (
              <div className="p-8 text-center bg-surface border border-border rounded-xl text-ink-muted text-xs">
                Mid-Term evaluations for the active term are currently scheduled. Past archived semesters can be requested from the Dean of Academics.
              </div>
            ) : (
              studentResults.map(res => (
                <div key={res.id} className="p-4 rounded-xl bg-surface border border-border space-y-3">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-forest">{res.examination_title}</h4>
                      <p className="text-xs text-ink-muted">Published: {res.published_date} • Semester {res.semester}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs uppercase font-bold text-ink-muted tracking-wider block">Grade</span>
                      <span className="font-serif text-2xl font-bold text-botanical-green">{res.overall_grade}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {res.subjects.map(subj => (
                      <div key={subj.subject_id} className="flex items-center justify-between text-xs py-1.5 border-b border-border/40">
                        <span className="text-ink font-medium">{subj.subject_name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-ink-muted">{subj.marks_obtained} / {subj.max_marks}</span>
                          <Badge variant="sage">{subj.grade}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs font-semibold text-forest bg-porcelain/40 p-2 rounded-lg">
                    <span>Overall Score: {res.percentage}%</span>
                    <span>Cumulative GPA: {res.gpa.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: FEES LEDGER */}
        {activeTab === 'fees' && (
          <div className="space-y-4">
            {studentFee ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-surface border border-border">
                    <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Total Billed</span>
                    <p className="font-serif text-xl font-bold text-forest mt-1">{formatCurrency(studentFee.net_payable)}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface border border-border">
                    <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Settled to Date</span>
                    <p className="font-serif text-xl font-bold text-botanical-green mt-1">{formatCurrency(studentFee.paid_amount)}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface border border-border">
                    <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Outstanding Balance</span>
                    <p className="font-serif text-xl font-bold text-botanical-terracotta mt-1">{formatCurrency(studentFee.balance_amount)}</p>
                  </div>
                </div>

                <div className="border border-border rounded-xl bg-surface p-4">
                  <h5 className="font-serif text-sm font-semibold text-forest mb-3">Recorded Payment Receipts</h5>
                  {studentFee.payments.length === 0 ? (
                    <p className="text-xs text-ink-muted">No payments logged yet for this academic invoice.</p>
                  ) : (
                    <div className="space-y-2">
                      {studentFee.payments.map(pay => (
                        <div key={pay.id} className="flex items-center justify-between p-2.5 rounded-lg bg-porcelain/50 border border-border text-xs">
                          <div>
                            <span className="font-mono font-bold text-forest">{pay.receipt_number}</span>
                            <span className="text-ink-muted block text-[10px]">{pay.payment_date} via {pay.payment_method}</span>
                          </div>
                          <span className="font-serif font-bold text-forest text-sm">{formatCurrency(pay.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-ink-muted p-6 bg-surface rounded-xl border border-border text-center">
                Fee structures have been settled in full for previous academic cycles.
              </p>
            )}
          </div>
        )}

        {/* TAB 5: DOCUMENTS & CREDENTIALS */}
        {activeTab === 'documents' && (
          <div className="space-y-3">
            {[
              { title: 'Matriculation Oath & Enrollment Certificate', size: '1.2 MB PDF', date: student.enrollment_date },
              { title: 'Official High School Transcripts & Verification', size: '2.4 MB PDF', date: '2023-07-28' },
              { title: 'Campus Health Immunization Clearance Form', size: '420 KB PDF', date: '2023-08-01' },
              { title: 'Annual Library & Computing Lab Pass', size: '180 KB PDF', date: '2025-08-15' },
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-border hover:bg-porcelain/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileCheck2 className="w-4 h-4 text-forest" />
                  <div>
                    <p className="text-xs font-semibold text-forest">{doc.title}</p>
                    <span className="text-[10px] text-ink-muted">{doc.size} • Issued {doc.date}</span>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Downloading verified institutional credential: ${doc.title}`)}
                  className="flex items-center gap-1 text-xs text-forest hover:underline font-medium px-2.5 py-1 rounded-lg border border-border bg-porcelain"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-medium text-forest bg-surface hover:bg-black/5 border border-border transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </Modal>
  );
};
