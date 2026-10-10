import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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

  // Dynamic scroll fade mask calculation
  const navRef = useRef<HTMLElement | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScroll = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    const hasScroll = el.scrollHeight > el.clientHeight;
    if (!hasScroll) {
      setCanScrollUp(false);
      setCanScrollDown(false);
      return;
    }
    setCanScrollUp(el.scrollTop > 4);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = navRef.current;
    if (!el) return;
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);
    window.addEventListener('resize', checkScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const maskImage = useMemo(() => {
    if (canScrollUp && canScrollDown) {
      return 'linear-gradient(to bottom, transparent 0%, black 16px, black calc(100% - 16px), transparent 100%)';
    }
    if (canScrollDown) {
      return 'linear-gradient(to bottom, black calc(100% - 16px), transparent 100%)';
    }
    if (canScrollUp) {
      return 'linear-gradient(to bottom, transparent 0%, black 16px, black 100%)';
    }
    return undefined;
  }, [canScrollUp, canScrollDown]);

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
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans flex flex-col selection:bg-amber-300 selection:text-black transition-colors duration-200">
      <div className="flex flex-1 min-h-0">
        {/* =========================================================================
            LEFT SIDEBAR (FULL HEIGHT STICKY 100dvh AT >= 900px)
            Three distinct zones:
            1. Pinned Top Logo (never scrolls)
            2. Scrollable Middle Nav (flex-1 min-h-0, thin custom scrollbar, edge fade mask)
            3. Pinned Bottom Actions (never scrolls, 1px divider line)
            ========================================================================= */}
        <aside
          className="portal-sidebar-desktop flex flex-col justify-between w-64 shrink-0 bg-[var(--app-surface)] border-r border-[var(--app-border)] sticky top-0 z-30 transition-all duration-200"
          style={{ height: '100dvh', maxHeight: '100dvh', minHeight: '100vh' }}
        >
          {/* Top Logo Zone (Fixed/Pinned) */}
          <div className="p-4 pb-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 text-left cursor-pointer group px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded-lg"
              aria-label="CampusConnect Home"
            >
              <div className="w-7 h-7 rounded-full bg-white text-black dark:bg-white dark:text-black border border-neutral-300 dark:border-transparent flex items-center justify-center font-black text-[11px] tracking-tight shrink-0 shadow-xs">
                cc
              </div>
              <span className="font-montserrat font-black text-sm tracking-tight text-[var(--app-text)] uppercase">
                CAMPUSCONNECT
              </span>
            </button>
          </div>

          {/* Middle Nav List (Scrolls independently, overscroll contain, themed scrollbar, gradient fade) */}
          <nav
            ref={navRef}
            onScroll={checkScroll}
            aria-label="Student Portal Navigation"
            className="sidebar-nav-scroll flex-1 min-h-0 overflow-y-auto px-4 py-2 space-y-5"
            style={{
              overscrollBehavior: 'contain',
              maskImage,
              WebkitMaskImage: maskImage,
            }}
          >
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
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${
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
          </nav>

          {/* Bottom Settings & User Profile Zone (Fixed/Pinned with 1px divider) */}
          <div className="p-4 pt-3 shrink-0 border-t border-[var(--app-border)] space-y-2 bg-[var(--app-surface)]">
            <button
              type="button"
              onClick={() => navigate('/settings')}
              aria-current={currentPath === '/settings' ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full font-bold text-xs transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${
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
              aria-current={currentPath === '/profile' ? 'page' : undefined}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] hover:border-neutral-400 transition cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
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
            MAIN CONTENT AREA
            ========================================================================= */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Top Bar (< 900px) */}
          <div className="portal-sidebar-mobile items-center justify-between p-4 border-b border-[var(--app-border)] bg-[var(--app-surface)]">
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
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg border border-[var(--app-border)] text-[var(--app-text)]"
                aria-label="Open navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Drawer (< 900px) */}
          {mobileMenuOpen && (
            <div className="portal-sidebar-mobile fixed inset-x-0 top-16 bottom-0 z-40 bg-[var(--app-surface)] p-4 overflow-y-auto border-b border-[var(--app-border)] flex-col space-y-2">
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
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full font-bold text-sm text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)]"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          )}

          {/* Content Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
