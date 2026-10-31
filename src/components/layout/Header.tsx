import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, 
  Search, 
  Bell, 
  ChevronDown, 
  Menu, 
  Database, 
  ShieldCheck, 
  UserCheck, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationPanel } from '@/components/ui/NotificationPanel';
import { dataService, subscribeToDataChanges } from '@/services/dataService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { NotificationItem, UserRole } from '@/types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
  onOpenSupabaseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenCommandPalette,
  onOpenSupabaseModal,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(dataService.getCurrentRole());
  const [isSupabaseLive, setIsSupabaseLive] = useState(isSupabaseConfigured());

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateData = () => {
      setNotifications(dataService.getNotifications());
      setCurrentRole(dataService.getCurrentRole());
      setIsSupabaseLive(isSupabaseConfigured());
    };
    updateData();
    return subscribeToDataChanges(updateData);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const todayFormatted = format(new Date(), 'EEEE, dd MMM yyyy');

  const handleRoleChange = (role: UserRole) => {
    dataService.setCurrentRole(role);
    setIsProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-20 bg-[#F4F0E8]/90 backdrop-blur-md border-b border-[#E3DDD2] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Date Indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-ink hover:bg-porcelain/80 border border-border"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#72776F]">
          <Sun className="w-4 h-4 text-botanical-amber shrink-0" />
          <span>{todayFormatted}</span>
        </div>
      </div>

      {/* Right: Search, DB Status, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Global Search Pill (Cmd+K) */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#FBF9F4] border border-[#E3DDD2] text-xs text-[#72776F] hover:border-[#263329]/40 hover:text-[#17221D] shadow-warm-sm transition-all w-64 lg:w-80 justify-between group"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-[#72776F] group-hover:text-[#263329]" />
            <span className="truncate">Search students, courses, or anything...</span>
          </div>
          <div className="flex items-center gap-0.5 text-[10px] font-mono bg-[#EAE5DA] px-1.5 py-0.5 rounded text-[#263329] border border-[#E3DDD2] shrink-0">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>

        {/* Mobile Search Button */}
        <button
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 rounded-full bg-[#FBF9F4] border border-[#E3DDD2] text-[#72776F] hover:text-[#17221D]"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Supabase Status Pill */}
        <button
          onClick={onOpenSupabaseModal}
          title="Click to view or connect Supabase backend"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors shadow-warm-sm"
          style={{
            backgroundColor: isSupabaseLive ? '#EBF2DE' : '#FAF6EE',
            borderColor: isSupabaseLive ? '#B8C69F' : '#E3DDD2',
            color: isSupabaseLive ? '#263329' : '#72776F',
          }}
        >
          <Database className={`w-3 h-3 ${isSupabaseLive ? 'text-botanical-green' : 'text-botanical-amber'}`} />
          <span>{isSupabaseLive ? 'Supabase Connected' : 'Local / Supabase Sync'}</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-full bg-[#FBF9F4] border border-[#E3DDD2] text-[#263329] hover:bg-[#FAF6EE] shadow-warm-sm transition-colors"
            aria-label="Open notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C85A48] ring-2 ring-[#FBF9F4]" />
            )}
          </button>

          <NotificationPanel
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            notifications={notifications}
          />
        </div>

        {/* User Profile Pill & Role Switcher */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 sm:pr-3 rounded-full bg-[#FBF9F4] border border-[#E3DDD2] hover:bg-[#FAF6EE] shadow-warm-sm transition-all"
          >
            <Avatar
              name="Abin R Dasan"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              size="sm"
            />
            <div className="hidden sm:block text-left text-xs leading-tight">
              <span className="font-semibold text-[#17221D] block">Abin R Dasan</span>
              <span className="text-[10px] text-[#72776F]">{currentRole}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#72776F] hidden sm:block" />
          </button>

          {/* Profile & Role Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 top-12 w-64 bg-[#FBF9F4] border border-[#E3DDD2] rounded-2xl shadow-warm-xl p-3 z-50 animate-slide-up">
              <div className="p-2 border-b border-[#E3DDD2] mb-2">
                <p className="text-xs font-semibold text-[#17221D]">Abin R Dasan</p>
                <p className="text-[11px] text-[#72776F]">abin.dasan@aurelia.edu</p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] bg-sage/50 text-forest px-2 py-0.5 rounded-full w-fit font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Active Role: {currentRole}</span>
                </div>
              </div>

              <div className="space-y-1 mb-2">
                <p className="text-[10px] font-bold text-[#72776F] uppercase tracking-wider px-2 py-1">
                  Switch Active Role
                </p>
                {(['Admin', 'Teacher', 'Accountant', 'Staff'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      currentRole === role ? 'bg-[#263329] text-[#FBF9F4]' : 'text-[#17221D] hover:bg-[#FAF6EE]'
                    }`}
                  >
                    <span>{role}</span>
                    {currentRole === role && <UserCheck className="w-3.5 h-3.5 text-[#D9E2C6]" />}
                  </button>
                ))}
              </div>

              <div className="border-t border-[#E3DDD2] pt-2 space-y-1">
                <button
                  onClick={() => { setIsProfileOpen(false); onOpenSupabaseModal(); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#17221D] hover:bg-[#FAF6EE] transition-colors"
                >
                  <Database className="w-3.5 h-3.5 text-botanical-green" />
                  <span>Supabase Settings</span>
                </button>
                <button
                  onClick={() => {
                    dataService.resetToSeedData();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#8C3A2E] hover:bg-[#FCECE9] transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

