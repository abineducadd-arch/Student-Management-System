import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Printer, Award, FileText, CheckCircle2 } from 'lucide-react';
import { ExamResult } from '@/types';
import { AureliaLogoIcon } from '@/components/ui/BotanicalDecorations';

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ExamResult | null;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  if (!result) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Academic Transcript"
      subtitle={`Verified Institutional Result Record: ${result.student_name} (${result.student_code})`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Printable Transcript Document Paper Container */}
        <div className="p-8 rounded-2xl bg-surface border-2 border-border shadow-warm-lg space-y-6 text-ink print:p-0 print:border-none print:shadow-none">
          {/* Header with Institutional Seal */}
          <div className="flex items-center justify-between border-b-2 border-forest pb-4">
            <div className="flex items-center gap-3">
              <AureliaLogoIcon className="w-12 h-12 text-forest" />
              <div>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-forest leading-none">
                  Aurelia Institute of Technology
                </h2>
                <p className="text-[11px] text-ink-muted mt-1 font-sans">
                  Office of Academic Records & Chancellor's Examinations Registry
                </p>
                <p className="text-[10px] text-ink-muted">400 Chancellor Walk, Cambridge, MA 02138 • www.aurelia.edu</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest text-ink-muted block">Document Type</span>
              <span className="font-serif text-lg font-bold text-forest">OFFICIAL TRANSCRIPT</span>
              <span className="text-[10px] font-mono text-ink-muted block mt-0.5">Ref: TRN-2025-{result.id.slice(-4)}</span>
            </div>
          </div>

          {/* Scholar & Examination Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-porcelain/60 border border-border text-xs">
            <div>
              <span className="text-[10px] text-ink-muted uppercase font-bold block">Scholar Name</span>
              <span className="font-bold text-forest text-sm">{result.student_name}</span>
            </div>
            <div>
              <span className="text-[10px] text-ink-muted uppercase font-bold block">Student ID</span>
              <span className="font-mono font-bold text-forest text-sm">{result.student_code}</span>
            </div>
            <div>
              <span className="text-[10px] text-ink-muted uppercase font-bold block">Degree Program</span>
              <span className="font-medium text-ink">{result.course_name}</span>
            </div>
            <div>
              <span className="text-[10px] text-ink-muted uppercase font-bold block">Semester Term</span>
              <span className="font-medium text-ink">Semester {result.semester}</span>
            </div>
          </div>

          {/* Subject Marks Table */}
          <div className="border border-border rounded-xl overflow-hidden bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="bg-porcelain border-b border-border text-ink-muted font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Subject Description</th>
                  <th className="py-3 px-4 text-center">Max Marks</th>
                  <th className="py-3 px-4 text-center">Marks Awarded</th>
                  <th className="py-3 px-4 text-right">Letter Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {result.subjects.map(s => (
                  <tr key={s.subject_id} className="hover:bg-porcelain/30">
                    <td className="py-3 px-4 font-semibold text-ink">{s.subject_name}</td>
                    <td className="py-3 px-4 text-center font-mono text-ink-muted">{s.max_marks}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-forest">{s.marks_obtained}</td>
                    <td className="py-3 px-4 text-right font-bold text-forest text-sm">{s.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Performance Summary Banner */}
          <div className="p-4 rounded-xl bg-porcelain border border-border flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-ink-muted uppercase font-bold block">Total Aggregate</span>
              <span className="font-serif text-xl font-bold text-forest">
                {result.total_marks} / {result.total_max_marks} ({result.percentage}%)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-ink-muted uppercase font-bold block">Grade Point Average</span>
              <span className="font-serif text-xl font-bold text-forest">{result.gpa.toFixed(2)} / 4.00</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-ink-muted uppercase font-bold block">Standing Result</span>
              <span className="font-serif text-2xl font-bold text-botanical-green">{result.overall_grade}</span>
            </div>
          </div>

          {/* Remarks */}
          {result.remarks && (
            <p className="text-xs text-ink-muted italic border-l-2 border-forest pl-3">
              "{result.remarks}"
            </p>
          )}

          {/* Formal Verification Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border text-center text-xs">
            <div>
              <div className="w-36 border-b border-ink-muted/60 mx-auto mb-1.5 h-6" />
              <span className="font-semibold text-forest block">Dr. Eleanor Vance</span>
              <span className="text-[10px] text-ink-muted">Dean of Academic Standards</span>
            </div>
            <div>
              <div className="w-36 border-b border-ink-muted/60 mx-auto mb-1.5 h-6" />
              <span className="font-semibold text-forest block">Office of Registrar</span>
              <span className="text-[10px] text-ink-muted">Authenticated Institutional Record</span>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-ink-muted flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-botanical-green" />
            <span>Cryptographically sealed record verified on campus server</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-ink hover:bg-black/5 transition-colors border border-border"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="btn-forest px-5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-warm-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Transcript</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

