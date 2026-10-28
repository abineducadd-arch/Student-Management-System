import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  UserPlus, 
  ArrowUpRight, 
  BookOpen, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  CalendarCheck,
  Plus,
  Sparkles,
  ArrowRight,
  Eye,
  CreditCard,
  Edit,
  Trash2
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { CampusArchIllustration, LeafWatermark, SunRays } from '@/components/ui/BotanicalDecorations';
import { dataService, subscribeToDataChanges } from '@/services/dataService';
import { Student, Course, AcademicEvent } from '@/types';

interface DashboardPageProps {
  onOpenAddStudent: () => void;
  onOpenMarkAttendance: () => void;
  onOpenAddCourse: () => void;
  onViewStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenAddStudent,
  onOpenMarkAttendance,
  onOpenAddCourse,
  onViewStudent,
  onEditStudent,
}) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date(2025, 9, 28)); // 28 Oct 2025
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 9, 28));
  const [activeMenuStudentId, setActiveMenuStudentId] = useState<string | null>(null);

  // Sync with data store
  useEffect(() => {
    const refreshData = () => {
      setStudents(dataService.getStudents());
      setCourses(dataService.getCourses());
      setEvents(dataService.getEvents());
    };
    refreshData();
    return subscribeToDataChanges(refreshData);
  }, []);

  // Calculate real metrics
  const totalStudentsCount = 1284; // base institutional registry count + created students
  const displayTotalStudents = totalStudentsCount + (students.length - 5);
  const activeCoursesCount = courses.length > 0 ? courses.length * 4 + 4 : 24; // curriculum count

  // Calculate attendance rate from records
  const attRecords = dataService.getAttendanceRecords();
  const presentCount = attRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const attendanceRate = attRecords.length > 0 ? ((presentCount / attRecords.length) * 100).toFixed(1) : '94.6';

  // Calendar logic
  const monthStart = startOfMonth(currentCalendarDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentCalendarDate(subMonths(currentCalendarDate, 1));
  const nextMonth = () => setCurrentCalendarDate(addMonths(currentCalendarDate, 1));

  // Events for selected date
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dateEvents = events.filter(e => e.date === selectedDateStr);

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Are you sure you want to remove this student dossier?')) {
      dataService.deleteStudent(studentId);
      setActiveMenuStudentId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      {/* 2-Column Responsive Layout: Main Column (Left 70%) & Widget Column (Right 30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT / MAIN CONTENT AREA (lg:col-span-8) ================= */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* A. WELCOME EDITORIAL BANNER */}
          <div className="relative rounded-[22px] bg-gradient-to-br from-[#FAF6EE] via-[#F6F1E6] to-[#ECE3D2] border border-[#E3DDD2] p-6 sm:p-8 overflow-hidden shadow-warm">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Text side */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center gap-2">
                  <SunRays className="w-4 h-4 text-botanical-amber" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#72776F]">
                    {format(new Date(), 'EEEE, dd MMM yyyy')} • Academic Term Fall
                  </span>
                </div>

                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#17221D] tracking-tight leading-tight">
                    Good Morning,
                    <span className="font-handwriting font-normal text-4xl sm:text-5xl text-[#263329] ml-2.5 inline-flex items-center">
                      Abin
                      <span className="inline-block -mt-4 ml-1 text-botanical-amber text-lg">✦</span>
                    </span>
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-[#72776F] max-w-lg leading-relaxed font-sans">
                  Education is not just about learning, it's about building a better tomorrow.
                </p>
              </div>

              {/* Graphic side: Campus Building Cutout & Hand-drawn annotation */}
              <div className="md:col-span-5 relative flex flex-col items-center justify-center">
                <div className="relative w-full max-w-[280px] h-44 sm:h-48 drop-shadow-md">
                  <CampusArchIllustration className="w-full h-full" />
                </div>
                {/* Handwritten Floating Note */}
                <div className="absolute -top-1 right-2 sm:right-6 transform rotate-6 bg-[#FAF6EE]/90 backdrop-blur-xs px-3 py-1 rounded-full border border-[#E9D3B5] shadow-warm-sm pointer-events-none">
                  <span className="font-handwriting text-lg text-[#263329] whitespace-nowrap">
                    Small steps Big dreams ✨
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* B. 4 SUMMARY METRICS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Card 1: Total Students */}
            <div className="editorial-card p-4 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-full bg-[#EBF2DE] flex items-center justify-center text-[#263329] border border-[#CFDCBA]">
                  <Users className="w-4 h-4" />
                </div>
                <LeafWatermark className="w-16 h-16 absolute -right-3 -bottom-3 text-sage opacity-40 group-hover:opacity-70 transition-opacity" color="#D9E2C6" />
              </div>
              <span className="text-[11px] font-sans font-medium text-[#72776F] block">Total Students</span>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#17221D] mt-0.5">
                {displayTotalStudents.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-botanical-green font-medium mt-1.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>8.4% from last term</span>
              </div>
            </div>

            {/* Card 2: Active Courses */}
            <div className="editorial-card p-4 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-full bg-[#F2ECF7] flex items-center justify-center text-[#402D52] border border-[#DDD1EA]">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="w-16 h-16 rounded-full bg-[#DDD1EA]/25 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] font-sans font-medium text-[#72776F] block">Active Courses</span>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#17221D] mt-0.5">
                {activeCoursesCount}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-botanical-green font-medium mt-1.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>2 new this month</span>
              </div>
            </div>

            {/* Card 3: Attendance Rate */}
            <div className="editorial-card p-4 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-full bg-[#F7EEDF] flex items-center justify-center text-[#593E1F] border border-[#E9D3B5]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="w-16 h-16 rounded-full bg-[#E9D3B5]/25 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] font-sans font-medium text-[#72776F] block">Attendance Rate</span>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#17221D] mt-0.5">
                {attendanceRate}%
              </div>
              <div className="flex items-center gap-1 text-[11px] text-botanical-green font-medium mt-1.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>1.8% from last month</span>
              </div>
            </div>

            {/* Card 4: New Admissions */}
            <div className="editorial-card p-4 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-full bg-[#EBF2DE] flex items-center justify-center text-[#263329] border border-[#CFDCBA]">
                  <UserPlus className="w-4 h-4" />
                </div>
                <LeafWatermark className="w-16 h-16 absolute -right-3 -bottom-3 text-sage opacity-40 group-hover:opacity-70 transition-opacity" color="#D9E2C6" />
              </div>
              <span className="text-[11px] font-sans font-medium text-[#72776F] block">New Admissions</span>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#17221D] mt-0.5">
                38
              </div>
              <div className="flex items-center gap-1 text-[11px] text-botanical-green font-medium mt-1.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>12% from last month</span>
              </div>
            </div>
          </div>

          {/* C. FEATURED EDITORIAL PANEL: "Building Future Leaders" */}
          <div className="editorial-card p-6 sm:p-8 relative overflow-hidden bg-[#FAF6EE]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Text Side */}
              <div className="md:col-span-6 space-y-4">
                <span className="text-[10px] font-bold tracking-widest text-[#72776F] uppercase">
                  FEATURED
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#17221D] leading-tight">
                  Building <br className="hidden sm:inline" /> Future Leaders
                </h3>
                <p className="text-xs sm:text-sm text-[#72776F] leading-relaxed">
                  Our student management system helps you track, support, and empower every learner's journey.
                </p>
                <div className="pt-2 flex items-center gap-4">
                  <button
                    onClick={() => navigate('/students')}
                    className="btn-forest px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-warm-sm group"
                  >
                    <span>Explore Students</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  {/* Slider dots */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#263329]" />
                    <span className="w-2 h-2 rounded-full bg-[#E3DDD2]" />
                    <span className="w-2 h-2 rounded-full bg-[#E3DDD2]" />
                  </div>
                </div>
              </div>

              {/* Image Side: Hardcover books, ceramic vase, warm sunlight */}
              <div className="md:col-span-6 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-warm aspect-[16/10] border border-[#E3DDD2] bg-[#F4F0E8] group">
                  <img
                    src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
                    alt="Hardcover books stacked on wooden table with eucalyptus and pen"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle warm overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/30 via-transparent to-transparent pointer-events-none" />
                </div>
                {/* Handwritten Floating Annotation */}
                <div className="absolute -top-3 right-4 transform -rotate-3 bg-[#FAF6EE] px-3.5 py-1 rounded-full border border-[#E9D3B5] shadow-warm pointer-events-none">
                  <span className="font-handwriting text-base text-[#263329] whitespace-nowrap">
                    Great minds grow here ✨
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* D. RECENT STUDENTS TABLE */}
          <div className="editorial-card p-6 bg-[#FBF9F4]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-bold text-[#17221D]">Recent Students</h3>
              <button
                onClick={() => navigate('/students')}
                className="text-xs font-semibold text-[#263329] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6EE] border-y border-[#E3DDD2] text-[#72776F] font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DDD2]/60">
                  {students.slice(0, 5).map(student => (
                    <tr key={student.id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                      {/* Name with Avatar */}
                      <td className="py-3 px-4">
                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => onViewStudent(student)}
                        >
                          <Avatar name={student.full_name} src={student.avatar_url} size="sm" />
                          <span className="font-semibold text-[#17221D] group-hover:text-[#263329] group-hover:underline">
                            {student.full_name}
                          </span>
                        </div>
                      </td>

                      {/* Student ID */}
                      <td className="py-3 px-4 font-mono text-[#72776F] font-medium">
                        {student.student_id}
                      </td>

                      {/* Course */}
                      <td className="py-3 px-4 text-[#17221D]">
                        {student.course_name}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge
                          variant={student.status === 'Active' ? 'sage' : 'terracotta'}
                          size="sm"
                        >
                          {student.status}
                        </Badge>
                      </td>

                      {/* Action Menu */}
                      <td className="py-3 px-4 text-right relative">
                        <button
                          onClick={() => setActiveMenuStudentId(activeMenuStudentId === student.id ? null : student.id)}
                          className="p-1 rounded-full text-[#72776F] hover:text-[#17221D] hover:bg-black/5 transition-colors"
                          aria-label="Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action Dropdown Menu */}
                        {activeMenuStudentId === student.id && (
                          <div className="absolute right-4 top-8 w-44 bg-[#FBF9F4] border border-[#E3DDD2] rounded-xl shadow-warm-lg p-1.5 z-20 text-left animate-slide-up">
                            <button
                              onClick={() => { onViewStudent(student); setActiveMenuStudentId(null); }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#17221D] hover:bg-[#FAF6EE] transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-forest" />
                              <span>View Dossier</span>
                            </button>
                            <button
                              onClick={() => { onEditStudent(student); setActiveMenuStudentId(null); }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#17221D] hover:bg-[#FAF6EE] transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5 text-forest" />
                              <span>Edit Details</span>
                            </button>
                            <button
                              onClick={() => { navigate('/attendance'); setActiveMenuStudentId(null); }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#17221D] hover:bg-[#FAF6EE] transition-colors"
                            >
                              <CalendarCheck className="w-3.5 h-3.5 text-forest" />
                              <span>Check Attendance</span>
                            </button>
                            <div className="border-t border-[#E3DDD2] my-1" />
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#8C3A2E] hover:bg-[#FCECE9] transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Record</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ================= RIGHT / WIDGET SIDEBAR (lg:col-span-4) ================= */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. FUNCTIONAL MONTHLY CALENDAR */}
          <div className="editorial-card p-5 bg-[#FBF9F4]">
            {/* Month Header with chevrons */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-serif text-lg font-bold text-[#17221D]">
                {format(currentCalendarDate, 'MMMM yyyy')}
              </h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1 rounded-lg text-[#72776F] hover:text-[#17221D] hover:bg-black/5 transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1 rounded-lg text-[#72776F] hover:text-[#17221D] hover:bg-black/5 transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day of week abbreviations */}
            <div className="grid grid-cols-7 text-center text-[11px] font-sans text-[#72776F] mb-2 font-medium">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {calendarDays.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, currentCalendarDate);
                const isSelected = isSameDay(day, selectedDate);
                const hasEvent = events.some(e => e.date === format(day, 'yyyy-MM-dd'));

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={`relative w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs font-medium transition-all ${
                      !isCurrentMonth ? 'text-[#72776F]/30' : 'text-[#17221D]'
                    } ${
                      isSelected
                        ? 'bg-[#263329] text-[#FBF9F4] font-bold shadow-warm-sm'
                        : 'hover:bg-[#FAF6EE]'
                    }`}
                  >
                    <span>{format(day, 'd')}</span>
                    {hasEvent && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-botanical-amber" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected date preview if an event occurs on that day */}
            {dateEvents.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#E3DDD2] text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#72776F]">
                  Events on {format(selectedDate, 'MMM d')}:
                </span>
                <div className="mt-1.5 space-y-1">
                  {dateEvents.map(e => (
                    <div key={e.id} className="p-2 rounded-lg bg-[#FAF6EE] border border-[#E3DDD2] text-xs flex justify-between items-center">
                      <span className="font-semibold text-[#17221D]">{e.title}</span>
                      <Badge variant="sage">{e.category}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. QUICK ACTIONS (2x2 Grid) */}
          <div className="editorial-card p-5 bg-[#FBF9F4]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-serif text-lg font-bold text-[#17221D]">Quick Actions</h4>
              <Sparkles className="w-4 h-4 text-botanical-amber" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Action 1: Add Student */}
              <button
                onClick={onOpenAddStudent}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#EBF2DE] border border-[#CFDCBA] hover:bg-[#D9E2C6] transition-all group shadow-warm-sm"
              >
                <div className="w-9 h-9 rounded-full bg-[#3E5C38] text-surface flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-[#17221D]">Add Student</span>
              </button>

              {/* Action 2: Mark Attendance */}
              <button
                onClick={onOpenMarkAttendance}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#F2ECF7] border border-[#DDD1EA] hover:bg-[#E5D7F2] transition-all group shadow-warm-sm"
              >
                <div className="w-9 h-9 rounded-full bg-[#553E6B] text-surface flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-[#17221D]">Mark Attendance</span>
              </button>

              {/* Action 3: Add Course */}
              <button
                onClick={onOpenAddCourse}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#F7EEDF] border border-[#E9D3B5] hover:bg-[#EEDBBF] transition-all group shadow-warm-sm"
              >
                <div className="w-9 h-9 rounded-full bg-[#785429] text-surface flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-[#17221D]">Add Course</span>
              </button>

              {/* Action 4: Generate Report */}
              <button
                onClick={() => navigate('/reports')}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#EAF0F4] border border-[#CADAE5] hover:bg-[#D8E6F2] transition-all group shadow-warm-sm"
              >
                <div className="w-9 h-9 rounded-full bg-[#2A495E] text-surface flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-[#17221D]">Generate Report</span>
              </button>
            </div>
          </div>

          {/* 3. UPCOMING EVENTS */}
          <div className="editorial-card p-5 bg-[#FBF9F4]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-serif text-lg font-bold text-[#17221D]">Upcoming Events</h4>
              <button
                onClick={() => navigate('/academics')}
                className="text-xs font-semibold text-[#263329] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {events.slice(0, 3).map((event, idx) => {
                const dateParts = event.date.split('-');
                const dayNum = dateParts[2] || '29';
                const monthName = format(new Date(event.date), 'MMM');

                const badgeBg =
                  event.color_accent === 'sage'
                    ? 'bg-[#EBF2DE] text-[#3E5C38] border-[#CFDCBA]'
                    : event.color_accent === 'lavender'
                    ? 'bg-[#F2ECF7] text-[#553E6B] border-[#DDD1EA]'
                    : 'bg-[#F7EEDF] text-[#785429] border-[#E9D3B5]';

                return (
                  <div
                    key={event.id || idx}
                    className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E3DDD2] hover:bg-[#F4F0E8] transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                    onClick={() => alert(`Academic Event: ${event.title}\n${event.description}\nAudience: ${event.audience}`)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Date Badge */}
                      <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shrink-0 ${badgeBg}`}>
                        <span className="text-sm font-bold font-mono leading-none">{dayNum}</span>
                        <span className="text-[10px] uppercase font-semibold mt-0.5">{monthName}</span>
                      </div>
                      {/* Title & Audience */}
                      <div>
                        <h5 className="font-semibold text-xs text-[#17221D] group-hover:text-[#263329]">
                          {event.title}
                        </h5>
                        <p className="text-[11px] text-[#72776F] mt-0.5">
                          {event.audience}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#72776F] group-hover:text-[#17221D] transition-colors shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer branding */}
          <div className="text-center text-[11px] text-[#72776F] py-2">
            <span>Aurelia v1.0 • Made with ♡ for education</span>
          </div>

        </div>

      </div>
    </div>
  );
};
