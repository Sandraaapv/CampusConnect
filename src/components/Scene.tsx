import React from 'react';
import type { SceneData } from '../data/scenes';
import { ArrowRight, UserPlus, LogIn } from 'lucide-react';

interface SceneProps {
  scene: SceneData;
  index: number;
}

const renderDescriptionText = (segments?: SceneData['descriptionSegments']) => {
  if (!segments || segments.length === 0) return null;

  const words: { word: string; isHighlight: boolean; isLast: boolean }[] = [];
  segments.forEach((seg, sIdx) => {
    const rawWords = seg.text.trim().split(/\s+/).filter(Boolean);
    rawWords.forEach((rw, wIdx) => {
      const isLast = sIdx === segments.length - 1 && wIdx === rawWords.length - 1;
      words.push({
        word: rw,
        isHighlight: !!seg.highlight,
        isLast,
      });
    });
  });

  return (
    <p className="scene-description scene-description-text mt-[1.8vh]">
      {words.map((wObj, wIdx) => {
        const hasTrailingDot = wObj.isLast && wObj.word.endsWith('.');
        const cleanWord = hasTrailingDot ? wObj.word.slice(0, -1) : wObj.word;
        const letters = cleanWord.split('');

        return (
          <span
            key={wIdx}
            className={`scene-word inline-block mr-[0.28em] ${
              wObj.isHighlight ? 'font-black text-black' : 'font-medium text-neutral-800'
            }`}
          >
            {letters.map((char, cIdx) => (
              <span
                key={cIdx}
                className="scene-char inline-block opacity-0 will-change-[opacity]"
              >
                {char}
              </span>
            ))}
            {hasTrailingDot && (
              <span className="scene-char inline-block opacity-0 will-change-[opacity] font-bold">
                .
              </span>
            )}
          </span>
        );
      })}
    </p>
  );
};

export const Scene: React.FC<SceneProps> = ({ scene, index }) => {
  const PreviewComponent = scene.previewComponent;
  const isSpecialScene10 = scene.isCallToAction;
  const isRightSide = scene.side === 'right';

  // Scene 10: Special centered layout
  if (isSpecialScene10) {
    return (
      <section
        id={`scene-${scene.id}`}
        aria-label={scene.heading}
        className="scene-container absolute inset-0 w-full h-full select-none pointer-events-none"
        style={{
          paddingTop: 'calc(var(--header-h) + 2vh)',
          opacity: index === 0 ? 1 : 0,
          visibility: index === 0 ? 'visible' : 'hidden',
          zIndex: index === 0 ? 10 : 1,
        }}
      >
        {/* Content Centered at Top */}
        <div className="scene-text-content z-20 text-center max-w-3xl mx-auto flex flex-col items-center pointer-events-auto px-4">
          {/* Heading Row (emojis removed) */}
          <div className="scene-heading flex items-center justify-center">
            <h1 className="scene-heading-title">
              {scene.heading}
            </h1>
          </div>

          {/* Tagline */}
          <p className="scene-tagline scene-tagline-text text-neutral-800 mt-[1vh]">
            {scene.taglinePrefix}
            <span className="italic font-bold text-black underline decoration-amber-400 decoration-wavy decoration-2">
              {scene.taglineItalic}
            </span>
            {scene.taglineSuffix}
          </p>

          {/* Two Big CTA Buttons: Sign up & Sign in */}
          <div className="scene-cta flex items-center justify-center gap-4 sm:gap-6 mt-[3vh]">
            <a
              href="/signup"
              id="cta-signup-btn"
              className="px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-black text-white font-black text-sm sm:text-base hover:bg-neutral-800 transition-all transform hover:-translate-y-0.5 shadow-md flex items-center gap-2 focus:ring-4 focus:ring-neutral-400 focus:outline-none cursor-pointer"
            >
              <UserPlus className="w-5 h-5 text-amber-300" />
              Sign up
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </a>

            <a
              href="/login"
              id="cta-signin-btn"
              className="px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-white text-black font-black text-sm sm:text-base border-2 border-black hover:bg-neutral-100 transition-all transform hover:-translate-y-0.5 shadow-xs flex items-center gap-2 focus:ring-4 focus:ring-neutral-300 focus:outline-none cursor-pointer"
            >
              <LogIn className="w-5 h-5 text-neutral-900" />
              Sign in
            </a>
          </div>
        </div>

        {/* Mascot (Arms Open) Centered at Bottom ~54vh */}
        <div
          className="scene-mascot absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(90vw,720px)] h-[54vh] pointer-events-none"
        >
          <img
            src={scene.image}
            alt={scene.altText}
            width={1355}
            height={906}
            loading={index >= 3 ? 'lazy' : 'eager'}
            className="mascot-blend mascot-hero w-full h-full object-contain object-bottom drop-shadow-xs"
          />
        </div>
      </section>
    );
  }

  // Standard Scenes 1 to 9
  return (
    <section
      id={`scene-${scene.id}`}
      aria-label={scene.heading}
      className="scene-container absolute inset-0 w-full h-full select-none pointer-events-none"
      style={{
        opacity: index === 0 ? 1 : 0,
        visibility: index === 0 ? 'visible' : 'hidden',
        pointerEvents: index === 0 ? 'auto' : 'none',
        zIndex: index === 0 ? 10 : 1,
      }}
    >
      {/* DESKTOP LAYOUT (>= 900px) */}
      <div className="hidden lg:block w-full h-full relative">
        {/* Mascot Box: EXACTLY 50vw wide, 90vh tall, flush to bottom and side */}
        <div
          className={`scene-mascot absolute bottom-0 w-[50vw] h-[90vh] pointer-events-none ${
            isRightSide ? 'right-0' : 'left-0'
          }`}
          style={{ margin: 0, padding: 0 }}
        >
          <img
            src={scene.image}
            alt={scene.altText}
            width={1100}
            height={1100}
            loading={index >= 3 ? 'lazy' : 'eager'}
            className={`mascot-blend mascot-hero w-full h-full object-contain ${
              isRightSide ? 'object-right-bottom' : 'object-left-bottom'
            }`}
            style={{
              objectPosition: isRightSide ? 'right bottom' : 'left bottom',
            }}
          />
        </div>

        {/* Text Column: EXACTLY other 50vw, vertically centered in space under header */}
        <div
          className={`scene-text-col absolute top-0 w-[50vw] h-full flex flex-col justify-center pointer-events-auto ${
            isRightSide ? 'left-0 pl-[5vw] pr-[3vw]' : 'right-0 pl-[3vw] pr-[5vw]'
          }`}
          style={{
            paddingTop: 'calc(var(--header-h) + 2vh)',
            paddingBottom: '2vh',
          }}
        >
          <div className="scene-text-content w-full max-w-[min(46vw,680px)] -translate-y-[2vh]">
            {/* Heading (emojis removed) */}
            <div className="scene-heading flex items-center">
              {scene.id === 1 ? (
                <h1 className="scene-heading-title flex flex-col items-start">
                  <span className="scene-hero-welcome">WELCOME TO</span>
                  <span className="scene-hero-brand">CAMPUSCONNECT</span>
                </h1>
              ) : (
                <h2 className="scene-heading-title">
                  {scene.heading}
                </h2>
              )}
            </div>

            {/* Tagline */}
            <p className="scene-tagline scene-tagline-text text-neutral-800 mt-[1.2vh]">
              {scene.taglinePrefix}
              <span className="italic font-extrabold text-black underline decoration-amber-400 decoration-wavy decoration-2">
                {scene.taglineItalic}
              </span>
              {scene.taglineSuffix}
            </p>

            {/* Supporting Description */}
            {renderDescriptionText(scene.descriptionSegments)}

            {/* Feature Preview Device Mockup sits directly under description with extended margin */}
            {PreviewComponent && (
              <div className="scene-preview perspective-container mt-[3.2vh]">
                <PreviewComponent />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT (< 900px): Stacked, heading & preview at top, mascot at bottom 36vh */}
      <div
        className="flex lg:hidden flex-col justify-between w-full h-full px-4"
        style={{
          paddingTop: 'calc(var(--header-h) + 2vh)',
          paddingBottom: 0,
        }}
      >
        {/* Top Text & Preview */}
        <div className="scene-text-content flex-1 flex flex-col justify-center items-center text-center pointer-events-auto max-w-sm mx-auto">
          <div className="scene-heading flex items-center justify-center">
            {scene.id === 1 ? (
              <h1 className="scene-heading-title flex flex-col items-center text-center">
                <span className="scene-hero-welcome">WELCOME TO</span>
                <span className="scene-hero-brand">CAMPUSCONNECT</span>
              </h1>
            ) : (
              <h2 className="scene-heading-title text-center">
                {scene.heading}
              </h2>
            )}
          </div>

          <p className="scene-tagline scene-tagline-text text-neutral-800 mt-1.5">
            {scene.taglinePrefix}
            <span className="italic font-bold text-black">
              {scene.taglineItalic}
            </span>
            {scene.taglineSuffix}
          </p>

          {/* Supporting Description (Mobile) */}
          {renderDescriptionText(scene.descriptionSegments)}

          {PreviewComponent && (
            <div className="scene-preview mt-3.5 w-full flex justify-center">
              <PreviewComponent />
            </div>
          )}
        </div>

        {/* Bottom Mascot: 36vh tall, anchored at bottom */}
        <div className="scene-mascot w-full h-[36vh] flex items-end justify-center pointer-events-none shrink-0">
          <img
            src={scene.image}
            alt={scene.altText}
            width={1100}
            height={1100}
            loading={index >= 3 ? 'lazy' : 'eager'}
            className="mascot-blend mascot-hero w-full h-full object-contain object-bottom"
          />
        </div>
      </div>
    </section>
  );
};
