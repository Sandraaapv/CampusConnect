// Typed API client layer for CampusConnect Student Portal
// Directly mirrors the Java Spring Boot REST API surface.
// Backed by client data store so screens stay 100% decouple from the backend implementation.

import { db } from './db';
import type { User, AttendanceRecord, MarkRecord, Notification } from './db';
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

  // --- Attendance Endpoints (Read-Only from College Records) ---
  async getAttendance(): Promise<AttendanceRecord[]> {
    return db.getAttendance();
  },

  async getAttendanceSummary() {
    return db.getAttendanceSummary();
  },

  // --- Marks & CGPA Endpoints (Read-Only from College Records) ---
  async getMarks(): Promise<MarkRecord[]> {
    return db.getMarks();
  },

  async predictMarks(targetCgpa: number) {
    return db.predictEndSemMarks(targetCgpa);
  },

  async getAcademicHistory() {
    return db.getAcademicHistory();
  },

  async getCumulativeCgpa() {
    return db.getCumulativeCgpa();
  },

  // --- Student Settings Endpoints (GET / PUT /settings) ---
  async getSettings() {
    return db.getUser().settings;
  },

  async updateSettings(updates: Partial<User['settings']>) {
    return db.updateUserSettings(updates);
  },

  // --- Syllabus Endpoints (GET /syllabus/units, PUT /syllabus/progress) ---
  async getSyllabusUnits() {
    return db.getSyllabusUnits();
  },

  async getUnitProgress() {
    return db.getUnitProgress();
  },

  async updateUnitProgress(unitId: string) {
    return db.toggleUnitProgress(unitId);
  },

  // --- Exams & Study Planner Endpoints (GET /exams, GET /exams/plan) ---
  async getExams() {
    return db.getExams();
  },

  async getExamPlan(dailyHours?: number) {
    return db.getStudyPlan(dailyHours);
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

  // --- Timetable Endpoints (Read-Only College Records) ---
  async getTimetable() {
    return db.getTimetableSlots();
  },

  async getTodayTimetable(dayOverride?: any) {
    return db.getTodayTimetable(dayOverride);
  },

  async getClassChanges() {
    return db.getClassChanges();
  },

  async getTimetableIcs() {
    return db.getTimetableIcs();
  },

  // --- Fees Endpoints (Read-Only College Records) ---
  async getFees(semester?: number) {
    return db.getFeeStatusSummary(semester);
  },

  async getFeePayments(semester?: number) {
    return db.getFeePayments(semester);
  },

  async getFeeReceipt(id: string) {
    return db.getFeeReceiptById(id);
  },

  async verifyReceiptToken(token: string) {
    const receipt = db.getFeeReceiptByToken(token);
    if (!receipt) return { valid: false };
    return {
      valid: true,
      receipt,
      student: {
        name: db.getUser().name,
        registerNumber: db.getUser().registerNumber,
        department: db.getUser().department,
      },
    };
  },

  // --- Faculty Directory Endpoints (Read-Only College Records) ---
  async getFaculty() {
    return db.getFacultyList();
  },

  async getMyFaculty() {
    return db.getMyFaculty();
  },

  async getFacultyById(id: string) {
    return db.getFacultyById(id);
  },

  // --- Course Feedback Endpoints (Anonymity by Design) ---
  async getFeedbackForms() {
    return db.getFeedbackForms();
  },

  async getFeedbackQuestions() {
    return db.getFeedbackQuestions();
  },

  async submitFeedback(formId: string, answers: Record<string, number>, comment?: string) {
    return db.submitFeedback(formId, answers, comment);
  },

  // --- Helpdesk Endpoints (Student Issue Tracking & Simulated Support) ---
  async getHelpdeskTickets() {
    return db.getHelpdeskTickets();
  },

  async getHelpdeskTicket(id: string) {
    return db.getHelpdeskTicketById(id);
  },

  async createHelpdeskTicket(input: {
    category: any;
    priority: any;
    title: string;
    description: string;
    location: string;
    attachments?: any[];
  }) {
    return db.createHelpdeskTicket(input);
  },

  async addHelpdeskComment(ticketId: string, message: string) {
    return db.addHelpdeskComment(ticketId, message);
  },

  async updateHelpdeskTicket(ticketId: string, action: 'reopen' | 'close', rating?: number) {
    return db.updateHelpdeskTicket(ticketId, action, rating);
  },
};
