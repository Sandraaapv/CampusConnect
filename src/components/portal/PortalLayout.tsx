import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  Clock,
  CalendarDays,
  MessageSquareQuote,
  ShieldCheck,
  Megaphone,
  BookOpen,
  Users,
  CreditCard,
  LifeBuoy,
  Flame,
  Sparkles,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  MoreHorizontal,
  LogOut,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { authService } from '../../services/auth';
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
  badgeType?: 'neutral' | 'pink' | 'dot';
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({ currentPath, children }) => {
  const { theme, toggleTheme, setTheme } = useTheme();
  const user = db.getUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMoreSheetOpen, setMobileMoreSheetOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  // Dynamic live badges from database
  const pendingFeedbackCount = useMemo(() => {
    return db.getFeedbackForms().filter((f) => f.status === 'pending').length;
  }, []);

  const openApprovalsCount = useMemo(() => {
    return db.getRequests().filter((r) => r.status === 'Submitted' || r.status === 'In Review').length;
  }, []);

  const openHelpdeskCount = useMemo(() => {
    return db.getHelpdeskTickets().filter((t) => t.status !== 'Closed').length;
  }, []);

  const feeStatusSummary = useMemo(() => {
    return db.getFeeStatusSummary(user.semester);
  }, [user.semester]);

  const feeDueSoon = feeStatusSummary.status === 'Due soon' || feeStatusSummary.status === 'Overdue';

  // Dynamic scroll fade mask calculation for fixed-height sidebar
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
      return 'linear-gradient(to bottom, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%)';
    }
    if (canScrollDown) {
      return 'linear-gradient(to bottom, black calc(100% - 20px), transparent 100%)';
    }
    if (canScrollUp) {
      return 'linear-gradient(to bottom, transparent 0%, black 20px, black 100%)';
    }
    return undefined;
  }, [canScrollUp, canScrollDown]);

  // Section 1: Regrouped navigation
  const navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'ACADEMICS',
      items: [
        { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
        { label: 'Marks & SGPA', path: '/marks', icon: GraduationCap },
        { label: 'Timetable', path: '/timetable', icon: CalendarDays },
        { label: 'Exams & Plan', path: '/exams', icon: Clock },
        {
          label: 'Course Feedback',
          path: '/feedback',
          icon: MessageSquareQuote,
          badge: pendingFeedbackCount > 0 ? String(pendingFeedbackCount) : undefined,
          badgeType: 'pink',
        },
      ],
    },
    {
      title: 'CAMPUS',
      items: [
        {
          label: 'Approvals',
          path: '/requests',
          icon: ShieldCheck,
          badge: openApprovalsCount > 0 ? String(openApprovalsCount) : undefined,
          badgeType: 'neutral',
        },
        { label: 'Circulars', path: '/circulars', icon: Megaphone, badge: '3', badgeType: 'pink' },
        { label: 'Notes Hub', path: '/notes', icon: BookOpen },
        { label: 'Faculty Directory', path: '/faculty', icon: Users },
        {
          label: 'Fees',
          path: '/fees',
          icon: CreditCard,
          badge: feeDueSoon ? '•' : undefined,
          badgeType: 'dot',
        },
        {
          label: 'Helpdesk',
          path: '/helpdesk',
          icon: LifeBuoy,
          badge: openHelpdeskCount > 0 ? String(openHelpdeskCount) : undefined,
          badgeType: 'neutral',
        },
      ],
    },
    {
      title: 'YOU',
      items: [
        { label: 'Badges & Streak', path: '/badges', icon: Flame },
        { label: 'Digital ID', path: '/id-card', icon: CreditCard },
        { label: 'Wrapped', path: '/wrapped', icon: Sparkles },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans flex flex-col selection:bg-amber-300 selection:text-black transition-colors duration-200">
      <div className="flex flex-1 min-h-0">
        {/* =========================================================================
            LEFT SIDEBAR (FULL HEIGHT FIXED 100dvh AT >= 900px)
            Pinned top logo, scrollable nav with edge fade mask, pinned bottom actions
            ========================================================================= */}
        <aside
          className="portal-sidebar-desktop flex flex-col justify-between w-64 shrink-0 bg-[var(--app-surface)] border-r border-[var(--app-border)] fixed top-0 left-0 bottom-0 z-30 transition-all duration-200"
          style={{ height: '100dvh', maxHeight: '100dvh' }}
        >
          {/* Pinned Top Logo Zone */}
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

          {/* Internally Scrolling Nav List with edge fade */}
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
                          ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs font-black'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        item.badgeType === 'dot' ? (
                          <span
                            title="Payment due soon"
                            className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-[var(--app-surface)] animate-pulse"
                          />
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black leading-none ${
                              item.badgeType === 'pink'
                                ? 'bg-[#ff8fa3] text-black font-extrabold'
                                : 'bg-neutral-200 dark:bg-neutral-800 text-[var(--app-text)]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Pinned Bottom Block: Settings, Theme Toggle, Profile Card */}
          <div className="p-4 pt-3 shrink-0 border-t border-[var(--app-border)] space-y-2 bg-[var(--app-surface)]">
            <button
              type="button"
              onClick={() => navigate('/settings')}
              aria-current={currentPath === '/settings' ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full font-bold text-xs transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${
                currentPath === '/settings'
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)]'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full font-bold text-xs transition cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Log Out</span>
            </button>

            {/* Segmented Control: Light / Dark */}
            <div
              role="radiogroup"
              aria-label="Theme mode"
              className="w-full h-9 bg-[var(--app-surface-subtle)] p-1 rounded-full border border-[var(--app-border)] flex items-center gap-1"
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  setTheme('dark');
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  setTheme('light');
                }
              }}
            >
              <button
                type="button"
                role="radio"
                aria-checked={theme === 'light'}
                aria-label="Light mode"
                onClick={() => setTheme('light')}
                className={`flex-1 h-full flex items-center justify-center gap-1.5 rounded-full text-xs transition-colors duration-150 motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${
                  theme === 'light'
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black shadow-xs'
                    : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] font-bold'
                }`}
              >
                <Sun className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
                <span>Light</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={theme === 'dark'}
                aria-label="Dark mode"
                onClick={() => setTheme('dark')}
                className={`flex-1 h-full flex items-center justify-center gap-1.5 rounded-full text-xs transition-colors duration-150 motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${
                  theme === 'dark'
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black shadow-xs'
                    : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] font-bold'
                }`}
              >
                <Moon className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
                <span>Dark</span>
              </button>
            </div>

            {/* Profile Card */}
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
                  {user.registerNumber} · Sem {user.semester}
                </p>
              </div>
            </button>
          </div>
        </aside>

        {/* =========================================================================
            MAIN CONTENT AREA
            ========================================================================= */}
        <div className="portal-main-content flex-1 flex flex-col min-w-0 pb-20 min-[900px]:pb-6">
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
                onClick={handleLogout}
                className="p-2 rounded-full border border-[var(--app-border)] text-red-600 dark:text-red-400 hover:bg-red-500/10"
                aria-label="Log out"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
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

          {/* Mobile Drawer (Menu fallback) */}
          {mobileMenuOpen && (
            <div className="portal-sidebar-mobile fixed inset-x-0 top-16 bottom-0 z-40 bg-[var(--app-surface)] p-4 overflow-y-auto border-b border-[var(--app-border)] flex-col space-y-4">
              {navSections.map((sec, idx) => (
                <div key={idx} className="space-y-1">
                  {sec.title && (
                    <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-3 mb-1 font-mono">
                      {sec.title}
                    </p>
                  )}
                  {sec.items.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate(item.path);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-full font-bold text-xs text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)]"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-neutral-200 dark:bg-neutral-800">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
              <div className="pt-2 border-t border-[var(--app-border)] space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full font-bold text-xs text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)]"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full font-bold text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Content Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* =========================================================================
          MOBILE BOTTOM TAB BAR (< 900px)
          Five main items: Dashboard, Attendance, Timetable, Approvals, More
          ========================================================================= */}
      <div className="portal-bottom-bar fixed bottom-0 inset-x-0 bg-[var(--app-surface)] border-t border-[var(--app-border)] z-40 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-extrabold ${
            currentPath === '/dashboard' ? 'text-[var(--app-text)] font-black' : 'text-neutral-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/attendance')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-extrabold ${
            currentPath === '/attendance' ? 'text-[var(--app-text)] font-black' : 'text-neutral-400'
          }`}
        >
          <CalendarCheck className="w-5 h-5" />
          <span>Attendance</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/timetable')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-extrabold ${
            currentPath === '/timetable' ? 'text-[var(--app-text)] font-black' : 'text-neutral-400'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span>Timetable</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/requests')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-extrabold relative ${
            currentPath.startsWith('/requests') ? 'text-[var(--app-text)] font-black' : 'text-neutral-400'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Approvals</span>
          {openApprovalsCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-neutral-900 dark:bg-white" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setMobileMoreSheetOpen(true)}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-extrabold ${
            mobileMoreSheetOpen ? 'text-[var(--app-text)] font-black' : 'text-neutral-400'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>More</span>
        </button>
      </div>

      {/* =========================================================================
          MOBILE "MORE" BOTTOM SHEET
          Lists all portal sections grouped exactly as the sidebar
          ========================================================================= */}
      {mobileMoreSheetOpen && (
        <div className="portal-bottom-bar fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMoreSheetOpen(false)}
          />

          {/* Sheet */}
          <div className="relative bg-[var(--app-surface)] border-t border-[var(--app-border)] rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 space-y-5 shadow-2xl z-10 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <span className="font-montserrat font-black text-sm uppercase text-[var(--app-text)]">
                ALL CAMPUS SECTIONS
              </span>
              <button
                type="button"
                onClick={() => setMobileMoreSheetOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-[var(--app-text)]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {navSections.map((sec, secIdx) => (
                <div key={secIdx} className="space-y-1">
                  {sec.title && (
                    <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-2 font-mono">
                      {sec.title}
                    </p>
                  )}
                  <div className="grid grid-cols-1 gap-1">
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        currentPath === item.path ||
                        (item.path !== '/dashboard' && currentPath.startsWith(item.path));

                      return (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => {
                            setMobileMoreSheetOpen(false);
                            navigate(item.path);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                            isActive
                              ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black'
                              : 'text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
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
                </div>
              ))}
            </div>

            {/* Sheet Pinned Actions */}
            <div className="pt-4 border-t border-[var(--app-border)] space-y-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMoreSheetOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)]"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMoreSheetOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMoreSheetOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)]"
              >
                <div className="w-8 h-8 rounded-full bg-[#f5b800] text-black font-black text-xs flex items-center justify-center shrink-0">
                  AS
                </div>
                <div className="text-left">
                  <p className="text-xs font-extrabold text-[var(--app-text)]">{user.name}</p>
                  <p className="text-[10px] font-mono text-neutral-400">
                    {user.registerNumber} · Sem {user.semester}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
