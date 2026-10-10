// In-memory & LocalStorage database for CampusConnect
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  registerNumber: string;
  role: 'student' | 'faculty' | 'admin';
  department: string;
  semester?: number;
  passwordHash: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface StudentEnrollment {
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
  attendancePercent: number;
  totalClasses: number;
  attendedClasses: number;
  internalMarks: number;
  maxInternal: number;
}

export interface RequestRecord {
  id: string;
  type: 'No-dues' | 'OD letter' | 'Scholarship' | 'Event';
  title: string;
  studentName: string;
  registerNumber: string;
  department: string;
  status: 'Pending' | 'Faculty Review' | 'Admin Review' | 'Approved' | 'Rejected';
  date: string;
  remarks: string;
  details: string;
}

export interface Circular {
  id: string;
  title: string;
  department: string;
  date: string;
  category: 'Exam' | 'Event' | 'Academic' | 'Hostel';
  summary: string;
}

const STORAGE_KEYS = {
  USERS: 'campusconnect_users',
  ENROLLMENTS: 'campusconnect_enrollments',
  REQUESTS: 'campusconnect_requests',
  CIRCULARS: 'campusconnect_circulars',
  SUBJECTS: 'campusconnect_subjects',
  SEEDED: 'campusconnect_db_seeded_v1',
};

// Default password hash for demo accounts: "Password@123"
// Generated using bcrypt.hashSync("Password@123", 10)
const DEMO_PASSWORD_HASH = bcrypt.hashSync('Password@123', 10);

const SEED_ENROLLMENTS: StudentEnrollment[] = [
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
    semester: 4,
  },
  {
    registerNumber: '21ME019',
    email: 'sneha.patel@college.edu',
    name: 'Sneha Patel',
    department: 'Mechanical Engineering',
    semester: 6,
  },
];

const SEED_USERS: User[] = [
  {
    id: 'user-demo-student',
    name: 'Aarav Sharma',
    email: 'student.demo@college.edu',
    registerNumber: '21CS042',
    role: 'student',
    department: 'Computer Science & Engineering',
    semester: 6,
    passwordHash: DEMO_PASSWORD_HASH,
    isDemo: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-demo-faculty',
    name: 'Dr. Rajesh Kumar',
    email: 'faculty.demo@college.edu',
    registerNumber: 'FAC-CSE-104',
    role: 'faculty',
    department: 'Computer Science & Engineering',
    passwordHash: DEMO_PASSWORD_HASH,
    isDemo: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-demo-admin',
    name: 'College Admin Office',
    email: 'admin.demo@college.edu',
    registerNumber: 'ADM-REG-001',
    role: 'admin',
    department: 'Academic Administration',
    passwordHash: DEMO_PASSWORD_HASH,
    isDemo: true,
    createdAt: new Date().toISOString(),
  },
];

const SEED_SUBJECTS: Subject[] = [
  {
    id: 'sub-1',
    code: 'CS3601',
    name: 'Data Structures & Algorithms',
    attendancePercent: 88.1,
    totalClasses: 42,
    attendedClasses: 37,
    internalMarks: 46,
    maxInternal: 50,
  },
  {
    id: 'sub-2',
    code: 'CS3602',
    name: 'Operating Systems',
    attendancePercent: 81.6,
    totalClasses: 38,
    attendedClasses: 31,
    internalMarks: 42,
    maxInternal: 50,
  },
  {
    id: 'sub-3',
    code: 'CS3603',
    name: 'Database Management Systems',
    attendancePercent: 90.0,
    totalClasses: 40,
    attendedClasses: 36,
    internalMarks: 48,
    maxInternal: 50,
  },
  {
    id: 'sub-4',
    code: 'CS3604',
    name: 'Computer Networks',
    attendancePercent: 78.9,
    totalClasses: 38,
    attendedClasses: 30,
    internalMarks: 40,
    maxInternal: 50,
  },
  {
    id: 'sub-5',
    code: 'CS3605',
    name: 'Cloud Computing & DevOps',
    attendancePercent: 85.3,
    totalClasses: 34,
    attendedClasses: 29,
    internalMarks: 44,
    maxInternal: 50,
  },
];

const SEED_REQUESTS: RequestRecord[] = [
  {
    id: 'REQ-OD-4819',
    type: 'OD letter',
    title: 'HackFest 2026 On-Duty Attendance (2 Days)',
    studentName: 'Aarav Sharma',
    registerNumber: '21CS042',
    department: 'Computer Science & Engineering',
    status: 'Faculty Review',
    date: '2026-10-08',
    remarks: 'Awaiting faculty verification of hackathon invitation pass.',
    details: 'Requested 2 days duty leave for participating in National HackFest Finals at IIT.',
  },
  {
    id: 'REQ-ND-8842',
    type: 'No-dues',
    title: 'Semester 6 No-Dues Clearance',
    studentName: 'Aarav Sharma',
    registerNumber: '21CS042',
    department: 'Computer Science & Engineering',
    status: 'Approved',
    date: '2026-10-02',
    remarks: 'Library, Hostel, Accounts, and Labs cleared. Certificate issued.',
    details: 'All departmental dues cleared for final sem registration.',
  },
  {
    id: 'REQ-SCH-2210',
    type: 'Scholarship',
    title: 'Merit-Cum-Means Fee Concession',
    studentName: 'Rohit Sharma',
    registerNumber: '21CS077',
    department: 'Computer Science & Engineering',
    status: 'Pending',
    date: '2026-10-09',
    remarks: 'Income verification submitted.',
    details: '35% fee concession application for academic year 2026-27.',
  },
];

const SEED_CIRCULARS: Circular[] = [
  {
    id: 'circ-1',
    title: 'End-Semester Examination Time Table & Hall Ticket Guidelines',
    department: 'Office of the Controller of Examinations',
    date: '2026-10-09',
    category: 'Exam',
    summary: 'Theory exams commence from Nov 15th. Check portal for personalized hall tickets.',
  },
  {
    id: 'circ-2',
    title: 'HackFest 2026 — Inter-College 36hr Hackathon Registration',
    department: 'Department of CSE',
    date: '2026-10-07',
    category: 'Event',
    summary: 'Teams must register before Oct 20th. On-Duty allowance provided for finalists.',
  },
  {
    id: 'circ-3',
    title: 'Hostel No-Dues Window and Mess Rebate Reimbursement',
    department: 'Chief Warden Office',
    date: '2026-10-05',
    category: 'Hostel',
    summary: 'Submit mess rebate claim forms online by end of the week.',
  },
];

class Database {
  private users: User[] = [];
  private enrollments: StudentEnrollment[] = [];
  private requests: RequestRecord[] = [];
  private circulars: Circular[] = [];
  private subjects: Subject[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const seeded = localStorage.getItem(STORAGE_KEYS.SEEDED);
      if (!seeded) {
        this.resetToDefaults();
      } else {
        this.loadFromStorage();
      }
    } catch {
      // Fallback for environments where localStorage isn't available
      this.resetToDefaults();
    }
  }

  public resetToDefaults() {
    this.users = [...SEED_USERS];
    this.enrollments = [...SEED_ENROLLMENTS];
    this.requests = [...SEED_REQUESTS];
    this.circulars = [...SEED_CIRCULARS];
    this.subjects = [...SEED_SUBJECTS];
    this.saveToStorage();
    try {
      localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
    } catch {
      // ignore
    }
  }

  private loadFromStorage() {
    try {
      const u = localStorage.getItem(STORAGE_KEYS.USERS);
      const e = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
      const r = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      const c = localStorage.getItem(STORAGE_KEYS.CIRCULARS);
      const s = localStorage.getItem(STORAGE_KEYS.SUBJECTS);

      this.users = u ? JSON.parse(u) : [...SEED_USERS];
      this.enrollments = e ? JSON.parse(e) : [...SEED_ENROLLMENTS];
      this.requests = r ? JSON.parse(r) : [...SEED_REQUESTS];
      this.circulars = c ? JSON.parse(c) : [...SEED_CIRCULARS];
      this.subjects = s ? JSON.parse(s) : [...SEED_SUBJECTS];
    } catch {
      this.resetToDefaults();
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(this.enrollments));
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(this.requests));
      localStorage.setItem(STORAGE_KEYS.CIRCULARS, JSON.stringify(this.circulars));
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(this.subjects));
    } catch {
      // ignore
    }
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.users;
  }

  public findUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public findUserByEmailOrRegNo(identifier: string): User | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.users.find(
      (u) =>
        u.email.toLowerCase() === clean ||
        u.registerNumber.toLowerCase() === clean
    );
  }

  public addUser(user: User): User {
    this.users.push(user);
    this.saveToStorage();
    return user;
  }

  // --- Enrollments ---
  public getEnrollments(): StudentEnrollment[] {
    return this.enrollments;
  }

  public findEnrollment(regNo: string, email: string): StudentEnrollment | undefined {
    const cleanReg = regNo.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();
    return this.enrollments.find(
      (e) =>
        e.registerNumber.toUpperCase() === cleanReg &&
        e.email.toLowerCase() === cleanEmail
    );
  }

  // --- Requests ---
  public getRequests(): RequestRecord[] {
    return this.requests;
  }

  public updateRequestStatus(id: string, status: RequestRecord['status'], remarks?: string) {
    const req = this.requests.find((r) => r.id === id);
    if (req) {
      req.status = status;
      if (remarks) req.remarks = remarks;
      this.saveToStorage();
    }
    return req;
  }

  public addRequest(request: RequestRecord) {
    this.requests.unshift(request);
    this.saveToStorage();
    return request;
  }

  // --- Circulars & Subjects ---
  public getCirculars(): Circular[] {
    return this.circulars;
  }

  public getSubjects(): Subject[] {
    return this.subjects;
  }
}

export const db = new Database();
