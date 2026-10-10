import React, { useRef, useEffect } from 'react';
import { scenes } from './data/scenes';
import { Scene } from './components/Scene';
import { useScrollScenes } from './hooks/useScrollScenes';
import { LogIn } from 'lucide-react';
import { useCurrentPath, navigate } from './utils/navigation';
import { authService } from './services/auth';

// Auth Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Student Portal Pages
import { DashboardPage } from './pages/portal/DashboardPage';
import { AttendancePage } from './pages/portal/AttendancePage';
import { MarksPage } from './pages/portal/MarksPage';
import { NotificationsPage } from './pages/portal/NotificationsPage';
import { CircularsPage } from './pages/portal/CircularsPage';
import { NotesPage } from './pages/portal/NotesPage';
import { RequestsPage } from './pages/portal/RequestsPage';
import { NewRequestPage } from './pages/portal/NewRequestPage';
import { RequestDetailPage } from './pages/portal/RequestDetailPage';
import { ExamsPage } from './pages/portal/ExamsPage';
import { BadgesPage } from './pages/portal/BadgesPage';
import { IdCardPage } from './pages/portal/IdCardPage';
import { VerifyTokenPage } from './pages/portal/VerifyTokenPage';
import { WrappedPage } from './pages/portal/WrappedPage';
import { ProfilePage } from './pages/portal/ProfilePage';
import { SettingsPage } from './pages/portal/SettingsPage';
import { OnboardingPage } from './pages/portal/OnboardingPage';
import { NotFoundPage } from './pages/portal/NotFoundPage';

// Section 1-6 New Student Portal Pages
import { TimetablePage } from './pages/portal/TimetablePage';
import { FeesPage } from './pages/portal/FeesPage';
import { FacultyPage } from './pages/portal/FacultyPage';
import { FeedbackPage } from './pages/portal/FeedbackPage';
import { HelpdeskPage } from './pages/portal/HelpdeskPage';
import { VerifyReceiptPage } from './pages/portal/VerifyReceiptPage';

function LandingPage() {
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const { containerRef, stageRef, scrollToScene } = useScrollScenes(scenes, {
    progressBarRef,
  });

  useEffect(() => {
    (window as unknown as { __scrollToScene: (idx: number) => void }).__scrollToScene =
      scrollToScene;
  }, [scrollToScene]);

  // Keyboard navigation support
  useEffect(() => {
    let currentIdx = 0;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (currentIdx < scenes.length - 1) {
          e.preventDefault();
          currentIdx += 1;
          scrollToScene(currentIdx);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentIdx > 0) {
          e.preventDefault();
          currentIdx -= 1;
          scrollToScene(currentIdx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollToScene]);

  return (
    <div className="bg-[#f5f5f3] text-black min-h-screen relative selection:bg-amber-300 selection:text-black">
      {/* Scroll Progress Bar (hidden for seamless header) */}
      <div
        ref={progressBarRef}
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-black z-50 origin-left pointer-events-none hidden"
        style={{ transform: 'scaleX(0)' }}
        role="progressbar"
        aria-label="Page scroll progress"
      />

      {/* Seamless Header */}
      <header className="fixed top-0 inset-x-0 h-[var(--header-h,64px)] px-4 sm:px-8 lg:px-12 flex items-center justify-end z-40 bg-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
            className="px-5 py-2 rounded-full bg-black text-white text-xs sm:text-sm font-extrabold hover:bg-neutral-800 transition shadow-xs focus:ring-2 focus:ring-black focus:outline-none flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="whitespace-nowrap">Sign in</span>
          </a>
        </div>
      </header>

      {/* Stage Container */}
      <main
        ref={containerRef}
        className="relative w-full"
        style={{ height: `${scenes.length * 260}vh` }}
      >
        <div
          ref={stageRef}
          className="sticky top-0 w-full h-screen overflow-hidden bg-[#f5f5f3]"
        >
          {scenes.map((scene, idx) => (
            <Scene key={scene.id} scene={scene} index={idx} />
          ))}
        </div>
      </main>
    </div>
  );
}

// Protected Route Guard
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = authService.isAuthenticated();

  useEffect(() => {
    if (!isAuth) {
      navigate('/login');
    }
  }, [isAuth]);

  if (!isAuth) {
    return null;
  }

  return <>{children}</>;
}

export function App() {
  const currentPath = useCurrentPath();

  // Intercept relative internal link clicks for client-side routing
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target) {
        const href = target.getAttribute('href');
        if (href && href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/#')) {
          e.preventDefault();
          navigate(href);
        }
      }
    };

    window.addEventListener('click', handleLinkClick);
    return () => window.removeEventListener('click', handleLinkClick);
  }, []);

  // Public Routes
  if (currentPath === '/' || currentPath === '') {
    return <LandingPage />;
  }

  if (currentPath === '/login') {
    return <LoginPage />;
  }

  if (currentPath === '/register' || currentPath === '/signup') {
    return <RegisterPage />;
  }

  if (currentPath.startsWith('/verify/')) {
    return <VerifyTokenPage />;
  }

  if (currentPath.startsWith('/receipts/verify/')) {
    return <VerifyReceiptPage />;
  }

  // Student Portal Routes (Protected)
  if (currentPath === '/dashboard' || currentPath === '/dashboard/student') {
    return (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/timetable') {
    return (
      <ProtectedRoute>
        <TimetablePage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/fees') {
    return (
      <ProtectedRoute>
        <FeesPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/faculty') {
    return (
      <ProtectedRoute>
        <FacultyPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/feedback') {
    return (
      <ProtectedRoute>
        <FeedbackPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/helpdesk') {
    return (
      <ProtectedRoute>
        <HelpdeskPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/attendance') {
    return (
      <ProtectedRoute>
        <AttendancePage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/marks') {
    return (
      <ProtectedRoute>
        <MarksPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/notifications') {
    return (
      <ProtectedRoute>
        <NotificationsPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/circulars') {
    return (
      <ProtectedRoute>
        <CircularsPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/notes') {
    return (
      <ProtectedRoute>
        <NotesPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/requests') {
    return (
      <ProtectedRoute>
        <RequestsPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/requests/new') {
    return (
      <ProtectedRoute>
        <NewRequestPage />
      </ProtectedRoute>
    );
  }

  if (currentPath.startsWith('/requests/')) {
    return (
      <ProtectedRoute>
        <RequestDetailPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/exams') {
    return (
      <ProtectedRoute>
        <ExamsPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/badges') {
    return (
      <ProtectedRoute>
        <BadgesPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/id-card') {
    return (
      <ProtectedRoute>
        <IdCardPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/wrapped') {
    return (
      <ProtectedRoute>
        <WrappedPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/profile') {
    return (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/settings') {
    return (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/onboarding') {
    return (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    );
  }

  // 404 Route for any other paths
  return <NotFoundPage />;
}

export default App;
