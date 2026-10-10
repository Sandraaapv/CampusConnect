import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  Clock,
  ShieldCheck,
  Megaphone,
  BookOpen,
  Flame,
  CreditCard,
  Sparkles,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { navigate } from '../../utils/navigation';

interface PortalLayoutProps {
  currentPath: string;
  title?: string;
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeType?: 'neutral' | 'pink';
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({ currentPath, children }) => {
  const { theme, toggleTheme } = useTheme();
  const user = db.getUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navSections: NavSection[] = [
    {
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'ACADEMICS',
      items: [
        { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
        { label: 'Marks & CGPA', path: '/marks', icon: GraduationCap },
        { label: 'Exams & plan', path: '/exams', icon: Clock },
      ],
    },
    {
      title: 'CAMPUS',
      items: [
        { label: 'Approvals', path: '/requests', icon: ShieldCheck, badge: '1', badgeType: 'neutral' },
        { label: 'Circulars', path: '/circulars', icon: Megaphone, badge: '3', badgeType: 'pink' },
        { label: 'Notes hub', path: '/notes', icon: BookOpen },
      ],
    },
    {
      title: 'YOU',
      items: [
        { label: 'Badges & streak', path: '/badges', icon: Flame },
        { label: 'Digital ID', path: '/id-card', icon: CreditCard },
        { label: 'Wrapped', path: '/wrapped', icon: Sparkles },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans flex flex-col md:flex-row selection:bg-amber-300 selection:text-black transition-colors duration-200">
      {/* =========================================================================
          LEFT SIDEBAR (EXACT MATCH TO DESIGN)
          ========================================================================= */}
      <aside className="hidden md:flex flex-col justify-between w-64 shrink-0 bg-[var(--app-surface)] border-r border-[var(--app-border)] sticky top-0 h-screen z-30 transition-all duration-200 p-4">
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Top Logo: [cc] CAMPUSCONNECT */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-left cursor-pointer group px-2 py-1"
          >
            <div className="w-7 h-7 rounded-full bg-white text-black dark:bg-white dark:text-black border border-neutral-300 dark:border-transparent flex items-center justify-center font-black text-[11px] tracking-tight shrink-0 shadow-xs">
              cc
            </div>
            <span className="font-montserrat font-black text-sm tracking-tight text-[var(--app-text)] uppercase">
              CAMPUSCONNECT
            </span>
          </button>

          {/* Nav items partitioned by section headers */}
          <div className="space-y-5">
            {navSections.map((sec, secIdx) => (
              <div key={secIdx} className="space-y-1">
                {sec.title && (
                  <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-3 mb-2 font-mono">
                    {sec.title}
                  </p>
                )}
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    currentPath === item.path ||
                    (item.path !== '/dashboard' && currentPath.startsWith(item.path));

                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-black'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black leading-none ${
                            item.badgeType === 'pink'
                              ? 'bg-[#ff8fa3] text-black font-extrabold'
                              : 'bg-neutral-200 dark:bg-neutral-800 text-[var(--app-text)]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Settings & User Profile Card */}
        <div className="space-y-2 pt-3 border-t border-[var(--app-border)]">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full font-bold text-xs transition cursor-pointer ${
              currentPath === '/settings'
                ? 'bg-black text-white dark:bg-white dark:text-black font-black'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)]'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </button>

          {/* Profile Card with yellow 'AS' avatar */}
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] hover:border-neutral-400 transition cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-full bg-[#f5b800] text-black font-black text-xs flex items-center justify-center shrink-0">
              AS
            </div>
            <div className="truncate">
              <p className="text-xs font-extrabold text-[var(--app-text)] truncate leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 truncate leading-tight mt-0.5">
                {user.registerNumber} · Semester {user.semester}
              </p>
            </div>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MAIN COLUMN
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-[var(--app-border)] bg-[var(--app-surface)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white text-black dark:bg-white dark:text-black border border-neutral-300 dark:border-transparent flex items-center justify-center font-black text-[11px]">
              cc
            </div>
            <span className="font-montserrat font-black text-sm tracking-tight text-[var(--app-text)] uppercase">
              CAMPUSCONNECT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full border border-[var(--app-border)] text-[var(--app-text)]"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-[var(--app-border)] text-[var(--app-text)]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-[var(--app-surface)] p-4 overflow-y-auto border-b border-[var(--app-border)] space-y-2">
            {navSections.flatMap((s) => s.items).map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(item.path);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full font-bold text-sm text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)]"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
