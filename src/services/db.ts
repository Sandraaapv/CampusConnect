// CampusConnect Student Portal — Typed Client Data Store & Seed Database
// Strictly student-only: No faculty or admin roles, screens, or entities.

import bcrypt from 'bcryptjs';
import {
  COLLEGE_SYLLABUS_UNITS,
  INITIAL_STUDENT_UNIT_PROGRESS,
  computeCollegeTotalInternal,
  calculateSafeSkips,
  calculateClassesToRecover,
  buildStudyPlan,
  getAcademicHistoryForStudent,
  calculateCumulativeCgpa,
  COLLEGE_TIMETABLE_SLOTS,
  COLLEGE_CLASS_CHANGES,
  COLLEGE_FEE_STRUCTURES,
  COLLEGE_FEE_PAYMENTS,
  COLLEGE_FEE_RECEIPTS,
  COLLEGE_FACULTY,
  COLLEGE_FEEDBACK_FORMS,
  COLLEGE_FEEDBACK_QUESTIONS,
  INITIAL_FEEDBACK_RESPONSES,
  INITIAL_FEEDBACK_SUBMISSIONS,
  SEED_HELPDESK_TICKETS,
  SEED_HELPDESK_COMMENTS,
  getFeeStatus,
  generateIcsCalendar,
  COLLEGE_PAYMENT_PORTAL_URL,
  SEMESTER_6_FEE_DUE_DATE,
} from './collegeRecords';
import type {
  SyllabusUnit,
  StudyPlanResult,
  PastSubjectRecord,
  PastSemesterRecord,
  AcademicHistoryConfig,
  TimetableSlot,
  ClassChange,
  FeeStructureItem,
  FeePaymentRecord,
  FeeReceipt,
  FacultyMember,
  FacultyOfficeHour,
  FeedbackForm,
  FeedbackQuestion,
  FeedbackResponse,
  FeedbackSubmission,
  HelpdeskTicket,
  HelpdeskComment,
  HelpdeskAttachment,
  HelpdeskEvent,
  DayOfWeek,
} from './collegeRecords';

export type {
  PastSubjectRecord,
  PastSemesterRecord,
  AcademicHistoryConfig,
  TimetableSlot,
  ClassChange,
  FeeStructureItem,
  FeePaymentRecord,
  FeeReceipt,
  FacultyMember,
  FacultyOfficeHour,
  FeedbackForm,
  FeedbackQuestion,
  FeedbackResponse,
  FeedbackSubmission,
  HelpdeskTicket,
  HelpdeskComment,
  HelpdeskAttachment,
  HelpdeskEvent,
  DayOfWeek,
};

export interface StudentSettings {
  attendanceThreshold: number; // default 75
  targetCgpa: number; // default 8.5
  dailyStudyHours: number; // default 4
  gradingScheme: { grade: string; minPercent: number; points: number }[];
  internalWeight: number; // default 50
  endSemWeight: number; // default 50
  emailAlerts: {
    lowAttendance: boolean;
    approachingDeadlines: boolean;
    requestStatus: boolean;
    circulars: boolean;
    newBadges: boolean;
    classChanged?: boolean;
    feeDue?: boolean;
    feeOverdue?: boolean;
    feedbackClosing?: boolean;
    helpdeskUpdate?: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  registerNumber: string;
  department: string;
  semester: number;
  passwordHash: string;
  avatarUrl?: string;
  settings: StudentSettings;
  createdAt: string;
}

export interface StudentRecord {
  registerNumber: string;
  email: string;
  name: string;
  department: string;
  semester: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  facultyName: string;
  syllabusCoveragePercent: number;
}

export interface TimetableEntry {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'od';
  source: 'college';
}

export interface MarkRecord {
  subjectId: string;
  internal1: number; // max 25
  internal2: number; // max 25
  assignment: number; // max 10
  totalInternal: number; // max 50
  maxInternal: 50;
  credits: number;
  source: 'college';
}

export interface Assignment {
  id: string;
  subjectId: string;
  subjectCode: string;
  title: string;
  dueDate: string; // ISO string
  status: 'pending' | 'submitted';
  description: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  examDate: string; // YYYY-MM-DD
  startTime: string;
  duration: string;
  room: string;
}

export interface Circular {
  id: string;
  title: string;
  department: string;
  semester?: number;
  category: 'Exam' | 'Academic' | 'Event' | 'Hostel' | 'Scholarship';
  date: string;
  content: string;
  tags: string[];
}

export interface Note {
  id: string;
  subjectId: string;
  subjectCode: string;
  title: string;
  fileType: 'PDF' | 'Notes' | 'PYQ';
  uploadedBy: string;
  uploadedDate: string;
  upvotes: number;
  upvotedBy: string[];
}

export interface DepartmentClearance {
  department: 'Library' | 'Hostel' | 'Accounts' | 'Labs';
  cleared: boolean;
  clearedAt?: string;
  remarks?: string;
}

export interface RequestItem {
  id: string;
  type: 'No-dues' | 'OD letter' | 'Scholarship' | 'Event' | 'Attendance correction';
  title: string;
  status: 'Submitted' | 'In Review' | 'Faculty Review' | 'Admin Review' | 'Approved' | 'Rejected';
  submittedDate: string;
  details: {
    eventName?: string;
    durationDays?: number;
    concessionCategory?: string;
    clubName?: string;
    reason?: string;
    affectedSubjectIds?: string[];
    // For Attendance correction:
    subjectId?: string;
    subjectCode?: string;
    date?: string;
    className?: string;
    expectedStatus?: string;
    note?: string;
  };
  departmentStages?: DepartmentClearance[];
  odDaysCredited?: number;
  comments: {
    role: string;
    author: string;
    comment: string;
    date: string;
  }[];
  verificationToken: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  hint: string;
}

export interface Notification {
  id: string;
  type:
    | 'attendance'
    | 'deadline'
    | 'circular'
    | 'request'
    | 'badge'
    | 'class_changed'
    | 'fee_due'
    | 'fee_overdue'
    | 'feedback_closing'
    | 'helpdesk_update';
  title: string;
  message: string;
  date: string;
  read: boolean;
  link?: string;
}

// -------------------------------------------------------------
// DEFAULT DATA & SEED RECORDS
// -------------------------------------------------------------

const DEFAULT_SETTINGS: StudentSettings = {
  attendanceThreshold: 75,
  targetCgpa: 8.5,
  dailyStudyHours: 4,
  gradingScheme: [
    { grade: 'O (Outstanding)', minPercent: 90, points: 10 },
    { grade: 'A+ (Excellent)', minPercent: 80, points: 9 },
    { grade: 'A (Very Good)', minPercent: 70, points: 8 },
    { grade: 'B+ (Good)', minPercent: 60, points: 7 },
    { grade: 'B (Above Average)', minPercent: 50, points: 6 },
    { grade: 'C (Average)', minPercent: 45, points: 5 },
  ],
  internalWeight: 50,
  endSemWeight: 50,
  emailAlerts: {
    lowAttendance: true,
    approachingDeadlines: true,
    requestStatus: true,
    circulars: false,
    newBadges: true,
    classChanged: true,
    feeDue: true,
    feeOverdue: true,
    feedbackClosing: true,
    helpdeskUpdate: true,
  },
};

const SEED_STUDENT_RECORDS: StudentRecord[] = [
  {
    registerNumber: '21CS042',
    email: 'student.demo@college.edu',
    name: 'Aarav Sharma',
    department: 'Computer Science & Engineering',
    semester: 6,
  },
  {
    registerNumber: '21CS077',
    email: 'rohit.sharma@college.edu',
    name: 'Rohit Sharma',
    department: 'Computer Science & Engineering',
    semester: 6,
  },
  {
    registerNumber: '21CS105',
    email: 'ananya.sen@college.edu',
    name: 'Ananya Sen',
    department: 'Computer Science & Engineering',
    semester: 6,
  },
  {
    registerNumber: '21EC034',
    email: 'vikram.mehta@college.edu',
    name: 'Vikram Mehta',
    department: 'Electronics & Communication',
    semester: 6,
  },
  {
    registerNumber: '21ME019',
    email: 'sneha.patel@college.edu',
    name: 'Sneha Patel',
    department: 'Mechanical Engineering',
    semester: 6,
  },
];

const SEED_DEMO_USER: User = {
  id: 'usr-student-demo-001',
  name: 'Aarav Sharma',
  email: 'student.demo@college.edu',
  registerNumber: '21CS042',
  department: 'Computer Science & Engineering',
  semester: 6,
  passwordHash: bcrypt.hashSync('Password@123', 10),
  avatarUrl: '/mascots/01-welcome.png',
  settings: DEFAULT_SETTINGS,
  createdAt: '2026-08-01T09:00:00Z',
};

const SEED_SUBJECTS: Subject[] = [
  {
    id: 'sub-dsa',
    code: 'CS3601',
    name: 'Data Structures & Algorithms',
    credits: 4,
    facultyName: 'Dr. Priya V.',
    syllabusCoveragePercent: 85,
  },
  {
    id: 'sub-os',
    code: 'CS3602',
    name: 'Operating Systems',
    credits: 4,
    facultyName: 'Prof. Rajesh K.',
    syllabusCoveragePercent: 70,
  },
  {
    id: 'sub-dbms',
    code: 'CS3603',
    name: 'Database Management Systems',
    credits: 4,
    facultyName: 'Dr. Anand R.',
    syllabusCoveragePercent: 90,
  },
  {
    id: 'sub-cn',
    code: 'CS3604',
    name: 'Computer Networks',
    credits: 3,
    facultyName: 'Prof. Shweta M.',
    syllabusCoveragePercent: 60,
  },
  {
    id: 'sub-cloud',
    code: 'CS3605',
    name: 'Cloud Computing & DevOps',
    credits: 3,
    facultyName: 'Dr. Karthik S.',
    syllabusCoveragePercent: 75,
  },
];

const SEED_TIMETABLE: TimetableEntry[] = [
  { id: 'tt-1', dayOfWeek: 'Monday', subjectId: 'sub-dsa', subjectCode: 'CS3601', subjectName: 'Data Structures & Algorithms', startTime: '09:00', endTime: '10:00', room: 'LH-201' },
  { id: 'tt-2', dayOfWeek: 'Monday', subjectId: 'sub-os', subjectCode: 'CS3602', subjectName: 'Operating Systems', startTime: '10:15', endTime: '11:15', room: 'LH-201' },
  { id: 'tt-3', dayOfWeek: 'Monday', subjectId: 'sub-dbms', subjectCode: 'CS3603', subjectName: 'Database Management Systems', startTime: '11:30', endTime: '12:30', room: 'Lab-3' },
  { id: 'tt-4', dayOfWeek: 'Tuesday', subjectId: 'sub-cn', subjectCode: 'CS3604', subjectName: 'Computer Networks', startTime: '09:00', endTime: '10:00', room: 'LH-203' },
  { id: 'tt-5', dayOfWeek: 'Tuesday', subjectId: 'sub-cloud', subjectCode: 'CS3605', subjectName: 'Cloud Computing & DevOps', startTime: '10:15', endTime: '11:15', room: 'LH-203' },
  { id: 'tt-6', dayOfWeek: 'Wednesday', subjectId: 'sub-dsa', subjectCode: 'CS3601', subjectName: 'Data Structures & Algorithms', startTime: '09:00', endTime: '10:00', room: 'LH-201' },
  { id: 'tt-7', dayOfWeek: 'Wednesday', subjectId: 'sub-dbms', subjectCode: 'CS3603', subjectName: 'Database Management Systems', startTime: '10:15', endTime: '11:15', room: 'LH-201' },
  { id: 'tt-8', dayOfWeek: 'Thursday', subjectId: 'sub-os', subjectCode: 'CS3602', subjectName: 'Operating Systems', startTime: '09:00', endTime: '10:00', room: 'LH-201' },
  { id: 'tt-9', dayOfWeek: 'Thursday', subjectId: 'sub-cn', subjectCode: 'CS3604', subjectName: 'Computer Networks', startTime: '11:30', endTime: '12:30', room: 'LH-203' },
  { id: 'tt-10', dayOfWeek: 'Friday', subjectId: 'sub-cloud', subjectCode: 'CS3605', subjectName: 'Cloud Computing & DevOps', startTime: '09:00', endTime: '10:00', room: 'LH-203' },
  { id: 'tt-11', dayOfWeek: 'Friday', subjectId: 'sub-dsa', subjectCode: 'CS3601', subjectName: 'Data Structures & Algorithms', startTime: '10:15', endTime: '11:15', room: 'Lab-1' },
];

// Generate official historical college attendance
const generateSeedAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const subjectList = ['sub-dsa', 'sub-os', 'sub-dbms', 'sub-cn', 'sub-cloud'];
  const targets: Record<string, { total: number; attended: number }> = {
    'sub-dsa': { total: 42, attended: 37 },
    'sub-os': { total: 38, attended: 31 },
    'sub-dbms': { total: 40, attended: 36 },
    'sub-cn': { total: 38, attended: 28 }, // Below 75% threshold!
    'sub-cloud': { total: 34, attended: 29 },
  };

  const today = new Date('2026-10-10');

  subjectList.forEach((subId) => {
    const config = targets[subId];
    let presentCount = 0;
    for (let i = config.total; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i * 1.5);
      const dateStr = d.toISOString().split('T')[0];
      const isPresent = presentCount < config.attended;
      if (isPresent) presentCount++;

      records.push({
        id: `att-${subId}-${i}`,
        subjectId: subId,
        date: dateStr,
        status: isPresent ? 'present' : 'absent',
        source: 'college',
      });
    }
  });

  return records;
};

const SEED_MARKS: MarkRecord[] = [
  {
    subjectId: 'sub-dsa',
    internal1: 23,
    internal2: 24,
    assignment: 9.5,
    totalInternal: computeCollegeTotalInternal(23, 24, 9.5),
    maxInternal: 50,
    credits: 4,
    source: 'college',
  },
  {
    subjectId: 'sub-os',
    internal1: 20,
    internal2: 21,
    assignment: 9.0,
    totalInternal: computeCollegeTotalInternal(20, 21, 9.0),
    maxInternal: 50,
    credits: 4,
    source: 'college',
  },
  {
    subjectId: 'sub-dbms',
    internal1: 24,
    internal2: 25,
    assignment: 10,
    totalInternal: computeCollegeTotalInternal(24, 25, 10),
    maxInternal: 50,
    credits: 4,
    source: 'college',
  },
  {
    subjectId: 'sub-cn',
    internal1: 17,
    internal2: 19,
    assignment: 8.5,
    totalInternal: computeCollegeTotalInternal(17, 19, 8.5),
    maxInternal: 50,
    credits: 3,
    source: 'college',
  },
  {
    subjectId: 'sub-cloud',
    internal1: 21,
    internal2: 22,
    assignment: 9.0,
    totalInternal: computeCollegeTotalInternal(21, 22, 9.0),
    maxInternal: 50,
    credits: 3,
    source: 'college',
  },
];

const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    subjectId: 'sub-dbms',
    subjectCode: 'CS3603',
    title: 'B+ Tree Indexing & Query Optimization Quiz',
    dueDate: new Date(Date.now() + 28 * 3600 * 1000).toISOString(), // ~28 hours from now (<48h)
    status: 'pending',
    description: 'Implement B+ Tree insertion algorithm and submit test benchmark results.',
  },
  {
    id: 'asg-2',
    subjectId: 'sub-cn',
    subjectCode: 'CS3604',
    title: 'Wireshark Packet Analysis Lab Report',
    dueDate: new Date(Date.now() + 65 * 3600 * 1000).toISOString(), // ~65 hours
    status: 'pending',
    description: 'Capture TCP 3-way handshake and analyze window scaling.',
  },
];

const SEED_EXAMS: Exam[] = [
  {
    id: 'ex-1',
    subjectId: 'sub-cn',
    subjectCode: 'CS3604',
    subjectName: 'Computer Networks',
    examDate: '2026-10-16', // 6 days from now (< 7 days!)
    startTime: '09:30 AM',
    duration: '3 hours',
    room: 'Hall B',
  },
  {
    id: 'ex-2',
    subjectId: 'sub-os',
    subjectCode: 'CS3602',
    subjectName: 'Operating Systems',
    examDate: '2026-10-20',
    startTime: '09:30 AM',
    duration: '3 hours',
    room: 'Hall B',
  },
  {
    id: 'ex-3',
    subjectId: 'sub-dsa',
    subjectCode: 'CS3601',
    subjectName: 'Data Structures & Algorithms',
    examDate: '2026-10-24',
    startTime: '09:30 AM',
    duration: '3 hours',
    room: 'Hall A',
  },
];

const SEED_CIRCULARS: Circular[] = [
  {
    id: 'circ-1',
    title: 'End-Semester Examination Time Table & Hall Ticket Guidelines',
    department: 'Computer Science & Engineering',
    semester: 6,
    category: 'Exam',
    date: '2026-10-09',
    content: 'The end-semester theory examinations for Semester 6 begin on November 15th, 2026. Hall tickets will be downloadable from the portal starting November 5th. Clear all departmental dues prior to registration.',
    tags: ['Exam', 'Schedule', 'HallTicket'],
  },
  {
    id: 'circ-2',
    title: 'Inter-College HackFest 2026 Registration & OD Grant',
    department: 'Computer Science & Engineering',
    semester: 6,
    category: 'Event',
    date: '2026-10-07',
    content: 'Selected finalists for HackFest 2026 at IIT Bombay are entitled to 2 days of On-Duty attendance. Submit an OD Letter request online with your confirmation badge before October 12th.',
    tags: ['Hackathon', 'OD', 'Events'],
  },
  {
    id: 'circ-3',
    title: 'Hostel Mess Rebate & No-Dues Clearance Window',
    department: 'Computer Science & Engineering',
    category: 'Hostel',
    date: '2026-10-05',
    content: 'Hostel students can file online applications for mess rebate reimbursement for absences exceeding 5 continuous days.',
    tags: ['Hostel', 'Rebate'],
  },
];

const SEED_NOTES: Note[] = [
  {
    id: 'note-1',
    subjectId: 'sub-dsa',
    subjectCode: 'CS3601',
    title: 'Graph Algorithms & Dynamic Programming Cheatsheet',
    fileType: 'Notes',
    uploadedBy: 'Aarav Sharma (21CS042)',
    uploadedDate: '2026-09-28',
    upvotes: 42,
    upvotedBy: ['usr-1', 'usr-2'],
  },
  {
    id: 'note-2',
    subjectId: 'sub-cn',
    subjectCode: 'CS3604',
    title: 'Previous 5 Years Question Papers with Solutions (2021-2025)',
    fileType: 'PYQ',
    uploadedBy: 'Sneha Rao (21CS089)',
    uploadedDate: '2026-10-02',
    upvotes: 68,
    upvotedBy: ['usr-student-demo-001'],
  },
  {
    id: 'note-3',
    subjectId: 'sub-os',
    subjectCode: 'CS3602',
    title: 'Process Synchronization & Semaphore Implementation Handouts',
    fileType: 'PDF',
    uploadedBy: 'Rohan Mehra (21CS014)',
    uploadedDate: '2026-09-15',
    upvotes: 31,
    upvotedBy: [],
  },
];

const SEED_REQUESTS: RequestItem[] = [
  {
    id: 'REQ-ND-8842',
    type: 'No-dues',
    title: 'Semester 6 No-Dues Clearance',
    status: 'Approved',
    submittedDate: '2026-10-02',
    details: { reason: 'Final semester graduation and lab clearance.' },
    departmentStages: [
      { department: 'Library', cleared: true, clearedAt: '2026-10-03', remarks: 'No outstanding books or fines.' },
      { department: 'Hostel', cleared: true, clearedAt: '2026-10-04', remarks: 'Room handover inspected.' },
      { department: 'Accounts', cleared: true, clearedAt: '2026-10-04', remarks: 'All semester tuition paid.' },
      { department: 'Labs', cleared: true, clearedAt: '2026-10-05', remarks: 'Component kit returned.' },
    ],
    comments: [
      { role: 'System', author: 'Clearance Engine', comment: 'All 4 departments cleared. Digital certificate issued.', date: '2026-10-05' },
    ],
    verificationToken: 'v_token_nd8842_signed_cc2026',
  },
  {
    id: 'REQ-OD-4819',
    type: 'OD letter',
    title: 'HackFest 2026 Finals (2 Days)',
    status: 'Faculty Review',
    submittedDate: '2026-10-08',
    details: {
      eventName: 'National Inter-College HackFest 2026',
      durationDays: 2,
      affectedSubjectIds: ['sub-os', 'sub-cn'],
      reason: 'Representing college in 36-hour hackathon finals at IIT.',
    },
    comments: [
      { role: 'Student', author: 'Aarav Sharma', comment: 'Attached invitation pass and round-1 selection mail.', date: '2026-10-08' },
      { role: 'Faculty', author: 'Faculty Advisor', comment: 'Reviewing event credentials with HOD.', date: '2026-10-09' },
    ],
    verificationToken: 'v_token_od4819_signed_cc2026',
  },
  {
    id: 'REQ-SCH-2210',
    type: 'Scholarship',
    title: 'Merit-Cum-Means Fee Concession',
    status: 'Admin Review',
    submittedDate: '2026-10-01',
    details: { concessionCategory: 'Merit Category A', reason: 'CGPA > 8.5 with income certificate attached.' },
    comments: [
      { role: 'Admin', author: 'Scholarship Cell', comment: 'Income certificate verified. Concession approved.', date: '2026-10-06' },
    ],
    verificationToken: 'v_token_sch2210_signed_cc2026',
  },
  {
    id: 'REQ-EVT-9184',
    type: 'Event',
    title: 'ACM Chapter CodeFest Auditorium Permission',
    status: 'Approved',
    submittedDate: '2026-09-25',
    details: { clubName: 'ACM Student Chapter', reason: 'Technical seminar and coding competition.' },
    comments: [
      { role: 'Admin', author: 'Dean Student Affairs', comment: 'Venue and date confirmed. Auditorium booked.', date: '2026-09-28' },
    ],
    verificationToken: 'v_token_evt9184_signed_cc2026',
  },
];

const SEED_BADGES: Badge[] = [
  { id: 'b-streak-master', title: 'Streak Master', description: 'Maintained 18+ days of uninterrupted attendance', iconName: 'Flame', unlocked: true, unlockedAt: '2026-10-08', hint: 'Attend all classes consecutively' },
  { id: 'b-perfect-week', title: 'Perfect Week', description: '100% attendance across all subjects in a single week', iconName: 'Award', unlocked: true, unlockedAt: '2026-09-22', hint: 'Never miss a class Monday to Friday' },
  { id: 'b-early-bird', title: 'Early Bird', description: 'Present for every 9:00 AM period throughout the month', iconName: 'Zap', unlocked: true, unlockedAt: '2026-09-30', hint: 'Be on time for period 1' },
  { id: 'b-comeback-kid', title: 'Comeback Kid', description: 'Recovered a low subject from below 75% back to safe zone', iconName: 'ShieldCheck', unlocked: false, hint: 'Bring Computer Networks back above 75%' },
];

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'attendance',
    title: 'Attendance Alert: Computer Networks',
    message: 'Your attendance is at 73.7% (below the 75% threshold). You need to attend 2 consecutive classes to recover.',
    date: 'Today, 08:30 AM',
    read: false,
    link: '/attendance',
  },
  {
    id: 'notif-2',
    type: 'deadline',
    title: 'Assignment Due in 28 Hours',
    message: 'B+ Tree Indexing & Query Optimization Quiz is due tomorrow at 11:59 PM.',
    date: 'Today, 09:15 AM',
    read: false,
    link: '/dashboard',
  },
  {
    id: 'notif-3',
    type: 'request',
    title: 'No-Dues Clearance Approved',
    message: 'All 4 departments have stamped cleared. Download your verified clearance certificate.',
    date: 'Yesterday, 04:00 PM',
    read: true,
    link: '/requests/REQ-ND-8842',
  },
  {
    id: 'notif-4',
    type: 'circular',
    title: 'New Circular: End-Sem Exam Schedule',
    message: 'Office of COE has published the final theory exam schedule for Semester 6.',
    date: 'Oct 9, 2026',
    read: true,
    link: '/circulars',
  },
];

// -------------------------------------------------------------
// LOCALSTORAGE REPOSITORY MANAGER
// -------------------------------------------------------------

const STORAGE_KEYS = {
  USER: 'campusconnect_student_user_v2',
  SUBJECTS: 'campusconnect_student_subjects_v2',
  TIMETABLE: 'campusconnect_student_timetable_v2',
  ATTENDANCE: 'campusconnect_student_attendance_v2',
  MARKS: 'campusconnect_student_marks_v2',
  ASSIGNMENTS: 'campusconnect_student_assignments_v2',
  EXAMS: 'campusconnect_student_exams_v2',
  CIRCULARS: 'campusconnect_student_circulars_v2',
  NOTES: 'campusconnect_student_notes_v2',
  REQUESTS: 'campusconnect_student_requests_v2',
  BADGES: 'campusconnect_student_badges_v2',
  NOTIFICATIONS: 'campusconnect_student_notifications_v2',
  FEEDBACK_RESPONSES: 'campusconnect_feedback_responses_v2',
  FEEDBACK_SUBMISSIONS: 'campusconnect_feedback_submissions_v2',
  HELPDESK_TICKETS: 'campusconnect_helpdesk_tickets_v2',
  HELPDESK_COMMENTS: 'campusconnect_helpdesk_comments_v2',
  SEEDED: 'campusconnect_portal_seeded_v3',
};

class StudentPortalDB {
  private user: User = SEED_DEMO_USER;
  private subjects: Subject[] = SEED_SUBJECTS;
  private timetable: TimetableEntry[] = SEED_TIMETABLE;
  private attendance: AttendanceRecord[] = [];
  private marks: MarkRecord[] = SEED_MARKS;
  private assignments: Assignment[] = SEED_ASSIGNMENTS;
  private exams: Exam[] = SEED_EXAMS;
  private circulars: Circular[] = SEED_CIRCULARS;
  private notes: Note[] = SEED_NOTES;
  private requests: RequestItem[] = SEED_REQUESTS;
  private badges: Badge[] = SEED_BADGES;
  private notifications: Notification[] = SEED_NOTIFICATIONS;
  private feedbackResponses: FeedbackResponse[] = INITIAL_FEEDBACK_RESPONSES;
  private feedbackSubmissions: FeedbackSubmission[] = INITIAL_FEEDBACK_SUBMISSIONS;
  private helpdeskTickets: HelpdeskTicket[] = SEED_HELPDESK_TICKETS;
  private helpdeskComments: HelpdeskComment[] = SEED_HELPDESK_COMMENTS;

  constructor() {
    this.init();
    this.startSimulatedApprovalEngine();
    this.startSimulatedHelpdeskEngine();
  }

  private init() {
    try {
      const isSeeded = localStorage.getItem(STORAGE_KEYS.SEEDED);
      if (!isSeeded) {
        this.resetToDefaults();
      } else {
        this.loadFromStorage();
      }
    } catch {
      this.resetToDefaults();
    }
  }

  public resetToDefaults() {
    this.user = { ...SEED_DEMO_USER };
    this.subjects = [...SEED_SUBJECTS];
    this.timetable = [...SEED_TIMETABLE];
    this.attendance = generateSeedAttendance();
    this.marks = [...SEED_MARKS];
    this.assignments = [...SEED_ASSIGNMENTS];
    this.exams = [...SEED_EXAMS];
    this.circulars = [...SEED_CIRCULARS];
    this.notes = [...SEED_NOTES];
    this.requests = [...SEED_REQUESTS];
    this.badges = [...SEED_BADGES];
    this.notifications = [...SEED_NOTIFICATIONS];
    this.feedbackResponses = [...INITIAL_FEEDBACK_RESPONSES];
    this.feedbackSubmissions = [...INITIAL_FEEDBACK_SUBMISSIONS];
    this.helpdeskTickets = [...SEED_HELPDESK_TICKETS];
    this.helpdeskComments = [...SEED_HELPDESK_COMMENTS];
    this.saveAll();
    try {
      localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
    } catch {
      // ignore
    }
  }

  private loadFromStorage() {
    try {
      const u = localStorage.getItem(STORAGE_KEYS.USER);
      const sub = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      const tt = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
      const att = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      const mk = localStorage.getItem(STORAGE_KEYS.MARKS);
      const asg = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      const ex = localStorage.getItem(STORAGE_KEYS.EXAMS);
      const circ = localStorage.getItem(STORAGE_KEYS.CIRCULARS);
      const nt = localStorage.getItem(STORAGE_KEYS.NOTES);
      const req = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      const bdg = localStorage.getItem(STORAGE_KEYS.BADGES);
      const not = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const fbr = localStorage.getItem(STORAGE_KEYS.FEEDBACK_RESPONSES);
      const fbs = localStorage.getItem(STORAGE_KEYS.FEEDBACK_SUBMISSIONS);
      const hdt = localStorage.getItem(STORAGE_KEYS.HELPDESK_TICKETS);
      const hdc = localStorage.getItem(STORAGE_KEYS.HELPDESK_COMMENTS);

      if (u) this.user = JSON.parse(u);
      if (sub) this.subjects = JSON.parse(sub);
      if (tt) this.timetable = JSON.parse(tt);
      if (att) this.attendance = JSON.parse(att);
      if (mk) this.marks = JSON.parse(mk);
      if (asg) this.assignments = JSON.parse(asg);
      if (ex) this.exams = JSON.parse(ex);
      if (circ) this.circulars = JSON.parse(circ);
      if (nt) this.notes = JSON.parse(nt);
      if (req) this.requests = JSON.parse(req);
      if (bdg) this.badges = JSON.parse(bdg);
      if (not) this.notifications = JSON.parse(not);
      if (fbr) this.feedbackResponses = JSON.parse(fbr);
      if (fbs) this.feedbackSubmissions = JSON.parse(fbs);
      if (hdt) this.helpdeskTickets = JSON.parse(hdt);
      if (hdc) this.helpdeskComments = JSON.parse(hdc);
    } catch {
      this.resetToDefaults();
    }
  }

  public saveAll() {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.user));
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(this.subjects));
      localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(this.timetable));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(this.attendance));
      localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify(this.marks));
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(this.assignments));
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(this.exams));
      localStorage.setItem(STORAGE_KEYS.CIRCULARS, JSON.stringify(this.circulars));
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(this.notes));
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(this.requests));
      localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(this.badges));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
      localStorage.setItem(STORAGE_KEYS.FEEDBACK_RESPONSES, JSON.stringify(this.feedbackResponses));
      localStorage.setItem(STORAGE_KEYS.FEEDBACK_SUBMISSIONS, JSON.stringify(this.feedbackSubmissions));
      localStorage.setItem(STORAGE_KEYS.HELPDESK_TICKETS, JSON.stringify(this.helpdeskTickets));
      localStorage.setItem(STORAGE_KEYS.HELPDESK_COMMENTS, JSON.stringify(this.helpdeskComments));
    } catch {
      // ignore
    }
  }

  // Verification table for registration
  public getStudentRecordWhitelist(): StudentRecord[] {
    return SEED_STUDENT_RECORDS;
  }

  // --- User / Profile / Settings ---
  public getUser(): User {
    return this.user;
  }

  public updateUserSettings(settings: Partial<StudentSettings>): User {
    this.user.settings = { ...this.user.settings, ...settings };
    this.saveAll();
    return this.user;
  }

  public updateUserProfile(updates: Partial<User>): User {
    this.user = { ...this.user, ...updates };
    this.saveAll();
    return this.user;
  }

  // --- Subjects & Timetable ---
  public getSubjects(): Subject[] {
    return this.subjects;
  }

  public getTimetable(): TimetableEntry[] {
    return this.timetable;
  }

  // --- Attendance & Calculation Formulas ---
  public getAttendance(): AttendanceRecord[] {
    return this.attendance;
  }

  // Internal: Used only when official requests (such as On-Duty letter) are approved
  public internalCreditOdAttendance(subjectId: string, date: string) {
    const existingIndex = this.attendance.findIndex(
      (a) => a.subjectId === subjectId && a.date === date
    );

    if (existingIndex >= 0) {
      this.attendance[existingIndex].status = 'od';
    } else {
      this.attendance.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subjectId,
        date,
        status: 'od',
        source: 'college',
      });
    }
    this.saveAll();
  }

  public recordAttendance(subjectId: string, date: string, _status: 'present' | 'absent' | 'od') {
    // Official college records: student role has no write access. Only OD administrative workflow credits days.
    this.internalCreditOdAttendance(subjectId, date);
  }

  public getAttendanceSummary() {
    const threshold = this.user.settings?.attendanceThreshold || 75;

    return this.subjects.map((sub) => {
      const records = this.attendance.filter((a) => a.subjectId === sub.id);
      const total = records.length;
      const attended = records.filter((a) => a.status === 'present' || a.status === 'od').length;
      const currentPercent = total > 0 ? Number(((attended / total) * 100).toFixed(1)) : 100;

      const safeSkips = calculateSafeSkips(attended, total, threshold);
      const classesNeeded = calculateClassesToRecover(attended, total, threshold);

      return {
        subject: sub,
        total,
        attended,
        currentPercent,
        safeSkips,
        classesNeeded,
        isAtRisk: currentPercent < threshold,
      };
    });
  }

  // --- Marks & CGPA Predictor ---
  public getMarks(): MarkRecord[] {
    return this.marks;
  }

  // Official college records: student role has no write path to internal marks
  public updateMark(_subjectId: string, _updates: Partial<MarkRecord>) {
    console.warn('[CollegeRecords] Modification of official internal assessment marks is rejected.');
    return { error: 'Read-only college records: student write rejected.' };
  }

  // --- Academic History (Read-Only from College Records) ---
  public getAcademicHistory(config?: AcademicHistoryConfig): PastSemesterRecord[] {
    return getAcademicHistoryForStudent(this.user.semester, config);
  }

  public getCumulativeCgpa(config?: AcademicHistoryConfig): number {
    const history = this.getAcademicHistory(config);
    return calculateCumulativeCgpa(history, config);
  }

  // --- Syllabus Units & Student Progress ---
  public getSyllabusUnits(): SyllabusUnit[] {
    return COLLEGE_SYLLABUS_UNITS;
  }

  public getUnitProgress(): Record<string, boolean> {
    try {
      const saved = localStorage.getItem('campusconnect_unit_progress');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { ...INITIAL_STUDENT_UNIT_PROGRESS };
  }

  public toggleUnitProgress(unitId: string): Record<string, boolean> {
    const current = this.getUnitProgress();
    const updated = { ...current, [unitId]: !current[unitId] };
    try {
      localStorage.setItem('campusconnect_unit_progress', JSON.stringify(updated));
    } catch {}
    return updated;
  }

  public getStudyPlan(dailyHours?: number): StudyPlanResult {
    const hours = dailyHours ?? this.user.settings?.dailyStudyHours ?? 4;
    const progress = this.getUnitProgress();
    return buildStudyPlan(hours, progress);
  }

  /**
   * Predict end-semester marks needed for each subject to achieve a target CGPA
   */
  public predictEndSemMarks(targetCgpa: number) {
    const scheme = this.user.settings?.gradingScheme || DEFAULT_SETTINGS.gradingScheme;
    const internalWeight = (this.user.settings?.internalWeight || 50) / 100;
    const endSemWeight = (this.user.settings?.endSemWeight || 50) / 100;

    return this.subjects.map((sub) => {
      const mark = this.marks.find((m) => m.subjectId === sub.id) || {
        internal1: 20,
        internal2: 20,
        assignment: 8,
        totalInternal: 40,
        maxInternal: 50 as const,
        credits: sub.credits,
        source: 'college' as const,
      };

      // Find grade threshold corresponding to target CGPA points
      const matchingGrade =
        scheme.find((g) => g.points <= targetCgpa) || scheme[scheme.length - 1];
      const targetPercent = matchingGrade.minPercent;

      // targetPercent = internalContribution + endSemContribution
      // internalContribution = (totalInternal / 50) * 100 * internalWeight
      const internalContribution = ((mark.totalInternal || 0) / 50) * 100 * internalWeight;
      const neededEndSemPercent = (targetPercent - internalContribution) / endSemWeight;
      // Convert to mark out of 100
      const neededMarksOutOf100 = Math.ceil(neededEndSemPercent);

      const isImpossible = neededMarksOutOf100 > 100;
      const maxAchievablePercent = internalContribution + 100 * endSemWeight;
      const bestAchievableGrade =
        scheme.find((g) => maxAchievablePercent >= g.minPercent) || scheme[scheme.length - 1];

      return {
        subject: sub,
        mark,
        targetCgpa,
        targetGrade: matchingGrade.grade,
        neededMarksOutOf100: Math.max(0, neededMarksOutOf100),
        isImpossible,
        bestAchievableCgpa: bestAchievableGrade.points,
        bestAchievableGrade: bestAchievableGrade.grade,
      };
    });
  }

  // --- Assignments & Exams ---
  public getAssignments(): Assignment[] {
    return this.assignments;
  }

  public getExams(): Exam[] {
    return this.exams;
  }

  // --- Circulars & Notes Hub ---
  public getCirculars(searchQuery?: string, category?: string): Circular[] {
    let list = this.circulars;
    if (category && category !== 'All') {
      list = list.filter((c) => c.category === category);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.content.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }

  public getNotes(subjectCode?: string): Note[] {
    if (subjectCode && subjectCode !== 'All') {
      return this.notes.filter((n) => n.subjectCode === subjectCode);
    }
    return this.notes;
  }

  public upvoteNote(noteId: string): Note | undefined {
    const note = this.notes.find((n) => n.id === noteId);
    if (!note) return undefined;
    const userId = this.user.id;
    if (note.upvotedBy.includes(userId)) {
      note.upvotes -= 1;
      note.upvotedBy = note.upvotedBy.filter((u) => u !== userId);
    } else {
      note.upvotes += 1;
      note.upvotedBy.push(userId);
    }
    this.saveAll();
    return note;
  }

  public addNote(note: Omit<Note, 'id' | 'upvotes' | 'upvotedBy' | 'uploadedDate'>): Note {
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}`,
      upvotes: 0,
      upvotedBy: [],
      uploadedDate: new Date().toISOString().split('T')[0],
    };
    this.notes.unshift(newNote);
    this.saveAll();
    return newNote;
  }

  // --- Approval Tracker (Simulated Engine) ---
  public getRequests(): RequestItem[] {
    return this.requests;
  }

  public getRequestById(id: string): RequestItem | undefined {
    return this.requests.find((r) => r.id === id);
  }

  public createRequest(item: Omit<RequestItem, 'id' | 'status' | 'submittedDate' | 'comments' | 'verificationToken'>): RequestItem {
    const newReq: RequestItem = {
      ...item,
      id: `REQ-${Date.now().toString().slice(-4)}`,
      status: 'Submitted',
      submittedDate: new Date().toISOString().split('T')[0],
      comments: [
        {
          role: 'Student',
          author: this.user.name,
          comment: `Application submitted for ${item.type}.`,
          date: new Date().toISOString().split('T')[0],
        },
      ],
      verificationToken: `v_token_${Date.now()}_signed_cc`,
      departmentStages:
        item.type === 'No-dues'
          ? [
              { department: 'Library', cleared: false },
              { department: 'Hostel', cleared: false },
              { department: 'Accounts', cleared: false },
              { department: 'Labs', cleared: false },
            ]
          : undefined,
    };

    this.requests.unshift(newReq);
    this.saveAll();
    return newReq;
  }

  /**
   * Demo Approval Simulation Engine:
   * Periodically checks for submitted/in-review requests and advances them automatically!
   */
  private startSimulatedApprovalEngine() {
    setInterval(() => {
      let changed = false;
      this.requests.forEach((req) => {
        if (req.status === 'Submitted') {
          req.status = 'In Review';
          req.comments.push({
            role: 'Faculty',
            author: 'Department Reviewer',
            comment: 'Documents verified. Forwarded for final clearance.',
            date: new Date().toISOString().split('T')[0],
          });
          changed = true;
        } else if (req.status === 'In Review' || req.status === 'Faculty Review') {
          // If No-dues, sequentially stamp departments, checking Accounts fee status
          if (req.type === 'No-dues' && req.departmentStages) {
            const nextUncleared = req.departmentStages.find((s) => !s.cleared);
            if (nextUncleared) {
              if (nextUncleared.department === 'Accounts') {
                const feeSummary = this.getFeeStatusSummary(this.user.semester);
                if (feeSummary.balanceDue > 0) {
                  // Blocked due to fee balance outstanding!
                  nextUncleared.cleared = false;
                  nextUncleared.remarks = `Fees due: ₹${feeSummary.balanceDue.toLocaleString()} pending for Semester ${this.user.semester}. Clear fees before approval.`;
                  changed = true;
                  return;
                }
              }
              nextUncleared.cleared = true;
              nextUncleared.clearedAt = new Date().toISOString().split('T')[0];
              nextUncleared.remarks = `${nextUncleared.department} verified no outstanding dues.`;
              changed = true;
            } else {
              req.status = 'Approved';
              req.comments.push({
                role: 'System',
                author: 'Clearance Engine',
                comment: 'All 4 departments cleared. Digital certificate issued.',
                date: new Date().toISOString().split('T')[0],
              });
              changed = true;
            }
          } else {
            // OD Letter, Scholarship, or Event
            req.status = 'Approved';
            if (req.type === 'OD letter' && req.details.durationDays) {
              req.odDaysCredited = req.details.durationDays;
              req.comments.push({
                role: 'Academic Office',
                author: 'Attendance Coordinator',
                comment: `Approved. Attendance credited: ${req.details.durationDays} days marked On-Duty.`,
                date: new Date().toISOString().split('T')[0],
              });

              // Credit attendance for affected subjects!
              const today = new Date().toISOString().split('T')[0];
              (req.details.affectedSubjectIds || ['sub-cn', 'sub-os']).forEach((subId) => {
                this.recordAttendance(subId, today, 'od');
              });
            } else if (req.type === 'Scholarship') {
              req.comments.push({
                role: 'Accounts',
                author: 'Scholarship Admin',
                comment: 'Income certificate verified. Concession approved.',
                date: new Date().toISOString().split('T')[0],
              });
            } else if (req.type === 'Event') {
              req.comments.push({
                role: 'Dean Office',
                author: 'Dean Student Affairs',
                comment: 'Venue and date confirmed.',
                date: new Date().toISOString().split('T')[0],
              });
            }
            changed = true;
          }
        }
      });

      if (changed) {
        this.saveAll();
      }
    }, 15000); // Check every 15s
  }

  /**
   * Simulated Helpdesk Response Engine:
   * Advances Open -> Assigned -> In progress after delays, adding simulated support comments!
   */
  private startSimulatedHelpdeskEngine() {
    setInterval(() => {
      let changed = false;
      this.helpdeskTickets.forEach((tkt) => {
        if (tkt.status === 'Open') {
          tkt.status = 'Assigned';
          tkt.updatedAt = new Date().toISOString();
          const comment: HelpdeskComment = {
            id: `com-sim-${Date.now()}`,
            ticketId: tkt.id,
            authorType: 'support',
            authorName: `${tkt.assignedDepartment} Helpdesk`,
            message: `Ticket assigned to primary field technician. Inspection scheduled today.`,
            createdAt: new Date().toISOString(),
          };
          this.helpdeskComments.push(comment);
          this.notifications.unshift({
            id: `notif-hd-${Date.now()}`,
            type: 'helpdesk_update',
            title: `Ticket Assigned: ${tkt.ticketNumber}`,
            message: `Your ticket has been assigned to ${tkt.assignedDepartment}.`,
            date: 'Just now',
            read: false,
            link: '/helpdesk',
          });
          changed = true;
        } else if (tkt.status === 'Assigned') {
          tkt.status = 'In progress';
          tkt.updatedAt = new Date().toISOString();
          const comment: HelpdeskComment = {
            id: `com-sim-${Date.now()}`,
            ticketId: tkt.id,
            authorType: 'support',
            authorName: `${tkt.assignedDepartment} Engineering`,
            message: `Technician has arrived at location: ${tkt.location}. Diagnostics underway.`,
            createdAt: new Date().toISOString(),
          };
          this.helpdeskComments.push(comment);
          changed = true;
        }
      });

      if (changed) {
        this.saveAll();
      }
    }, 20000); // Check every 20s
  }

  // --- TIMETABLE & CLASS CHANGES (READ-ONLY COLLEGE RECORDS) ---
  public getTimetableSlots(): TimetableSlot[] {
    return COLLEGE_TIMETABLE_SLOTS;
  }

  public getClassChanges(): ClassChange[] {
    return COLLEGE_CLASS_CHANGES;
  }

  public getTodayTimetable(dayOverride?: DayOfWeek): (TimetableSlot & { change?: ClassChange })[] {
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as unknown as DayOfWeek[];
    const todayDayName = dayOverride || days[new Date().getDay()] || 'Monday';
    const effectiveDay: DayOfWeek = todayDayName === ('Sunday' as DayOfWeek) ? 'Monday' : todayDayName;

    const daySlots = COLLEGE_TIMETABLE_SLOTS.filter((s) => s.day === effectiveDay);
    return daySlots.map((slot) => {
      const change = COLLEGE_CLASS_CHANGES.find((cc) => cc.slotId === slot.id);
      return {
        ...slot,
        change,
      };
    });
  }

  public getTimetableIcs(): string {
    return generateIcsCalendar(COLLEGE_TIMETABLE_SLOTS, this.user.name);
  }

  // Read-only rejection
  public updateTimetable() {
    return { error: 'Read-only college records: student write rejected.' };
  }

  // --- FEES & RECEIPTS (READ-ONLY COLLEGE RECORDS) ---
  public getFeeStructures(semester?: number): FeeStructureItem[] {
    const sem = semester ?? this.user.semester;
    return COLLEGE_FEE_STRUCTURES.filter((fs) => fs.semester === sem);
  }

  public getFeePayments(semester?: number): FeePaymentRecord[] {
    const sem = semester ?? this.user.semester;
    return COLLEGE_FEE_PAYMENTS.filter((fp) => fp.semester === sem);
  }

  public getFeeReceipts(): FeeReceipt[] {
    return COLLEGE_FEE_RECEIPTS;
  }

  public getFeeReceiptById(id: string): FeeReceipt | undefined {
    return COLLEGE_FEE_RECEIPTS.find((r) => r.id === id || r.paymentId === id);
  }

  public getFeeReceiptByToken(token: string): FeeReceipt | undefined {
    return COLLEGE_FEE_RECEIPTS.find((r) => r.verifyToken === token);
  }

  public getFeeStatusSummary(semester?: number) {
    const sem = semester ?? this.user.semester;
    const structures = this.getFeeStructures(sem);
    const payments = this.getFeePayments(sem);

    const totalFee = structures.reduce((sum, item) => sum + item.amount, 0);
    const paid = payments
      .filter((p) => p.status === 'success')
      .reduce((sum, p) => sum + p.amount, 0);
    const balanceDue = Math.max(0, totalFee - paid);
    const dueDate = SEMESTER_6_FEE_DUE_DATE;
    const status = getFeeStatus(balanceDue, dueDate);

    return {
      semester: sem,
      totalFee,
      paid,
      balanceDue,
      dueDate,
      status,
      paymentPortalUrl: COLLEGE_PAYMENT_PORTAL_URL,
      breakdown: structures,
      payments,
    };
  }

  // Read-only rejection
  public updateFees() {
    return { error: 'Read-only college records: student write rejected.' };
  }

  // --- FACULTY DIRECTORY (READ-ONLY COLLEGE RECORDS) ---
  public getFacultyList(): FacultyMember[] {
    return COLLEGE_FACULTY;
  }

  public getMyFaculty(): FacultyMember[] {
    return COLLEGE_FACULTY.filter((f) =>
      f.subjects.some((s) => this.subjects.some((sub) => sub.code === s.code || sub.name.includes(s.name)))
    );
  }

  public getFacultyById(id: string): FacultyMember | undefined {
    return COLLEGE_FACULTY.find((f) => f.id === id);
  }

  // Read-only rejection
  public updateFaculty() {
    return { error: 'Read-only college records: student write rejected.' };
  }

  // --- COURSE FEEDBACK (ANONYMITY BY DESIGN) ---
  public getFeedbackForms(): FeedbackForm[] {
    return COLLEGE_FEEDBACK_FORMS.map((form) => {
      const isSubmitted = this.feedbackSubmissions.some(
        (sub) => sub.studentId === this.user.id && sub.formId === form.id
      );
      return {
        ...form,
        status: isSubmitted ? 'submitted' : form.status,
      };
    });
  }

  public getFeedbackQuestions(): FeedbackQuestion[] {
    return COLLEGE_FEEDBACK_QUESTIONS;
  }

  public submitFeedback(
    formId: string,
    answers: Record<string, number>,
    comment?: string
  ): { success: boolean; error?: string } {
    // 1. Guard against duplicate submission
    const alreadySubmitted = this.feedbackSubmissions.some(
      (sub) => sub.studentId === this.user.id && sub.formId === formId
    );
    if (alreadySubmitted) {
      return { success: false, error: 'Duplicate submission rejected: Course feedback already submitted.' };
    }

    // 2. Store response strictly WITHOUT student_id (Anonymity by design)
    const response: FeedbackResponse = {
      id: `fbr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      formId,
      answers,
      comment: comment?.trim() ? comment.trim() : undefined,
      createdAt: new Date().toISOString(),
    };
    this.feedbackResponses.push(response);

    // 3. Store separate submission receipt ONLY with student_id + form_id to prevent duplicates
    const submission: FeedbackSubmission = {
      id: `fbs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: this.user.id,
      formId,
      submittedAt: new Date().toISOString(),
    };
    this.feedbackSubmissions.push(submission);

    this.saveAll();
    return { success: true };
  }

  // Read-only rejection
  public updateFeedbackForm() {
    return { error: 'Read-only college records: student write rejected.' };
  }

  // --- HELPDESK TICKETS & SIMULATED SUPPORT ---
  public getHelpdeskTickets(): HelpdeskTicket[] {
    return this.helpdeskTickets.filter((t) => t.studentId === this.user.id);
  }

  public getHelpdeskTicketById(id: string): { ticket: HelpdeskTicket; comments: HelpdeskComment[] } | undefined {
    const ticket = this.helpdeskTickets.find((t) => t.id === id && t.studentId === this.user.id);
    if (!ticket) return undefined;
    const comments = this.helpdeskComments.filter((c) => c.ticketId === id);
    return { ticket, comments };
  }

  public createHelpdeskTicket(input: {
    category: HelpdeskTicket['category'];
    priority: HelpdeskTicket['priority'];
    title: string;
    description: string;
    location: string;
    attachments?: HelpdeskAttachment[];
  }): { success: boolean; ticket?: HelpdeskTicket; error?: string } {
    // 1. Rate-limiting check: max 5 tickets per day
    const todayStr = new Date().toISOString().split('T')[0];
    const ticketsToday = this.helpdeskTickets.filter(
      (t) => t.studentId === this.user.id && t.createdAt.startsWith(todayStr)
    );
    if (ticketsToday.length >= 5) {
      return { success: false, error: 'Daily limit reached: Maximum 5 support tickets per day allowed.' };
    }

    // 2. Validate attachments: max 3 image attachments, max 5MB
    const attachments = (input.attachments || []).slice(0, 3);
    for (const att of attachments) {
      if (att.size > 5 * 1024 * 1024) {
        return { success: false, error: `File ${att.name} exceeds maximum 5MB size limit.` };
      }
      if (!att.type.startsWith('image/')) {
        return { success: false, error: `File ${att.name} must be an image (PNG, JPG, WEBP).` };
      }
    }

    const assignedDepartment =
      input.category === 'Wi-Fi / Network'
        ? 'Campus IT & Network Operations'
        : input.category === 'Hostel Maintenance'
        ? 'Hostel Estate & Facilities'
        : input.category === 'Library'
        ? 'Central Library Services'
        : input.category === 'Transport'
        ? 'Campus Transport Office'
        : 'Student Affairs & Administration';

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `HD-2026-${randomNum}`;

    const newTicket: HelpdeskTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber,
      studentId: this.user.id,
      category: input.category,
      priority: input.priority,
      title: input.title.trim(),
      description: input.description.trim(),
      location: input.location.trim(),
      status: 'Open',
      assignedDepartment,
      attachments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.helpdeskTickets.unshift(newTicket);

    // Initial acknowledgment comment
    const welcomeComment: HelpdeskComment = {
      id: `com-ack-${Date.now()}`,
      ticketId: newTicket.id,
      authorType: 'support',
      authorName: `${assignedDepartment} Automated Dispatch`,
      message: `Your ticket has been logged with Priority: ${input.priority}. It is being routed to the on-duty support team.`,
      createdAt: new Date().toISOString(),
    };
    this.helpdeskComments.push(welcomeComment);

    this.notifications.unshift({
      id: `notif-hd-new-${Date.now()}`,
      type: 'helpdesk_update',
      title: `Ticket Logged: ${ticketNumber}`,
      message: `Your ticket regarding "${input.title}" was registered.`,
      date: 'Just now',
      read: false,
      link: '/helpdesk',
    });

    this.saveAll();
    return { success: true, ticket: newTicket };
  }

  public addHelpdeskComment(ticketId: string, message: string): { success: boolean; comment?: HelpdeskComment; error?: string } {
    const ticket = this.helpdeskTickets.find((t) => t.id === ticketId && t.studentId === this.user.id);
    if (!ticket) return { success: false, error: 'Ticket not found.' };

    const newComment: HelpdeskComment = {
      id: `com-usr-${Date.now()}`,
      ticketId,
      authorType: 'student',
      authorName: this.user.name,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };
    this.helpdeskComments.push(newComment);
    ticket.updatedAt = new Date().toISOString();

    // Trigger simulated support follow-up after 4s
    setTimeout(() => {
      const followUp: HelpdeskComment = {
        id: `com-sup-${Date.now()}`,
        ticketId,
        authorType: 'support',
        authorName: `${ticket.assignedDepartment} Support`,
        message: `Thank you for the additional information. We have updated the work order notes accordingly.`,
        createdAt: new Date().toISOString(),
      };
      this.helpdeskComments.push(followUp);
      this.saveAll();
    }, 4000);

    this.saveAll();
    return { success: true, comment: newComment };
  }

  public updateHelpdeskTicket(
    ticketId: string,
    action: 'reopen' | 'close',
    rating?: number
  ): { success: boolean; error?: string } {
    const ticket = this.helpdeskTickets.find((t) => t.id === ticketId && t.studentId === this.user.id);
    if (!ticket) return { success: false, error: 'Ticket not found.' };

    if (action === 'reopen') {
      // Reopen within 7 days rule
      const resolvedAt = new Date(ticket.updatedAt);
      const daysSinceResolved = (Date.now() - resolvedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceResolved > 7) {
        return { success: false, error: 'Tickets resolved more than 7 days ago cannot be reopened. Please open a new ticket.' };
      }
      ticket.status = 'In progress';
      ticket.updatedAt = new Date().toISOString();
      this.helpdeskComments.push({
        id: `com-reopen-${Date.now()}`,
        ticketId,
        authorType: 'student',
        authorName: this.user.name,
        message: 'Reopened this ticket for further follow-up.',
        createdAt: new Date().toISOString(),
      });
    } else {
      ticket.status = 'Closed';
      if (rating) ticket.rating = rating;
      ticket.updatedAt = new Date().toISOString();
      this.helpdeskComments.push({
        id: `com-closed-${Date.now()}`,
        ticketId,
        authorType: 'student',
        authorName: this.user.name,
        message: `Student confirmed closure. Satisfaction rating: ${rating || 5}/5.`,
        createdAt: new Date().toISOString(),
      });
    }

    this.saveAll();
    return { success: true };
  }

  // --- Badges & Streaks ---
  public getBadges(): Badge[] {
    return this.badges;
  }

  public getStreak(): { count: number; active: boolean; nextMilestone: string } {
    return {
      count: 18,
      active: true,
      nextMilestone: '21-Day Streak Master',
    };
  }

  // --- Notifications ---
  public getNotifications(): Notification[] {
    return this.notifications;
  }

  public markNotificationAsRead(id: string) {
    const n = this.notifications.find((notif) => notif.id === id);
    if (n) {
      n.read = true;
      this.saveAll();
    }
  }

  public markAllNotificationsAsRead() {
    this.notifications.forEach((n) => (n.read = true));
    this.saveAll();
  }

  // --- Dashboard Aggregated Data ---
  public getDashboardData() {
    const summary = this.getAttendanceSummary();
    const urgentAttendance = summary.filter((s) => s.isAtRisk);
    const pendingAssignments = this.assignments.filter((a) => a.status === 'pending');
    const upcomingExams = this.exams;
    const latestCirculars = this.circulars.slice(0, 3);
    const streak = this.getStreak();
    const badges = this.badges.filter((b) => b.unlocked);

    // Timetable & class changes for today
    const todaySlots = this.getTodayTimetable();
    const changedSlots = todaySlots.filter((s) => s.change);

    // Feedback forms status
    const feedbackForms = this.getFeedbackForms();
    const pendingFeedbackForms = feedbackForms.filter((f) => f.status === 'pending');

    // Helpdesk tickets status
    const helpdeskTickets = this.getHelpdeskTickets();
    const openHelpdeskTickets = helpdeskTickets.filter((t) => t.status !== 'Closed');

    // Fees status
    const feeSummary = this.getFeeStatusSummary(this.user.semester);
    const feeDueSoon = feeSummary.status === 'Due soon' || feeSummary.status === 'Overdue';

    // Dashboard Urgency Order (Single highest urgent item for hero card):
    // 1) Attendance below threshold (<75%)
    // 2) Assignments due within 48h
    // 3) Feedback forms closing within 3 days
    // 4) Fees due within 7 days
    // 5) Exams within 7 days
    // 6) New circulars
    let urgentHero: {
      category: 'attendance' | 'assignment' | 'feedback' | 'fee' | 'exam' | 'circular';
      title: string;
      highlight: string;
      description: string;
      actionText: string;
      actionPath: string;
    };

    if (urgentAttendance.length > 0) {
      const riskSub = urgentAttendance[0];
      urgentHero = {
        category: 'attendance',
        title: 'ATTEND',
        highlight: `${riskSub.classesNeeded} MORE CLASS`,
        description: `You're at ${riskSub.currentPercent}%, just under the ${this.user.settings?.attendanceThreshold || 75}% line in ${riskSub.subject.name}. Next class restores safety.`,
        actionText: 'Open calculator',
        actionPath: '/attendance',
      };
    } else if (pendingAssignments.length > 0) {
      const asg = pendingAssignments[0];
      urgentHero = {
        category: 'assignment',
        title: 'SUBMIT',
        highlight: asg.title,
        description: `Due soon for ${asg.subjectCode}. Upload your submission to maintain continuous internal marks.`,
        actionText: 'View assignments',
        actionPath: '/dashboard',
      };
    } else if (pendingFeedbackForms.length > 0) {
      urgentHero = {
        category: 'feedback',
        title: 'COMPLETE',
        highlight: `${pendingFeedbackForms.length} COURSE FEEDBACK FORMS`,
        description: `Mandatory student evaluation window closes in 48 hours. Required before exam hall tickets are generated.`,
        actionText: 'Submit feedback',
        actionPath: '/feedback',
      };
    } else if (feeSummary.balanceDue > 0 && feeDueSoon) {
      urgentHero = {
        category: 'fee',
        title: 'SETTLE',
        highlight: `₹${feeSummary.balanceDue.toLocaleString()} SEMESTER 6 FEE`,
        description: `Balance payment due on ${feeSummary.dueDate}. Settle on college portal to ensure no-dues clearance.`,
        actionText: 'View fee details',
        actionPath: '/fees',
      };
    } else if (upcomingExams.length > 0) {
      urgentHero = {
        category: 'exam',
        title: 'REVISE',
        highlight: `${upcomingExams[0].subjectCode} EXAM`,
        description: `${upcomingExams[0].subjectName} theory exam scheduled on ${upcomingExams[0].examDate}.`,
        actionText: 'Study planner',
        actionPath: '/exams',
      };
    } else {
      urgentHero = {
        category: 'circular',
        title: 'CHECK',
        highlight: 'LATEST CIRCULARS',
        description: 'New official campus notifications and announcements posted by registrar.',
        actionText: 'Read circulars',
        actionPath: '/circulars',
      };
    }

    return {
      urgentHero,
      summary,
      urgentAttendance,
      pendingAssignments,
      upcomingExams,
      latestCirculars,
      streak,
      unlockedBadges: badges,
      todaySlots,
      changedSlots,
      pendingFeedbackCount: pendingFeedbackForms.length,
      openHelpdeskCount: openHelpdeskTickets.length,
      feeSummary,
      feeDueSoon,
    };
  }
}

export const db = new StudentPortalDB();
