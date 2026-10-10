// Typed API client layer for CampusConnect Student Portal
// Directly mirrors the Java Spring Boot REST API surface.
// Backed by client data store so screens stay 100% decouple from the backend implementation.

import { db } from './db';
import type { User, AttendanceRecord, MarkRecord, Note, RequestItem, Circular, Notification } from './db';
import { authService } from './auth';
import type { RegisterInput, LoginInput } from './auth';

export const api = {
  // --- Auth Endpoints ---
  async register(input: RegisterInput) {
    return authService.register(input);
  },

  async login(input: LoginInput) {
    return authService.login(input);
  },

  async getMe(): Promise<User | null> {
    return authService.getCurrentUser();
  },

  // --- Attendance Endpoints ---
  async getAttendance(): Promise<AttendanceRecord[]> {
    return db.getAttendance();
  },

  async recordAttendance(subjectId: string, date: string, status: 'present' | 'absent' | 'od') {
    db.recordAttendance(subjectId, date, status);
    return { success: true };
  },

  async getAttendanceSummary() {
    return db.getAttendanceSummary();
  },

  // --- Marks & CGPA Endpoints ---
  async getMarks(): Promise<MarkRecord[]> {
    return db.getMarks();
  },

  async updateMark(subjectId: string, updates: Partial<MarkRecord>) {
    db.updateMark(subjectId, updates);
    return { success: true };
  },

  async predictMarks(targetCgpa: number) {
    return db.predictEndSemMarks(targetCgpa);
  },

  // --- Circulars Endpoints ---
  async getCirculars(_dept?: string, _sem?: number, q?: string): Promise<Circular[]> {
    return db.getCirculars(q);
  },

  // --- Notes & PYQ Endpoints ---
  async getNotes(subjectCode?: string): Promise<Note[]> {
    return db.getNotes(subjectCode);
  },

  async upvoteNote(noteId: string): Promise<Note | undefined> {
    return db.upvoteNote(noteId);
  },

  async uploadNote(note: Omit<Note, 'id' | 'upvotes' | 'upvotedBy' | 'uploadedDate'>): Promise<Note> {
    return db.addNote(note);
  },

  // --- Approval Tracker Endpoints ---
  async getRequests(): Promise<RequestItem[]> {
    return db.getRequests();
  },

  async getRequestById(id: string): Promise<RequestItem | undefined> {
    return db.getRequestById(id);
  },

  async createRequest(data: Omit<RequestItem, 'id' | 'status' | 'submittedDate' | 'comments' | 'verificationToken'>): Promise<RequestItem> {
    return db.createRequest(data);
  },

  // --- Exams & Study Planner Endpoints ---
  async getExams() {
    return db.getExams();
  },

  async generateStudyPlan(dailyHours: number) {
    const exams = db.getExams();
    const marks = db.getMarks();
    const subjects = db.getSubjects();

    // Allocate study hours inversely proportional to internal mark strength and syllabus coverage
    return subjects.map((sub) => {
      const mark = marks.find((m) => m.subjectId === sub.id)?.totalInternal || 40;
      const weaknessWeight = Math.max(1, 50 - mark) + Math.max(1, 100 - sub.syllabusCoveragePercent) * 0.5;
      return {
        subject: sub,
        exam: exams.find((e) => e.subjectId === sub.id),
        allocatedDailyHours: Number(((weaknessWeight / 70) * (dailyHours / subjects.length) * 2).toFixed(1)),
        suggestedFocus: mark < 40 ? 'High Priority: Weak Internal Scores' : 'Revision & PYQ Practice',
      };
    });
  },

  // --- Badges, Streak, Wrapped ---
  async getBadges() {
    return db.getBadges();
  },

  async getStreak() {
    return db.getStreak();
  },

  async getWrapped() {
    return {
      studentName: db.getUser().name,
      department: db.getUser().department,
      semester: db.getUser().semester,
      bestSubject: 'Database Management Systems (90.0% Attendance, 49/50 Internals)',
      longestStreak: '18 Days Active',
      mostImprovedSubject: 'Cloud Computing & DevOps (+12% improvement)',
      totalClassesAttended: 161,
      totalClassesHeld: 192,
      overallPercent: '83.8%',
      badgesEarnedCount: db.getBadges().filter((b) => b.unlocked).length,
    };
  },

  // --- Digital ID Card & Verification ---
  async getIdCardData() {
    const user = db.getUser();
    return {
      user,
      verificationToken: `cc_id_sig_${user.registerNumber}_2026`,
      issuedDate: 'August 2026',
      validUntil: 'July 2027',
    };
  },

  async verifyIdToken(token: string) {
    const user = db.getUser();
    if (token.includes(user.registerNumber) || token.startsWith('cc_id_sig_')) {
      return {
        valid: true,
        student: {
          name: user.name,
          registerNumber: user.registerNumber,
          department: user.department,
          semester: user.semester,
          avatarUrl: user.avatarUrl,
        },
      };
    }
    return { valid: false };
  },

  // --- Notifications ---
  async getNotifications(): Promise<Notification[]> {
    return db.getNotifications();
  },

  async markNotificationRead(id: string) {
    db.markNotificationAsRead(id);
    return { success: true };
  },

  async markAllNotificationsRead() {
    db.markAllNotificationsAsRead();
    return { success: true };
  },

  // --- Dashboard Aggregated ---
  async getDashboard() {
    return db.getDashboardData();
  },
};
