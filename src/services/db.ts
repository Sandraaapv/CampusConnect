// CampusConnect Student Portal — Typed Client Data Store & Seed Database
// Strictly student-only: No faculty or admin roles, screens, or entities.

import bcrypt from 'bcryptjs';

export interface StudentSettings {
  attendanceThreshold: number; // default 75
  gradingScheme: { grade: string; minPercent: number; points: number }[];
  internalWeight: number; // default 50
  endSemWeight: number; // default 50
  emailAlerts: {
    lowAttendance: boolean;
    approachingDeadlines: boolean;
    requestStatus: boolean;
    circulars: boolean;
    newBadges: boolean;
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
  isSelfReported: boolean;
}

export interface MarkRecord {
  subjectId: string;
  internal1: number; // max 25
  internal2: number; // max 25
  assignment: number; // max 10 (normalized to internal total 50)
  totalInternal: number; // max 50
  credits: number;
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
  type: 'No-dues' | 'OD letter' | 'Scholarship' | 'Event';
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
  type: 'attendance' | 'deadline' | 'circular' | 'request' | 'badge';
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

// Generate 60 days of historical attendance
const generateSeedAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const subjectList = ['sub-dsa', 'sub-os', 'sub-dbms', 'sub-cn', 'sub-cloud'];
  // Targets:
  // DSA: ~88% (attended 37/42)
  // OS: ~81% (attended 31/38)
  // DBMS: ~90% (attended 36/40)
  // CN: ~73.6% (CRITICAL: Below 75% for realism! Attended 28/38)
  // Cloud: ~85% (attended 29/34)
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
        isSelfReported: true,
      });
    }
  });

  return records;
};

const SEED_MARKS: MarkRecord[] = [
  { subjectId: 'sub-dsa', internal1: 23, internal2: 24, assignment: 9.5, totalInternal: 47, credits: 4 },
  { subjectId: 'sub-os', internal1: 20, internal2: 21, assignment: 9.0, totalInternal: 41, credits: 4 },
  { subjectId: 'sub-dbms', internal1: 24, internal2: 25, assignment: 10, totalInternal: 49, credits: 4 },
  { subjectId: 'sub-cn', internal1: 17, internal2: 19, assignment: 8.5, totalInternal: 36, credits: 3 }, // low marks
  { subjectId: 'sub-cloud', internal1: 21, internal2: 22, assignment: 9.0, totalInternal: 43, credits: 3 },
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
  SEEDED: 'campusconnect_portal_seeded_v2',
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

  constructor() {
    this.init();
    this.startSimulatedApprovalEngine();
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

  public recordAttendance(subjectId: string, date: string, status: 'present' | 'absent' | 'od') {
    // Check if record already exists for this subject and date
    const existingIndex = this.attendance.findIndex(
      (a) => a.subjectId === subjectId && a.date === date
    );

    if (existingIndex >= 0) {
      this.attendance[existingIndex].status = status;
    } else {
      this.attendance.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subjectId,
        date,
        status,
        isSelfReported: true,
      });
    }
    this.saveAll();
  }

  /**
   * Verified Attendance Calculations:
   * threshold = default 0.75 (configurable via settings)
   * a = attended classes (+ OD credited)
   * t = total classes held
   * Safe skips = floor(a / threshold - t)
   * Classes needed to recover = ceil((threshold * t - a) / (1 - threshold))
   */
  public getAttendanceSummary() {
    const threshold = (this.user.settings?.attendanceThreshold || 75) / 100;

    return this.subjects.map((sub) => {
      const records = this.attendance.filter((a) => a.subjectId === sub.id);
      const total = records.length;
      const attended = records.filter((a) => a.status === 'present' || a.status === 'od').length;
      const currentPercent = total > 0 ? Number(((attended / total) * 100).toFixed(1)) : 100;

      // Safe skips formula: floor(a / threshold - t)
      let safeSkips = 0;
      if (total > 0 && attended / total >= threshold) {
        safeSkips = Math.max(0, Math.floor(attended / threshold - total));
      }

      // Recovery needed formula: ceil((threshold * total - attended) / (1 - threshold))
      let classesNeeded = 0;
      if (total > 0 && attended / total < threshold) {
        classesNeeded = Math.max(0, Math.ceil((threshold * total - attended) / (1 - threshold)));
      }

      return {
        subject: sub,
        total,
        attended,
        currentPercent,
        safeSkips,
        classesNeeded,
        isAtRisk: currentPercent < (this.user.settings?.attendanceThreshold || 75),
      };
    });
  }

  // --- Marks & CGPA Predictor ---
  public getMarks(): MarkRecord[] {
    return this.marks;
  }

  public updateMark(subjectId: string, updates: Partial<MarkRecord>) {
    const index = this.marks.findIndex((m) => m.subjectId === subjectId);
    if (index >= 0) {
      this.marks[index] = { ...this.marks[index], ...updates };
      this.marks[index].totalInternal =
        (this.marks[index].internal1 || 0) +
        (this.marks[index].internal2 || 0) +
        (this.marks[index].assignment || 0);
      this.saveAll();
    }
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
        totalInternal: 40,
        credits: sub.credits,
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
          // If No-dues, sequentially stamp departments
          if (req.type === 'No-dues' && req.departmentStages) {
            const nextUncleared = req.departmentStages.find((s) => !s.cleared);
            if (nextUncleared) {
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

    // Rule-based urgency scoring:
    // 1) Low attendance (<75%)
    // 2) Assignment due within 48h
    // 3) Exam within 7 days
    const atRiskCount = urgentAttendance.length;

    let assistantSentence = 'All systems nominal. You have 2 classes scheduled today.';
    if (atRiskCount > 0) {
      const riskSub = urgentAttendance[0];
      assistantSentence = `Attention: ${riskSub.subject.name} is at ${riskSub.currentPercent}%. You need ${riskSub.classesNeeded} more class to return to safety.`;
    } else {
      assistantSentence = '2 classes today, DBMS quiz tomorrow, you can safely skip 1 class.';
    }

    return {
      assistantSentence,
      atRiskCount,
      summary,
      urgentAttendance,
      pendingAssignments,
      upcomingExams,
      latestCirculars,
      streak,
      unlockedBadges: badges,
    };
  }
}

export const db = new StudentPortalDB();
