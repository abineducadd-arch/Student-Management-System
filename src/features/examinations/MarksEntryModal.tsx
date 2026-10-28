import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Examination, Student, Subject, SubjectMark, ExamResult } from '@/types';
import { dataService } from '@/services/dataService';
import confetti from 'canvas-confetti';

interface MarksEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  examination: Examination | null;
  onSuccess?: () => void;
}

export const MarksEntryModal: React.FC<MarksEntryModalProps> = ({
  isOpen,
  onClose,
  examination,
  onSuccess,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState('');
  const [settings, setSettings] = useState(dataService.getSettings());

  useEffect(() => {
    if (isOpen && examination) {
      const allStudents = dataService.getStudents();
      const enrolled = allStudents.filter(s => s.course_id === examination.course_id || !examination.course_id);
      setStudents(enrolled);
      if (enrolled.length > 0) {
        setSelectedStudentId(enrolled[0].id);
      }

      const allSubjs = dataService.getSubjects();
      const courseSubjs = allSubjs.filter(s => s.course_id === examination.course_id);
      setSubjects(courseSubjs.length > 0 ? courseSubjs : allSubjs.slice(0, 3));

      // Initial marks
      const initialMarks: Record<string, number> = {};
      (courseSubjs.length > 0 ? courseSubjs : allSubjs.slice(0, 3)).forEach(s => {
        initialMarks[s.id] = 85;
      });
      setMarksMap(initialMarks);
      setSettings(dataService.getSettings());
      setRemarks('Commendable theoretical comprehension.');
    }
  }, [isOpen, examination]);

  if (!examination) return null;

  const gradingScale = settings.grading_scale || [
    { grade: 'A+', min_score: 90, max_score: 100, gpa: 4.0 },
    { grade: 'A', min_score: 80, max_score: 89, gpa: 3.7 },
    { grade: 'B+', min_score: 70, max_score: 79, gpa: 3.3 },
    { grade: 'B', min_score: 60, max_score: 69, gpa: 3.0 },
    { grade: 'C', min_score: 50, max_score: 59, gpa: 2.0 },
    { grade: 'F', min_score: 0, max_score: 49, gpa: 0.0 },
  ];

  const calculateGrade = (score: number) => {
    for (const tier of gradingScale) {
      if (score >= tier.min_score && score <= tier.max_score) {
        return tier.grade;
      }
    }
    return score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : 'C';
  };

  const calculateGPA = (score: number) => {
    for (const tier of gradingScale) {
      if (score >= tier.min_score && score <= tier.max_score) {
        return tier.gpa;
      }
    }
    return (score / 25).toFixed(2);
  };

  // Calculations
  const subjectBreakdown: SubjectMark[] = subjects.map(s => {
    const mark = Math.min(s.max_marks, Math.max(0, marksMap[s.id] ?? 0));
    const grade = calculateGrade(mark);
    return {
      subject_id: s.id,
      subject_name: s.name,
      max_marks: s.max_marks,
      marks_obtained: mark,
      grade,
    };
  });

  const totalObtained = subjectBreakdown.reduce((sum, item) => sum + item.marks_obtained, 0);
  const totalMax = subjectBreakdown.reduce((sum, item) => sum + item.max_marks, 0) || 100;
  const percentage = Number(((totalObtained / totalMax) * 100).toFixed(2));
  const overallGrade = calculateGrade(percentage);
  const calculatedGpa = Number(calculateGPA(percentage));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    dataService.saveExamResult({
      examination_id: examination.id,
      examination_title: examination.title,
      student_id: student.id,
      student_name: student.full_name,
      student_code: student.student_id,
      course_id: examination.course_id,
      course_name: examination.course_name,
      semester: examination.semester,
      subjects: subjectBreakdown,
      total_marks: totalObtained,
      total_max_marks: totalMax,
      percentage,
      gpa: calculatedGpa,
      overall_grade: overallGrade,
      published_date: new Date().toISOString().split('T')[0],
      remarks,
    });

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#263329', '#D9E2C6', '#DDD1EA'],
    });

    onSuccess?.();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Marks Entry & Grade Compilation"
      subtitle={`Examination: ${examination.title} (${examination.course_name})`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Scholar Selector */}
        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
            Select Scholar
          </label>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none font-medium"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.student_id}) — Sem {s.semester}
              </option>
            ))}
          </select>
        </div>

        {/* Subjects Marks Grid */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
            Curriculum Subject Marks Entry
          </label>
          <div className="border border-border rounded-xl overflow-hidden bg-surface divide-y divide-border/60">
            {subjects.map(subj => {
              const currentVal = marksMap[subj.id] ?? 0;
              const currentGrade = calculateGrade(currentVal);

              return (
                <div key={subj.id} className="p-3.5 flex items-center justify-between gap-4 hover:bg-porcelain/30">
                  <div className="flex-1">
                    <span className="font-semibold text-xs text-forest block">{subj.name}</span>
                    <span className="text-[10px] text-ink-muted font-mono">{subj.code} • Max {subj.max_marks} marks</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={subj.max_marks}
                      value={currentVal}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setMarksMap(prev => ({ ...prev, [subj.id]: val }));
                      }}
                      className="w-20 px-2.5 py-1.5 rounded-lg border border-border bg-porcelain text-xs font-mono font-bold text-center focus:bg-surface focus:outline-none"
                    />
                    <span className="w-8 text-center text-xs font-bold text-forest">{currentGrade}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Calculated Summary Box */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-porcelain to-[#FAF6EE] border border-border flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider block">Total Score</span>
            <span className="font-serif text-xl font-bold text-forest">
              {totalObtained} / {totalMax} ({percentage}%)
            </span>
          </div>
          <div>
            <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider block">Calculated Grade</span>
            <span className="font-serif text-2xl font-bold text-botanical-green">{overallGrade}</span>
          </div>
          <div>
            <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider block">Semester GPA</span>
            <span className="font-serif text-xl font-bold text-forest">{calculatedGpa.toFixed(2)}</span>
          </div>
        </div>

        {/* Evaluator Remarks */}
        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
            Official Evaluator Remarks
          </label>
          <input
            type="text"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Official commentary on academic performance..."
            className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
          />
        </div>

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
            Publish Result Entry
          </button>
        </div>
      </form>
    </Modal>
  );
};
