import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import type { SceneData } from '../data/scenes';

gsap.registerPlugin(ScrollTrigger);

interface UseScrollScenesOptions {
  progressBarRef: React.RefObject<HTMLDivElement | null>;
}

export const useScrollScenes = (scenes: SceneData[], options: UseScrollScenesOptions) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Preload and decode all 10 mascot images up front
  useEffect(() => {
    scenes.forEach((sc) => {
      const img = new Image();
      img.src = sc.image;
      if ('decode' in img) {
        img.decode().catch(() => {});
      }
    });
  }, [scenes]);

  useEffect(() => {
    if (!containerRef.current || !stageRef.current) return;

    // 1. Initialize Lenis Smooth Scrolling with gentle, relaxed momentum
    const lenis = new Lenis({
      lerp: 0.06,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tickerCb = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sceneElements = stageRef.current.querySelectorAll<HTMLElement>('.scene-container');
    const totalScenes = scenes.length;

    // 2. Set initial scene states
    sceneElements.forEach((el, idx) => {
      const heading = el.querySelector<HTMLElement>('.scene-heading');
      const chars = el.querySelectorAll<HTMLElement>('.scene-char');

      if (idx === 0) {
        gsap.set(el, { opacity: 1, pointerEvents: 'auto', visibility: 'visible', zIndex: 10 });
        if (heading) gsap.set(heading, { y: 0, opacity: 1 });
        if (chars.length > 0) gsap.set(chars, { opacity: 1 });
      } else {
        gsap.set(el, { opacity: 0, pointerEvents: 'none', visibility: 'hidden', zIndex: 1 });
        if (!prefersReducedMotion) {
          if (heading) gsap.set(heading, { y: 40, opacity: 0 });
          if (chars.length > 0) gsap.set(chars, { opacity: 0 });
        } else {
          if (heading) gsap.set(heading, { y: 0, opacity: 1 });
          if (chars.length > 0) gsap.set(chars, { opacity: 1 });
        }

        // Scene 6 initial tracker state
        if (el.id === 'scene-6') {
          const tracker = el.querySelector<HTMLElement>('.request-tracker-wrapper');
          if (tracker) {
            const stamps = tracker.querySelectorAll('.nodues-stamp');
            const finalStamp = tracker.querySelector('.nodues-final-stamp');
            const dlBtn = tracker.querySelector('.nodues-download-btn');
            const panel0 = tracker.querySelector('.req-panel-0');
            const otherPanels = tracker.querySelectorAll('.req-panel-1, .req-panel-2, .req-panel-3');

            if (!prefersReducedMotion) {
              gsap.set(panel0, { opacity: 1 });
              gsap.set(otherPanels, { opacity: 0 });
              gsap.set(stamps, { opacity: 0, scale: 1.3 });
              gsap.set(finalStamp, { opacity: 0, scale: 1.3, rotate: -8 });
              gsap.set(dlBtn, { opacity: 0 });
            } else {
              gsap.set(panel0, { opacity: 1 });
              gsap.set(otherPanels, { opacity: 0 });
              gsap.set(stamps, { opacity: 1, scale: 1 });
              gsap.set(finalStamp, { opacity: 1, scale: 1, rotate: -8 });
              gsap.set(dlBtn, { opacity: 1 });
            }
          }
        }
      }
    });

    // Update top progress bar without React state re-renders
    const updateProgress = (progress: number) => {
      if (options.progressBarRef.current) {
        options.progressBarRef.current.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
      }
    };

    // 3. Create ONE pinned GSAP ScrollTrigger timeline for all scenes spanning container
    const mainTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: stageRef.current,
        scrub: 2, // Smooth, leisurely scrub pacing
        anticipatePin: 1,
        onUpdate: (self) => {
          updateProgress(self.progress);
        },
      },
    });

    // 4. Build paced, slower transitions with comfortable scene rest windows
    for (let i = 0; i < totalScenes - 1; i++) {
      const currentEl = sceneElements[i];
      const nextEl = sceneElements[i + 1];
      const currentScene = scenes[i];
      const nextScene = scenes[i + 1];

      if (!currentEl || !nextEl) continue;

      const currentMascot = currentEl.querySelector<HTMLElement>('.mascot-hero');
      const currentText = currentEl.querySelector<HTMLElement>('.scene-text-content');
      const currentPreview = currentEl.querySelector<HTMLElement>('.scene-preview');

      const nextMascot = nextEl.querySelector<HTMLElement>('.mascot-hero');
      const nextHeading = nextEl.querySelector('.scene-heading');
      const nextTagline = nextEl.querySelector('.scene-tagline');
      const nextPreview = nextEl.querySelector('.scene-preview');
      const nextCta = nextEl.querySelector('.scene-cta');

      const isNextLeft = nextScene.side === 'left';
      const isNextRight = nextScene.side === 'right';
      const isNextCenter = nextScene.side === 'center';

      // Resting hold duration: scene stays completely stable for reading and interacting
      mainTimeline.to({}, { duration: 1.8 });

      const stepLabel = `step_${i}_to_${i + 1}`;
      mainTimeline.addLabel(stepLabel);

      if (prefersReducedMotion) {
        // Reduced motion: instant cuts
        mainTimeline.to(
          currentEl,
          {
            opacity: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
            duration: 0.1,
          },
          stepLabel
        );
        mainTimeline.to(
          nextEl,
          {
            opacity: 1,
            visibility: 'visible',
            pointerEvents: 'auto',
            zIndex: i + 2,
            duration: 0.1,
          },
          stepLabel
        );
      } else {
        // Will-change optimization
        mainTimeline.set([currentEl, nextEl], { willChange: 'transform, opacity' }, stepLabel);

        // 1. Outgoing scene elements fade and slide out at a gentle, slower pace
        if (currentMascot) {
          const outX = currentScene.side === 'left' ? '-6vw' : '6vw';
          mainTimeline.to(
            currentMascot,
            {
              x: outX,
              opacity: 0,
              duration: 1.35,
              ease: 'power2.inOut',
            },
            stepLabel
          );
        }

        if (currentText) {
          mainTimeline.to(
            currentText,
            {
              y: -24,
              opacity: 0,
              duration: 1.2,
              ease: 'power2.inOut',
            },
            stepLabel
          );
        }

        if (currentPreview) {
          mainTimeline.to(
            currentPreview,
            {
              scale: 0.93,
              opacity: 0,
              duration: 1.2,
              ease: 'power2.inOut',
            },
            stepLabel
          );
        }

        mainTimeline.to(
          currentEl,
          {
            opacity: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
            duration: 0.6,
            onComplete: () => {
              gsap.set(currentEl, { zIndex: 1 });
            },
          },
          `${stepLabel}+=0.75`
        );

        // 2. Incoming scene prepares and crossfades in
        mainTimeline.set(
          nextEl,
          {
            visibility: 'visible',
            pointerEvents: 'auto',
            zIndex: 10,
          },
          `${stepLabel}+=0.65`
        );

        mainTimeline.to(
          nextEl,
          {
            opacity: 1,
            duration: 1.4,
            ease: 'power2.out',
          },
          `${stepLabel}+=0.65`
        );

        // Mascot slides in smoothly from its side (~8vw) and scales up comfortably
        if (nextMascot) {
          let initialX = 0;
          let initialY = 0;

          if (isNextLeft) initialX = -window.innerWidth * 0.08;
          else if (isNextRight) initialX = window.innerWidth * 0.08;
          else if (isNextCenter) initialY = window.innerHeight * 0.08;

          mainTimeline.fromTo(
            nextMascot,
            {
              x: initialX,
              y: initialY,
              scale: 0.94,
              opacity: 0,
            },
            {
              x: 0,
              y: 0,
              scale: 1,
              opacity: 1,
              duration: 1.8,
              ease: 'power2.out',
            },
            `${stepLabel}+=0.7`
          );
        }

        // Heading translates in from 40px
        if (nextHeading) {
          mainTimeline.fromTo(
            nextHeading,
            {
              y: 40,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              ease: 'power2.out',
            },
            `${stepLabel}+=0.75`
          );
        }

        // Tagline fades in shortly after heading
        if (nextTagline) {
          mainTimeline.fromTo(
            nextTagline,
            {
              y: 20,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              ease: 'power2.out',
            },
            `${stepLabel}+=0.9`
          );
        }

        // CTA for call-to-action scene
        if (nextCta) {
          mainTimeline.fromTo(
            nextCta,
            {
              y: 30,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.95,
              ease: 'power2.out',
            },
            `${stepLabel}+=1.0`
          );
        }

        // Supporting description characters appear letter-by-letter as user scrolls (not by default)
        const desktopChars = nextEl.querySelectorAll<HTMLElement>('.scene-text-col .scene-char');
        const mobileChars = nextEl.querySelectorAll<HTMLElement>('.lg\\:hidden .scene-char');
        if (desktopChars.length > 0) {
          mainTimeline.fromTo(
            desktopChars,
            {
              opacity: 0,
            },
            {
              opacity: 1,
              stagger: 0.012,
              duration: 0.14,
              ease: 'none',
            },
            `${stepLabel}+=1.0`
          );
        }
        if (mobileChars.length > 0) {
          mainTimeline.fromTo(
            mobileChars,
            {
              opacity: 0,
            },
            {
              opacity: 1,
              stagger: 0.012,
              duration: 0.14,
            },
            `${stepLabel}+=1.0`
          );
        }

        // Device mockup scales from 0.92 and tilts in 3D with graceful ease
        if (nextPreview) {
          mainTimeline.fromTo(
            nextPreview,
            {
              scale: 0.92,
              rotateY: isNextRight ? -5 : 5,
              rotateX: 4,
              opacity: 0,
            },
            {
              scale: 1,
              rotateY: 0,
              rotateX: 0,
              opacity: 1,
              duration: 1.45,
              ease: 'back.out(1.15)',
            },
            `${stepLabel}+=1.1`
          );
        }

        // Scene 6 (Approval Tracker): 4 request types scrubbed auto-cycle
        if (nextScene.id === 6 && !prefersReducedMotion) {
          const tracker = nextEl.querySelector<HTMLElement>('.request-tracker-wrapper');
          if (tracker) {
            const chips = tracker.querySelectorAll<HTMLElement>('.request-tab-chip');
            const panel0 = tracker.querySelector<HTMLElement>('.req-panel-0');
            const panel1 = tracker.querySelector<HTMLElement>('.req-panel-1');
            const panel2 = tracker.querySelector<HTMLElement>('.req-panel-2');
            const panel3 = tracker.querySelector<HTMLElement>('.req-panel-3');

            const stamps = tracker.querySelectorAll<HTMLElement>('.nodues-stamp');
            const finalStamp = tracker.querySelector<HTMLElement>('.nodues-final-stamp');
            const dlBtn = tracker.querySelector<HTMLElement>('.nodues-download-btn');

            const startT = `${stepLabel}+=2.0`;

            // Phase 1: No-Dues stamping node-by-node
            if (stamps.length > 0) {
              mainTimeline.to(
                stamps,
                {
                  opacity: 1,
                  scale: 1,
                  duration: 0.35,
                  stagger: 0.22,
                  ease: 'back.out(1.4)',
                },
                startT
              );
            }

            if (finalStamp) {
              mainTimeline.to(
                finalStamp,
                {
                  opacity: 1,
                  scale: 1,
                  rotate: -8,
                  duration: 0.45,
                  ease: 'back.out(1.5)',
                },
                `${startT}+=1.1`
              );
            }

            if (dlBtn) {
              mainTimeline.to(dlBtn, { opacity: 1, duration: 0.3 }, `${startT}+=1.2`);
            }

            // Sync stamp press on mascot
            if (nextMascot) {
              mainTimeline.to(
                nextMascot,
                { y: 6, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.inOut' },
                `${startT}+=1.1`
              );
            }

            // Phase 2: Auto-cycle to OD Letter (Chip 1)
            const t1 = `${startT}+=2.0`;
            if (panel0 && panel1) {
              mainTimeline.to(panel0, { opacity: 0, duration: 0.35 }, t1);
              mainTimeline.to(panel1, { opacity: 1, duration: 0.35 }, t1);
            }
            if (chips.length >= 2) {
              mainTimeline.to(chips[0], { backgroundColor: '#f5f5f5', color: '#525252', duration: 0.2 }, t1);
              mainTimeline.to(chips[1], { backgroundColor: '#171717', color: '#ffffff', duration: 0.2 }, t1);
            }
            if (panel1) {
              const line = panel1.querySelector('.step-line-fill');
              const circles = panel1.querySelectorAll('.step-circle');
              const remark = panel1.querySelector('.panel-remark');
              if (line) mainTimeline.fromTo(line, { width: '0%' }, { width: '100%', duration: 0.7, ease: 'power1.inOut' }, `${t1}+=0.1`);
              if (circles.length > 0) mainTimeline.fromTo(circles, { opacity: 0.4, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.25, stagger: 0.12 }, `${t1}+=0.1`);
              if (remark) mainTimeline.fromTo(remark, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.35 }, `${t1}+=0.6`);
            }

            // Phase 3: Auto-cycle to Scholarship / Fee Concession (Chip 2)
            const t2 = `${t1}+=1.8`;
            if (panel1 && panel2) {
              mainTimeline.to(panel1, { opacity: 0, duration: 0.35 }, t2);
              mainTimeline.to(panel2, { opacity: 1, duration: 0.35 }, t2);
            }
            if (chips.length >= 3) {
              mainTimeline.to(chips[1], { backgroundColor: '#f5f5f5', color: '#525252', duration: 0.2 }, t2);
              mainTimeline.to(chips[2], { backgroundColor: '#171717', color: '#ffffff', duration: 0.2 }, t2);
            }
            if (panel2) {
              const line = panel2.querySelector('.step-line-fill');
              const circles = panel2.querySelectorAll('.step-circle');
              const remark = panel2.querySelector('.panel-remark');
              if (line) mainTimeline.fromTo(line, { width: '0%' }, { width: '100%', duration: 0.7, ease: 'power1.inOut' }, `${t2}+=0.1`);
              if (circles.length > 0) mainTimeline.fromTo(circles, { opacity: 0.4, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.25, stagger: 0.12 }, `${t2}+=0.1`);
              if (remark) mainTimeline.fromTo(remark, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.35 }, `${t2}+=0.6`);
            }

            // Phase 4: Auto-cycle to Event Permission (Chip 3)
            const t3 = `${t2}+=1.8`;
            if (panel2 && panel3) {
              mainTimeline.to(panel2, { opacity: 0, duration: 0.35 }, t3);
              mainTimeline.to(panel3, { opacity: 1, duration: 0.35 }, t3);
            }
            if (chips.length >= 4) {
              mainTimeline.to(chips[2], { backgroundColor: '#f5f5f5', color: '#525252', duration: 0.2 }, t3);
              mainTimeline.to(chips[3], { backgroundColor: '#171717', color: '#ffffff', duration: 0.2 }, t3);
            }
            if (panel3) {
              const line = panel3.querySelector('.step-line-fill');
              const circles = panel3.querySelectorAll('.step-circle');
              const remark = panel3.querySelector('.panel-remark');
              if (line) mainTimeline.fromTo(line, { width: '0%' }, { width: '100%', duration: 0.7, ease: 'power1.inOut' }, `${t3}+=0.1`);
              if (circles.length > 0) mainTimeline.fromTo(circles, { opacity: 0.4, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.25, stagger: 0.12 }, `${t3}+=0.1`);
              if (remark) mainTimeline.fromTo(remark, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.35 }, `${t3}+=0.6`);
            }
          }
        }

        // Settling hold duration after arrival
        mainTimeline.to({}, { duration: 1.5 });

        mainTimeline.set([currentEl, nextEl], { willChange: 'auto' }, `${stepLabel}+=2.8`);
      }
    }

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);

    return () => {
      clearTimeout(refreshTimer);
      mainTimeline.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
    };
  }, [scenes, options.progressBarRef]);

  const scrollToScene = (index: number) => {
    if (!containerRef.current) return;
    const totalScenes = scenes.length;
    const maxScroll = containerRef.current.offsetHeight - window.innerHeight;
    const targetScroll = containerRef.current.offsetTop + (index / (totalScenes - 1)) * maxScroll;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetScroll, { duration: 3.0 });
    } else {
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };

  return {
    containerRef,
    stageRef,
    scrollToScene,
  };
};
