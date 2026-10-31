import React, { useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { StudentFormModal } from '@/features/students/StudentFormModal';
import { StudentProfileModal } from '@/features/students/StudentProfileModal';
import { StudentImportModal } from '@/features/students/StudentImportModal';
import { MarkAttendanceModal } from '@/features/attendance/MarkAttendanceModal';
import { CourseFormModal } from '@/features/academics/CourseFormModal';
import { SupabaseConfigModal } from '@/features/settings/SupabaseConfigModal';
import { Student, Course } from '@/types';
import { dataService } from '@/services/dataService';

export const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Student Modals
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Attendance Modal
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // Course Modal
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  // Check URL params for student dossier deep link
  const [searchParams, setSearchParams] = useSearchParams();
  const deepStudentId = searchParams.get('id');

  React.useEffect(() => {
    if (deepStudentId) {
      const student = dataService.getStudentById(deepStudentId);
      if (student) {
        setSelectedStudentForProfile(student);
        setIsProfileModalOpen(true);
      }
    }
  }, [deepStudentId]);

  const handleOpenAddStudent = () => {
    setStudentToEdit(null);
    setIsStudentFormOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setIsStudentFormOpen(true);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudentForProfile(student);
    setIsProfileModalOpen(true);
  };

  const handleOpenAddCourse = () => {
    setCourseToEdit(null);
    setIsCourseFormOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setCourseToEdit(course);
    setIsCourseFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F4F0E8] text-[#17221D] flex paper-grain">
      {/* Sidebar */}
      <Sidebar
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1">
          <Outlet
            context={{
              onOpenAddStudent: handleOpenAddStudent,
              onOpenImportStudent: () => setIsImportModalOpen(true),
              onOpenMarkAttendance: () => setIsAttendanceModalOpen(true),
              onOpenAddCourse: handleOpenAddCourse,
              onViewStudent: handleViewStudent,
              onEditStudent: handleEditStudent,
              onEditCourse: handleEditCourse,
              onOpenSupabaseModal: () => setIsSupabaseModalOpen(true),
            }}
          />
        </main>
      </div>

      {/* Global Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenAddStudent={handleOpenAddStudent}
        onOpenMarkAttendance={() => setIsAttendanceModalOpen(true)}
        onOpenAddCourse={handleOpenAddCourse}
      />

      {/* Add / Edit Student Modal */}
      <StudentFormModal
        isOpen={isStudentFormOpen}
        onClose={() => {
          setIsStudentFormOpen(false);
          setStudentToEdit(null);
        }}
        studentToEdit={studentToEdit}
      />

      {/* View Student Dossier Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedStudentForProfile(null);
          if (deepStudentId) {
            searchParams.delete('id');
            setSearchParams(searchParams);
          }
        }}
        student={selectedStudentForProfile}
        onEditStudent={handleEditStudent}
      />

      {/* Import CSV Modal */}
      <StudentImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Mark Attendance Modal */}
      <MarkAttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
      />

      {/* Course Form Modal */}
      <CourseFormModal
        isOpen={isCourseFormOpen}
        onClose={() => {
          setIsCourseFormOpen(false);
          setCourseToEdit(null);
        }}
        courseToEdit={courseToEdit}
      />

      {/* Supabase Config Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};

