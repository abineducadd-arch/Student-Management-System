import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, BookOpen, Calendar, FileText, CreditCard, BarChart2, Settings, Plus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '@/services/dataService';
import { Student } from '@/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddStudent?: () => void;
  onOpenMarkAttendance?: () => void;
  onOpenAddCourse?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenAddStudent,
  onOpenMarkAttendance,
  onOpenAddCourse,
}) => {
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setStudents(dataService.getStudents());
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via document event or props
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredStudents = query.trim()
    ? students.filter(
        s =>
          s.full_name.toLowerCase().includes(query.toLowerCase()) ||
          s.student_id.toLowerCase().includes(query.toLowerCase()) ||
          s.course_name.toLowerCase().includes(query.toLowerCase()) ||
          s.email.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const navItems = [
    { title: 'Dashboard', path: '/', icon: ArrowRight, desc: 'Overview, statistics, and quick metrics' },
    { title: 'Students Directory', path: '/students', icon: User, desc: 'Manage dossiers, enrollments, and profiles' },
    { title: 'Academics & Courses', path: '/academics', icon: BookOpen, desc: 'Departments, course structures, and faculty' },
    { title: 'Attendance Register', path: '/attendance', icon: Calendar, desc: 'Daily records, session tracking, and alerts' },
    { title: 'Examinations & Marks', path: '/examinations', icon: FileText, desc: 'Exam schedules, marksheets, and grading' },
    { title: 'Fees & Accounting', path: '/fees', icon: CreditCard, desc: 'Tuition balances, payments, and receipts' },
    { title: 'Reports & Analytics', path: '/reports', icon: BarChart2, desc: 'Institutional trends and visualizations' },
    { title: 'Institutional Settings', path: '/settings', icon: Settings, desc: 'Grading scale, threshold, and Supabase database' },
  ].filter(item => !query.trim() || item.title.toLowerCase().includes(query.toLowerCase()) || item.desc.toLowerCase().includes(query.toLowerCase()));

  const handleSelectNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSelectStudent = (studentId: string) => {
    navigate(`/students?id=${studentId}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-forest/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl bg-[#FBF9F4] border border-border shadow-warm-xl rounded-editorial overflow-hidden z-20 flex flex-col max-h-[75vh]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-border bg-porcelain/50 gap-3">
              <Search className="w-5 h-5 text-ink-muted" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search students by name, ID, course, or navigate..."
                className="w-full bg-transparent text-ink placeholder:text-ink-muted/70 text-base focus:outline-none"
                autoFocus
              />
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-surface border border-border text-ink-muted">
                ESC
              </span>
            </div>

            {/* Results list */}
            <div className="p-3 overflow-y-auto space-y-4">
              {/* Quick Actions if query matches */}
              {(!query || 'add student mark attendance course'.includes(query.toLowerCase())) && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                    Quick Actions
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mt-1">
                    {onOpenAddStudent && (
                      <button
                        onClick={() => { onClose(); onOpenAddStudent(); }}
                        className="flex items-center gap-2 p-2.5 rounded-lg text-left text-xs font-medium text-forest hover:bg-sage/40 transition-colors border border-border/50"
                      >
                        <Plus className="w-4 h-4 text-forest" />
                        <span>Add Student</span>
                      </button>
                    )}
                    {onOpenMarkAttendance && (
                      <button
                        onClick={() => { onClose(); onOpenMarkAttendance(); }}
                        className="flex items-center gap-2 p-2.5 rounded-lg text-left text-xs font-medium text-forest hover:bg-lavender/40 transition-colors border border-border/50"
                      >
                        <Calendar className="w-4 h-4 text-forest" />
                        <span>Mark Attendance</span>
                      </button>
                    )}
                    {onOpenAddCourse && (
                      <button
                        onClick={() => { onClose(); onOpenAddCourse(); }}
                        className="flex items-center gap-2 p-2.5 rounded-lg text-left text-xs font-medium text-forest hover:bg-sand/40 transition-colors border border-border/50"
                      >
                        <BookOpen className="w-4 h-4 text-forest" />
                        <span>Add Course</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Matching Students */}
              {filteredStudents.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                    Students ({filteredStudents.length})
                  </div>
                  <div className="mt-1 space-y-1">
                    {filteredStudents.map(student => (
                      <button
                        key={student.id}
                        onClick={() => handleSelectStudent(student.id)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-porcelain transition-colors border border-transparent hover:border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-sage/60 text-forest font-medium flex items-center justify-center text-xs">
                            {student.first_name[0]}{student.last_name[0]}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-ink flex items-center gap-2">
                              {student.full_name}
                              <span className="text-xs font-mono text-ink-muted">({student.student_id})</span>
                            </div>
                            <div className="text-xs text-ink-muted">{student.course_name} • Sem {student.semester}</div>
                          </div>
                        </div>
                        <span className="text-xs text-ink-muted flex items-center gap-1">
                          View Dossier <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation items */}
              <div>
                <div className="px-3 py-1 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                  Navigation
                </div>
                <div className="mt-1 space-y-1">
                  {navItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleSelectNav(item.path)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-porcelain transition-colors border border-transparent hover:border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-surface border border-border text-forest">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-ink">{item.title}</div>
                            <div className="text-xs text-ink-muted">{item.desc}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-ink-muted" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-2.5 px-4 border-t border-border bg-porcelain/30 flex items-center justify-between text-xs text-ink-muted">
              <span>Navigate with arrow keys or click</span>
              <span>Aurelia Academic Command</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

