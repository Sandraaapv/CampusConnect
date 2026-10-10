import React from 'react';

interface IconProps {
  className?: string;
}

// Hand-drawn style: 2.5px thick black strokes, playful curves, vibrant flat fills

export const WelcomeHandIcon: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Shadow/accent shape */}
    <path
      d="M20 8C18 8 16 10 16 13V24C16 24 13 23 11 23C9 23 7 25 7 27C7 31 11 36 15 40C19 44 25 45 30 44C36 43 41 38 41 32V20C41 17.5 39 15.5 36.5 15.5C35.5 15.5 34.5 16 34 17C33.5 15 32 13.5 30 13.5C29 13.5 28 14 27.5 14.5C26.5 12.5 25 11 23 11C22 11 21 11.5 20.5 12V8H20Z"
      fill="#FDE047"
    />
    {/* Thick black outline */}
    <path
      d="M20.5 12V8C20.5 6 18.5 5 16.5 6C14.5 7 14 9.5 14 12V24M20.5 12C20.5 9.5 22 8 24 8C26 8 27.5 9.5 27.5 12V22M27.5 14.5C28 12.5 29.5 11 31.5 11C33.5 11 35 12.5 35 14.5V22M35 17C35.5 15.5 37 14.5 38.5 14.5C40.5 14.5 42 16 42 18.5V31C42 37 37 42 31 43C25 44 19 43 14 38C10 34 6 29 6 25C6 22.5 8 21 10.5 21C13 21 15 23 15.5 25"
      stroke="#111111"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M28 28C28 32 25 35 21 35"
      stroke="#111111"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

export const DashboardLightningIcon: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M26 4L8 26H22L18 44L40 20H26L30 4H26Z"
      fill="#FACC15"
      stroke="#111111"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M28 8L34 16"
      stroke="#FFFFFF"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    {/* Mini spark dot */}
    <circle cx="38" cy="10" r="2.5" fill="#38BDF8" stroke="#111111" strokeWidth="2" />
  </svg>
);

export const AttendanceCalcIcon: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Calculator Body */}
    <rect
      x="8"
      y="6"
      width="32"
      height="36"
      rx="7"
      fill="#4ADE80"
      stroke="#111111"
      strokeWidth="2.8"
    />
    {/* Screen */}
    <rect
      x="13"
      y="11"
      width="22"
      height="9"
      rx="3"
      fill="#FFFFFF"
      stroke="#111111"
      strokeWidth="2.4"
    />
    {/* Percentage mark */}
    <circle cx="17" cy="15" r="1.5" fill="#111111" />
    <line x1="25" y1="13" x2="20" y2="18" stroke="#111111" strokeWidth="1.8" />
    <circle cx="28" cy="16" r="1.5" fill="#111111" />
    {/* Keypad dots */}
    <rect x="13" y="24" width="5" height="5" rx="1.5" fill="#FEF08A" stroke="#111111" strokeWidth="2" />
    <rect x="22" y="24" width="5" height="5" rx="1.5" fill="#FEF08A" stroke="#111111" strokeWidth="2" />
    <rect x="30" y="24" width="5" height="5" rx="1.5" fill="#FB7185" stroke="#111111" strokeWidth="2" />
    <rect x="13" y="32" width="5" height="5" rx="1.5" fill="#FEF08A" stroke="#111111" strokeWidth="2" />
    <rect x="22" y="32" width="13" height="5" rx="1.5" fill="#38BDF8" stroke="#111111" strokeWidth="2" />
  </svg>
);

export const CgpaGradCapIcon: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Cap diamond */}
    <polygon
      points="24,6 44,17 24,27 4,17"
      fill="#818CF8"
      stroke="#111111"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    {/* Skull cap base */}
    <path
      d="M13 22.5V32C13 36 18 39 24 39C30 39 35 36 35 32V22.5"
      fill="#C084FC"
      stroke="#111111"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    {/* Tassel cord */}
    <path
      d="M36 19V32"
      stroke="#F59E0B"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    <circle cx="36" cy="34" r="3" fill="#F59E0B" stroke="#111111" strokeWidth="2" />
    {/* Dart Star */}
    <circle cx="24" cy="16.5" r="2.5" fill="#FDE047" stroke="#111111" strokeWidth="1.8" />
  </svg>
);

export const CircularsMegaphoneIcon: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Megaphone Cone */}
    <path
      d="M11 20L28 10V34L11 24H6C4.89543 24 4 23.1046 4 22V22C4 20.8954 4.89543 20 6 20H11Z"
      fill="#FB7185"
      stroke="#111111"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    {/* Bell Horn oval */}
    <ellipse
      cx="28"
      cy="22"
      rx="4"
      ry="12"
      fill="#FDE047"
      stroke="#111111"
      strokeWidth="2.8"
    />
    {/* Handle */}
    <path
      d="M15 24V35C15 36.5 16.5 37.5 18 37C19.5 36.5 20 35 20 33.5V23"
      fill="#38BDF8"
      stroke="#111111"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Sound waves */}
    <path
      d="M36 14C39 16 41 19 41 22C41 25 39 28 36 30"
      stroke="#111111"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
    <path
      d="M40 10C44 13 46 17 46 22C46 27 44 31 40 34"
      stroke="#111111"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

export const RequestTrackerIcon: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Paper airplane body */}
    <polygon
      points="6,24 42,7 29,41 23,28"
      fill="#38BDF8"
      stroke="#111111"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    <polygon
      points="23,28 42,7 28,24"
      fill="#7DD3FC"
      stroke="#111111"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Checkmark Stamp Badge */}
    <circle cx="14" cy="36" r="8" fill="#4ADE80" stroke="#111111" strokeWidth="2.6" />
    <path
      d="M10 36L13 39L18 33"
      stroke="#111111"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const StreaksFlameIcon: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer flame */}
    <path
      d="M25 5C25 11 31 14 33 20C35 24 35 27 34 30C32 38 24 43 18 41C12 39 8 32 10 26C11 21 16 19 17 15C18 11 16 8 16 8C19 9 22 7 25 5Z"
      fill="#FB923C"
      stroke="#111111"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Inner core */}
    <path
      d="M21 21C21 24 24 26 25 29C26 32 25 35 23 37C20 39 17 38 16 35C15 32 18 30 18 27C18 24 17 22 17 22C19 23 20 22 21 21Z"
      fill="#FEF08A"
      stroke="#111111"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Spark */}
    <circle cx="36" cy="12" r="2.5" fill="#F43F5E" stroke="#111111" strokeWidth="2" />
  </svg>
);

export const DigitalIdBadgeIcon: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Lanyard Clip */}
    <rect x="20" y="4" width="8" height="5" rx="2" fill="#E2E8F0" stroke="#111111" strokeWidth="2.4" />
    <circle cx="24" cy="9" r="2" fill="#111111" />
    {/* Card */}
    <rect
      x="8"
      y="11"
      width="32"
      height="32"
      rx="6"
      fill="#2DD4BF"
      stroke="#111111"
      strokeWidth="2.8"
    />
    {/* Photo window */}
    <rect x="13" y="17" width="10" height="12" rx="2" fill="#FFFFFF" stroke="#111111" strokeWidth="2.2" />
    <circle cx="18" cy="21" r="2.5" fill="#F59E0B" />
    <path d="M14 28C14 26 16 25 18 25C20 25 22 26 22 28" fill="#F59E0B" />
    {/* Text lines */}
    <line x1="26" y1="19" x2="35" y2="19" stroke="#111111" strokeWidth="2.4" strokeLinecap="round" />
    <line x1="26" y1="24" x2="33" y2="24" stroke="#111111" strokeWidth="2.4" strokeLinecap="round" />
    {/* QR code glyph */}
    <rect x="26" y="29" width="9" height="9" rx="1.5" fill="#FFFFFF" stroke="#111111" strokeWidth="2" />
    <rect x="28" y="31" width="5" height="5" fill="#111111" />
  </svg>
);

export const SemesterWrappedGiftIcon: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Box */}
    <rect
      x="9"
      y="17"
      width="30"
      height="25"
      rx="4"
      fill="#A855F7"
      stroke="#111111"
      strokeWidth="2.8"
    />
    {/* Box Lid */}
    <rect
      x="6"
      y="12"
      width="36"
      height="8"
      rx="3"
      fill="#C084FC"
      stroke="#111111"
      strokeWidth="2.8"
    />
    {/* Vertical Ribbon */}
    <rect x="21" y="12" width="6" height="30" fill="#FDE047" stroke="#111111" strokeWidth="2.2" />
    {/* Bow Loops */}
    <path
      d="M21 12C17 9 14 5 18 4C22 3 23 9 24 12"
      fill="#FDE047"
      stroke="#111111"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    <path
      d="M27 12C31 9 34 5 30 4C26 3 25 9 24 12"
      fill="#FDE047"
      stroke="#111111"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    {/* Confetti */}
    <circle cx="8" cy="8" r="1.8" fill="#38BDF8" stroke="#111111" strokeWidth="1.5" />
    <circle cx="41" cy="9" r="1.8" fill="#F43F5E" stroke="#111111" strokeWidth="1.5" />
  </svg>
);

export const ReadyDoorIcon: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Door Frame */}
    <rect
      x="8"
      y="8"
      width="32"
      height="34"
      rx="3"
      fill="#E2E8F0"
      stroke="#111111"
      strokeWidth="2.8"
    />
    {/* Open door panel swinging inward */}
    <polygon
      points="10,10 32,5 32,39 10,40"
      fill="#F59E0B"
      stroke="#111111"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    {/* Door knob */}
    <circle cx="28" cy="23" r="2.5" fill="#FEF08A" stroke="#111111" strokeWidth="2" />
    {/* Welcome rays pouring out */}
    <path d="M34 16L41 14" stroke="#FBBF24" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M35 22L43 22" stroke="#FBBF24" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M34 28L41 30" stroke="#FBBF24" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);
