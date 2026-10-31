import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { UploadCloud, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { dataService } from '@/services/dataService';
import confetti from 'canvas-confetti';

interface StudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StudentImportModal: React.FC<StudentImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  const sampleCsv = `student_id,first_name,last_name,email,phone,gender,date_of_birth,department_name,course_name,status
STU010,Alexander,Wright,alexander.w@aurelia.edu,+1 (555) 712-3344,Male,2004-06-11,Computer Science & Engineering,Computer Science,Active
STU011,Elena,Rostova,elena.r@aurelia.edu,+1 (555) 823-4455,Female,2004-10-05,Information Technology,Information Technology,Active`;

  const handleUseSample = () => {
    setCsvText(sampleCsv);
    setError(null);
    setPreviewCount(2);
  };

  const handleProcessImport = () => {
    if (!csvText.trim()) {
      setError('Please provide CSV data or choose the sample template.');
      return;
    }

    try {
      const lines = csvText.trim().split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        setError('CSV must contain a header row and at least one student record.');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const existingStudents = dataService.getStudents();
      const existingIds = new Set(existingStudents.map(s => s.student_id));
      let importedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const rowData: Record<string, string> = {};
        headers.forEach((h, idx) => {
          rowData[h] = values[idx] || '';
        });

        const studentId = rowData['student_id'] || dataService.getNextStudentId();
        if (existingIds.has(studentId)) {
          continue; // Skip duplicate
        }

        const firstName = rowData['first_name'] || 'Scholar';
        const lastName = rowData['last_name'] || 'Learner';
        const email = rowData['email'] || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@aurelia.edu`;

        dataService.createStudent({
          student_id: studentId,
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          email,
          phone: rowData['phone'] || '+1 (555) 000-0000',
          gender: (rowData['gender'] as any) || 'Other',
          date_of_birth: rowData['date_of_birth'] || '2004-01-01',
          department_id: 'dept-cs',
          department_name: rowData['department_name'] || 'Computer Science & Engineering',
          course_id: 'course-cs101',
          course_name: rowData['course_name'] || 'Computer Science',
          academic_year: '2025-2026',
          semester: 1,
          enrollment_date: new Date().toISOString().split('T')[0],
          status: (rowData['status'] as any) || 'Active',
          avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
          attendance_rate: 98.0,
          gpa: 3.8,
          guardian: {
            name: `${lastName} Guardian`,
            relation: 'Parent',
            phone: '+1 (555) 999-8888',
          },
        });
        existingIds.add(studentId);
        importedCount++;
      }

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#263329', '#D9E2C6', '#E9D3B5'],
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error parsing CSV records. Please verify formatting.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Scholar Roster from CSV"
      subtitle="Batch upload student records with automatic duplicate identifier detection."
      maxWidth="xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-ink uppercase tracking-wider">
            CSV File Records
          </label>
          <button
            type="button"
            onClick={handleUseSample}
            className="text-xs text-forest hover:underline font-medium flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Load Sample Format</span>
          </button>
        </div>

        <textarea
          rows={7}
          value={csvText}
          onChange={e => {
            setCsvText(e.target.value);
            setError(null);
            const l = e.target.value.trim().split('\n').length;
            setPreviewCount(l > 1 ? l - 1 : 0);
          }}
          placeholder="student_id,first_name,last_name,email,phone,gender,date_of_birth,department_name,course_name,status&#10;STU010,Alexander,Wright,alexander.w@aurelia.edu,+1 (555) 712-3344,Male,2004-06-11,Computer Science,Computer Science,Active"
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink text-xs font-mono focus:ring-1 focus:ring-forest outline-none resize-none"
        />

        {previewCount !== null && previewCount > 0 && (
          <div className="text-xs text-botanical-green font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{previewCount} scholar records identified for ingest validation</span>
          </div>
        )}

        {error && (
          <div className="text-xs text-botanical-terracotta font-medium flex items-center gap-1.5 p-3 rounded-lg bg-[#FCECE9]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-ink hover:bg-black/5 transition-colors border border-border"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProcessImport}
            className="btn-forest px-6 py-2 rounded-xl text-sm font-medium shadow-warm-sm flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Process & Enroll Scholars</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

