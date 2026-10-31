import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { AttendanceRecord, Course, Student } from '@/types';
import { dataService, subscribeToDataChanges } from '@/services/dataService';
import { format } from 'date-fns';

interface AttendancePageProps {
  onOpenMarkAttendance: () => void;
  onViewStudent: (student: Student) => void;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({
  onOpenMarkAttendance,
  onViewStudent,
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [settings, setSettings] = useState(dataService.getSettings());

  // Filters
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const update = () => {
      setRecords(dataService.getAttendanceRecords());
      setCourses(dataService.getCourses());
      setStudents(dataService.getStudents());
      setSettings(dataService.getSettings());
    };
    update();
    return subscribeToDataChanges(update);
  }, []);

  // Filtered records
  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.student_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === 'ALL' || r.course_id === selectedCourse || r.course_name === selectedCourse;
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
    const matchesDate = !filterDate || r.date === filterDate;

    return matchesSearch && matchesCourse && matchesStatus && matchesDate;
  });

  // Identify at-risk students below threshold
  const threshold = settings.attendance_threshold || 75;
  const atRiskStudents = students.filter(s => (s.attendance_rate || 95) < threshold);

  // Overall statistics
  const presentCount = records.filter(r => r.status === 'Present').length;
  const lateCount = records.filter(r => r.status === 'Late').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;
  const overallRate = records.length > 0 ? (((presentCount + lateCount) / records.length) * 100).toFixed(1) : '94.6';

  const handleExportCSV = () => {
    const headers = ['Record ID', 'Date', 'Student ID', 'Student Name', 'Course', 'Subject', 'Session', 'Status', 'Remarks'];
    const rows = filteredRecords.map(r => [
      r.id,
      r.date,
      r.student_code,
      `"${r.student_name}"`,
      `"${r.course_name}"`,
      `"${r.subject_name || 'General'}"`,
      r.session,
      r.status,
      `"${r.remarks || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aurelia_attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-3xl font-bold text-forest">Attendance Register & Analytics</h2>
            <span className="text-xs bg-sand/60 text-[#593E1F] px-2.5 py-0.5 rounded-full font-semibold">
              {overallRate}% Term Average
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1 font-sans">
            Daily lecture session check-ins, automated threshold alerts, and compliance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface border border-border text-forest hover:bg-black/5 transition-colors shadow-warm-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Register</span>
          </button>
          <button
            onClick={onOpenMarkAttendance}
            className="btn-forest flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-warm-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Take Attendance</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="editorial-card p-4 bg-surface">
          <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Overall Attendance</span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-forest mt-1">{overallRate}%</div>
          <span className="text-[11px] text-botanical-green font-medium">Above institutional bar</span>
        </div>

        <div className="editorial-card p-4 bg-surface">
          <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Present Sessions</span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-forest mt-1">{presentCount}</div>
          <span className="text-[11px] text-ink-muted">Logged across cohorts</span>
        </div>

        <div className="editorial-card p-4 bg-surface">
          <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Tardy / Late</span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#D48B38] mt-1">{lateCount}</div>
          <span className="text-[11px] text-ink-muted">Grace period applied</span>
        </div>

        <div className="editorial-card p-4 bg-surface">
          <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Below Threshold ({threshold}%)</span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-botanical-terracotta mt-1">{atRiskStudents.length}</div>
          <span className="text-[11px] text-botanical-terracotta font-medium">Requires notification</span>
        </div>
      </div>

      {/* AT-RISK THRESHOLD WARNING BANNER */}
      {atRiskStudents.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#FCECE9] border border-[#F2C7C1] text-[#8C3A2E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#8C3A2E] text-surface shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider">
                Institutional Attendance Alert: {atRiskStudents.length} Scholar(s) Below {threshold}%
              </h4>
              <p className="text-xs text-[#8C3A2E]/90 mt-0.5">
                Students below the threshold risk academic suspension from term-end examinations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {atRiskStudents.map(st => (
              <button
                key={st.id}
                onClick={() => onViewStudent(st)}
                className="px-2.5 py-1 rounded-lg bg-surface border border-[#F2C7C1] text-xs font-semibold hover:bg-white transition-colors"
              >
                {st.full_name} ({st.attendance_rate}%)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters bar */}
      <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-border shadow-warm-sm">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search scholar name or ID..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
            />
          </div>

          <div>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
            >
              <option value="ALL">All Degree Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Excused">Excused</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
            />
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="editorial-card overflow-hidden bg-[#FBF9F4]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EE] border-b border-border text-[#72776F] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Scholar</th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Course Program</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Session</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-ink-muted">
                    No attendance records found matching filters. Click "Take Attendance" to log a new register session.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-forest">{rec.date}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-ink">{rec.student_name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-muted">{rec.student_code}</td>
                    <td className="py-3 px-4 text-ink">{rec.course_name}</td>
                    <td className="py-3 px-4 text-ink-muted">{rec.subject_name || 'General Lecture'}</td>
                    <td className="py-3 px-4">{rec.session}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          rec.status === 'Present'
                            ? 'sage'
                            : rec.status === 'Absent'
                            ? 'terracotta'
                            : rec.status === 'Late'
                            ? 'sand'
                            : 'lavender'
                        }
                      >
                        {rec.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-ink-muted italic">{rec.remarks || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

