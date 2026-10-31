import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Course, Department } from '@/types';
import { dataService } from '@/services/dataService';
import confetti from 'canvas-confetti';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit?: Course | null;
  onSuccess?: (course: Course) => void;
}

export const CourseFormModal: React.FC<CourseFormModalProps> = ({
  isOpen,
  onClose,
  courseToEdit,
  onSuccess,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [durationYears, setDurationYears] = useState(4);
  const [totalSemesters, setTotalSemesters] = useState(8);
  const [credits, setCredits] = useState(160);
  const [facultyCoordinator, setFacultyCoordinator] = useState('');
  const [colorAccent, setColorAccent] = useState<'sage' | 'lavender' | 'sand' | 'forest'>('sage');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const depts = dataService.getDepartments();
      setDepartments(depts);

      if (courseToEdit) {
        setName(courseToEdit.name);
        setCode(courseToEdit.code);
        setDepartmentId(courseToEdit.department_id);
        setDurationYears(courseToEdit.duration_years);
        setTotalSemesters(courseToEdit.total_semesters);
        setCredits(courseToEdit.credits);
        setFacultyCoordinator(courseToEdit.faculty_coordinator);
        setColorAccent(courseToEdit.color_accent);
        setDescription(courseToEdit.description || '');
      } else {
        setName('');
        setCode('');
        setDepartmentId(depts[0]?.id || '');
        setDurationYears(4);
        setTotalSemesters(8);
        setCredits(160);
        setFacultyCoordinator('');
        setColorAccent('sage');
        setDescription('');
      }
      setErrors({});
    }
  }, [isOpen, courseToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Course title is required';
    if (!code.trim()) errs.code = 'Course code is required';
    if (!facultyCoordinator.trim()) errs.coordinator = 'Faculty coordinator is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const dept = departments.find(d => d.id === departmentId);
    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      department_id: departmentId,
      department_name: dept?.name || 'Computer Science & Engineering',
      duration_years: durationYears,
      total_semesters: totalSemesters,
      credits,
      faculty_coordinator: facultyCoordinator.trim(),
      enrolled_students: courseToEdit?.enrolled_students ?? 0,
      color_accent: colorAccent,
      status: 'Active' as const,
      description: description.trim(),
    };

    let result: Course;
    if (courseToEdit) {
      result = dataService.updateCourse(courseToEdit.id, payload)!;
    } else {
      result = dataService.createCourse(payload);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#263329', '#D9E2C6', '#DDD1EA'],
      });
    }

    onSuccess?.(result);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={courseToEdit ? 'Modify Academic Course' : 'Create Academic Course Program'}
      subtitle="Establish curriculum structure, credit thresholds, and designated faculty leadership."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
              Course Title <span className="text-botanical-terracotta">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Artificial Intelligence & Robotics"
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-sm focus:ring-1 focus:ring-forest outline-none"
            />
            {errors.name && <p className="text-xs text-botanical-terracotta mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
              Code <span className="text-botanical-terracotta">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="e.g. AI-BTECH"
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-sm focus:ring-1 focus:ring-forest outline-none font-mono"
            />
            {errors.code && <p className="text-xs text-botanical-terracotta mt-1">{errors.code}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
              Hosting Department
            </label>
            <select
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-sm focus:ring-1 focus:ring-forest outline-none"
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
              Faculty Coordinator <span className="text-botanical-terracotta">*</span>
            </label>
            <input
              type="text"
              value={facultyCoordinator}
              onChange={e => setFacultyCoordinator(e.target.value)}
              placeholder="e.g. Dr. Arthur Pendelton"
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-sm focus:ring-1 focus:ring-forest outline-none"
            />
            {errors.coordinator && <p className="text-xs text-botanical-terracotta mt-1">{errors.coordinator}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
              Duration (Years)
            </label>
            <input
              type="number"
              min={1}
              max={6}
              value={durationYears}
              onChange={e => setDurationYears(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-sm focus:ring-1 focus:ring-forest outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
              Total Semesters
            </label>
            <input
              type="number"
              min={1}
              max={12}
              value={totalSemesters}
              onChange={e => setTotalSemesters(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-sm focus:ring-1 focus:ring-forest outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
              Credit Weight
            </label>
            <input
              type="number"
              min={10}
              max={300}
              value={credits}
              onChange={e => setCredits(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-sm focus:ring-1 focus:ring-forest outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
            Visual Accent Theme
          </label>
          <div className="flex items-center gap-3">
            {[
              { id: 'sage', label: 'Botanical Sage', color: 'bg-sage' },
              { id: 'lavender', label: 'Muted Lavender', color: 'bg-lavender' },
              { id: 'sand', label: 'Warm Sand', color: 'bg-sand' },
              { id: 'forest', label: 'Deep Forest', color: 'bg-forest' },
            ].map(theme => (
              <label
                key={theme.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                  colorAccent === theme.id ? 'border-forest bg-porcelain font-semibold' : 'border-border bg-surface'
                }`}
              >
                <input
                  type="radio"
                  name="colorAccent"
                  value={theme.id}
                  checked={colorAccent === theme.id}
                  onChange={() => setColorAccent(theme.id as any)}
                  className="hidden"
                />
                <span className={`w-3.5 h-3.5 rounded-full ${theme.color} border border-border/80`} />
                <span>{theme.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
            Program Overview
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Course syllabus description and core prerequisites..."
            className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-sm focus:ring-1 focus:ring-forest outline-none resize-none"
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
            {courseToEdit ? 'Save Changes' : 'Initialize Course'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

