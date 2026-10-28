import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building, 
  ShieldCheck, 
  Database, 
  Bell, 
  Save, 
  CheckCircle2, 
  Percent, 
  Layers, 
  Users,
  Award,
  RefreshCw
} from 'lucide-react';
import { dataService, subscribeToDataChanges } from '@/services/dataService';
import { InstitutionSettings, UserRole } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase';
import confetti from 'canvas-confetti';

interface SettingsPageProps {
  onOpenSupabaseModal: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenSupabaseModal }) => {
  const [settings, setSettings] = useState<InstitutionSettings>(dataService.getSettings());
  const [activeTab, setActiveTab] = useState<'institution' | 'academic' | 'grading' | 'roles' | 'supabase'>('institution');
  const [savedNotice, setSavedNotice] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(dataService.getCurrentRole());

  useEffect(() => {
    const update = () => {
      setSettings(dataService.getSettings());
      setCurrentRole(dataService.getCurrentRole());
    };
    update();
    return subscribeToDataChanges(update);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.updateSettings(settings);
    setSavedNotice(true);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#263329', '#D9E2C6', '#DDD1EA'],
    });
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const isSupabaseLive = isSupabaseConfigured();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-3xl font-bold text-forest">Institutional Governance & Settings</h2>
            <span className="text-xs bg-sage/60 text-forest px-2.5 py-0.5 rounded-full font-semibold">
              v1.0 Production
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1 font-sans">
            Configure institutional profile, grading scale rules, minimum attendance thresholds, and database synchronization.
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EBF2DE] text-[#3E5C38] border border-[#CFDCBA] text-xs font-semibold animate-slide-up">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto text-xs font-medium pb-1">
        {[
          { id: 'institution', label: 'Institution Profile', icon: Building },
          { id: 'academic', label: 'Academic & Thresholds', icon: Percent },
          { id: 'grading', label: 'Grading Scale Rules', icon: Award },
          { id: 'roles', label: 'Role-Based Access Control', icon: ShieldCheck },
          { id: 'supabase', label: 'Supabase PostgreSQL Cloud', icon: Database },
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

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* TAB 1: INSTITUTION PROFILE */}
        {activeTab === 'institution' && (
          <div className="editorial-card p-6 bg-[#FBF9F4] space-y-4">
            <h3 className="font-serif text-xl font-bold text-forest">Institution Identity & Official Registry</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                  Institution Name
                </label>
                <input
                  type="text"
                  value={settings.institution_name}
                  onChange={e => setSettings({ ...settings, institution_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm focus:ring-1 focus:ring-forest outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                  Motto / Editorial Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm focus:ring-1 focus:ring-forest outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                  Administrative Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={e => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                  Official Phone
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={e => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                  Campus Web Domain
                </label>
                <input
                  type="text"
                  value={settings.website}
                  onChange={e => setSettings({ ...settings, website: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                Campus Physical Address
              </label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* TAB 2: ACADEMIC & THRESHOLDS */}
        {activeTab === 'academic' && (
          <div className="editorial-card p-6 bg-[#FBF9F4] space-y-4">
            <h3 className="font-serif text-xl font-bold text-forest">Academic Calendar Cycles & Warning Thresholds</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                  Active Academic Year
                </label>
                <input
                  type="text"
                  value={settings.current_academic_year}
                  onChange={e => setSettings({ ...settings, current_academic_year: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm focus:ring-1 focus:ring-forest outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                  Active Academic Term
                </label>
                <input
                  type="text"
                  value={settings.current_term}
                  onChange={e => setSettings({ ...settings, current_term: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm focus:ring-1 focus:ring-forest outline-none font-medium"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-porcelain border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-forest">
                    Attendance Warning Threshold
                  </h4>
                  <p className="text-xs text-ink-muted">
                    Students below this percentage trigger automatic academic suspension warnings on the register.
                  </p>
                </div>
                <span className="font-serif text-2xl font-bold text-botanical-terracotta">
                  {settings.attendance_threshold}%
                </span>
              </div>

              <input
                type="range"
                min={50}
                max={90}
                step={1}
                value={settings.attendance_threshold}
                onChange={e => setSettings({ ...settings, attendance_threshold: Number(e.target.value) })}
                className="w-full accent-forest cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink-muted font-mono">
                <span>50% Minimum</span>
                <span>75% Standard Council Bar</span>
                <span>90% Strict Honor Cohort</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GRADING SCALE RULES */}
        {activeTab === 'grading' && (
          <div className="editorial-card p-6 bg-[#FBF9F4] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-forest">Institutional Grading Scale Rules</h3>
                <p className="text-xs text-ink-muted">Scales dictate automated GPA calculation in examinations.</p>
              </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden bg-surface divide-y divide-border/60">
              {settings.grading_scale.map((tier, idx) => (
                <div key={idx} className="p-3.5 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-bold text-forest w-8">{tier.grade}</span>
                    <span className="text-xs text-ink-muted">{tier.description}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-ink-muted">Min:</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={tier.min_score}
                      onChange={e => {
                        const updated = [...settings.grading_scale];
                        updated[idx].min_score = Number(e.target.value);
                        setSettings({ ...settings, grading_scale: updated });
                      }}
                      className="w-16 px-2 py-1 rounded border border-border bg-porcelain text-center font-bold text-forest"
                    />
                    <span className="text-ink-muted">Max:</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={tier.max_score}
                      onChange={e => {
                        const updated = [...settings.grading_scale];
                        updated[idx].max_score = Number(e.target.value);
                        setSettings({ ...settings, grading_scale: updated });
                      }}
                      className="w-16 px-2 py-1 rounded border border-border bg-porcelain text-center font-bold text-forest"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-ink-muted">GPA:</span>
                    <input
                      type="number"
                      step={0.1}
                      min={0}
                      max={4.0}
                      value={tier.gpa}
                      onChange={e => {
                        const updated = [...settings.grading_scale];
                        updated[idx].gpa = Number(e.target.value);
                        setSettings({ ...settings, grading_scale: updated });
                      }}
                      className="w-16 px-2 py-1 rounded border border-border bg-porcelain text-center font-bold text-forest"
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-botanical-green">Active Scale</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ROLES & PERMISSIONS */}
        {activeTab === 'roles' && (
          <div className="editorial-card p-6 bg-[#FBF9F4] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-forest">Role-Based Access Control (RBAC)</h3>
                <p className="text-xs text-ink-muted">Active Role: <strong className="text-forest">{currentRole}</strong></p>
              </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden bg-surface">
              <table className="w-full text-left text-xs">
                <thead className="bg-porcelain border-b border-border text-ink-muted font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Role Title</th>
                    <th className="py-3 px-4">Student Dossiers</th>
                    <th className="py-3 px-4">Attendance Register</th>
                    <th className="py-3 px-4">Marks Compilation</th>
                    <th className="py-3 px-4">Bursar & Fees</th>
                    <th className="py-3 px-4">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {[
                    { role: 'Administrator', s: 'Full CRUD', a: 'Full Access', m: 'Full Access', f: 'Full Access', set: 'Full Access' },
                    { role: 'Teacher', s: 'Read & Edit', a: 'Take & Edit', m: 'Enter Marks', f: 'No Access', set: 'Read Only' },
                    { role: 'Accountant', s: 'Read Only', a: 'Read Only', m: 'Read Only', f: 'Full Access', set: 'Read Only' },
                    { role: 'Read-only Staff', s: 'Read Only', a: 'Read Only', m: 'Read Only', f: 'Read Only', set: 'No Access' },
                  ].map(r => (
                    <tr key={r.role} className={currentRole === (r.role.split(' ')[0] as any) ? 'bg-sage/20' : ''}>
                      <td className="py-3 px-4 font-bold text-forest">{r.role}</td>
                      <td className="py-3 px-4 font-medium">{r.s}</td>
                      <td className="py-3 px-4 font-medium">{r.a}</td>
                      <td className="py-3 px-4 font-medium">{r.m}</td>
                      <td className="py-3 px-4 font-medium">{r.f}</td>
                      <td className="py-3 px-4 font-medium">{r.set}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-ink-muted italic">
              * Switch your test role anytime from the profile avatar in the top right header.
            </p>
          </div>
        )}

        {/* TAB 5: SUPABASE CLOUD POSTGRESQL */}
        {activeTab === 'supabase' && (
          <div className="editorial-card p-6 bg-[#FBF9F4] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-forest">Supabase PostgreSQL Database</h3>
                <p className="text-xs text-ink-muted">
                  Status: {isSupabaseLive ? <strong className="text-botanical-green">Connected Live</strong> : <strong className="text-[#D48B38]">Operating on Persistent Local Storage</strong>}
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenSupabaseModal}
                className="btn-forest px-4 py-2 rounded-xl text-xs font-semibold shadow-warm-sm flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Configure Supabase Credentials</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-porcelain border border-border text-xs space-y-2">
              <p className="font-semibold text-forest">Instant Setup Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-ink-muted">
                <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-forest underline">supabase.com</a>.</li>
                <li>Copy the PostgreSQL migration script from <code className="bg-surface px-1 py-0.5 rounded font-mono">supabase/schema.sql</code> and paste into the Supabase SQL Editor.</li>
                <li>Run the seed script from <code className="bg-surface px-1 py-0.5 rounded font-mono">supabase/seed.sql</code> to populate the 20 tables.</li>
                <li>Enter your Supabase Project URL and Anon Public Key via the button above.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset entire system data back to pristine demo state?')) {
                dataService.resetToSeedData();
                alert('System data reset complete.');
              }
            }}
            className="text-xs text-[#8C3A2E] hover:underline flex items-center gap-1 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restore Factory Demo Data</span>
          </button>

          <button
            type="submit"
            className="btn-forest px-6 py-2.5 rounded-xl text-xs font-semibold shadow-warm-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Institutional Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
