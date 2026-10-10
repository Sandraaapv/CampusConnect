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
