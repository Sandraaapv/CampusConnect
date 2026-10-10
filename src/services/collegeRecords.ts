// CampusConnect — Official College Records Layer
// In production, this layer syncs read-only data from the College ERP / SIS (Student Information System).
// The student UI has zero write access to attendance, internal marks, credits, or exam timetables.

export interface CollegeSubject {
  id: string;
  code: string;
  name: string;
  credits: number;
  facultyName: string;
}

export interface CollegeAttendanceRecord {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'od';
  source: 'college';
}

export interface CollegeMarkRecord {
  subjectId: string;
  internal1: number; // max 25
  internal2: number; // max 25
  assignment: number; // max 10
  totalInternal: number; // max 50 (scaled per college scheme)
  maxInternal: 50;
  credits: number;
  source: 'college';
}

export interface CollegeTimetableEntry {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  room: string;
  todayStatus: 'attended' | 'absent' | 'not_yet_recorded';
}

export interface CollegeExam {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  examDate: string; // YYYY-MM-DD
  startTime: string;
  duration: string;
  room: string;
}

export interface SyllabusUnit {
  id: string;
  subjectId: string;
  unitNo: number;
  title: string;
  estHours: number;
}

export interface StudentUnitProgress {
  unitId: string;
  covered: boolean;
  updatedAt: string;
}

export interface UserSettings {
  targetCgpa: number;
  dailyStudyHours: number;
  attendanceThreshold: number;
}

export interface PastSubjectRecord {
  code: string;
  name: string;
  credits: number;
  grade: string;
  gradePoints: number;
  isArrear?: boolean;
}

export interface PastSemesterRecord {
  semester: number;
  term: string;
  sgpa: number;
  cumulativeCgpa: number;
  totalCredits: number;
  subjects: PastSubjectRecord[];
}

export interface AcademicHistoryConfig {
  arrearsCountedInCredits: boolean; // default true (college rule)
}

// ============================================================================
// NEW SECTION 8 DATA MODELS (COLLEGE RECORDS - READ-ONLY FOR STUDENT)
// ============================================================================

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  period: number; // 1 to 7
  startTime: string; // e.g. "08:45"
  endTime: string; // e.g. "09:40"
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  room: string;
  facultyId: string;
  facultyName: string;
  slotType: 'lecture' | 'lab' | 'tutorial';
  colorKey: string;
}

export interface ClassChange {
  id: string;
  slotId: string;
  date: string; // YYYY-MM-DD
  type: 'cancelled' | 'rescheduled' | 'room_changed' | 'Cancelled' | 'Rescheduled' | 'Room changed';
  newRoom?: string;
  newTime?: string;
  note?: string;
}

export interface FeeStructureItem {
  id: string;
  semester: number;
  component: string;
  amount: number;
}

export interface FeePaymentRecord {
  id: string;
  studentId: string;
  semester: number;
  amount: number;
  mode: string;
  reference: string;
  referenceNumber?: string;
  paidAt: string;
  status: 'success' | 'pending' | 'failed';
  description: string;
}

export interface FeeReceipt {
  id: string;
  paymentId: string;
  receiptNumber: string;
  verifyToken: string;
  collegeName: string;
  studentName: string;
  registerNumber: string;
  department: string;
  semester: number;
  amount: number;
  paidDate: string;
  paidAt?: string;
  paymentMode: string;
  paymentRef: string;
  referenceNumber?: string;
  description: string;
}

export interface FacultyOfficeHour {
  day: DayOfWeek;
  startTime: string; // "14:00"
  endTime: string; // "16:00"
  start?: string;
  end?: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  cabin: string;
  specializations: string[];
  bio: string;
  subjects: { id: string; code: string; name: string }[];
  officeHours: FacultyOfficeHour[];
}

export interface FeedbackForm {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  opensAt: string;
  closesAt: string;
  status: 'not_open' | 'pending' | 'submitted' | 'closed';
}

export interface FeedbackQuestion {
  id: string;
  category: string;
  text: string;
}

export interface FeedbackResponse {
  id: string;
  formId: string;
  answers?: Record<string, number>; // questionId -> 1..5
  ratings?: Record<string, number>;
  comment?: string;
  createdAt: string;
}

export interface FeedbackSubmission {
  id: string;
  studentId: string;
  formId: string;
  submittedAt: string;
}

export interface HelpdeskAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  url?: string;
}

export interface HelpdeskComment {
  id: string;
  ticketId: string;
  authorType: 'student' | 'support';
  authorName: string;
  message: string;
  createdAt: string;
}

export interface HelpdeskEvent {
  id: string;
  ticketId: string;
  eventType: 'created' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'reopened';
  description: string;
  timestamp: string;
}

export interface HelpdeskTicket {
  id: string;
  ticketNumber: string;
  studentId: string;
  category: 'Wi-Fi / Network' | 'Hostel Maintenance' | 'Academic / Administrative' | 'Library' | 'Transport' | 'Other';
  priority: 'Low' | 'Medium' | 'High';
  title: string;
  description: string;
  location: string;
  status: 'Open' | 'Assigned' | 'In progress' | 'Resolved' | 'Closed';
  assignedDepartment: string;
  attachments: HelpdeskAttachment[];
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CONFIGURABLE COLLEGE ASSESSMENT & ATTENDANCE FORMULAS
// ============================================================================

/**
 * College Internal Assessment Scheme:
 * Internal 1: max 25
 * Internal 2: max 25
 * Assignment / Quiz: max 10
 * Formula: ((internal1 + internal2) / 50 * 40) + assignment = max 50.
 * Guarantee: result is strictly bounded within [0, 50].
 */
export function computeCollegeTotalInternal(
  internal1: number,
  internal2: number,
  assignment: number
): number {
  const i1 = Math.max(0, Math.min(25, internal1));
  const i2 = Math.max(0, Math.min(25, internal2));
  const asg = Math.max(0, Math.min(10, assignment));
  const scaledInternals = ((i1 + i2) / 50) * 40;
  const total = Number((scaledInternals + asg).toFixed(1));
  return Math.min(50, Math.max(0, total));
}

/**
 * Safe Skips Formula:
 * safe skips = floor(attended / (threshold / 100) - total)
 * Edge cases: total = 0 returns 0; bounded >= 0.
 */
export function calculateSafeSkips(
  attended: number,
  total: number,
  threshold = 75
): number {
  if (total <= 0) return 0;
  if (attended <= 0) return 0;
  const minRatio = threshold / 100;
  const skips = Math.floor(attended / minRatio - total);
  return Math.max(0, skips);
}

/**
 * Classes Needed to Recover Formula:
 * (attended + x) / (total + x) >= threshold / 100
 * <=> x >= ceil((threshold * total - 100 * attended) / (100 - threshold))
 * Edge cases: total = 0 or already >= threshold returns 0.
 */
export function calculateClassesToRecover(
  attended: number,
  total: number,
  threshold = 75
): number {
  if (total <= 0) return 0;
  if (attended / total >= threshold / 100) return 0;
  const needed = Math.ceil((threshold * total - 100 * attended) / (100 - threshold));
  return Math.max(0, needed);
}

// ============================================================================
// OFFICIAL SEEDED COLLEGE DATA (READ-ONLY)
// ============================================================================

export const COLLEGE_SUBJECTS: CollegeSubject[] = [
  { id: 'sub-cn', code: 'CS3604', name: 'Computer Networks', credits: 4, facultyName: 'Dr. Ramesh Kumar' },
  { id: 'sub-dsa', code: 'CS3601', name: 'Design & Analysis of Algorithms', credits: 4, facultyName: 'Prof. Ananya Sen' },
  { id: 'sub-os', code: 'CS3602', name: 'Operating Systems', credits: 4, facultyName: 'Dr. V. Srinivasan' },
  { id: 'sub-dbms', code: 'CS3603', name: 'Database Management Systems', credits: 3, facultyName: 'Dr. Meera Patel' },
  { id: 'sub-toc', code: 'CS3605', name: 'Theory of Computation', credits: 3, facultyName: 'Prof. K. Narayanan' },
  { id: 'sub-se', code: 'CS3606', name: 'Software Engineering & Agile', credits: 3, facultyName: 'Dr. Shalini Rao' },
];

export const COLLEGE_TIMETABLE: CollegeTimetableEntry[] = [
  {
    id: 'tt-1',
    dayOfWeek: 'Monday',
    subjectId: 'sub-dsa',
    subjectCode: 'CS3601',
    subjectName: 'Design & Analysis of Algorithms',
    startTime: '08:45',
    endTime: '09:40',
    room: 'LH-201',
    todayStatus: 'attended',
  },
  {
    id: 'tt-2',
    dayOfWeek: 'Monday',
    subjectId: 'sub-os',
    subjectCode: 'CS3602',
    subjectName: 'Operating Systems',
    startTime: '09:45',
    endTime: '10:40',
    room: 'LH-201',
    todayStatus: 'attended',
  },
  {
    id: 'tt-3',
    dayOfWeek: 'Monday',
    subjectId: 'sub-dbms',
    subjectCode: 'CS3603',
    subjectName: 'Database Management Systems',
    startTime: '11:30',
    endTime: '12:25',
    room: 'LH-104',
    todayStatus: 'not_yet_recorded',
  },
  {
    id: 'tt-4',
    dayOfWeek: 'Monday',
    subjectId: 'sub-cn',
    subjectCode: 'CS3604',
    subjectName: 'Computer Networks',
    startTime: '14:00',
    endTime: '14:55',
    room: 'LH-202',
    todayStatus: 'not_yet_recorded',
  },
];

export const COLLEGE_EXAMS: CollegeExam[] = [
  {
    id: 'ex-1',
    subjectId: 'sub-cn',
    subjectCode: 'CS3604',
    subjectName: 'Computer Networks',
    examDate: '2026-10-24',
    startTime: '09:30 AM',
    duration: '3 Hours',
    room: 'Hall A-102',
  },
  {
    id: 'ex-2',
    subjectId: 'sub-dsa',
    subjectCode: 'CS3601',
    subjectName: 'Design & Analysis of Algorithms',
    examDate: '2026-10-28',
    startTime: '09:30 AM',
    duration: '3 Hours',
    room: 'Hall B-204',
  },
  {
    id: 'ex-3',
    subjectId: 'sub-os',
    subjectCode: 'CS3602',
    subjectName: 'Operating Systems',
    examDate: '2026-11-02',
    startTime: '02:00 PM',
    duration: '3 Hours',
    room: 'Hall A-105',
  },
  {
    id: 'ex-4',
    subjectId: 'sub-dbms',
    subjectCode: 'CS3603',
    subjectName: 'Database Management Systems',
    examDate: '2026-11-06',
    startTime: '09:30 AM',
    duration: '3 Hours',
    room: 'Hall C-301',
  },
  {
    id: 'ex-5',
    subjectId: 'sub-toc',
    subjectCode: 'CS3605',
    subjectName: 'Theory of Computation',
    examDate: '2026-11-10',
    startTime: '09:30 AM',
    duration: '3 Hours',
    room: 'Hall B-101',
  },
  {
    id: 'ex-6',
    subjectId: 'sub-se',
    subjectCode: 'CS3606',
    subjectName: 'Software Engineering & Agile',
    examDate: '2026-11-14',
    startTime: '02:00 PM',
    duration: '3 Hours',
    room: 'Hall A-202',
  },
];

export const COLLEGE_SYLLABUS_UNITS: SyllabusUnit[] = [
  // Computer Networks (CS3604)
  { id: 'u-cn-1', subjectId: 'sub-cn', unitNo: 1, title: 'Network Fundamentals & Physical Layer', estHours: 4 },
  { id: 'u-cn-2', subjectId: 'sub-cn', unitNo: 2, title: 'Data Link Layer & Error Control', estHours: 5 },
  { id: 'u-cn-3', subjectId: 'sub-cn', unitNo: 3, title: 'Network Layer & Routing Protocols', estHours: 6 },
  { id: 'u-cn-4', subjectId: 'sub-cn', unitNo: 4, title: 'Transport Layer & TCP Congestion', estHours: 6 },
  { id: 'u-cn-5', subjectId: 'sub-cn', unitNo: 5, title: 'Application Layer & Network Security', estHours: 5 },

  // Algorithms (CS3601)
  { id: 'u-dsa-1', subjectId: 'sub-dsa', unitNo: 1, title: 'Asymptotic Analysis & Recurrences', estHours: 4 },
  { id: 'u-dsa-2', subjectId: 'sub-dsa', unitNo: 2, title: 'Divide & Conquer, Greedy Strategies', estHours: 5 },
  { id: 'u-dsa-3', subjectId: 'sub-dsa', unitNo: 3, title: 'Dynamic Programming & Memoization', estHours: 7 },
  { id: 'u-dsa-4', subjectId: 'sub-dsa', unitNo: 4, title: 'Graph Algorithms & Shortest Paths', estHours: 6 },
  { id: 'u-dsa-5', subjectId: 'sub-dsa', unitNo: 5, title: 'NP-Completeness & Approximation', estHours: 5 },

  // Operating Systems (CS3602)
  { id: 'u-os-1', subjectId: 'sub-os', unitNo: 1, title: 'Processes, Threads & CPU Scheduling', estHours: 5 },
  { id: 'u-os-2', subjectId: 'sub-os', unitNo: 2, title: 'Synchronization & Deadlocks', estHours: 6 },
  { id: 'u-os-3', subjectId: 'sub-os', unitNo: 3, title: 'Memory Management & Virtual Memory', estHours: 6 },
  { id: 'u-os-4', subjectId: 'sub-os', unitNo: 4, title: 'Storage Systems & File System Interface', estHours: 4 },

  // DBMS (CS3603)
  { id: 'u-dbms-1', subjectId: 'sub-dbms', unitNo: 1, title: 'Relational Model & Relational Algebra', estHours: 4 },
  { id: 'u-dbms-2', subjectId: 'sub-dbms', unitNo: 2, title: 'SQL & Schema Normalization (1NF-BCNF)', estHours: 6 },
  { id: 'u-dbms-3', subjectId: 'sub-dbms', unitNo: 3, title: 'Indexing, B+ Trees & Query Optimization', estHours: 5 },
  { id: 'u-dbms-4', subjectId: 'sub-dbms', unitNo: 4, title: 'Transactions, ACID Properties & Concurrency', estHours: 6 },

  // TOC (CS3605)
  { id: 'u-toc-1', subjectId: 'sub-toc', unitNo: 1, title: 'Finite Automata & Regular Expressions', estHours: 5 },
  { id: 'u-toc-2', subjectId: 'sub-toc', unitNo: 2, title: 'Context-Free Grammars & Pushdown Automata', estHours: 6 },
  { id: 'u-toc-3', subjectId: 'sub-toc', unitNo: 3, title: 'Turing Machines & Decidability', estHours: 6 },

  // Software Engineering (CS3606)
  { id: 'u-se-1', subjectId: 'sub-se', unitNo: 1, title: 'Agile Methodologies & Scrum Framework', estHours: 4 },
  { id: 'u-se-2', subjectId: 'sub-se', unitNo: 2, title: 'Requirement Engineering & UML Modeling', estHours: 5 },
  { id: 'u-se-3', subjectId: 'sub-se', unitNo: 3, title: 'Software Architecture & Design Patterns', estHours: 5 },
  { id: 'u-se-4', subjectId: 'sub-se', unitNo: 4, title: 'Software Testing, CI/CD & Quality Metrics', estHours: 5 },
];

export const INITIAL_STUDENT_UNIT_PROGRESS: Record<string, boolean> = {
  'u-cn-1': true,
  'u-cn-2': true,
  'u-cn-3': false,
  'u-cn-4': false,
  'u-cn-5': false,
  'u-dsa-1': true,
  'u-dsa-2': true,
  'u-dsa-3': true,
  'u-dsa-4': false,
  'u-dsa-5': false,
  'u-os-1': true,
  'u-os-2': true,
  'u-os-3': false,
  'u-os-4': false,
  'u-dbms-1': true,
  'u-dbms-2': true,
  'u-dbms-3': false,
  'u-dbms-4': false,
  'u-toc-1': true,
  'u-toc-2': false,
  'u-toc-3': false,
  'u-se-1': true,
  'u-se-2': true,
  'u-se-3': false,
  'u-se-4': false,
};

export const INITIAL_COLLEGE_MARKS: CollegeMarkRecord[] = [
  {
    subjectId: 'sub-cn',
    internal1: 19,
    internal2: 20,
    assignment: 8.5,
    totalInternal: computeCollegeTotalInternal(19, 20, 8.5), // 39.7 / 50
    maxInternal: 50,
    credits: 4,
    source: 'college',
  },
  {
    subjectId: 'sub-dsa',
    internal1: 24,
    internal2: 23,
    assignment: 9.5,
    totalInternal: computeCollegeTotalInternal(24, 23, 9.5), // 47.1 / 50
    maxInternal: 50,
    credits: 4,
    source: 'college',
  },
  {
    subjectId: 'sub-os',
    internal1: 22,
    internal2: 21,
    assignment: 9.0,
    totalInternal: computeCollegeTotalInternal(22, 21, 9.0), // 43.4 / 50
    maxInternal: 50,
    credits: 4,
    source: 'college',
  },
  {
    subjectId: 'sub-dbms',
    internal1: 21,
    internal2: 22,
    assignment: 8.5,
    totalInternal: computeCollegeTotalInternal(21, 22, 8.5), // 42.9 / 50
    maxInternal: 50,
    credits: 3,
    source: 'college',
  },
  {
    subjectId: 'sub-toc',
    internal1: 17,
    internal2: 18,
    assignment: 7.5,
    totalInternal: computeCollegeTotalInternal(17, 18, 7.5), // 35.5 / 50
    maxInternal: 50,
    credits: 3,
    source: 'college',
  },
  {
    subjectId: 'sub-se',
    internal1: 23,
    internal2: 24,
    assignment: 9.0,
    totalInternal: computeCollegeTotalInternal(23, 24, 9.0), // 46.6 / 50
    maxInternal: 50,
    credits: 3,
    source: 'college',
  },
];

// ============================================================================
// STUDY PLANNER ALGORITHM
// ============================================================================

export interface StudyPlanTask {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  unitId: string;
  unitNo: number;
  unitTitle: string;
  hours: number;
  isRevision?: boolean;
}

export interface DayStudyPlan {
  dayIndex: number;
  dayName: string;
  dateString: string;
  isToday: boolean;
  isRest: boolean;
  isRevision: boolean;
  totalHours: number;
  tasks: StudyPlanTask[];
}

export interface StudyPlanResult {
  days: DayStudyPlan[];
  atRiskSubjects: { code: string; name: string; uncoveredHours: number }[];
  isConstrained: boolean;
  totalAllocatedHours: number;
}

/**
 * Builds a day-by-day study schedule from today to upcoming exams:
 * 1. Collects remaining (uncovered) syllabus units.
 * 2. Prioritizes units: nearer exam, lower internal score, more remaining units.
 * 3. Enforces daily study-hours cap.
 * 4. Reserves 1-2 days before each exam for revision and past papers.
 * 5. Distinct units scheduled across days (no repeating identical block).
 */
export function buildStudyPlan(
  dailyHoursCap: number,
  studentProgress: Record<string, boolean>,
  currentDate = new Date()
): StudyPlanResult {
  const cap = Math.max(1, dailyHoursCap || 4);
  const exams = [...COLLEGE_EXAMS].sort(
    (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  );

  // Remaining units per subject
  const remainingUnits: (SyllabusUnit & { examDaysLeft: number; markScore: number })[] = [];
  const atRiskSubjects: { code: string; name: string; uncoveredHours: number }[] = [];

  COLLEGE_SUBJECTS.forEach((sub) => {
    const exam = exams.find((e) => e.subjectId === sub.id);
    const examDate = exam ? new Date(exam.examDate) : new Date(currentDate.getTime() + 30 * 86400000);
    const daysLeft = Math.max(1, Math.ceil((examDate.getTime() - currentDate.getTime()) / 86400000));
    const markRecord = INITIAL_COLLEGE_MARKS.find((m) => m.subjectId === sub.id);
    const markScore = markRecord ? markRecord.totalInternal : 40;

    const subUnits = COLLEGE_SYLLABUS_UNITS.filter((u) => u.subjectId === sub.id);
    let uncoveredHrs = 0;

    subUnits.forEach((u) => {
      if (!studentProgress[u.id]) {
        remainingUnits.push({
          ...u,
          examDaysLeft: daysLeft,
          markScore,
        });
        uncoveredHrs += u.estHours;
      }
    });

    if (uncoveredHrs > daysLeft * (cap / 2)) {
      atRiskSubjects.push({
        code: sub.code,
        name: sub.name,
        uncoveredHours: uncoveredHrs,
      });
    }
  });

  // Sort remaining units:
  // Primary: Nearest exam date (fewer days left)
  // Secondary: Lower internal mark (needs more help)
  // Tertiary: Lower unit number (sequential learning)
  remainingUnits.sort((a, b) => {
    if (a.examDaysLeft !== b.examDaysLeft) return a.examDaysLeft - b.examDaysLeft;
    if (a.markScore !== b.markScore) return a.markScore - b.markScore;
    return a.unitNo - b.unitNo;
  });

  // Schedule next 7 days
  const days: DayStudyPlan[] = [];
  const unitQueue = [...remainingUnits];
  let totalAllocatedHours = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(currentDate);
    d.setDate(currentDate.getDate() + i);
    const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `Day ${i + 1}`;

    // Check if an exam happens tomorrow or in 2 days -> reserve day for revision!
    const nearExam = exams.find((e) => {
      const eDate = new Date(e.examDate);
      const diff = Math.round((eDate.getTime() - d.getTime()) / 86400000);
      return diff === 1 || diff === 2;
    });

    const dayTasks: StudyPlanTask[] = [];
    let hoursLeft = cap;

    if (nearExam) {
      // Revision day for near exam
      const revHours = Math.min(hoursLeft, cap);
      dayTasks.push({
        subjectId: nearExam.subjectId,
        subjectCode: nearExam.subjectCode,
        subjectName: nearExam.subjectName,
        unitId: `rev-${nearExam.id}`,
        unitNo: 0,
        unitTitle: 'Final Syllabus Revision & PYQ Mock Drill',
        hours: revHours,
        isRevision: true,
      });
      hoursLeft -= revHours;
    } else {
      // Allocate units for this day
      while (hoursLeft >= 1 && unitQueue.length > 0) {
        const nextUnit = unitQueue.shift()!;
        const sub = COLLEGE_SUBJECTS.find((s) => s.id === nextUnit.subjectId)!;
        const taskHours = Math.min(nextUnit.estHours, hoursLeft);

        dayTasks.push({
          subjectId: nextUnit.subjectId,
          subjectCode: sub.code,
          subjectName: sub.name,
          unitId: nextUnit.id,
          unitNo: nextUnit.unitNo,
          unitTitle: `Unit ${nextUnit.unitNo}: ${nextUnit.title}`,
          hours: Number(taskHours.toFixed(1)),
        });

        hoursLeft -= taskHours;

        // If unit wasn't fully finished in today's quota, re-queue remaining hours for next days
        if (nextUnit.estHours - taskHours > 0.5) {
          unitQueue.unshift({
            ...nextUnit,
            estHours: nextUnit.estHours - taskHours,
          });
          break;
        }
      }
    }

    const dayHours = Number((cap - hoursLeft).toFixed(1));
    totalAllocatedHours += dayHours;

    days.push({
      dayIndex: i,
      dayName,
      dateString,
      isToday: i === 0,
      isRest: dayTasks.length === 0,
      isRevision: !!nearExam,
      totalHours: dayHours,
      tasks: dayTasks,
    });
  }

  return {
    days,
    atRiskSubjects,
    isConstrained: atRiskSubjects.length > 0,
    totalAllocatedHours: Number(totalAllocatedHours.toFixed(1)),
  };
}

// ============================================================================
// ACADEMIC HISTORY (READ-ONLY FROM COLLEGE RECORDS)
// ============================================================================

export const ALL_HISTORICAL_SEMESTERS: Record<number, PastSubjectRecord[]> = {
  1: [
    { code: 'MA1101', name: 'Linear Algebra & Calculus', credits: 4, grade: 'A+', gradePoints: 9 },
    { code: 'PH1101', name: 'Engineering Physics', credits: 3, grade: 'A', gradePoints: 8 },
    { code: 'CS1101', name: 'Problem Solving & Python Programming', credits: 4, grade: 'O', gradePoints: 10 },
    { code: 'GE1101', name: 'Engineering Graphics & CAD', credits: 3, grade: 'A', gradePoints: 8 },
    { code: 'CY1101', name: 'Engineering Chemistry', credits: 3, grade: 'B+', gradePoints: 7 },
    { code: 'CS1181', name: 'Python Programming Laboratory', credits: 2, grade: 'O', gradePoints: 10 },
  ],
  2: [
    { code: 'MA1201', name: 'Transforms & Partial Differential Equations', credits: 4, grade: 'A', gradePoints: 8 },
    { code: 'CS1201', name: 'Programming in C & Data Structures', credits: 4, grade: 'A+', gradePoints: 9 },
    { code: 'EE1201', name: 'Basic Electrical & Electronics Engineering', credits: 3, grade: 'B+', gradePoints: 7 },
    { code: 'CS1202', name: 'Digital Principles & System Design', credits: 3, grade: 'A', gradePoints: 8 },
    { code: 'EN1201', name: 'Technical English & Professional Communication', credits: 2, grade: 'A+', gradePoints: 9 },
    { code: 'CS1281', name: 'C Programming & Data Structures Lab', credits: 2, grade: 'O', gradePoints: 10 },
    { code: 'EE1281', name: 'Electrical & Electronics Engineering Lab', credits: 2, grade: 'A', gradePoints: 8 },
  ],
  3: [
    { code: 'MA2101', name: 'Discrete Mathematics & Graph Theory', credits: 4, grade: 'A', gradePoints: 8 },
    { code: 'CS2101', name: 'Object Oriented Programming (Java)', credits: 3, grade: 'O', gradePoints: 10 },
    { code: 'CS2102', name: 'Computer Architecture & Organization', credits: 4, grade: 'B+', gradePoints: 7 },
    { code: 'CS2103', name: 'Data Structures & Advanced Algorithms', credits: 4, grade: 'A+', gradePoints: 9 },
    { code: 'CS2104', name: 'Software Engineering Fundamentals', credits: 3, grade: 'A', gradePoints: 8 },
    { code: 'CS2181', name: 'Java & Object Technologies Laboratory', credits: 2, grade: 'O', gradePoints: 10 },
  ],
  4: [
    { code: 'MA2201', name: 'Probability, Statistics & Queuing Theory', credits: 4, grade: 'B+', gradePoints: 7 },
    { code: 'CS2201', name: 'Database Management Systems', credits: 4, grade: 'A+', gradePoints: 9 },
    { code: 'CS2202', name: 'Design & Analysis of Algorithms', credits: 4, grade: 'A', gradePoints: 8 },
    { code: 'CS2203', name: 'Operating Systems Principles', credits: 3, grade: 'B+', gradePoints: 7 },
    { code: 'CS2204', name: 'Environmental Science & Sustainability', credits: 2, grade: 'A', gradePoints: 8 },
    { code: 'CS2281', name: 'DBMS & Algorithm Design Lab', credits: 2, grade: 'A+', gradePoints: 9 },
  ],
  5: [
    { code: 'CS3101', name: 'Theory of Computation & Automata', credits: 4, grade: 'A', gradePoints: 8 },
    { code: 'CS3102', name: 'Computer Networks & Internet Protocols', credits: 4, grade: 'A+', gradePoints: 9 },
    { code: 'CS3103', name: 'Microprocessors & Embedded Interfacing', credits: 3, grade: 'B+', gradePoints: 7 },
    { code: 'CS3104', name: 'Web Technologies & Full-Stack Development', credits: 3, grade: 'O', gradePoints: 10 },
    { code: 'CS3105', name: 'Professional Ethics in Engineering', credits: 2, grade: 'A+', gradePoints: 9 },
    { code: 'CS3181', name: 'Computer Networks & Web Applications Lab', credits: 2, grade: 'O', gradePoints: 10 },
    { code: 'CS3182', name: 'Mini Project & Technical Seminar', credits: 2, grade: 'A+', gradePoints: 9 },
  ],
};

function generateFallbackSemesterSubjects(sem: number): PastSubjectRecord[] {
  return [
    { code: `CS${sem}01`, name: `Core Advanced Elective I (Sem ${sem})`, credits: 4, grade: 'A', gradePoints: 8 },
    { code: `CS${sem}02`, name: `Professional Elective II (Sem ${sem})`, credits: 4, grade: 'A+', gradePoints: 9 },
    { code: `CS${sem}03`, name: `Open Elective Domain (Sem ${sem})`, credits: 3, grade: 'B+', gradePoints: 7 },
    { code: `CS${sem}04`, name: `Emerging Technologies Specialization`, credits: 3, grade: 'O', gradePoints: 10 },
    { code: `CS${sem}81`, name: `Specialized Domain Laboratory`, credits: 2, grade: 'A+', gradePoints: 9 },
  ];
}

/**
 * Generic academic history seed generator:
 * For a student in semester `currentSemester`, returns complete history for all completed
 * earlier semesters (1 to currentSemester - 1).
 */
export function getAcademicHistoryForStudent(
  currentSemester: number,
  config: AcademicHistoryConfig = { arrearsCountedInCredits: true }
): PastSemesterRecord[] {
  if (currentSemester <= 1) return [];

  const maxCompleted = currentSemester - 1;
  const history: PastSemesterRecord[] = [];

  let accumulatedGradePoints = 0;
  let accumulatedCredits = 0;

  for (let sem = 1; sem <= maxCompleted; sem++) {
    const semSubjects = ALL_HISTORICAL_SEMESTERS[sem] || generateFallbackSemesterSubjects(sem);

    let semPoints = 0;
    let semCredits = 0;

    semSubjects.forEach((sub) => {
      const isFailed = Boolean(sub.isArrear || sub.grade === 'RA' || sub.grade === 'F' || sub.grade === 'U');
      const countsInCredits = !isFailed || config.arrearsCountedInCredits;
      if (countsInCredits) {
        semCredits += sub.credits;
      }
      semPoints += sub.credits * sub.gradePoints;
    });

    const sgpa = semCredits > 0 ? Number((semPoints / semCredits).toFixed(2)) : 0;

    accumulatedGradePoints += semPoints;
    accumulatedCredits += semCredits;

    const cumulativeCgpa =
      accumulatedCredits > 0
        ? Number((accumulatedGradePoints / accumulatedCredits).toFixed(2))
        : 0;

    const term = sem % 2 === 1 ? `Fall Semester (Odd)` : `Spring Semester (Even)`;

    history.push({
      semester: sem,
      term,
      sgpa,
      cumulativeCgpa,
      totalCredits: semCredits,
      subjects: semSubjects.map((s) => ({
        ...s,
        isArrear: Boolean(s.isArrear || s.grade === 'RA' || s.grade === 'F' || s.grade === 'U'),
      })),
    });
  }

  return history;
}

/**
 * Calculates cumulative CGPA across all completed semesters:
 * CGPA = total grade points across all completed semesters / total credits
 */
export function calculateCumulativeCgpa(
  history: PastSemesterRecord[],
  config: AcademicHistoryConfig = { arrearsCountedInCredits: true }
): number {
  if (!history || history.length === 0) return 0;
  let totalPoints = 0;
  let totalCredits = 0;

  history.forEach((sem) => {
    sem.subjects.forEach((sub) => {
      const isFailed = Boolean(sub.isArrear || sub.grade === 'RA' || sub.grade === 'F' || sub.grade === 'U');
      const countsInCredits = !isFailed || config.arrearsCountedInCredits;
      if (countsInCredits) {
        totalCredits += sub.credits;
      }
      totalPoints += sub.credits * sub.gradePoints;
    });
  });

  return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
}

// ============================================================================
// TIMETABLE PERIODS & SEED SLOTS (MON - SAT)
// ============================================================================

export interface TimetablePeriod {
  period: number;
  label: string;
  startTime: string;
  endTime: string;
}

export const COLLEGE_TIMETABLE_PERIODS: TimetablePeriod[] = [
  { period: 1, label: 'Period 1', startTime: '08:45', endTime: '09:40' },
  { period: 2, label: 'Period 2', startTime: '09:45', endTime: '10:40' },
  { period: 3, label: 'Period 3', startTime: '10:55', endTime: '11:50' },
  { period: 4, label: 'Period 4', startTime: '11:55', endTime: '12:50' },
  { period: 5, label: 'Period 5', startTime: '13:45', endTime: '14:40' },
  { period: 6, label: 'Period 6', startTime: '14:45', endTime: '15:40' },
  { period: 7, label: 'Period 7', startTime: '15:45', endTime: '16:40' },
];

export const COLLEGE_TIMETABLE_SLOTS: TimetableSlot[] = [
  // MONDAY
  {
    id: 'slot-mon-1',
    day: 'Monday',
    period: 1,
    startTime: '08:45',
    endTime: '09:40',
    subjectId: 'sub-dsa',
    subjectCode: 'CS3601',
    subjectName: 'Design & Analysis of Algorithms',
    room: 'LH-201',
    facultyId: 'fac-ananya',
    facultyName: 'Prof. Ananya Sen',
    slotType: 'lecture',
    colorKey: 'sub-dsa',
  },
  {
    id: 'slot-mon-2',
    day: 'Monday',
    period: 2,
    startTime: '09:45',
    endTime: '10:40',
    subjectId: 'sub-os',
    subjectCode: 'CS3602',
    subjectName: 'Operating Systems',
    room: 'LH-201',
    facultyId: 'fac-srinivasan',
    facultyName: 'Dr. V. Srinivasan',
    slotType: 'lecture',
    colorKey: 'sub-os',
  },
  {
    id: 'slot-mon-3',
    day: 'Monday',
    period: 3,
    startTime: '10:55',
    endTime: '11:50',
    subjectId: 'sub-dbms',
    subjectCode: 'CS3603',
    subjectName: 'Database Management Systems',
    room: 'LH-104',
    facultyId: 'fac-meera',
    facultyName: 'Dr. Meera Patel',
    slotType: 'lecture',
    colorKey: 'sub-dbms',
  },
  {
    id: 'slot-mon-4',
    day: 'Monday',
    period: 4,
    startTime: '11:55',
    endTime: '12:50',
    subjectId: 'sub-cn',
    subjectCode: 'CS3604',
    subjectName: 'Computer Networks',
    room: 'LH-202',
    facultyId: 'fac-ramesh',
    facultyName: 'Dr. Ramesh Kumar',
    slotType: 'lecture',
    colorKey: 'sub-cn',
  },
  // Monday Period 5: Free (55 min)
  {
    id: 'slot-mon-6',
    day: 'Monday',
    period: 6,
    startTime: '14:45',
    endTime: '15:40',
    subjectId: 'sub-toc',
    subjectCode: 'CS3605',
    subjectName: 'Theory of Computation',
    room: 'LH-102',
    facultyId: 'fac-narayanan',
    facultyName: 'Prof. K. Narayanan',
    slotType: 'lecture',
    colorKey: 'sub-toc',
  },
  {
    id: 'slot-mon-7',
    day: 'Monday',
    period: 7,
    startTime: '15:45',
    endTime: '16:40',
    subjectId: 'sub-se',
    subjectCode: 'CS3606',
    subjectName: 'Software Engineering & Agile',
    room: 'LH-203',
    facultyId: 'fac-shalini',
    facultyName: 'Dr. Shalini Rao',
    slotType: 'lecture',
    colorKey: 'sub-se',
  },

  // TUESDAY
  {
    id: 'slot-tue-1',
    day: 'Tuesday',
    period: 1,
    startTime: '08:45',
    endTime: '09:40',
    subjectId: 'sub-cn',
    subjectCode: 'CS3604',
    subjectName: 'Computer Networks',
    room: 'LH-202',
    facultyId: 'fac-ramesh',
    facultyName: 'Dr. Ramesh Kumar',
    slotType: 'lecture',
    colorKey: 'sub-cn',
  },
  {
    id: 'slot-tue-2',
    day: 'Tuesday',
    period: 2,
    startTime: '09:45',
    endTime: '10:40',
    subjectId: 'sub-dsa',
    subjectCode: 'CS3601',
    subjectName: 'Design & Analysis of Algorithms',
    room: 'LH-201',
    facultyId: 'fac-ananya',
    facultyName: 'Prof. Ananya Sen',
    slotType: 'lecture',
    colorKey: 'sub-dsa',
  },
  {
    id: 'slot-tue-3',
    day: 'Tuesday',
    period: 3,
    startTime: '10:55',
    endTime: '11:50',
    subjectId: 'sub-os',
    subjectCode: 'CS3602',
    subjectName: 'Operating Systems',
    room: 'LH-201',
    facultyId: 'fac-srinivasan',
    facultyName: 'Dr. V. Srinivasan',
    slotType: 'lecture',
    colorKey: 'sub-os',
  },
  // Tuesday Period 4: Free (55 min)
  {
    id: 'slot-tue-5',
    day: 'Tuesday',
    period: 5,
    startTime: '13:45',
    endTime: '14:40',
    subjectId: 'sub-dbms',
    subjectCode: 'CS3603',
    subjectName: 'Database Management Systems Lab',
    room: 'Lab 2 (DBMS Center)',
    facultyId: 'fac-meera',
    facultyName: 'Dr. Meera Patel',
    slotType: 'lab',
    colorKey: 'sub-dbms',
  },
  {
    id: 'slot-tue-6',
    day: 'Tuesday',
    period: 6,
    startTime: '14:45',
    endTime: '15:40',
    subjectId: 'sub-dbms',
    subjectCode: 'CS3603',
    subjectName: 'Database Management Systems Lab',
    room: 'Lab 2 (DBMS Center)',
    facultyId: 'fac-meera',
    facultyName: 'Dr. Meera Patel',
    slotType: 'lab',
    colorKey: 'sub-dbms',
  },
  {
    id: 'slot-tue-7',
    day: 'Tuesday',
    period: 7,
    startTime: '15:45',
    endTime: '16:40',
    subjectId: 'sub-toc',
    subjectCode: 'CS3605',
    subjectName: 'Theory of Computation Tutorial',
    room: 'LH-102',
    facultyId: 'fac-narayanan',
    facultyName: 'Prof. K. Narayanan',
    slotType: 'tutorial',
    colorKey: 'sub-toc',
  },

  // WEDNESDAY
  {
    id: 'slot-wed-1',
    day: 'Wednesday',
    period: 1,
    startTime: '08:45',
    endTime: '09:40',
    subjectId: 'sub-se',
    subjectCode: 'CS3606',
    subjectName: 'Software Engineering & Agile',
    room: 'LH-203',
    facultyId: 'fac-shalini',
    facultyName: 'Dr. Shalini Rao',
    slotType: 'lecture',
    colorKey: 'sub-se',
  },
  {
    id: 'slot-wed-2',
    day: 'Wednesday',
    period: 2,
    startTime: '09:45',
    endTime: '10:40',
    subjectId: 'sub-os',
    subjectCode: 'CS3602',
    subjectName: 'Operating Systems',
    room: 'LH-201',
    facultyId: 'fac-srinivasan',
    facultyName: 'Dr. V. Srinivasan',
    slotType: 'lecture',
    colorKey: 'sub-os',
  },
  {
    id: 'slot-wed-3',
    day: 'Wednesday',
    period: 3,
    startTime: '10:55',
    endTime: '11:50',
    subjectId: 'sub-dsa',
    subjectCode: 'CS3601',
    subjectName: 'Design & Analysis of Algorithms',
    room: 'LH-201',
    facultyId: 'fac-ananya',
    facultyName: 'Prof. Ananya Sen',
    slotType: 'lecture',
    colorKey: 'sub-dsa',
  },
  {
    id: 'slot-wed-4',
    day: 'Wednesday',
    period: 4,
    startTime: '11:55',
    endTime: '12:50',
    subjectId: 'sub-toc',
    subjectCode: 'CS3605',
    subjectName: 'Theory of Computation',
    room: 'LH-102',
    facultyId: 'fac-narayanan',
    facultyName: 'Prof. K. Narayanan',
    slotType: 'lecture',
    colorKey: 'sub-toc',
  },
  {
    id: 'slot-wed-5',
    day: 'Wednesday',
    period: 5,
    startTime: '13:45',
    endTime: '14:40',
    subjectId: 'sub-cn',
    subjectCode: 'CS3604',
    subjectName: 'Computer Networks Lab',
    room: 'Lab 1 (Networking Hub)',
    facultyId: 'fac-ramesh',
    facultyName: 'Dr. Ramesh Kumar',
    slotType: 'lab',
    colorKey: 'sub-cn',
  },
  {
    id: 'slot-wed-6',
    day: 'Wednesday',
    period: 6,
    startTime: '14:45',
    endTime: '15:40',
    subjectId: 'sub-cn',
    subjectCode: 'CS3604',
    subjectName: 'Computer Networks Lab',
    room: 'Lab 1 (Networking Hub)',
    facultyId: 'fac-ramesh',
    facultyName: 'Dr. Ramesh Kumar',
    slotType: 'lab',
    colorKey: 'sub-cn',
  },
  // Wednesday Period 7: Free (55 min)

  // THURSDAY
  {
    id: 'slot-thu-1',
    day: 'Thursday',
    period: 1,
    startTime: '08:45',
    endTime: '09:40',
    subjectId: 'sub-dbms',
    subjectCode: 'CS3603',
    subjectName: 'Database Management Systems',
    room: 'LH-104',
    facultyId: 'fac-meera',
    facultyName: 'Dr. Meera Patel',
    slotType: 'lecture',
    colorKey: 'sub-dbms',
  },
  {
    id: 'slot-thu-2',
    day: 'Thursday',
    period: 2,
    startTime: '09:45',
    endTime: '10:40',
    subjectId: 'sub-cn',
    subjectCode: 'CS3604',
    subjectName: 'Computer Networks',
    room: 'LH-202',
    facultyId: 'fac-ramesh',
    facultyName: 'Dr. Ramesh Kumar',
    slotType: 'lecture',
    colorKey: 'sub-cn',
  },
  {
    id: 'slot-thu-3',
    day: 'Thursday',
    period: 3,
    startTime: '10:55',
    endTime: '11:50',
    subjectId: 'sub-se',
    subjectCode: 'CS3606',
    subjectName: 'Software Engineering & Agile',
    room: 'LH-203',
    facultyId: 'fac-shalini',
    facultyName: 'Dr. Shalini Rao',
    slotType: 'lecture',
    colorKey: 'sub-se',
  },
  {
    id: 'slot-thu-4',
    day: 'Thursday',
    period: 4,
    startTime: '11:55',
    endTime: '12:50',
    subjectId: 'sub-dsa',
    subjectCode: 'CS3601',
    subjectName: 'Algorithms Lab',
    room: 'Lab 4 (Systems)',
    facultyId: 'fac-ananya',
    facultyName: 'Prof. Ananya Sen',
    slotType: 'lab',
    colorKey: 'sub-dsa',
  },
  {
    id: 'slot-thu-5',
    day: 'Thursday',
    period: 5,
    startTime: '13:45',
    endTime: '14:40',
    subjectId: 'sub-dsa',
    subjectCode: 'CS3601',
    subjectName: 'Algorithms Lab',
    room: 'Lab 4 (Systems)',
    facultyId: 'fac-ananya',
    facultyName: 'Prof. Ananya Sen',
    slotType: 'lab',
    colorKey: 'sub-dsa',
  },
  // Thursday Period 6: Free (55 min)
  {
    id: 'slot-thu-7',
    day: 'Thursday',
    period: 7,
    startTime: '15:45',
    endTime: '16:40',
    subjectId: 'sub-os',
    subjectCode: 'CS3602',
    subjectName: 'Operating Systems Tutorial',
    room: 'LH-201',
    facultyId: 'fac-srinivasan',
    facultyName: 'Dr. V. Srinivasan',
    slotType: 'tutorial',
    colorKey: 'sub-os',
  },

  // FRIDAY
  {
    id: 'slot-fri-1',
    day: 'Friday',
    period: 1,
    startTime: '08:45',
    endTime: '09:40',
    subjectId: 'sub-os',
    subjectCode: 'CS3602',
    subjectName: 'Operating Systems',
    room: 'LH-201',
    facultyId: 'fac-srinivasan',
    facultyName: 'Dr. V. Srinivasan',
    slotType: 'lecture',
    colorKey: 'sub-os',
  },
  {
    id: 'slot-fri-2',
    day: 'Friday',
    period: 2,
    startTime: '09:45',
    endTime: '10:40',
    subjectId: 'sub-toc',
    subjectCode: 'CS3605',
    subjectName: 'Theory of Computation',
    room: 'LH-102',
    facultyId: 'fac-narayanan',
    facultyName: 'Prof. K. Narayanan',
    slotType: 'lecture',
    colorKey: 'sub-toc',
  },
  {
    id: 'slot-fri-3',
    day: 'Friday',
    period: 3,
    startTime: '10:55',
    endTime: '11:50',
    subjectId: 'sub-dbms',
    subjectCode: 'CS3603',
    subjectName: 'Database Management Systems',
    room: 'LH-104',
    facultyId: 'fac-meera',
    facultyName: 'Dr. Meera Patel',
    slotType: 'lecture',
    colorKey: 'sub-dbms',
  },
  {
    id: 'slot-fri-4',
    day: 'Friday',
    period: 4,
    startTime: '11:55',
    endTime: '12:50',
    subjectId: 'sub-se',
    subjectCode: 'CS3606',
    subjectName: 'Software Engineering Project Studio',
    room: 'Studio A-201',
    facultyId: 'fac-shalini',
    facultyName: 'Dr. Shalini Rao',
    slotType: 'lab',
    colorKey: 'sub-se',
  },
  // Friday Period 5: Free (55 min)
  {
    id: 'slot-fri-6',
    day: 'Friday',
    period: 6,
    startTime: '14:45',
    endTime: '15:40',
    subjectId: 'sub-cn',
    subjectCode: 'CS3604',
    subjectName: 'Computer Networks Seminar',
    room: 'LH-202',
    facultyId: 'fac-ramesh',
    facultyName: 'Dr. Ramesh Kumar',
    slotType: 'tutorial',
    colorKey: 'sub-cn',
  },
  // Friday Period 7: Free (55 min)

  // SATURDAY (Short Day / Research & Electives)
  {
    id: 'slot-sat-1',
    day: 'Saturday',
    period: 1,
    startTime: '08:45',
    endTime: '09:40',
    subjectId: 'sub-dsa',
    subjectCode: 'CS3601',
    subjectName: 'Advanced Competitive Coding',
    room: 'LH-201',
    facultyId: 'fac-ananya',
    facultyName: 'Prof. Ananya Sen',
    slotType: 'lecture',
    colorKey: 'sub-dsa',
  },
  {
    id: 'slot-sat-2',
    day: 'Saturday',
    period: 2,
    startTime: '09:45',
    endTime: '10:40',
    subjectId: 'sub-toc',
    subjectCode: 'CS3605',
    subjectName: 'Formal Methods Problem Solving',
    room: 'LH-102',
    facultyId: 'fac-narayanan',
    facultyName: 'Prof. K. Narayanan',
    slotType: 'tutorial',
    colorKey: 'sub-toc',
  },
  {
    id: 'slot-sat-3',
    day: 'Saturday',
    period: 3,
    startTime: '10:55',
    endTime: '11:50',
    subjectId: 'sub-os',
    subjectCode: 'CS3602',
    subjectName: 'Kernel Programming Workshop',
    room: 'Lab 4 (Systems)',
    facultyId: 'fac-srinivasan',
    facultyName: 'Dr. V. Srinivasan',
    slotType: 'lab',
    colorKey: 'sub-os',
  },
  // Saturday Periods 4, 5, 6, 7: Free (Library / Self-Study)
];

export const COLLEGE_CLASS_CHANGES: ClassChange[] = [
  {
    id: 'cc-1',
    slotId: 'slot-mon-4',
    date: '2026-10-12',
    type: 'room_changed',
    newRoom: 'Lab 3 (Advanced Systems)',
    note: 'Special networking packet analysis drill moved to Lab 3',
  },
  {
    id: 'cc-2',
    slotId: 'slot-wed-2',
    date: '2026-10-14',
    type: 'rescheduled',
    newTime: '15:45 - 16:40',
    note: 'Shifted to Period 7 due to department faculty council meeting',
  },
  {
    id: 'cc-3',
    slotId: 'slot-sat-3',
    date: '2026-10-17',
    type: 'cancelled',
    note: 'Faculty attending National Research Symposium; makeup class to follow',
  },
];

// ============================================================================
// FEES & RECEIPTS SEED DATA (READ-ONLY)
// ============================================================================

export const COLLEGE_FEE_STRUCTURES: FeeStructureItem[] = [
  // Semester 6 (Current)
  { id: 'fs-6-1', semester: 6, component: 'Tuition Fee (Theory & Practical)', amount: 48000 },
  { id: 'fs-6-2', semester: 6, component: 'Specialized Laboratory & Computing Facility', amount: 12000 },
  { id: 'fs-6-3', semester: 6, component: 'Hostel Accommodation & Campus Dining', amount: 22000 },
  { id: 'fs-6-4', semester: 6, component: 'University Examination & Assessment Fee', amount: 4500 },
  { id: 'fs-6-5', semester: 6, component: 'Campus Wi-Fi, Library & Digital Subscriptions', amount: 3500 },

  // Earlier Semesters (1 to 5)
  { id: 'fs-5-1', semester: 5, component: 'Semester 5 Consolidated Academic Fee', amount: 85000 },
  { id: 'fs-4-1', semester: 4, component: 'Semester 4 Consolidated Academic Fee', amount: 82000 },
  { id: 'fs-3-1', semester: 3, component: 'Semester 3 Consolidated Academic Fee', amount: 82000 },
  { id: 'fs-2-1', semester: 2, component: 'Semester 2 Consolidated Academic Fee', amount: 78000 },
  { id: 'fs-1-1', semester: 1, component: 'Semester 1 Admission & Academic Fee', amount: 80000 },
];

export const COLLEGE_FEE_PAYMENTS: FeePaymentRecord[] = [
  // Semester 6 Payments (Partial Paid - triggers Due Soon status!)
  {
    id: 'pay-6-1',
    studentId: 'usr-demo-student',
    semester: 6,
    amount: 60000,
    mode: 'Campus Portal Gateway',
    reference: 'COLPAY-2026-0810-7712',
    paidAt: '2026-08-10T11:30:00Z',
    status: 'success',
    description: 'Semester 6 First Installment (Tuition & Laboratory)',
  },

  // Past Semesters Fully Paid
  {
    id: 'pay-5-1',
    studentId: 'usr-demo-student',
    semester: 5,
    amount: 85000,
    mode: 'Online NetBanking',
    reference: 'NETBANK-2026-0112-9901',
    paidAt: '2026-01-12T14:15:00Z',
    status: 'success',
    description: 'Semester 5 Full Academic & Hostel Fee',
  },
  {
    id: 'pay-4-1',
    studentId: 'usr-demo-student',
    semester: 4,
    amount: 82000,
    mode: 'UPI Transfer',
    reference: 'UPI-2025-0728-4432',
    paidAt: '2025-07-28T09:40:00Z',
    status: 'success',
    description: 'Semester 4 Full Academic Fee',
  },
  {
    id: 'pay-3-1',
    studentId: 'usr-demo-student',
    semester: 3,
    amount: 82000,
    mode: 'Demand Draft',
    reference: 'DD-SBI-2025-0108-1209',
    paidAt: '2025-01-08T16:00:00Z',
    status: 'success',
    description: 'Semester 3 Full Academic Fee',
  },
  {
    id: 'pay-2-1',
    studentId: 'usr-demo-student',
    semester: 2,
    amount: 78000,
    mode: 'Online NetBanking',
    reference: 'NETBANK-2024-0715-3381',
    paidAt: '2024-07-15T12:00:00Z',
    status: 'success',
    description: 'Semester 2 Full Academic Fee',
  },
  {
    id: 'pay-1-1',
    studentId: 'usr-demo-student',
    semester: 1,
    amount: 80000,
    mode: 'Online NetBanking',
    reference: 'NETBANK-2024-0105-0012',
    paidAt: '2024-01-05T10:30:00Z',
    status: 'success',
    description: 'Semester 1 Admission & Tuition Fee',
  },
];

export const COLLEGE_FEE_RECEIPTS: FeeReceipt[] = [
  {
    id: 'rcpt-6-1',
    paymentId: 'pay-6-1',
    receiptNumber: 'REC-2026-S6-001',
    verifyToken: 'cc_receipt_S6_88412_sig',
    collegeName: 'Apex Institute of Engineering & Technology (Autonomous)',
    studentName: 'Aarav Sharma',
    registerNumber: '2023CS0142',
    department: 'Computer Science & Engineering',
    semester: 6,
    amount: 60000,
    paidDate: '10 Aug 2026',
    paymentMode: 'Campus Portal Gateway',
    paymentRef: 'COLPAY-2026-0810-7712',
    description: 'Semester 6 First Installment (Tuition & Laboratory)',
  },
  {
    id: 'rcpt-5-1',
    paymentId: 'pay-5-1',
    receiptNumber: 'REC-2026-S5-042',
    verifyToken: 'cc_receipt_S5_77109_sig',
    collegeName: 'Apex Institute of Engineering & Technology (Autonomous)',
    studentName: 'Aarav Sharma',
    registerNumber: '2023CS0142',
    department: 'Computer Science & Engineering',
    semester: 5,
    amount: 85000,
    paidDate: '12 Jan 2026',
    paymentMode: 'Online NetBanking',
    paymentRef: 'NETBANK-2026-0112-9901',
    description: 'Semester 5 Full Academic & Hostel Fee',
  },
  {
    id: 'rcpt-4-1',
    paymentId: 'pay-4-1',
    receiptNumber: 'REC-2025-S4-188',
    verifyToken: 'cc_receipt_S4_66542_sig',
    collegeName: 'Apex Institute of Engineering & Technology (Autonomous)',
    studentName: 'Aarav Sharma',
    registerNumber: '2023CS0142',
    department: 'Computer Science & Engineering',
    semester: 4,
    amount: 82000,
    paidDate: '28 Jul 2025',
    paymentMode: 'UPI Transfer',
    paymentRef: 'UPI-2025-0728-4432',
    description: 'Semester 4 Full Academic Fee',
  },
  {
    id: 'rcpt-3-1',
    paymentId: 'pay-3-1',
    receiptNumber: 'REC-2025-S3-091',
    verifyToken: 'cc_receipt_S3_55219_sig',
    collegeName: 'Apex Institute of Engineering & Technology (Autonomous)',
    studentName: 'Aarav Sharma',
    registerNumber: '2023CS0142',
    department: 'Computer Science & Engineering',
    semester: 3,
    amount: 82000,
    paidDate: '08 Jan 2025',
    paymentMode: 'Demand Draft',
    paymentRef: 'DD-SBI-2025-0108-1209',
    description: 'Semester 3 Full Academic Fee',
  },
  {
    id: 'rcpt-2-1',
    paymentId: 'pay-2-1',
    receiptNumber: 'REC-2024-S2-212',
    verifyToken: 'cc_receipt_S2_44102_sig',
    collegeName: 'Apex Institute of Engineering & Technology (Autonomous)',
    studentName: 'Aarav Sharma',
    registerNumber: '2023CS0142',
    department: 'Computer Science & Engineering',
    semester: 2,
    amount: 78000,
    paidDate: '15 Jul 2024',
    paymentMode: 'Online NetBanking',
    paymentRef: 'NETBANK-2024-0715-3381',
    description: 'Semester 2 Full Academic Fee',
  },
  {
    id: 'rcpt-1-1',
    paymentId: 'pay-1-1',
    receiptNumber: 'REC-2024-S1-008',
    verifyToken: 'cc_receipt_S1_33091_sig',
    collegeName: 'Apex Institute of Engineering & Technology (Autonomous)',
    studentName: 'Aarav Sharma',
    registerNumber: '2023CS0142',
    department: 'Computer Science & Engineering',
    semester: 1,
    amount: 80000,
    paidDate: '05 Jan 2024',
    paymentMode: 'Online NetBanking',
    paymentRef: 'NETBANK-2024-0105-0012',
    description: 'Semester 1 Admission & Tuition Fee',
  },
];

// Configurable College Online Payment Portal URL
export const COLLEGE_PAYMENT_PORTAL_URL = 'https://portal.apex-institute.edu/fees/online-gateway';

// Semester 6 Fee Due Date (Today + 5 days -> triggers Due Soon chip & notification)
export const SEMESTER_6_FEE_DUE_DATE = '2026-10-15';

// ============================================================================
// FACULTY DIRECTORY SEED DATA (READ-ONLY)
// ============================================================================

export const COLLEGE_FACULTY: FacultyMember[] = [
  {
    id: 'fac-ramesh',
    name: 'Dr. Ramesh Kumar',
    designation: 'Professor & Head of Department',
    department: 'Computer Science & Engineering',
    email: 'ramesh.kumar@apex-institute.edu',
    cabin: 'CS Block, Room 301 (HOD Office)',
    specializations: ['Computer Networks', 'Wireless Sensor Networks', 'Network Security'],
    bio: 'Ph.D. from IIT Madras. 18+ years of academic research in software-defined networking and distributed protocols.',
    subjects: [
      { id: 'sub-cn', code: 'CS3604', name: 'Computer Networks' },
      { id: 'sub-cn-lab', code: 'CS3681', name: 'Computer Networks Laboratory' },
    ],
    officeHours: [
      { day: 'Monday', startTime: '14:00', endTime: '16:00' },
      { day: 'Wednesday', startTime: '15:00', endTime: '17:00' },
      { day: 'Friday', startTime: '11:00', endTime: '13:00' },
    ],
  },
  {
    id: 'fac-ananya',
    name: 'Prof. Ananya Sen',
    designation: 'Associate Professor',
    department: 'Computer Science & Engineering',
    email: 'ananya.sen@apex-institute.edu',
    cabin: 'CS Block, Room 208',
    specializations: ['Design & Analysis of Algorithms', 'Computational Complexity', 'Graph Algorithms'],
    bio: 'M.Tech from IISc Bangalore. Coach for ACM ICPC regional finalists with active industry consulting in algorithmic optimization.',
    subjects: [
      { id: 'sub-dsa', code: 'CS3601', name: 'Design & Analysis of Algorithms' },
      { id: 'sub-algo-lab', code: 'CS3682', name: 'Algorithms Studio' },
    ],
    officeHours: [
      { day: 'Tuesday', startTime: '11:00', endTime: '13:00' },
      { day: 'Thursday', startTime: '14:00', endTime: '16:00' },
      { day: 'Saturday', startTime: '10:00', endTime: '12:00' },
    ],
  },
  {
    id: 'fac-srinivasan',
    name: 'Dr. V. Srinivasan',
    designation: 'Professor',
    department: 'Computer Science & Engineering',
    email: 'v.srinivasan@apex-institute.edu',
    cabin: 'CS Block, Room 314',
    specializations: ['Operating Systems', 'Kernel Architecture', 'Distributed Systems'],
    bio: '22+ years in academia. Former system architect at Sun Microsystems. Lead researcher in high-performance virtual memory management.',
    subjects: [
      { id: 'sub-os', code: 'CS3602', name: 'Operating Systems' },
      { id: 'sub-os-lab', code: 'CS3683', name: 'Operating Systems Kernel Lab' },
    ],
    officeHours: [
      { day: 'Monday', startTime: '11:00', endTime: '13:00' },
      { day: 'Wednesday', startTime: '14:00', endTime: '16:00' },
      { day: 'Thursday', startTime: '16:00', endTime: '17:30' },
    ],
  },
  {
    id: 'fac-meera',
    name: 'Dr. Meera Patel',
    designation: 'Associate Professor',
    department: 'Computer Science & Engineering',
    email: 'meera.patel@apex-institute.edu',
    cabin: 'CS Block, Room 212',
    specializations: ['Database Management Systems', 'Big Data Engineering', 'NoSQL Architectures'],
    bio: 'Ph.D. in Data Engineering. Author of 24 international IEEE journal papers on distributed query optimization and B-Tree indexing.',
    subjects: [
      { id: 'sub-dbms', code: 'CS3603', name: 'Database Management Systems' },
      { id: 'sub-dbms-lab', code: 'CS3684', name: 'DBMS Implementation Lab' },
    ],
    officeHours: [
      { day: 'Monday', startTime: '15:00', endTime: '17:00' },
      { day: 'Tuesday', startTime: '14:00', endTime: '16:00' },
      { day: 'Friday', startTime: '09:00', endTime: '11:00' },
    ],
  },
  {
    id: 'fac-narayanan',
    name: 'Prof. K. Narayanan',
    designation: 'Assistant Professor (Senior Scale)',
    department: 'Computer Science & Engineering',
    email: 'k.narayanan@apex-institute.edu',
    cabin: 'CS Block, Room 105',
    specializations: ['Theory of Computation', 'Formal Languages', 'Automata Theory & Decidability'],
    bio: 'Gold medalist in Theoretical Computer Science from Anna University. Passionate educator for GATE CS aspirants.',
    subjects: [
      { id: 'sub-toc', code: 'CS3605', name: 'Theory of Computation' },
    ],
    officeHours: [
      { day: 'Wednesday', startTime: '11:00', endTime: '13:00' },
      { day: 'Friday', startTime: '14:00', endTime: '16:00' },
    ],
  },
  {
    id: 'fac-shalini',
    name: 'Dr. Shalini Rao',
    designation: 'Associate Professor',
    department: 'Computer Science & Engineering',
    email: 'shalini.rao@apex-institute.edu',
    cabin: 'CS Block, Room 204',
    specializations: ['Software Engineering', 'Agile & DevOps', 'Software Metrics & CI/CD'],
    bio: 'Ph.D. in Software Quality Engineering with certified Scrum Master credentials. Mentor for smart India hackathon teams.',
    subjects: [
      { id: 'sub-se', code: 'CS3606', name: 'Software Engineering & Agile' },
    ],
    officeHours: [
      { day: 'Tuesday', startTime: '10:00', endTime: '12:00' },
      { day: 'Thursday', startTime: '11:00', endTime: '13:00' },
    ],
  },
  // Other Department Faculty
  {
    id: 'fac-arvind',
    name: 'Dr. Arvind Menon',
    designation: 'Professor',
    department: 'Information Technology',
    email: 'arvind.menon@apex-institute.edu',
    cabin: 'IT Block, Room 402',
    specializations: ['Artificial Intelligence', 'Natural Language Processing', 'Deep Learning'],
    bio: 'Lead of the AI Innovation Center. PI for funded DST research projects in generative language models.',
    subjects: [
      { id: 'sub-ai', code: 'IT3701', name: 'Artificial Intelligence Systems' },
    ],
    officeHours: [
      { day: 'Monday', startTime: '14:00', endTime: '16:00' },
      { day: 'Thursday', startTime: '15:00', endTime: '17:00' },
    ],
  },
  {
    id: 'fac-deepa',
    name: 'Prof. Deepa Nair',
    designation: 'Assistant Professor',
    department: 'Information Technology',
    email: 'deepa.nair@apex-institute.edu',
    cabin: 'IT Block, Room 409',
    specializations: ['Cybersecurity', 'Applied Cryptography', 'Ethical Hacking'],
    bio: 'Certified Ethical Hacker (CEH). Faculty advisor for the Campus WhiteHat Security Guild.',
    subjects: [
      { id: 'sub-sec', code: 'IT3704', name: 'Information Security & Cryptography' },
    ],
    officeHours: [
      { day: 'Wednesday', startTime: '10:00', endTime: '12:00' },
      { day: 'Friday', startTime: '14:00', endTime: '16:00' },
    ],
  },
  {
    id: 'fac-rajesh',
    name: 'Dr. Rajesh Sundaram',
    designation: 'Professor',
    department: 'Electronics & Communication',
    email: 'rajesh.s@apex-institute.edu',
    cabin: 'ECE Block, Room 112',
    specializations: ['Embedded Systems', 'IoT Architectures', 'Edge Computing'],
    bio: 'Former Texas Instruments researcher. Spearheads the Autonomous Robotics & Embedded Devices laboratory.',
    subjects: [
      { id: 'sub-emb', code: 'EC3602', name: 'Embedded Systems Design' },
    ],
    officeHours: [
      { day: 'Tuesday', startTime: '15:00', endTime: '17:00' },
      { day: 'Thursday', startTime: '10:00', endTime: '12:00' },
    ],
  },
  {
    id: 'fac-vikram',
    name: 'Prof. Vikram Joshi',
    designation: 'Associate Professor',
    department: 'Computer Science & Engineering',
    email: 'vikram.joshi@apex-institute.edu',
    cabin: 'CS Block, Room 309',
    specializations: ['Cloud Computing', 'Container Orchestration', 'Microservices'],
    bio: 'AWS Certified Solutions Architect & Kubernetes developer. Directs the college campus cloud infrastructure.',
    subjects: [
      { id: 'sub-cloud', code: 'CS3802', name: 'Cloud Computing & DevOps' },
    ],
    officeHours: [
      { day: 'Monday', startTime: '10:00', endTime: '12:00' },
      { day: 'Wednesday', startTime: '16:00', endTime: '17:30' },
    ],
  },
];

// ============================================================================
// COURSE FEEDBACK SEED DATA (READ-ONLY FOR STUDENT)
// ============================================================================

export const COLLEGE_FEEDBACK_QUESTIONS: FeedbackQuestion[] = [
  { id: 'q1', category: 'Teaching & Clarity', text: 'Faculty explains core concepts with clarity and uses effective real-world examples.' },
  { id: 'q2', category: 'Syllabus & Depth', text: 'All units of the curriculum are thoroughly covered within the scheduled course hours.' },
  { id: 'q3', category: 'Pace & Interaction', text: 'The pace of lecture delivery is balanced and student doubts are encouraged in class.' },
  { id: 'q4', category: 'Resources & Notes', text: 'Study material, lecture slides, and reference notes shared are of high academic quality.' },
  { id: 'q5', category: 'Assessment Fairness', text: 'Evaluation of internal assessments, assignments, and quizzes is transparent and fair.' },
  { id: 'q6', category: 'Overall Effectiveness', text: 'Overall rating of the course learning experience, subject mastery, and faculty mentorship.' },
];

export const COLLEGE_FEEDBACK_FORMS: FeedbackForm[] = [
  // Closing in 2 days (Oct 12) -> triggers urgency #3 and notifications!
  {
    id: 'fb-cn',
    subjectId: 'sub-cn',
    subjectCode: 'CS3604',
    subjectName: 'Computer Networks',
    facultyId: 'fac-ramesh',
    facultyName: 'Dr. Ramesh Kumar',
    opensAt: '2026-10-01T00:00:00Z',
    closesAt: '2026-10-12T23:59:59Z',
    status: 'pending',
  },
  {
    id: 'fb-dsa',
    subjectId: 'sub-dsa',
    subjectCode: 'CS3601',
    subjectName: 'Design & Analysis of Algorithms',
    facultyId: 'fac-ananya',
    facultyName: 'Prof. Ananya Sen',
    opensAt: '2026-10-01T00:00:00Z',
    closesAt: '2026-10-12T23:59:59Z',
    status: 'pending',
  },
  {
    id: 'fb-os',
    subjectId: 'sub-os',
    subjectCode: 'CS3602',
    subjectName: 'Operating Systems',
    facultyId: 'fac-srinivasan',
    facultyName: 'Dr. V. Srinivasan',
    opensAt: '2026-10-01T00:00:00Z',
    closesAt: '2026-10-12T23:59:59Z',
    status: 'submitted',
  },
  {
    id: 'fb-dbms',
    subjectId: 'sub-dbms',
    subjectCode: 'CS3603',
    subjectName: 'Database Management Systems',
    facultyId: 'fac-meera',
    facultyName: 'Dr. Meera Patel',
    opensAt: '2026-10-01T00:00:00Z',
    closesAt: '2026-10-12T23:59:59Z',
    status: 'submitted',
  },
  {
    id: 'fb-toc',
    subjectId: 'sub-toc',
    subjectCode: 'CS3605',
    subjectName: 'Theory of Computation',
    facultyId: 'fac-narayanan',
    facultyName: 'Prof. K. Narayanan',
    opensAt: '2026-10-01T00:00:00Z',
    closesAt: '2026-10-12T23:59:59Z',
    status: 'pending',
  },
  {
    id: 'fb-se',
    subjectId: 'sub-se',
    subjectCode: 'CS3606',
    subjectName: 'Software Engineering & Agile',
    facultyId: 'fac-shalini',
    facultyName: 'Dr. Shalini Rao',
    opensAt: '2026-10-01T00:00:00Z',
    closesAt: '2026-10-12T23:59:59Z',
    status: 'submitted',
  },
];

// Initial Anonymous Responses (Stored WITHOUT student_id to guarantee anonymity)
export const INITIAL_FEEDBACK_RESPONSES: FeedbackResponse[] = [
  {
    id: 'fbr-1',
    formId: 'fb-os',
    ratings: { q1: 5, q2: 5, q3: 4, q4: 5, q5: 4, q6: 5 },
    comment: 'Exceptional explanation of kernel thread synchronization and virtual memory paging.',
    createdAt: '2026-10-04T14:20:00Z',
  },
  {
    id: 'fbr-2',
    formId: 'fb-dbms',
    ratings: { q1: 4, q2: 5, q3: 4, q4: 4, q5: 5, q6: 4 },
    comment: 'Great SQL query optimization drills during laboratory sessions.',
    createdAt: '2026-10-05T10:15:00Z',
  },
  {
    id: 'fbr-3',
    formId: 'fb-se',
    ratings: { q1: 5, q2: 4, q3: 5, q4: 5, q5: 4, q6: 5 },
    comment: 'Agile sprints in class were interactive and felt like working in an actual dev team.',
    createdAt: '2026-10-06T16:45:00Z',
  },
];

// Submissions receipt table (only tracks student_id + form_id to block duplicate submission)
export const INITIAL_FEEDBACK_SUBMISSIONS: FeedbackSubmission[] = [
  { id: 'fbs-1', studentId: 'usr-demo-student', formId: 'fb-os', submittedAt: '2026-10-04T14:20:00Z' },
  { id: 'fbs-2', studentId: 'usr-demo-student', formId: 'fb-dbms', submittedAt: '2026-10-05T10:15:00Z' },
  { id: 'fbs-3', studentId: 'usr-demo-student', formId: 'fb-se', submittedAt: '2026-10-06T16:45:00Z' },
];

// ============================================================================
// HELPDESK SEED DATA
// ============================================================================

export const SEED_HELPDESK_TICKETS: HelpdeskTicket[] = [
  {
    id: 'tkt-1',
    ticketNumber: 'HD-2026-0412',
    studentId: 'usr-demo-student',
    category: 'Wi-Fi / Network',
    priority: 'High',
    title: 'Hostel Block B 2nd floor 5GHz Wi-Fi drops intermittently during study hours',
    description: 'The access point outside Room 214 resets every 15-20 minutes, interrupting ongoing online project meetings and video lectures. Several roommates on the floor are experiencing the same issue.',
    location: 'Hostel Block B, 2nd Floor Corridor (Near AP-B204)',
    status: 'In progress',
    assignedDepartment: 'Campus IT & Network Infrastructure',
    attachments: [
      {
        id: 'att-1',
        name: 'wifi_ping_drop_log.png',
        size: 142000,
        type: 'image/png',
      },
    ],
    createdAt: '2026-10-08T09:30:00Z',
    updatedAt: '2026-10-09T14:20:00Z',
  },
  {
    id: 'tkt-2',
    ticketNumber: 'HD-2026-0388',
    studentId: 'usr-demo-student',
    category: 'Library',
    priority: 'Medium',
    title: 'Remote proxy credential access for IEEE Xplore digital library',
    description: 'Need off-campus VPN/Shibboleth credentials configured for accessing IEEE Transactions and ACM Digital Library for our CS3182 technical seminar survey paper.',
    location: 'Central Library, Digital Knowledge Resource Wing',
    status: 'Resolved',
    assignedDepartment: 'Central Library Information Services',
    attachments: [],
    rating: 5,
    createdAt: '2026-10-02T11:00:00Z',
    updatedAt: '2026-10-04T15:30:00Z',
  },
  {
    id: 'tkt-3',
    ticketNumber: 'HD-2026-0294',
    studentId: 'usr-demo-student',
    category: 'Hostel Maintenance',
    priority: 'Low',
    title: 'Room 214 ceiling fan regulator replacement',
    description: 'The step regulator for the ceiling fan in Room 214 was stuck on step 1. Electrician inspected and replaced the rotary switch module.',
    location: 'Hostel Block B, Room 214',
    status: 'Closed',
    assignedDepartment: 'Hostel Estate & Electrical Services',
    attachments: [],
    rating: 4,
    createdAt: '2026-09-20T10:15:00Z',
    updatedAt: '2026-09-22T17:00:00Z',
  },
];

export const SEED_HELPDESK_COMMENTS: HelpdeskComment[] = [
  {
    id: 'com-1',
    ticketId: 'tkt-1',
    authorType: 'support',
    authorName: 'Campus IT Network Operations',
    message: 'Ticket received and assigned to Field Network Engineer. AP-B204 telemetry shows channel interference on 5.2GHz. Scheduled firmware upgrade and channel rebalancing today at 4:30 PM.',
    createdAt: '2026-10-08T11:45:00Z',
  },
  {
    id: 'com-2',
    ticketId: 'tkt-1',
    authorType: 'student',
    authorName: 'Aarav Sharma',
    message: 'Thank you. The signal is slightly better now, but we noticed packet latency spikes around 9 PM when everyone joins evening labs.',
    createdAt: '2026-10-08T21:10:00Z',
  },
  {
    id: 'com-3',
    ticketId: 'tkt-1',
    authorType: 'support',
    authorName: 'Campus IT Network Operations',
    message: 'Bandwidth QoS profile updated for Block B wing. Monitoring packet jitter over next 24 hours.',
    createdAt: '2026-10-09T14:20:00Z',
  },
  {
    id: 'com-4',
    ticketId: 'tkt-2',
    authorType: 'support',
    authorName: 'Library Digital Desk',
    message: 'Institutional SSO proxy credentials activated for register number 2023CS0142. You can access IEEE Xplore through https://ezproxy.apex-institute.edu using your college Google ID.',
    createdAt: '2026-10-04T15:30:00Z',
  },
];

// ============================================================================
// HELPER FUNCTIONS (TIMETABLE, FACULTY, FEES, CALENDAR)
// ============================================================================

/**
 * Checks whether a faculty member is currently within their office hours.
 */
export function isFacultyAvailableNow(
  facultyOrHours: FacultyMember | FacultyOfficeHour[] | any,
  referenceDate = new Date()
): boolean {
  if (!facultyOrHours) return false;
  const hours: FacultyOfficeHour[] = Array.isArray(facultyOrHours)
    ? facultyOrHours
    : facultyOrHours.officeHours;

  if (!hours || !Array.isArray(hours) || hours.length === 0) return false;

  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as unknown as DayOfWeek[];
  const currentDayName = days[referenceDate.getDay()];
  const currentMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();

  return hours.some((oh) => {
    if (oh.day !== currentDayName) return false;
    const startStr = (oh as any).startTime || oh.start || '09:00';
    const endStr = (oh as any).endTime || oh.end || '17:00';
    const [sh, sm] = startStr.split(':').map(Number);
    const [eh, em] = endStr.split(':').map(Number);
    const startMins = sh * 60 + (sm || 0);
    const endMins = eh * 60 + (em || 0);
    return currentMinutes >= startMins && currentMinutes <= endMins;
  });
}

/**
 * Calculates empty/free slots on a given day's timetable.
 */
export function calculateFreeSlots(
  allSlotsOrDaySlots: TimetableSlot[],
  dayName?: DayOfWeek
): { period: number; startTime: string; endTime: string; durationMinutes: number }[] {
  const daySlots = dayName
    ? allSlotsOrDaySlots.filter((s) => s.day === dayName)
    : allSlotsOrDaySlots;

  const freeSlots: { period: number; startTime: string; endTime: string; durationMinutes: number }[] = [];

  COLLEGE_TIMETABLE_PERIODS.forEach((p) => {
    const isOccupied = daySlots.some((s) => s.period === p.period);
    if (!isOccupied) {
      const [sh, sm] = p.startTime.split(':').map(Number);
      const [eh, em] = p.endTime.split(':').map(Number);
      const duration = (eh * 60 + em) - (sh * 60 + sm);
      freeSlots.push({
        period: p.period,
        startTime: p.startTime,
        endTime: p.endTime,
        durationMinutes: duration,
      });
    }
  });

  return freeSlots;
}

/**
 * Evaluates payment status: 'Paid' | 'Due soon' | 'Overdue'
 */
export function getFeeStatus(
  balanceDue: number,
  dueDateString: string,
  now = new Date()
): 'Paid' | 'Due soon' | 'Overdue' {
  if (balanceDue <= 0) return 'Paid';

  const dueDate = new Date(dueDateString);
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Overdue';
  if (diffDays <= 7) return 'Due soon';
  return 'Due soon';
}

/**
 * Generates RFC 5545 iCalendar (.ics) string for recurring weekly timetable.
 */
export function generateIcsCalendar(
  slots: TimetableSlot[],
  studentName = 'Aarav Sharma'
): string {
  const dayToIcsDay: Record<DayOfWeek, string> = {
    Monday: 'MO',
    Tuesday: 'TU',
    Wednesday: 'WE',
    Thursday: 'TH',
    Friday: 'FR',
    Saturday: 'SA',
    Sunday: 'SU',
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusConnect//Student Portal Timetable//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:CampusConnect Timetable - ${studentName}`,
    'X-WR-TIMEZONE:Asia/Kolkata',
  ];

  slots.forEach((slot) => {
    const icsDay = dayToIcsDay[slot.day];
    const [sh, sm] = slot.startTime.split(':');
    const [eh, em] = slot.endTime.split(':');

    // Base start date in 2026-10 (Monday is Oct 12, 2026)
    const dayOffset =
      slot.day === 'Monday'
        ? 12
        : slot.day === 'Tuesday'
        ? 13
        : slot.day === 'Wednesday'
        ? 14
        : slot.day === 'Thursday'
        ? 15
        : slot.day === 'Friday'
        ? 16
        : 17;

    const dtStart = `202610${dayOffset}T${sh}${sm}00`;
    const dtEnd = `202610${dayOffset}T${eh}${em}00`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:cc-${slot.id}@campusconnect.edu`,
      `DTSTAMP:20261010T000000Z`,
      `DTSTART;TZID=Asia/Kolkata:${dtStart}`,
      `DTEND;TZID=Asia/Kolkata:${dtEnd}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${icsDay};UNTIL=20261231T235959Z`,
      `SUMMARY:${slot.subjectCode} - ${slot.subjectName}`,
      `LOCATION:${slot.room}`,
      `DESCRIPTION:Faculty: ${slot.facultyName} (${slot.slotType.toUpperCase()})\\nRoom: ${slot.room}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

