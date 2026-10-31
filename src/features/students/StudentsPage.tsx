import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload, 
  LayoutGrid, 
  List, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap,
  Sparkles,
  Phone,
  Mail
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Student, Department, Course, StudentStatus } from '@/types';
import { dataService, subscribeToDataChanges } from '@/services/dataService';

interface StudentsPageProps {
  onOpenAddStudent: () => void;
  onOpenImportStudent: () => void;
  onViewStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({
  onOpenAddStudent,
  onOpenImportStudent,
  onViewStudent,
  onEditStudent,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'id' | 'gpa' | 'attendance'>('name');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Context menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const refreshData = () => {
      setStudents(dataService.getStudents());
      setDepartments(dataService.getDepartments());
      setCourses(dataService.getCourses());
    };
    refreshData();
    return subscribeToDataChanges(refreshData);
  }, []);

  // Filter and sort students
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery);

    const matchesDept = selectedDept === 'ALL' || student.department_id === selectedDept || student.department_name === selectedDept;
    const matchesCourse = selectedCourse === 'ALL' || student.course_id === selectedCourse || student.course_name === selectedCourse;
    const matchesStatus = selectedStatus === 'ALL' || student.status === selectedStatus;

    return matchesSearch && matchesDept && matchesCourse && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.full_name.localeCompare(b.full_name);
    if (sortBy === 'id') return a.student_id.localeCompare(b.student_id);
    if (sortBy === 'gpa') return (b.gpa || 0) - (a.gpa || 0);
    if (sortBy === 'attendance') return (b.attendance_rate || 0) - (a.attendance_rate || 0);
    return 0;
  });

  // Pagination slice
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Confirm deletion of scholar dossier for ${name}?`)) {
      dataService.deleteStudent(id);
      setActiveMenuId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Full Name', 'Email', 'Phone', 'Gender', 'Department', 'Course', 'Semester', 'Status', 'Attendance', 'GPA'];
    const rows = filteredStudents.map(s => [
      s.student_id,
      `"${s.full_name}"`,
      s.email,
      s.phone,
      s.gender,
      `"${s.department_name}"`,
      `"${s.course_name}"`,
      s.semester,
      s.status,
      `${s.attendance_rate || 95}%`,
      s.gpa || 3.8
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aurelia_scholars_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-3xl font-bold text-forest">Scholar Directory</h2>
            <span className="text-xs bg-sage/60 text-forest px-2.5 py-0.5 rounded-full font-semibold">
              {filteredStudents.length} Scholars
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1 font-sans">
            Comprehensive student academic dossiers, active enrollments, and institutional registries.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenImportStudent}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface border border-border text-forest hover:bg-black/5 transition-colors shadow-warm-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface border border-border text-forest hover:bg-black/5 transition-colors shadow-warm-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddStudent}
            className="btn-forest flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-warm-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Scholar</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-border shadow-warm-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, student ID, email, or phone..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none transition-all placeholder:text-ink-muted/60"
            />
          </div>

          {/* Department Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedDept}
              onChange={e => { setSelectedDept(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedStatus}
              onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Graduated">Graduated</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* View toggle & Sort */}
          <div className="sm:col-span-2 flex items-center justify-end gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
            >
              <option value="name">Sort: Name</option>
              <option value="id">Sort: ID</option>
              <option value="gpa">Sort: GPA</option>
              <option value="attendance">Sort: Attendance</option>
            </select>

            <div className="flex border border-border rounded-xl bg-surface p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-forest text-surface' : 'text-ink-muted hover:text-ink'}`}
                aria-label="Table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('gallery')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'gallery' ? 'bg-forest text-surface' : 'text-ink-muted hover:text-ink'}`}
                aria-label="Gallery view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Students Display: Table or Gallery */}
      {viewMode === 'table' ? (
        <div className="editorial-card overflow-hidden bg-[#FBF9F4]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6EE] border-b border-border text-[#72776F] font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Scholar</th>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Course & Department</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4">Attendance</th>
                  <th className="py-3.5 px-4">GPA</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-ink-muted">
                      No scholars found matching the selected search query and filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map(student => (
                    <tr key={student.id} className="hover:bg-[#FAF6EE]/60 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => onViewStudent(student)}
                        >
                          <Avatar name={student.full_name} src={student.avatar_url} size="sm" />
                          <div>
                            <span className="font-semibold text-ink group-hover:text-forest group-hover:underline block">
                              {student.full_name}
                            </span>
                            <span className="text-[10px] text-ink-muted font-mono">{student.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Student ID */}
                      <td className="py-3 px-4 font-mono font-medium text-ink-muted">
                        {student.student_id}
                      </td>

                      {/* Course */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-ink block">{student.course_name}</span>
                        <span className="text-[10px] text-ink-muted block">{student.department_name}</span>
                      </td>

                      {/* Semester */}
                      <td className="py-3 px-4 font-medium text-ink">
                        Sem {student.semester}
                      </td>

                      {/* Attendance */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold font-mono ${
                            (student.attendance_rate || 95) < 75 ? 'text-botanical-terracotta' : 'text-forest'
                          }`}>
                            {student.attendance_rate || 95}%
                          </span>
                        </div>
                      </td>

                      {/* GPA */}
                      <td className="py-3 px-4 font-mono font-semibold text-forest">
                        {student.gpa ? student.gpa.toFixed(2) : '3.80'}
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

                      {/* Actions */}
                      <td className="py-3 px-4 text-right relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === student.id ? null : student.id)}
                          className="p-1.5 rounded-full text-ink-muted hover:text-ink hover:bg-black/5 transition-colors"
                          aria-label="Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === student.id && (
                          <div className="absolute right-4 top-8 w-44 bg-[#FBF9F4] border border-border rounded-xl shadow-warm-lg p-1.5 z-20 text-left animate-slide-up">
                            <button
                              onClick={() => { onViewStudent(student); setActiveMenuId(null); }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-ink hover:bg-porcelain transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-forest" />
                              <span>View Dossier</span>
                            </button>
                            <button
                              onClick={() => { onEditStudent(student); setActiveMenuId(null); }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-ink hover:bg-porcelain transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-forest" />
                              <span>Edit Record</span>
                            </button>
                            <div className="border-t border-border my-1" />
                            <button
                              onClick={() => handleDelete(student.id, student.full_name)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#8C3A2E] hover:bg-[#FCECE9] transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Record</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Gallery / Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedStudents.map(student => (
            <div
              key={student.id}
              className="editorial-card p-5 bg-[#FBF9F4] flex flex-col justify-between hover:border-forest/40 transition-all cursor-pointer group"
              onClick={() => onViewStudent(student)}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Avatar name={student.full_name} src={student.avatar_url} size="lg" className="border-2 border-surface shadow-sm" />
                  <Badge variant={student.status === 'Active' ? 'sage' : 'terracotta'}>
                    {student.status}
                  </Badge>
                </div>

                <h4 className="font-serif text-lg font-bold text-forest group-hover:text-forest-dark transition-colors">
                  {student.full_name}
                </h4>
                <p className="text-[11px] font-mono text-ink-muted">{student.student_id} • Sem {student.semester}</p>
                <p className="text-xs text-ink font-medium mt-2">{student.course_name}</p>
                <p className="text-[11px] text-ink-muted">{student.department_name}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-ink-muted uppercase font-bold block">Attendance</span>
                  <span className="font-mono font-semibold text-forest">{student.attendance_rate || 95}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted uppercase font-bold block">GPA</span>
                  <span className="font-mono font-semibold text-forest">{student.gpa ? student.gpa.toFixed(2) : '3.80'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-ink-muted pt-2 border-t border-border">
        <span>
          Showing {paginatedStudents.length} of {filteredStudents.length} enrolled scholars
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-border bg-surface text-ink disabled:opacity-40 hover:bg-black/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 font-mono font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-border bg-surface text-ink disabled:opacity-40 hover:bg-black/5 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

