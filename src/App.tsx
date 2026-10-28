import React from 'react';
import { BrowserRouter, Routes, Route, useOutletContext, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { StudentsPage } from '@/features/students/StudentsPage';
import { AcademicsPage } from '@/features/academics/AcademicsPage';
import { AttendancePage } from '@/features/attendance/AttendancePage';
import { ExaminationsPage } from '@/features/examinations/ExaminationsPage';
import { FeesPage } from '@/features/fees/FeesPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { Student, Course } from '@/types';

interface LayoutContextType {
  onOpenAddStudent: () => void;
  onOpenImportStudent: () => void;
  onOpenMarkAttendance: () => void;
  onOpenAddCourse: () => void;
  onViewStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onEditCourse: (course: Course) => void;
}

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
    <StudentsPage
      onOpenAddStudent={context.onOpenAddStudent}
      onOpenImportStudent={context.onOpenImportStudent}
      onViewStudent={context.onViewStudent}
      onEditStudent={context.onEditStudent}
    />
  );
};

const AcademicsWrapper: React.FC = () => {
  const context = useOutletContext<LayoutContextType>();
  return (
    <AcademicsPage
      onOpenAddCourse={context.onOpenAddCourse}
      onEditCourse={context.onEditCourse}
    />
  );
};

const AttendanceWrapper: React.FC = () => {
  const context = useOutletContext<LayoutContextType>();
  return (
    <AttendancePage
      onOpenMarkAttendance={context.onOpenMarkAttendance}
      onViewStudent={context.onViewStudent}
    />
  );
};

const SettingsWrapper: React.FC = () => {
  return (
    <SettingsPage
      onOpenSupabaseModal={() => {
        // Trigger command or modal
      }}
    />
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
          <Route path="examinations" element={<ExaminationsPage />} />
          <Route path="fees" element={<FeesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsWrapper />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
