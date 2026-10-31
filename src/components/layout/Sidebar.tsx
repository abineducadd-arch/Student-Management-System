import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  FileText, 
  CreditCard, 
  BarChart3, 
  Settings, 
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';
import { AureliaLogoIcon } from '@/components/ui/BotanicalDecorations';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home, hasSubmenu: false },
  { name: 'Students', path: '/students', icon: Users, hasSubmenu: true },
  { name: 'Academics', path: '/academics', icon: GraduationCap, hasSubmenu: true },
  { name: 'Attendance', path: '/attendance', icon: CalendarCheck, hasSubmenu: true },
  { name: 'Examinations', path: '/examinations', icon: FileText, hasSubmenu: true },
  { name: 'Fees', path: '/fees', icon: CreditCard, hasSubmenu: true },
  { name: 'Reports', path: '/reports', icon: BarChart3, hasSubmenu: true },
  { name: 'Settings', path: '/settings', icon: Settings, hasSubmenu: false },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const content = (
    <div className="flex flex-col h-full bg-[#F4F0E8] border-r border-[#E3DDD2] w-64 select-none px-4 py-6 justify-between overflow-y-auto">
      {/* Top Brand / Logo */}
      <div>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <AureliaLogoIcon className="w-9 h-9 text-[#263329]" />
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[#17221D] leading-none">
                Aurelia
              </h1>
              <span className="text-[11px] font-sans text-[#72776F] tracking-wide block mt-1">
                Student Management System
              </span>
            </div>
          </div>
          {isOpenMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[#263329] text-[#FBF9F4] shadow-warm-sm'
                      : 'text-[#263329]/80 hover:text-[#17221D] hover:bg-[#EAE5DA]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'w-4 h-4 transition-colors',
                          isActive ? 'text-[#FBF9F4]' : 'text-[#72776F] group-hover:text-[#263329]'
                        )}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.hasSubmenu && (
                      <ChevronRight
                        className={cn(
                          'w-3.5 h-3.5 transition-colors',
                          isActive ? 'text-[#FBF9F4]/70' : 'text-[#72776F]/60 group-hover:text-[#263329]'
                        )}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Editorial Illustration & Tagline */}
      <div className="mt-8 pt-4">
        <div className="relative rounded-2xl overflow-hidden border border-[#E3DDD2] bg-[#FAF6EE] p-3 shadow-inner-soft">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex flex-col text-[8px] font-sans font-bold tracking-widest text-[#72776F] uppercase leading-tight">
              <span>BETTER</span>
              <span>STUDENTS</span>
              <span>A BRIGHTER</span>
              <span>TOMORROW</span>
            </div>
            {/* Campus Architectural cutout */}
            <div className="relative w-20 h-28 ml-auto rounded-t-full overflow-hidden border border-[#D9CBB7] shadow-sm bg-[#EBDDC8]">
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=300&q=80')` }}>
                <div className="w-full h-full bg-[#354539]/20 mix-blend-multiply" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#72776F] pt-2 border-t border-[#E3DDD2]/80">
            <Sparkles className="w-3 h-3 text-botanical-amber shrink-0" />
            <span className="font-serif italic">A smart way to manage your students</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 z-30">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-forest/40 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 max-w-full flex">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

