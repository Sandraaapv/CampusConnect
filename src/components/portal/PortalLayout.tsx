import React, { useState } from 'react';
import {
  LayoutDashboard,
  Percent,
  GraduationCap,
  FileCheck2,
  Bell,
  BookOpen,
  CalendarDays,
  Flame,
  CreditCard,
  Sparkles,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/auth';
import { db } from '../../services/db';
import { navigate } from '../../utils/navigation';

interface PortalLayoutProps {
  currentPath: string;
  title: string;
  children: React.ReactNode;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({ currentPath, title, children }) => {
  const { theme, toggleTheme } = useTheme();
  const user = db.getUser();
  const notifications = db.getNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Attendance', path: '/attendance', icon: Percent },
    { label: 'Marks & CGPA', path: '/marks', icon: GraduationCap },
    { label: 'Approvals', path: '/requests', icon: FileCheck2 },
    { label: 'Circulars', path: '/circulars', icon: Bell },
    { label: 'Notes Hub', path: '/notes', icon: BookOpen },
    { label: 'Exams & Plan', path: '/exams', icon: CalendarDays },
    { label: 'Badges & Streak', path: '/badges', icon: Flame },
    { label: 'Digital ID Card', path: '/id-card', icon: CreditCard },
    { label: 'Wrapped', path: '/wrapped', icon: Sparkles },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans flex flex-col lg:flex-row selection:bg-amber-300 selection:text-black transition-colors duration-200">
      {/* =========================================================================
          DESKTOP & TABLET SIDEBAR
          ========================================================================= */}
      <aside className="hidden md:flex flex-col justify-between w-20 lg:w-64 shrink-0 bg-[var(--app-surface)] border-r border-[var(--app-border)] sticky top-0 h-screen z-30 transition-all duration-200">
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 flex items-center px-4 lg:px-6 border-b border-[var(--app-border)] gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer group"
              aria-label="CampusConnect Home"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] flex items-center justify-center font-black text-sm group-hover:scale-105 transition-transform shadow-2xs">
                cc
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="portal-heading text-sm tracking-tight text-[var(--app-text)]">
                  CampusConnect
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--accent-yellow)]">
                  Student Portal
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 lg:p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs'
                      : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)]'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Mini Profile & Logout */}
        <div className="p-3 border-t border-[var(--app-border)]">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[var(--app-surface-subtle)]">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 text-left cursor-pointer overflow-hidden flex-1"
            >
              <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0 overflow-hidden">
                <img src="/mascots/01-welcome.png" alt="Student avatar" className="w-full h-full object-contain scale-110" />
              </div>
              <div className="hidden lg:block truncate">
                <p className="text-xs font-extrabold text-[var(--app-text)] truncate">{user.name}</p>
                <p className="text-[10px] font-mono text-[var(--app-text-muted)]">{user.registerNumber}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden lg:flex p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--accent-red)] transition cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN COLUMN (Header + Content Area + Mobile Tab Bar)
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-8 border-b border-[var(--app-border)] bg-[var(--app-surface)]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-[var(--app-border)] text-[var(--app-text)] cursor-pointer"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="portal-heading text-lg sm:text-xl tracking-tight portal-heading-gradient">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-[var(--app-text)] transition cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent-red)] text-white font-extrabold text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-[var(--app-text)] transition cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Avatar / Profile */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full border border-[var(--app-border)] overflow-hidden cursor-pointer shrink-0"
              aria-label="My Profile"
            >
              <img src="/mascots/01-welcome.png" alt="Avatar" className="w-full h-full object-contain scale-110" />
            </button>
          </div>
        </header>

        {/* Mobile Full Screen Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-[var(--app-surface)] p-4 overflow-y-auto border-b border-[var(--app-border)] space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(item.path);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                      : 'text-[var(--app-text-muted)] hover:bg-[var(--app-surface-subtle)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-4 mt-4 border-t border-[var(--app-border)]">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-[var(--accent-red)] hover:bg-red-500/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile Bottom Tab Bar (Fixed at bottom on phones < 768px) */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-[var(--app-surface)]/95 backdrop-blur-md border-t border-[var(--app-border)] z-30 flex items-center justify-around px-2">
          {[
            { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
            { label: 'Attendance', path: '/attendance', icon: Percent },
            { label: 'Marks', path: '/marks', icon: GraduationCap },
            { label: 'Approvals', path: '/requests', icon: FileCheck2 },
            { label: 'More', path: '/settings', icon: Menu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPath === tab.path || (tab.path !== '/dashboard' && currentPath.startsWith(tab.path));
            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-lg cursor-pointer ${
                  isActive ? 'text-[var(--app-text)] font-extrabold' : 'text-[var(--app-text-muted)] font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
