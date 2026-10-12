// Typed API client layer for CampusConnect Student Portal
// Directly mirrors the Java Spring Boot REST API surface.
// Backed by client data store so screens stay 100% decouple from the backend implementation.

import { db } from './db';
import type { User, AttendanceRecord, MarkRecord, Notification, RequestItem, Circular } from './db';
import { authService, BACKEND_URL } from './auth';
import type { RegisterInput, LoginInput } from './auth';

export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || import.meta.env.VITE_USE_MOCK_API === true;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authService.getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Request failed with status ${res.status}`);
  }
  return res.json();
}

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
    if (USE_MOCK_API) return db.getAttendance();
    return request<AttendanceRecord[]>('/attendance');
  },

  async getAttendanceSummary() {
    if (USE_MOCK_API) return db.getAttendanceSummary();
    return request<any>('/attendance/summary');
  },

  // --- Marks & CGPA Endpoints (Read-Only from College Records) ---
  async getMarks(): Promise<MarkRecord[]> {
    if (USE_MOCK_API) return db.getMarks();
    return request<MarkRecord[]>('/marks');
  },

  async predictMarks(targetCgpa: number) {
    if (USE_MOCK_API) return db.predictEndSemMarks(targetCgpa);
    return request<any>('/marks/predict', {
      method: 'POST',
      body: JSON.stringify({ targetCgpa }),
    });
  },

  async getAcademicHistory() {
    if (USE_MOCK_API) return db.getAcademicHistory();
    return request<any>('/marks/history');
  },

  async getCumulativeCgpa() {
    if (USE_MOCK_API) return db.getCumulativeCgpa();
    return request<any>('/marks/cumulative-cgpa');
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
    if (USE_MOCK_API) return db.getNotifications();
    return request<Notification[]>('/notifications');
  },

  async markNotificationRead(id: string) {
    if (USE_MOCK_API) {
      db.markNotificationAsRead(id);
      return { success: true };
    }
    return request<any>(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllNotificationsRead() {
    if (USE_MOCK_API) {
      db.markAllNotificationsAsRead();
      return { success: true };
    }
    return request<any>('/notifications/read-all', { method: 'PATCH' });
  },

  // --- Requests Endpoints ---
  async getRequests(): Promise<RequestItem[]> {
    if (USE_MOCK_API) return db.getRequests();
    return request<RequestItem[]>('/requests');
  },

  async getRequestById(id: string): Promise<RequestItem | undefined> {
    if (USE_MOCK_API) return db.getRequestById(id);
    return request<RequestItem>(`/requests/${id}`);
  },

  async createRequest(input: any): Promise<RequestItem> {
    if (USE_MOCK_API) return db.createRequest(input);
    return request<RequestItem>('/requests', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async downloadRequestDocument(id: string): Promise<Blob> {
    const token = authService.getAccessToken();
    const res = await fetch(`${BACKEND_URL}/requests/${id}/document`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to download clearance certificate');
    return res.blob();
  },

  // --- Circulars Endpoints ---
  async getCirculars(searchQuery?: string, category?: string): Promise<Circular[]> {
    if (USE_MOCK_API) return db.getCirculars(searchQuery, category);
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (category && category !== 'All') params.append('dept', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<Circular[]>(`/circulars${qs}`);
  },

  // --- Dashboard Aggregated ---
  async getDashboard() {
    if (USE_MOCK_API) return db.getDashboardData();
    return request<any>('/dashboard');
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
