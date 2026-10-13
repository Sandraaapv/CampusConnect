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
    signal: options.signal || AbortSignal.timeout(3500),
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
    if (USE_MOCK_API) return db.getUser().settings;
    return request<any>('/settings');
  },

  async updateSettings(updates: Partial<User['settings']>) {
    if (USE_MOCK_API) return db.updateUserSettings(updates);
    return request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // --- Syllabus Endpoints (GET /syllabus/units, PUT /syllabus/progress) ---
  async getSyllabusUnits() {
    if (USE_MOCK_API) return db.getSyllabusUnits();
    return request<any[]>('/syllabus/units');
  },

  async getUnitProgress() {
    if (USE_MOCK_API) return db.getUnitProgress();
    return request<Record<string, boolean>>('/syllabus/progress');
  },

  async updateUnitProgress(unitId: string) {
    if (USE_MOCK_API) return db.toggleUnitProgress(unitId);
    return request<any>('/syllabus/progress', {
      method: 'PUT',
      body: JSON.stringify({ unitId }),
    });
  },

  // --- Exams & Study Planner Endpoints (GET /exams, GET /exams/plan) ---
  async getExams() {
    if (USE_MOCK_API) return db.getExams();
    return request<any[]>('/exams');
  },

  async createExam(exam: any) {
    if (USE_MOCK_API) return exam;
    return request<any>('/exams', {
      method: 'POST',
      body: JSON.stringify(exam),
    });
  },

  async getExamPlan(dailyHours?: number) {
    if (USE_MOCK_API) return db.getStudyPlan(dailyHours);
    const qs = dailyHours ? `?dailyHours=${dailyHours}` : '';
    return request<any>(`/exams/plan${qs}`);
  },

  // --- Badges, Streak, Wrapped ---
  async getBadges() {
    if (USE_MOCK_API) return db.getBadges();
    return request<any[]>('/badges');
  },

  async getStreak() {
    if (USE_MOCK_API) return db.getStreak();
    return request<any>('/streak');
  },

  async getWrapped() {
    if (USE_MOCK_API) {
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
    }
    return request<any>('/wrapped');
  },

  // --- Digital ID Card & Verification ---
  async getIdCardData() {
    if (USE_MOCK_API) {
      const user = db.getUser();
      return {
        user,
        verificationToken: `cc_id_sig_${user.registerNumber}_2026`,
        issuedDate: 'August 2026',
        validUntil: 'July 2027',
      };
    }
    return request<any>('/id-card');
  },

  async verifyIdToken(token: string) {
    if (USE_MOCK_API) {
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
    }
    const res = await fetch(`${BACKEND_URL}/id-card/verify/${encodeURIComponent(token)}`);
    return res.json();
  },

  // --- Notes Endpoints ---
  async getNotes(subjectCode?: string) {
    if (USE_MOCK_API) return db.getNotes(subjectCode);
    const qs = subjectCode && subjectCode !== 'All' ? `?subjectCode=${encodeURIComponent(subjectCode)}` : '';
    return request<any[]>(`/notes${qs}`);
  },

  async addNote(note: any) {
    if (USE_MOCK_API) return db.addNote(note);
    return request<any>('/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  },

  async upvoteNote(id: string) {
    if (USE_MOCK_API) return db.upvoteNote(id);
    return request<any>(`/notes/${id}/upvote`, {
      method: 'POST',
    });
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
    if (USE_MOCK_API) return db.getTimetableSlots();
    return request<any[]>('/timetable');
  },

  async getTodayTimetable(dayOverride?: any) {
    return db.getTodayTimetable(dayOverride);
  },

  async getClassChanges() {
    return db.getClassChanges();
  },

  async getTimetableIcs() {
    if (USE_MOCK_API) return db.getTimetableIcs();
    const token = authService.getAccessToken();
    const res = await fetch(`${BACKEND_URL}/timetable/ics`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    });
    return res.text();
  },

  // --- Fees Endpoints (Read-Only College Records with server-side rules) ---
  async getFees(semester?: number) {
    if (USE_MOCK_API) return db.getFeeStatusSummary(semester);
    const qs = semester ? `?semester=${semester}` : '';
    return request<any>(`/fees${qs}`);
  },

  async getFeePayments(semester?: number) {
    if (USE_MOCK_API) return db.getFeePayments(semester);
    const qs = semester ? `?semester=${semester}` : '';
    return request<any[]>(`/fees/payments${qs}`);
  },

  async getFeeReceipt(id: string) {
    if (USE_MOCK_API) return db.getFeeReceiptById(id);
    return request<any>(`/fees/receipts/${id}`);
  },

  async verifyReceiptToken(token: string) {
    if (USE_MOCK_API) {
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
    }
    const res = await fetch(`${BACKEND_URL}/fees/receipts/verify/${encodeURIComponent(token)}`);
    return res.json();
  },

  // --- Faculty Directory Endpoints (Read-Only College Records) ---
  async getFaculty() {
    if (USE_MOCK_API) return db.getFacultyList();
    return request<any[]>('/faculty');
  },

  async getMyFaculty() {
    if (USE_MOCK_API) return db.getMyFaculty();
    return request<any[]>('/faculty/my');
  },

  async getFacultyById(id: string) {
    if (USE_MOCK_API) return db.getFacultyById(id);
    return request<any>(`/faculty/${id}`);
  },

  // --- Course Feedback Endpoints (Anonymity by Design) ---
  async getFeedbackForms() {
    if (USE_MOCK_API) return db.getFeedbackForms();
    return request<any[]>('/feedback/forms');
  },

  async getFeedbackQuestions() {
    if (USE_MOCK_API) return db.getFeedbackQuestions();
    return request<any[]>('/feedback/questions');
  },

  async submitFeedback(formId: string, answers: Record<string, number>, comment?: string) {
    if (USE_MOCK_API) return db.submitFeedback(formId, answers, comment);
    return request<any>('/feedback/submit', {
      method: 'POST',
      body: JSON.stringify({ formId, answers, comment }),
    });
  },

  // --- Helpdesk Endpoints (Student Issue Tracking & Simulated Support) ---
  async getHelpdeskTickets() {
    if (USE_MOCK_API) return db.getHelpdeskTickets();
    return request<any[]>('/helpdesk');
  },

  async getHelpdeskTicket(id: string) {
    if (USE_MOCK_API) return db.getHelpdeskTicketById(id);
    return request<any>(`/helpdesk/${id}`);
  },

  async createHelpdeskTicket(input: {
    category: any;
    priority: any;
    title: string;
    description: string;
    location: string;
    attachments?: any[];
  }) {
    if (USE_MOCK_API) return db.createHelpdeskTicket(input);
    return request<any>('/helpdesk', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async addHelpdeskComment(ticketId: string, message: string) {
    if (USE_MOCK_API) return db.addHelpdeskComment(ticketId, message);
    return request<any>(`/helpdesk/${ticketId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  async updateHelpdeskTicket(ticketId: string, action: 'reopen' | 'close', rating?: number) {
    if (USE_MOCK_API) return db.updateHelpdeskTicket(ticketId, action, rating);
    return request<any>(`/helpdesk/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action, rating }),
    });
  },
};
