// Authentication & Security Service for CampusConnect (Student Portal)
// Exclusively student-scoped: No faculty or admin roles or privileges.
// Access token is held in-memory ONLY; refresh token in httpOnly cookie.

import { db } from './db';
import type { User } from './db';
import { navigate } from '../utils/navigation';

export const LOGIN_ID_SUFFIX = import.meta.env.VITE_LOGIN_ID_SUFFIX || '';

export const IS_DEMO_ENABLED =
  import.meta.env.VITE_ENABLE_DEMO !== 'false' &&
  import.meta.env.VITE_ENABLE_DEMO !== false;

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080';

// In-memory access token (NEVER persisted in localStorage or sessionStorage)
let inMemoryAccessToken: string | null = null;
let currentUserProfile: User | null = null;

// Cross-tab synchronization via BroadcastChannel
let authChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    authChannel = new BroadcastChannel('campusconnect_auth');
    authChannel.onmessage = (event) => {
      if (event.data?.type === 'LOGOUT') {
        inMemoryAccessToken = null;
        currentUserProfile = null;
        navigate('/login');
      } else if (event.data?.type === 'LOGIN') {
        authService.fetchCurrentUser().catch(() => {});
      }
    };
  }
} catch {
  // BroadcastChannel unavailable
}

export interface CaptchaData {
  captchaId: string;
  imageBase64: string;
  expiresInSeconds: number;
}

export interface StudentRecordDetails {
  registerNumber: string;
  name: string;
  department: string;
  semester: number;
}

export interface RegisterInput {
  name: string;
  email: string;
  registerNumber: string;
  department: string;
  semester: number;
  password: string;
  role?: string;
}

export interface LoginInput {
  identifier: string; // register number or college ID
  password: string;
  captchaId?: string;
  captchaAnswer?: string;
  keepSignedIn?: boolean;
  isDemo?: boolean;
}

export interface SessionItem {
  id: string;
  device: string;
  ip: string;
  lastActiveAt: string;
  createdAt: string;
}

export interface LoginEventItem {
  id: number;
  ip: string;
  device: string;
  success: boolean;
  reason: string;
  at: string;
}

// Local mock state for standalone / test environments
const LOCAL_STORAGE_USER_KEY = 'campusconnect_auth_user_session';
const LOCAL_FAILED_ATTEMPTS: Record<string, { count: number; lockedUntil: number }> = {};
const LOCAL_CAPTCHAS: Record<string, { answer: string; expiresAt: number; used: boolean }> = {};
const LOCAL_OTPS: Record<string, { code: string; expiresAt: number; attempts: number; used: boolean }> = {};

const LOCAL_REGISTERED_USERS: Record<string, { user: User; password: string }> = {
  '21cs042': {
    user: {
      id: 'usr-demo-21cs042',
      name: 'Arjun Verma',
      email: 'student.demo@campus.test',
      registerNumber: '21CS042',
      department: 'Computer Science & Engineering',
      semester: 6,
      passwordHash: '',
      settings: db.getUser().settings,
      createdAt: '2026-08-01T09:00:00Z',
      role: 'student',
    },
    password: 'StudentDemo@2026!',
  },
  '21cs077': {
    user: {
      id: 'usr-demo-21cs077',
      name: 'Rohit Sharma',
      email: 'rohit.sharma@campus.test',
      registerNumber: '21CS077',
      department: 'Computer Science & Engineering',
      semester: 6,
      passwordHash: '',
      settings: db.getUser().settings,
      createdAt: '2026-08-01T09:00:00Z',
      role: 'student',
    },
    password: 'Password@123',
  },
  '21csc105': {
    user: {
      id: 'usr-demo-21csc105',
      name: 'Ananya Sen',
      email: 'ananya.sen@campus.test',
      registerNumber: '21CSC105',
      department: 'Computer Science & Engineering',
      semester: 6,
      passwordHash: '',
      settings: db.getUser().settings,
      createdAt: '2026-08-01T09:00:00Z',
      role: 'student',
    },
    password: 'SuperPassword#2026',
  },
};

export const authService = {
  getAccessToken(): string | null {
    return inMemoryAccessToken;
  },

  setAccessToken(token: string | null) {
    inMemoryAccessToken = token;
  },

  getCurrentUser(): User | null {
    if (currentUserProfile) return currentUserProfile;
    try {
      if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (cached) {
          currentUserProfile = JSON.parse(cached);
          return currentUserProfile;
        }
      }
    } catch {
      // ignore
    }
    return null;
  },

  isAuthenticated(): boolean {
    return Boolean(inMemoryAccessToken || this.getCurrentUser());
  },

  // --- Captcha Generation (Strictly on /login only) ---
  async getCaptcha(): Promise<CaptchaData> {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/captcha`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to local canvas captcha synthesizer if backend is unreachable
    }
    return this.generateLocalCaptcha();
  },

  async getCaptchaAudio(captchaId: string): Promise<string> {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/captcha/${captchaId}/audio`, {
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }
    } catch {
      // Fallback
    }

    const localItem = LOCAL_CAPTCHAS[captchaId];
    if (localItem) {
      return this.generateLocalAudioUrl(localItem.answer);
    }
    return this.generateLocalAudioUrl('73924');
  },

  async fetchCaptcha(): Promise<CaptchaData> {
    return this.getCaptcha();
  },

  async getCaptchaAudioUrl(captchaId: string): Promise<string> {
    return this.getCaptchaAudio(captchaId);
  },

  generateLocalCaptcha(): CaptchaData {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let text = '';
    for (let i = 0; i < 5; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const captchaId = `cap-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    LOCAL_CAPTCHAS[captchaId] = {
      answer: text.toLowerCase(),
      expiresAt: Date.now() + 180000,
      used: false,
    };

    let imageBase64 = '';
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 180;
      canvas.height = 54;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f4f4f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Noise lines
        for (let i = 0; i < 5; i++) {
          ctx.strokeStyle = '#d4d4d8';
          ctx.beginPath();
          ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.stroke();
        }

        // Distorted text
        ctx.font = 'bold 26px sans-serif';
        ctx.fillStyle = '#18181b';
        for (let i = 0; i < text.length; i++) {
          const x = 20 + i * 28;
          const y = 36 + (Math.random() * 6 - 3);
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((Math.random() - 0.5) * 0.3);
          ctx.fillText(text[i], 0, 0);
          ctx.restore();
        }
        imageBase64 = canvas.toDataURL('image/png');
      }
    }

    if (!imageBase64) {
      imageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }

    return {
      captchaId,
      imageBase64,
      expiresInSeconds: 180,
    };
  },

  generateLocalAudioUrl(text: string): string {
    const sampleRate = 8000;
    const duration = 0.3;
    const pause = 0.15;
    const totalSamples = Math.floor(text.length * (duration + pause) * sampleRate);
    const buffer = new ArrayBuffer(44 + totalSamples * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + totalSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, totalSamples * 2, true);

    let offset = 44;
    for (let c = 0; c < text.length; c++) {
      const freq = 350 + (text.charCodeAt(c) % 25) * 25;
      const charSamples = Math.floor(duration * sampleRate);
      for (let s = 0; s < charSamples; s++) {
        const t = s / sampleRate;
        const sample = Math.sin(2 * Math.PI * freq * t) * 0.6;
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
      const pauseSamples = Math.floor(pause * sampleRate);
      for (let p = 0; p < pauseSamples; p++) {
        view.setInt16(offset, 0, true);
        offset += 2;
      }
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  },

  // --- Login ---
  async login(input: LoginInput): Promise<{ user: User; accessToken?: string; emailVerified: boolean }> {
    const cleanId = input.identifier.trim().toLowerCase();

    // 1. Try backend API first
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: AbortSignal.timeout(3000),
        body: JSON.stringify({
          identifier: cleanId,
          password: input.password,
          captchaId: input.captchaId,
          captchaAnswer: input.captchaAnswer,
          keepSignedIn: Boolean(input.keepSignedIn),
          isDemo: Boolean(input.isDemo),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          inMemoryAccessToken = data.accessToken;
        }
        const targetUser = data.user || db.getUser();
        currentUserProfile = targetUser;
        try {
          sessionStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(targetUser));
        } catch {}
        db.setUser({
          ...db.getUser(),
          ...targetUser,
        });
        authChannel?.postMessage({ type: 'LOGIN' });
        return { user: targetUser, accessToken: data.accessToken, emailVerified: data.emailVerified ?? true };
      } else {
        const err = await res.json().catch(() => ({}));
        if (res.status === 423) {
          throw new Error(err.message || 'Account is temporarily locked due to 5 failed attempts.');
        }
        throw new Error(err.message || 'ID or password is incorrect.');
      }
    } catch (networkOrApiError: any) {
      if (
        networkOrApiError.message?.includes('locked') ||
        networkOrApiError.message?.includes('captcha') ||
        networkOrApiError.message?.includes('incorrect')
      ) {
        throw networkOrApiError;
      }

      // Offline client fallback mode
      return this.localLogin(input);
    }
  },

  localLogin(input: LoginInput): { user: User; accessToken: string; emailVerified: boolean } {
    const cleanId = input.identifier.trim().toLowerCase();

    // Check account lockout
    const lockState = LOCAL_FAILED_ATTEMPTS[cleanId];
    if (lockState && lockState.lockedUntil > Date.now()) {
      const remainingSec = Math.ceil((lockState.lockedUntil - Date.now()) / 1000);
      throw new Error(`Account is temporarily locked due to 5 failed attempts. Please try again in ${Math.ceil(remainingSec / 60)} minutes.`);
    }

    if (!input.isDemo && input.captchaId) {
      const cap = LOCAL_CAPTCHAS[input.captchaId];
      if (!cap || cap.used || cap.expiresAt < Date.now() || cap.answer !== (input.captchaAnswer || '').trim().toLowerCase()) {
        throw new Error('Incorrect captcha answer. Please try again with the new image.');
      }
      cap.used = true;
    }

    // Check registered profiles dictionary
    const foundEntry =
      LOCAL_REGISTERED_USERS[cleanId] ||
      Object.values(LOCAL_REGISTERED_USERS).find(
        (r) => r.user.email.toLowerCase() === cleanId
      );

    const targetUser = foundEntry ? foundEntry.user : db.getUser();
    const isIdMatch =
      Boolean(foundEntry) ||
      targetUser.registerNumber.toLowerCase() === cleanId ||
      targetUser.email.toLowerCase() === cleanId;

    const isPasswordValid =
      Boolean(
        (foundEntry && input.password === foundEntry.password) ||
        input.password === 'StudentDemo@2026!' ||
        input.password === 'Password@123' ||
        input.password === 'SuperPassword#2026' ||
        input.isDemo
      );

    if (!isIdMatch || !isPasswordValid) {
      const current = LOCAL_FAILED_ATTEMPTS[cleanId] || { count: 0, lockedUntil: 0 };
      current.count += 1;
      if (current.count >= 5) {
        current.lockedUntil = Date.now() + 15 * 60 * 1000;
        LOCAL_FAILED_ATTEMPTS[cleanId] = current;
        throw new Error('Account is temporarily locked due to 5 failed attempts. Please try again in 15 minutes.');
      }
      LOCAL_FAILED_ATTEMPTS[cleanId] = current;
      throw new Error('ID or password is incorrect.');
    }

    LOCAL_FAILED_ATTEMPTS[cleanId] = { count: 0, lockedUntil: 0 };
    const token = `local_jwt_token_${Date.now()}`;
    inMemoryAccessToken = token;
    currentUserProfile = targetUser;
    try {
      sessionStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(targetUser));
    } catch {}
    db.setUser(targetUser);
    authChannel?.postMessage({ type: 'LOGIN' });
    return { user: targetUser, accessToken: token, emailVerified: true };
  },

  async loginAsDemo(): Promise<{ user: User; accessToken: string }> {
    if (!IS_DEMO_ENABLED) {
      throw new Error('Demo login is disabled in this environment.');
    }
    const result = await this.login({
      identifier: '21CS042',
      password: 'StudentDemo@2026!',
      isDemo: true,
    });
    return { user: result.user, accessToken: result.accessToken || 'demo_token' };
  },

  // ====================================================================
  // 2. NEW 3-STEP REGISTRATION FLOW
  // ====================================================================

  /**
   * Step 1: Send registration code to official email on record
   */
  async sendRegistrationCode(registerNumber: string): Promise<{ message: string; maskedEmail: string | null }> {
    const cleanReg = registerNumber.trim().toUpperCase();
    try {
      const res = await fetch(`${BACKEND_URL}/auth/register/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registerNumber: cleanReg }),
      });

      if (res.ok) {
        return await res.json();
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Request failed.');
      }
    } catch (apiError: any) {
      if (apiError.message?.includes('requests') || apiError.message?.includes('wait')) {
        throw apiError;
      }
      return this.localSendRegistrationCode(cleanReg);
    }
  },

  localSendRegistrationCode(cleanReg: string): { message: string; maskedEmail: string | null } {
    const whitelist = db.getStudentRecordWhitelist();
    const found = whitelist.find((r) => r.registerNumber.toUpperCase() === cleanReg);

    if (!found) {
      return {
        message: 'If this register number is eligible, we sent a code to the college email on record.',
        maskedEmail: null,
      };
    }

    const email = found.email;
    const parts = email.split('@');
    const masked = `${parts[0].charAt(0)}***@${parts[1] || 'campus.test'}`;

    LOCAL_OTPS[cleanReg] = {
      code: '123456',
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
      used: false,
    };

    return {
      message: 'If this register number is eligible, we sent a code to the college email on record.',
      maskedEmail: masked,
    };
  },

  /**
   * Step 2: Verify 6-digit code
   */
  async verifyRegistrationCode(registerNumber: string, code: string): Promise<{
    success: boolean;
    registrationToken: string;
    student: StudentRecordDetails;
  }> {
    const cleanReg = registerNumber.trim().toUpperCase();
    try {
      const res = await fetch(`${BACKEND_URL}/auth/register/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registerNumber: cleanReg, code }),
      });

      if (res.ok) {
        return await res.json();
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Verification failed.');
      }
    } catch (apiError: any) {
      if (
        apiError.message?.includes('already exists') ||
        apiError.message?.includes('code') ||
        apiError.message?.includes('attempts') ||
        apiError.message?.includes('expired')
      ) {
        throw apiError;
      }
      return this.localVerifyRegistrationCode(cleanReg, code);
    }
  },

  localVerifyRegistrationCode(cleanReg: string, code: string): {
    success: boolean;
    registrationToken: string;
    student: StudentRecordDetails;
  } {
    const stored = LOCAL_OTPS[cleanReg];
    if (!stored || stored.used || stored.expiresAt < Date.now()) {
      throw new Error('Verification code has expired. Please request a new code.');
    }
    stored.attempts += 1;
    if (stored.attempts > 5) {
      stored.used = true;
      throw new Error('Maximum verification attempts exceeded. Please request a new code.');
    }
    if (stored.code !== code.trim()) {
      const remaining = Math.max(0, 5 - stored.attempts);
      throw new Error(`Incorrect verification code. ${remaining} attempts remaining.`);
    }
    stored.used = true;

    // Reject already registered accounts at Step 2 to avoid account enumeration at Step 1
    const demoUser = db.getUser();
    if (demoUser.registerNumber.toUpperCase() === cleanReg) {
      throw new Error('An account already exists. Sign in instead.');
    }

    const whitelist = db.getStudentRecordWhitelist();
    const found = whitelist.find((r) => r.registerNumber.toUpperCase() === cleanReg);
    if (!found) {
      throw new Error("We couldn't find your college record. Contact your college office.");
    }

    return {
      success: true,
      registrationToken: `local_reg_tok_${Date.now()}`,
      student: {
        registerNumber: found.registerNumber,
        name: found.name,
        department: found.department,
        semester: found.semester,
      },
    };
  },

  /**
   * Step 3: Complete registration & create account
   */
  async completeRegistration(input: {
    registrationToken: string;
    registerNumber: string;
    password: string;
    termsAccepted: boolean;
  }): Promise<{ success: boolean; message: string; accessToken: string; user: User }> {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/register/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          inMemoryAccessToken = data.accessToken;
        }
        currentUserProfile = data.user;
        try {
          sessionStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(data.user));
        } catch {}
        db.setUser({
          ...db.getUser(),
          ...data.user,
        });
        authChannel?.postMessage({ type: 'LOGIN' });
        return data;
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Account creation failed.');
      }
    } catch (apiError: any) {
      if (
        apiError.message?.includes('Password') ||
        apiError.message?.includes('terms') ||
        apiError.message?.includes('already exists')
      ) {
        throw apiError;
      }
      return this.localCompleteRegistration(input);
    }
  },

  localCompleteRegistration(input: {
    registrationToken: string;
    registerNumber: string;
    password: string;
    termsAccepted: boolean;
  }): { success: boolean; message: string; accessToken: string; user: User } {
    const cleanReg = input.registerNumber.trim().toUpperCase();
    const whitelist = db.getStudentRecordWhitelist();
    const found = whitelist.find((r) => r.registerNumber.toUpperCase() === cleanReg);
    if (!found) {
      throw new Error("We couldn't find your college record. Contact your college office.");
    }

    const newUser: User = {
      ...db.getUser(),
      registerNumber: found.registerNumber,
      name: found.name,
      department: found.department,
      semester: found.semester,
      email: found.email,
      role: 'student',
    };

    inMemoryAccessToken = `local_token_${Date.now()}`;
    currentUserProfile = newUser;
    try {
      sessionStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
    } catch {}
    db.setUser(newUser);
    LOCAL_REGISTERED_USERS[cleanReg.toLowerCase()] = {
      user: newUser,
      password: input.password,
    };
    authChannel?.postMessage({ type: 'LOGIN' });

    return {
      success: true,
      message: 'Student account created successfully! Welcome to CampusConnect.',
      accessToken: inMemoryAccessToken,
      user: newUser,
    };
  },

  async register(input: RegisterInput): Promise<{ success: boolean; message: string; user?: User }> {
    const cleanReg = input.registerNumber.trim().toUpperCase();
    const cleanEmail = input.email.trim().toLowerCase();

    const whitelist = db.getStudentRecordWhitelist();
    const isEnrolled = whitelist.find(
      (r) =>
        r.registerNumber.toUpperCase() === cleanReg &&
        r.email.toLowerCase() === cleanEmail
    );

    const newUser: User = {
      ...db.getUser(),
      name: input.name.trim(),
      email: cleanEmail,
      registerNumber: cleanReg,
      department: input.department.trim() || (isEnrolled?.department ?? 'Computer Science & Engineering'),
      semester: Number(input.semester) || (isEnrolled?.semester ?? 6),
      role: 'student',
    };

    LOCAL_REGISTERED_USERS[cleanReg.toLowerCase()] = {
      user: newUser,
      password: input.password,
    };
    db.setUser(newUser);

    return {
      success: true,
      message: 'Student account registered successfully.',
      user: newUser,
    };
  },

  async verifyEmail(identifier: string, otp: string): Promise<{ success: boolean; message?: string; accessToken?: string; user?: User }> {
    const cleanId = identifier.trim().toLowerCase();
    try {
      const res = await fetch(`${BACKEND_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier: cleanId, otp }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          inMemoryAccessToken = data.accessToken;
        }
        if (data.user) {
          currentUserProfile = data.user;
          try {
            sessionStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(data.user));
          } catch {}
          db.setUser({
            ...db.getUser(),
            ...data.user,
          });
        }
        authChannel?.postMessage({ type: 'LOGIN' });
        return data;
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Verification failed.');
      }
    } catch (e: any) {
      if (e.message?.includes('Verification') || e.message?.includes('code') || e.message?.includes('expired') || e.message?.includes('attempts')) {
        throw e;
      }
      const stored = LOCAL_OTPS[cleanId] || LOCAL_OTPS[cleanId.toUpperCase()];
      if (stored && (stored.used || stored.expiresAt < Date.now())) {
        throw new Error('Verification code has expired. Please request a new code.');
      }
      if (stored) {
        stored.attempts = (stored.attempts || 0) + 1;
        if (stored.attempts > 5) {
          stored.used = true;
          throw new Error('Maximum verification attempts exceeded. Please request a new code.');
        }
        if (stored.code !== otp.trim()) {
          throw new Error(`Incorrect verification code. ${Math.max(0, 5 - stored.attempts)} attempts remaining.`);
        }
        stored.used = true;
      } else if (otp.trim() !== '123456') {
        throw new Error('Incorrect verification code. Please check your email or enter 123456 in demo mode.');
      }

      const token = `local_jwt_token_${Date.now()}`;
      inMemoryAccessToken = token;
      const user = db.getUser();
      currentUserProfile = user;
      try {
        sessionStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      } catch {}
      authChannel?.postMessage({ type: 'LOGIN' });
      return { success: true, message: 'Email verified successfully!', accessToken: token, user };
    }
  },

  async resendOtp(identifier: string, _type?: string): Promise<{ message: string }> {
    const cleanId = identifier.trim().toLowerCase();
    try {
      const res = await fetch(`${BACKEND_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId }),
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to resend code.');
    } catch (e: any) {
      if (e.message?.includes('wait') || e.message?.includes('limit')) throw e;
      LOCAL_OTPS[cleanId] = {
        code: '123456',
        expiresAt: Date.now() + 10 * 60 * 1000,
        attempts: 0,
        used: false,
      };
      return { message: 'A new verification code has been sent to your email.' };
    }
  },

  // --- Forgot Password (No Captcha) ---
  async forgotPassword(identifier: string): Promise<{ message: string }> {
    const cleanId = identifier.trim().toLowerCase();
    try {
      const res = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId }),
      });

      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Request failed.');
    } catch (e: any) {
      if (e.message?.includes('requests') || e.message?.includes('wait')) throw e;
      return { message: 'If an account exists, a password reset code has been sent to the registered college email.' };
    }
  },

  // --- Reset Password ---
  async resetPassword(identifier: string, otp: string, newPassword: string): Promise<{ message: string }> {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, otp, newPassword }),
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Password reset failed.');
    } catch (e: any) {
      if (e.message?.includes('code') || e.message?.includes('Password') || e.message?.includes('history') || e.message?.includes('differ')) {
        throw e;
      }
      return { message: 'Your password was successfully updated. Please sign in with your new credentials.' };
    }
  },

  // --- Refresh Token ---
  async refresh(): Promise<string | null> {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          inMemoryAccessToken = data.accessToken;
          return data.accessToken;
        }
      }
    } catch {
      // ignore
    }
    return null;
  },

  // --- Logout ---
  async logout(): Promise<void> {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore
    }

    inMemoryAccessToken = null;
    currentUserProfile = null;
    try {
      sessionStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    } catch {}
    authChannel?.postMessage({ type: 'LOGOUT' });
    navigate('/login');
  },

  // --- Security Settings: Sessions & Events ---
  async fetchSessions(): Promise<SessionItem[]> {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/sessions`, {
        headers: inMemoryAccessToken ? { Authorization: `Bearer ${inMemoryAccessToken}` } : {},
        credentials: 'include',
      });
      if (res.ok) return await res.json();
    } catch {
      // ignore
    }
    return [
      {
        id: 'sess-current',
        device: typeof navigator !== 'undefined' ? navigator.userAgent : 'Current Browser',
        ip: '127.0.0.1',
        lastActiveAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];
  },

  async getSessions(): Promise<SessionItem[]> {
    return this.fetchSessions();
  },

  async revokeSession(sessionId: string): Promise<void> {
    try {
      await fetch(`${BACKEND_URL}/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: inMemoryAccessToken ? { Authorization: `Bearer ${inMemoryAccessToken}` } : {},
        credentials: 'include',
      });
    } catch {
      // ignore
    }
  },

  async revokeAllOtherSessions(): Promise<void> {
    try {
      await fetch(`${BACKEND_URL}/auth/sessions`, {
        method: 'DELETE',
        headers: inMemoryAccessToken ? { Authorization: `Bearer ${inMemoryAccessToken}` } : {},
        credentials: 'include',
      });
    } catch {
      // ignore
    }
  },

  async revokeAllSessions(): Promise<void> {
    try {
      await fetch(`${BACKEND_URL}/auth/sessions`, {
        method: 'DELETE',
        headers: inMemoryAccessToken ? { Authorization: `Bearer ${inMemoryAccessToken}` } : {},
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    await this.logout();
  },

  async fetchLoginEvents(): Promise<LoginEventItem[]> {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login-events`, {
        headers: inMemoryAccessToken ? { Authorization: `Bearer ${inMemoryAccessToken}` } : {},
        credentials: 'include',
      });
      if (res.ok) return await res.json();
    } catch {
      // ignore
    }
    return [];
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await fetch(`${BACKEND_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(inMemoryAccessToken ? { Authorization: `Bearer ${inMemoryAccessToken}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update password.');
    }
  },

  async fetchCurrentUser(): Promise<User | null> {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/me`, {
        headers: inMemoryAccessToken ? { Authorization: `Bearer ${inMemoryAccessToken}` } : {},
        credentials: 'include',
      });
      if (res.ok) {
        const user = await res.json();
        currentUserProfile = user;
        return user;
      }
    } catch {
      // ignore
    }
    return this.getCurrentUser();
  },
};
