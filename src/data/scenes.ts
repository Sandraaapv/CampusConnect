import React from 'react';
import {
  WelcomeHandIcon,
  DashboardLightningIcon,
  AttendanceCalcIcon,
  CgpaGradCapIcon,
  CircularsMegaphoneIcon,
  RequestTrackerIcon,
  StreaksFlameIcon,
  DigitalIdBadgeIcon,
  SemesterWrappedGiftIcon,
  ReadyDoorIcon,
} from '../components/icons/FeatureIcons';

import { DashboardPreview } from '../components/previews/DashboardPreview';
import { AttendancePreview } from '../components/previews/AttendancePreview';
import { CgpaPreview } from '../components/previews/CgpaPreview';
import { CircularsPreview } from '../components/previews/CircularsPreview';
import { RequestPreview } from '../components/previews/RequestPreview';
import { StreaksPreview } from '../components/previews/StreaksPreview';
import { IdCardPreview } from '../components/previews/IdCardPreview';
import { WrappedPreview } from '../components/previews/WrappedPreview';

export interface DescriptionSegment {
  text: string;
  highlight?: boolean;
}

export interface SceneData {
  id: number;
  image: string;
  side: 'left' | 'right' | 'center';
  heading: string;
  taglinePrefix: string;
  taglineItalic: string;
  taglineSuffix: string;
  description: string;
  descriptionSegments?: DescriptionSegment[];
  altText: string;
  icon: React.ComponentType<{ className?: string }>;
  previewComponent?: React.ComponentType;
  isCallToAction?: boolean;
}

export const scenes: SceneData[] = [
  {
    id: 1,
    image: '/mascots/01-welcome.webp',
    side: 'left',
    heading: 'Welcome to CampusConnect',
    taglinePrefix: 'Your whole college life, ',
    taglineItalic: 'in one place',
    taglineSuffix: '.',
    description: 'Attendance, marks, requests and notices, all in one portal.',
    altText: 'The CampusConnect puppet mascot waving cheerfully with a welcome smile',
    icon: WelcomeHandIcon,
  },
  {
    id: 2,
    image: '/mascots/02-Smart_dashboard.webp',
    side: 'left',
    heading: 'Smart Dashboard',
    taglinePrefix: 'Know what matters, ',
    taglineItalic: 'first',
    taglineSuffix: '.',
    description:
      "One home screen shows today's classes, attendance risk, pending assignments, upcoming exams and new circulars. The most urgent item always sits at the top, so subjects below 75% rank above deadlines.",
    descriptionSegments: [
      { text: "One home screen shows" },
      { text: "today's classes, attendance risk,", highlight: true },
      { text: "pending assignments, upcoming exams and new circulars. The" },
      { text: "most urgent item always sits at the top,", highlight: true },
      { text: "so" },
      { text: "subjects below 75%", highlight: true },
      { text: "rank above deadlines." },
    ],
    altText: 'The puppet mascot pointing attentively to the smart dashboard feed',
    icon: DashboardLightningIcon,
    previewComponent: DashboardPreview,
  },
  {
    id: 3,
    image: '/mascots/03-Attendance_calculator.webp',
    side: 'right',
    heading: 'Attendance Calculator',
    taglinePrefix: 'Know your attendance, ',
    taglineItalic: 'always',
    taglineSuffix: '.',
    description:
      'See your attendance per subject and exactly how many classes you can still skip while staying at 75%. Already below it? It tells you how many to attend in a row, and a what-if slider shows the drop before you skip.',
    descriptionSegments: [
      { text: "See your attendance per subject and" },
      { text: "exactly how many classes you can still skip", highlight: true },
      { text: "while" },
      { text: "staying at 75%.", highlight: true },
      { text: "Already below it? It tells you how many to attend in a row, and a" },
      { text: "what-if slider", highlight: true },
      { text: "shows the drop before you skip." },
    ],
    altText: 'The puppet mascot calculating safe buffer classes and attendance percentages',
    icon: AttendanceCalcIcon,
    previewComponent: AttendancePreview,
  },
  {
    id: 4,
    image: '/mascots/04-CGPA_predictor_and_exams.webp',
    side: 'right',
    heading: 'CGPA Predictor',
    taglinePrefix: 'Plan your grades, ',
    taglineItalic: "don't guess",
    taglineSuffix: '.',
    description:
      'Enter your expected internal marks and a target CGPA, and get the minimum end-sem marks needed in every subject. Impossible targets are flagged early, so you know where to focus.',
    descriptionSegments: [
      { text: "Enter your expected internal marks and a target CGPA, and get the" },
      { text: "minimum end-sem marks needed", highlight: true },
      { text: "in every subject." },
      { text: "Impossible targets are flagged early,", highlight: true },
      { text: "so you know" },
      { text: "where to focus.", highlight: true },
    ],
    altText: 'The puppet mascot analyzing exam countdowns and target end-semester marks',
    icon: CgpaGradCapIcon,
    previewComponent: CgpaPreview,
  },
  {
    id: 5,
    image: '/mascots/05-Circulars_and_notes.webp',
    side: 'left',
    heading: 'Circulars & Notes',
    taglinePrefix: 'Every notice, ',
    taglineItalic: 'easy to find',
    taglineSuffix: '.',
    description:
      'Notices are tagged by department and semester, with search and filters so none get buried. A notes and previous-year-paper section is organized by subject, with uploads and upvotes.',
    descriptionSegments: [
      { text: "Notices are" },
      { text: "tagged by department and semester,", highlight: true },
      { text: "with search and filters so" },
      { text: "none get buried.", highlight: true },
      { text: "A notes and previous-year-paper section is organized by subject, with" },
      { text: "uploads and upvotes.", highlight: true },
    ],
    altText: 'The puppet mascot sorting official notices and peer-reviewed study notes',
    icon: CircularsMegaphoneIcon,
    previewComponent: CircularsPreview,
  },
  {
    id: 6,
    image: '/mascots/06-Request_tracker.webp',
    side: 'left',
    heading: 'Approval Tracker',
    taglinePrefix: 'Approvals that ',
    taglineItalic: 'track themselves',
    taglineSuffix: '.',
    description:
      'No-dues clearance, OD letters, scholarship and fee concessions, and event permissions, all applied for online. Watch each approval move from Submitted to Faculty to Admin, with comments at every step and a downloadable document once approved.',
    descriptionSegments: [
      { text: "No-dues clearance,", highlight: true },
      { text: "OD letters,", highlight: true },
      { text: "scholarship and fee concessions, and event permissions, all applied for online. Watch" },
      { text: "each approval move", highlight: true },
      { text: "from Submitted to Faculty to Admin, with comments at every step and a" },
      { text: "downloadable document", highlight: true },
      { text: "once approved." },
    ],
    altText: 'The puppet mascot following the live progress of an online approval request with a stamp',
    icon: RequestTrackerIcon,
    previewComponent: RequestPreview,
  },
  {
    id: 7,
    image: '/mascots/07-Streaks_and_badges.webp',
    side: 'right',
    heading: 'Streaks & Badges',
    taglinePrefix: 'Small wins, ',
    taglineItalic: 'big streaks',
    taglineSuffix: '.',
    description:
      'Build a streak with every day of full attendance. Earn badges like Perfect Week, Comeback Kid, Early Bird and Streak Master, shown on your profile and dashboard.',
    descriptionSegments: [
      { text: "Build a" },
      { text: "streak with every day of full attendance.", highlight: true },
      { text: "Earn" },
      { text: "badges like Perfect Week, Comeback Kid,", highlight: true },
      { text: "Early Bird and Streak Master, shown on your" },
      { text: "profile and dashboard.", highlight: true },
    ],
    altText: 'The puppet mascot wearing achievement medals and celebrating a streak',
    icon: StreaksFlameIcon,
    previewComponent: StreaksPreview,
  },
  {
    id: 8,
    image: '/mascots/08-Digital_ID_card.webp',
    side: 'right',
    heading: 'Digital ID Card',
    taglinePrefix: 'Your ID, ',
    taglineItalic: 'always in your pocket',
    taglineSuffix: '.',
    description:
      'Carry your photo ID, register number, department and semester on your phone. A signed QR code lets faculty or admin verify you at the library or an event, and the card downloads as a PDF.',
    descriptionSegments: [
      { text: "Carry your" },
      { text: "photo ID, register number,", highlight: true },
      { text: "department and semester on your phone. A" },
      { text: "signed QR code", highlight: true },
      { text: "lets faculty or admin" },
      { text: "verify you at the library or an event,", highlight: true },
      { text: "and the card downloads as a PDF." },
    ],
    altText: 'The puppet mascot presenting a digital student ID card with QR code',
    icon: DigitalIdBadgeIcon,
    previewComponent: IdCardPreview,
  },
  {
    id: 9,
    image: '/mascots/09-Semester_Wrapped.webp',
    side: 'left',
    heading: 'Semester Wrapped',
    taglinePrefix: 'Look back on your ',
    taglineItalic: 'best semester',
    taglineSuffix: '.',
    description:
      'An end-of-semester recap in swipeable cards: your best subject, longest streak, biggest marks improvement, total classes attended and badges earned. Download it as an image to share.',
    descriptionSegments: [
      { text: "An" },
      { text: "end-of-semester recap in swipeable cards:", highlight: true },
      { text: "your" },
      { text: "best subject, longest streak, biggest marks improvement,", highlight: true },
      { text: "total classes attended and badges earned." },
      { text: "Download it as an image to share.", highlight: true },
    ],
    altText: 'The puppet mascot showcasing end-of-semester accomplishments in wrapped story format',
    icon: SemesterWrappedGiftIcon,
    previewComponent: WrappedPreview,
  },
  {
    id: 10,
    image: '/mascots/10-Login_call_to_action.webp',
    side: 'center',
    heading: 'Ready when you are',
    taglinePrefix: 'Pick your view and ',
    taglineItalic: 'come on in',
    taglineSuffix: '.',
    description: 'Students, faculty and admin each get their own view.',
    altText: 'The puppet mascot with open arms inviting students, faculty and admin to CampusConnect',
    icon: ReadyDoorIcon,
    isCallToAction: true,
  },
];
