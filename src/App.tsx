import { useRef, useEffect } from 'react';
import { scenes } from './data/scenes';
import { Scene } from './components/Scene';
import { useScrollScenes } from './hooks/useScrollScenes';
import { LogIn } from 'lucide-react';
import { useCurrentPath, navigate } from './utils/navigation';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function LandingPage() {
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const {
    containerRef,
    stageRef,
    scrollToScene,
  } = useScrollScenes(scenes, {
    progressBarRef,
  });

  useEffect(() => {
    (window as unknown as { __scrollToScene: (idx: number) => void }).__scrollToScene = scrollToScene;
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
      {/* 1. Scroll Progress Bar (hidden for seamless header) */}
      <div
        ref={progressBarRef}
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-black z-50 origin-left pointer-events-none hidden"
        style={{ transform: 'scaleX(0)' }}
        role="progressbar"
        aria-label="Page scroll progress"
      />

      {/* 2. Seamless Header (No icon, No line) */}
      <header
        className="fixed top-0 inset-x-0 h-[var(--header-h,64px)] px-4 sm:px-8 lg:px-12 flex items-center justify-end z-40 bg-transparent pointer-events-none"
      >
        {/* Right: Sign in button */}
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

      {/* 3. Stage Container (Pinned by GSAP ScrollTrigger) */}
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
            <Scene
              key={scene.id}
              scene={scene}
              index={idx}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export function App() {
  const currentPath = useCurrentPath();

  // Intercept relative internal link clicks for instant client-side routing
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target) {
        const href = target.getAttribute('href');
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          e.preventDefault();
          navigate(href);
        }
      }
    };

    window.addEventListener('click', handleLinkClick);
    return () => window.removeEventListener('click', handleLinkClick);
  }, []);

  // Simple, robust client-side route dispatcher
  if (currentPath === '/login') {
    return <LoginPage />;
  }

  if (currentPath === '/register' || currentPath === '/signup') {
    return <RegisterPage />;
  }

  if (currentPath === '/dashboard/student') {
    return <StudentDashboard />;
  }

  if (currentPath === '/dashboard/faculty') {
    return <FacultyDashboard />;
  }

  if (currentPath === '/dashboard/admin') {
    return <AdminDashboard />;
  }

  // Default: Landing Page (path '/' or unmatched)
  return <LandingPage />;
}

export default App;
