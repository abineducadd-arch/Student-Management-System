import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Building2, 
  BookOpen, 
  Calendar, 
  Plus, 
  Edit3, 
  Users, 
  Clock, 
  CheckCircle2, 
  Archive,
  Search
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Course, Department, Subject } from '@/types';
import { dataService, subscribeToDataChanges } from '@/services/dataService';

interface AcademicsPageProps {
  onOpenAddCourse: () => void;
  onEditCourse: (course: Course) => void;
}

export const AcademicsPage: React.FC<AcademicsPageProps> = ({
  onOpenAddCourse,
  onEditCourse,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState<'courses' | 'departments' | 'subjects' | 'timetable'>('courses');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const update = () => {
      setCourses(dataService.getCourses());
      setDepartments(dataService.getDepartments());
      setSubjects(dataService.getSubjects());
    };
    update();
    return subscribeToDataChanges(update);
  }, []);

  const handleArchiveCourse = (courseId: string) => {
    if (confirm('Archive this course program? Current enrollments will be preserved.')) {
      dataService.updateCourse(courseId, { status: 'Archived' });
    }
  };

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.faculty_coordinator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-3xl font-bold text-forest">Academics & Curriculum</h2>
            <span className="text-xs bg-lavender/60 text-[#402D52] px-2.5 py-0.5 rounded-full font-semibold">
              {courses.length} Programs
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1 font-sans">
            Departments, syllabus structures, faculty leadership, and institutional schedules.
          </p>
        </div>

        <button
          onClick={onOpenAddCourse}
          className="btn-forest flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-warm-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course Program</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto text-xs font-medium pb-1">
        {[
          { id: 'courses', label: `Degree Courses (${courses.length})`, icon: GraduationCap },
          { id: 'departments', label: `Departments (${departments.length})`, icon: Building2 },
          { id: 'subjects', label: `Subjects & Modules (${subjects.length})`, icon: BookOpen },
          { id: 'timetable', label: 'Weekly Timetable', icon: Calendar },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-forest text-surface font-semibold shadow-warm-sm'
                  : 'text-ink-muted hover:text-forest hover:bg-black/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: COURSES */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search courses by title, code, or coordinator..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map(course => {
              const accentBorder =
                course.color_accent === 'sage'
                  ? 'border-t-4 border-t-[#8CA778]'
                  : course.color_accent === 'lavender'
                  ? 'border-t-4 border-t-[#A594B8]'
                  : course.color_accent === 'sand'
                  ? 'border-t-4 border-t-[#CBB291]'
                  : 'border-t-4 border-t-[#263329]';

              const enrolledCount = course.enrolled_students || 120;

              return (
                <div
                  key={course.id}
                  className={`editorial-card p-6 bg-[#FBF9F4] flex flex-col justify-between ${accentBorder} shadow-warm-sm`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-forest bg-porcelain px-2 py-0.5 rounded border border-border">
                        {course.code}
                      </span>
                      <Badge variant={course.status === 'Active' ? 'sage' : 'default'}>
                        {course.status}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-serif text-xl font-bold text-forest leading-snug">
                        {course.name}
                      </h3>
                      <p className="text-xs text-ink-muted mt-1">{course.department_name}</p>
                    </div>

                    <p className="text-xs text-ink/80 line-clamp-2 leading-relaxed">
                      {course.description || 'Full 4-year undergraduate curriculum accredited under institutional council standards.'}
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/80 text-center">
                      <div className="p-2 rounded-lg bg-porcelain/60">
                        <span className="text-[10px] text-ink-muted uppercase font-bold block">Duration</span>
                        <span className="text-xs font-bold text-forest">{course.duration_years} Years</span>
                      </div>
                      <div className="p-2 rounded-lg bg-porcelain/60">
                        <span className="text-[10px] text-ink-muted uppercase font-bold block">Semesters</span>
                        <span className="text-xs font-bold text-forest">{course.total_semesters} Terms</span>
                      </div>
                      <div className="p-2 rounded-lg bg-porcelain/60">
                        <span className="text-[10px] text-ink-muted uppercase font-bold block">Credits</span>
                        <span className="text-xs font-bold text-forest">{course.credits} Credits</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-ink-muted block uppercase font-bold">Coordinator</span>
                      <span className="font-medium text-ink">{course.faculty_coordinator}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditCourse(course)}
                        className="p-1.5 rounded-lg border border-border bg-surface hover:bg-black/5 text-forest transition-colors"
                        title="Edit Course"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {course.status === 'Active' && (
                        <button
                          onClick={() => handleArchiveCourse(course.id)}
                          className="p-1.5 rounded-lg border border-border bg-surface hover:bg-black/5 text-ink-muted hover:text-botanical-terracotta transition-colors"
                          title="Archive Course"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map(dept => (
            <div key={dept.id} className="editorial-card p-6 bg-[#FBF9F4] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-forest bg-sage/40 px-2 py-0.5 rounded border border-[#CFDCBA]">
                  {dept.code}
                </span>
                <span className="text-xs text-ink-muted font-medium">{dept.course_count} Programs</span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-forest">{dept.name}</h3>
                <p className="text-xs text-forest font-semibold mt-1">Chair: {dept.head_of_department}</p>
              </div>

              <p className="text-xs text-ink-muted leading-relaxed">
                {dept.description}
              </p>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-ink-muted">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-forest" />
                  <span>{dept.student_count} Enrolled Scholars</span>
                </span>
                <Badge variant="sage">Active Dept</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SUBJECTS */}
      {activeTab === 'subjects' && (
        <div className="editorial-card overflow-hidden bg-[#FBF9F4]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6EE] border-b border-border text-ink-muted font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Subject Code</th>
                  <th className="py-3 px-4">Subject Title</th>
                  <th className="py-3 px-4">Course Program</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Max Marks</th>
                  <th className="py-3 px-4">Faculty In-Charge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {subjects.map(subj => (
                  <tr key={subj.id} className="hover:bg-porcelain/30">
                    <td className="py-3 px-4 font-mono font-bold text-forest">{subj.code}</td>
                    <td className="py-3 px-4 font-semibold text-ink">{subj.name}</td>
                    <td className="py-3 px-4 text-ink-muted">{subj.course_name}</td>
                    <td className="py-3 px-4">Sem {subj.semester}</td>
                    <td className="py-3 px-4 font-mono font-medium">{subj.credits} Credits</td>
                    <td className="py-3 px-4 font-mono font-medium">{subj.max_marks}</td>
                    <td className="py-3 px-4 text-forest font-medium">{subj.faculty_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: WEEKLY TIMETABLE */}
      {activeTab === 'timetable' && (
        <div className="editorial-card p-6 bg-[#FBF9F4] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-forest">Undergraduate Fall 2025 Master Schedule</h3>
            <span className="text-xs text-ink-muted">Chancellor Building & Turing Computing Suites</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, idx) => (
              <div key={day} className="p-3.5 rounded-xl bg-porcelain/60 border border-border space-y-3">
                <span className="font-serif font-bold text-forest text-sm block border-b border-border/80 pb-1.5">
                  {day}
                </span>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-surface border border-border shadow-warm-sm">
                    <span className="text-[10px] text-ink-muted font-mono block">09:00 - 10:30 AM</span>
                    <strong className="text-forest block mt-0.5">CS301: Data Structures</strong>
                    <span className="text-[10px] text-ink-muted">Hall 204 • Dr. Vance</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface border border-border shadow-warm-sm">
                    <span className="text-[10px] text-ink-muted font-mono block">11:00 - 12:30 PM</span>
                    <strong className="text-forest block mt-0.5">CS302: DBMS Architecture</strong>
                    <span className="text-[10px] text-ink-muted">Lab 3 • Prof. Turing</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface border border-border shadow-warm-sm">
                    <span className="text-[10px] text-ink-muted font-mono block">02:00 - 03:30 PM</span>
                    <strong className="text-forest block mt-0.5">CS303: Computer Systems</strong>
                    <span className="text-[10px] text-ink-muted">Auditorium A</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

