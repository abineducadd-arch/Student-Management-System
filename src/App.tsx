import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useOutletContext, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { Student, Course } from '@/types';

// Lazy-loaded routes for production code-splitting and optimized initial paint
const StudentsPage = lazy(() => import('@/features/students/StudentsPage').then(m => ({ default: m.StudentsPage })));
const AcademicsPage = lazy(() => import('@/features/academics/AcademicsPage').then(m => ({ default: m.AcademicsPage })));
const AttendancePage = lazy(() => import('@/features/attendance/AttendancePage').then(m => ({ default: m.AttendancePage })));
const ExaminationsPage = lazy(() => import('@/features/examinations/ExaminationsPage').then(m => ({ default: m.ExaminationsPage })));
const FeesPage = lazy(() => import('@/features/fees/FeesPage').then(m => ({ default: m.FeesPage })));
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));

interface LayoutContextType {
  onOpenAddStudent: () => void;
  onOpenImportStudent: () => void;
  onOpenMarkAttendance: () => void;
  onOpenAddCourse: () => void;
  onViewStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onEditCourse: (course: Course) => void;
  onOpenSupabaseModal: () => void;
}

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
    <div className="w-8 h-8 rounded-full border-2 border-[#263329]/20 border-t-[#263329] animate-spin mb-3" />
    <p className="font-serif italic text-base text-[#263329]">Loading section...</p>
    <p className="text-[11px] uppercase tracking-widest text-[#72776F]">Aurelia Academic Portal</p>
  </div>
);

const DashboardWrapper: React.FC = () => {
  const context = useOutletContext<LayoutContextType>();
  return (
    <DashboardPage
      onOpenAddStudent={context.onOpenAddStudent}
      onOpenMarkAttendance={context.onOpenMarkAttendance}
      onOpenAddCourse={context.onOpenAddCourse}
      onViewStudent={context.onViewStudent}
      onEditStudent={context.onEditStudent}
    />
  );
};

const StudentsWrapper: React.FC = () => {
  const context = useOutletContext<LayoutContextType>();
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <StudentsPage
        onOpenAddStudent={context.onOpenAddStudent}
        onOpenImportStudent={context.onOpenImportStudent}
        onViewStudent={context.onViewStudent}
        onEditStudent={context.onEditStudent}
      />
    </Suspense>
  );
};

const AcademicsWrapper: React.FC = () => {
  const context = useOutletContext<LayoutContextType>();
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <AcademicsPage
        onOpenAddCourse={context.onOpenAddCourse}
        onEditCourse={context.onEditCourse}
      />
    </Suspense>
  );
};

const AttendanceWrapper: React.FC = () => {
  const context = useOutletContext<LayoutContextType>();
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <AttendancePage
        onOpenMarkAttendance={context.onOpenMarkAttendance}
        onViewStudent={context.onViewStudent}
      />
    </Suspense>
  );
};

const ExaminationsWrapper: React.FC = () => (
  <Suspense fallback={<PageLoadingFallback />}>
    <ExaminationsPage />
  </Suspense>
);

const FeesWrapper: React.FC = () => (
  <Suspense fallback={<PageLoadingFallback />}>
    <FeesPage />
  </Suspense>
);

const ReportsWrapper: React.FC = () => (
  <Suspense fallback={<PageLoadingFallback />}>
    <ReportsPage />
  </Suspense>
);

const SettingsWrapper: React.FC = () => {
  const context = useOutletContext<LayoutContextType>();
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <SettingsPage
        onOpenSupabaseModal={context.onOpenSupabaseModal}
      />
    </Suspense>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardWrapper />} />
          <Route path="students" element={<StudentsWrapper />} />
          <Route path="academics" element={<AcademicsWrapper />} />
          <Route path="attendance" element={<AttendanceWrapper />} />
          <Route path="examinations" element={<ExaminationsWrapper />} />
          <Route path="fees" element={<FeesWrapper />} />
          <Route path="reports" element={<ReportsWrapper />} />
          <Route path="settings" element={<SettingsWrapper />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
