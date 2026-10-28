import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  Plus, 
  Award, 
  Eye, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  Search,
  Printer
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Examination, ExamResult, Course } from '@/types';
import { dataService, subscribeToDataChanges } from '@/services/dataService';
import { MarksEntryModal } from './MarksEntryModal';
import { ReportCardModal } from './ReportCardModal';

export const ExaminationsPage: React.FC = () => {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<'schedules' | 'results' | 'grading'>('schedules');

  // Modals state
  const [selectedExamForEntry, setSelectedExamForEntry] = useState<Examination | null>(null);
  const [selectedResultForView, setSelectedResultForView] = useState<ExamResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const update = () => {
      setExaminations(dataService.getExaminations());
      setResults(dataService.getExamResults());
      setCourses(dataService.getCourses());
    };
    update();
    return subscribeToDataChanges(update);
  }, []);

  const handleCreateNewExam = () => {
    const title = prompt('Enter Examination Title (e.g. End Semester Evaluation Fall 2025):');
    if (!title) return;
    const course = courses[0];
    dataService.createExamination({
      title,
      course_id: course?.id || 'course-cs101',
      course_name: course?.name || 'Computer Science',
      academic_year: '2025-2026',
      semester: 3,
      start_date: '2025-11-20',
      end_date: '2025-11-28',
      status: 'Scheduled',
    });
  };

  const filteredResults = results.filter(r =>
    r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.student_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.examination_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-3xl font-bold text-forest">Examinations & Evaluations</h2>
            <span className="text-xs bg-sage/60 text-forest px-2.5 py-0.5 rounded-full font-semibold">
              {examinations.length} Active Exam Cycles
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1 font-sans">
            Schedules, subject maximum marks, grading compilation, and verified printable transcripts.
          </p>
        </div>

        <button
          onClick={handleCreateNewExam}
          className="btn-forest flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-warm-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Examination</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto text-xs font-medium pb-1">
        {[
          { id: 'schedules', label: `Scheduled Examinations (${examinations.length})`, icon: Calendar },
          { id: 'results', label: `Published Transcripts (${results.length})`, icon: Award },
          { id: 'grading', label: 'Institutional Grading Scale', icon: FileText },
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

      {/* TAB 1: SCHEDULES */}
      {activeTab === 'schedules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {examinations.map(exam => (
            <div key={exam.id} className="editorial-card p-6 bg-[#FBF9F4] space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={exam.status === 'Results Published' ? 'sage' : exam.status === 'In Progress' ? 'sand' : 'lavender'}>
                  {exam.status}
                </Badge>
                <span className="text-xs font-mono text-ink-muted">Year {exam.academic_year}</span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-forest">{exam.title}</h3>
                <p className="text-xs text-ink-muted mt-1">{exam.course_name} • Semester {exam.semester}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-porcelain/60 border border-border text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Commencement Date:</span>
                  <span className="font-medium text-forest">{exam.start_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Conclusion Date:</span>
                  <span className="font-medium text-forest">{exam.end_date}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-ink-muted">Standard Max Score: 100 per Subject</span>
                <button
                  onClick={() => setSelectedExamForEntry(exam)}
                  className="btn-forest px-4 py-2 rounded-xl text-xs font-semibold shadow-warm-sm flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Enter Marks</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: RESULTS */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by scholar name, ID, or examination title..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
            />
          </div>

          <div className="editorial-card overflow-hidden bg-[#FBF9F4]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6EE] border-b border-border text-[#72776F] font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Scholar</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Examination</th>
                    <th className="py-3 px-4">Aggregate Score</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">GPA</th>
                    <th className="py-3 px-4">Standing</th>
                    <th className="py-3 px-4 text-right">Transcript</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-ink-muted">
                        No published examination transcripts found. Select an examination under "Scheduled Examinations" and click "Enter Marks" to compile a result.
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map(res => (
                      <tr key={res.id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-ink">{res.student_name}</td>
                        <td className="py-3 px-4 font-mono text-ink-muted">{res.student_code}</td>
                        <td className="py-3 px-4 text-forest">{res.examination_title}</td>
                        <td className="py-3 px-4 font-mono font-medium">
                          {res.total_marks} / {res.total_max_marks}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-forest">{res.percentage}%</td>
                        <td className="py-3 px-4 font-mono font-bold text-forest">{res.gpa.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <Badge variant="sage">{res.overall_grade}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedResultForView(res)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-porcelain text-forest font-semibold text-xs transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Transcript</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GRADING RULES */}
      {activeTab === 'grading' && (
        <div className="editorial-card p-6 bg-[#FBF9F4] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-forest">Institutional Grading Scale Rules</h3>
            <span className="text-xs text-ink-muted">Configurable under Institutional Settings</span>
          </div>

          <div className="border border-border rounded-xl overflow-hidden bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="bg-porcelain border-b border-border text-ink-muted font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Letter Grade</th>
                  <th className="py-3 px-4">Score Range</th>
                  <th className="py-3 px-4">GPA Equivalent</th>
                  <th className="py-3 px-4">Mastery Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  { grade: 'A+', min: 90, max: 100, gpa: 4.0, desc: 'Outstanding Distinction' },
                  { grade: 'A', min: 80, max: 89, gpa: 3.7, desc: 'Excellent Mastery' },
                  { grade: 'B+', min: 70, max: 79, gpa: 3.3, desc: 'Very Good Performance' },
                  { grade: 'B', min: 60, max: 69, gpa: 3.0, desc: 'Good Standing' },
                  { grade: 'C', min: 50, max: 59, gpa: 2.0, desc: 'Satisfactory' },
                  { grade: 'F', min: 0, max: 49, gpa: 0.0, desc: 'Needs Remediation' },
                ].map(tier => (
                  <tr key={tier.grade} className="hover:bg-porcelain/30">
                    <td className="py-3 px-4 font-bold text-forest text-sm">{tier.grade}</td>
                    <td className="py-3 px-4 font-mono font-medium">{tier.min}% – {tier.max}%</td>
                    <td className="py-3 px-4 font-mono font-bold text-forest">{tier.gpa.toFixed(1)}</td>
                    <td className="py-3 px-4 text-ink">{tier.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Marks Entry Modal */}
      <MarksEntryModal
        isOpen={!!selectedExamForEntry}
        onClose={() => setSelectedExamForEntry(null)}
        examination={selectedExamForEntry}
      />

      {/* Report Card Printable Modal */}
      <ReportCardModal
        isOpen={!!selectedResultForView}
        onClose={() => setSelectedResultForView(null)}
        result={selectedResultForView}
      />
    </div>
  );
};
