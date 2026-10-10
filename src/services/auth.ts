// Authentication & Security Service for CampusConnect (Student Portal)
// Exclusively student-scoped: No faculty or admin roles or privileges.
import bcrypt from 'bcryptjs';
import { db } from './db';
import type { User } from './db';

const JWT_SECRET = 'campusconnect-student-portal-jwt-2026';
const TOKEN_KEY = 'campusconnect_auth_token';
const USER_KEY = 'campusconnect_auth_user';

export const COLLEGE_EMAIL_DOMAIN =
  import.meta.env.VITE_COLLEGE_EMAIL_DOMAIN || '@college.edu';

export const IS_DEMO_ENABLED =
  import.meta.env.VITE_ENABLE_DEMO !== 'false' &&
  import.meta.env.VITE_ENABLE_DEMO !== false;

function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(escape(atob(base64)));
}

function generateSignature(headerAndPayload: string): string {
  let hash = 0;
  const input = `${headerAndPayload}.${JWT_SECRET}`;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return base64UrlEncode(`sig_student_${Math.abs(hash).toString(36)}`);
}

export interface JWTPayload {
  sub: string;
  id: string;
  email: string;
  registerNumber: string;
  name: string;
  department: string;
  semester: number;
  exp: number;
}

export function createJWT(user: User): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadData: JWTPayload = {
    sub: user.id,
    id: user.id,
    email: user.email,
    registerNumber: user.registerNumber,
    name: user.name,
    department: user.department,
    semester: user.semester,
    exp: Math.floor(Date.now() / 1000) + 7 * 86400, // 7 days
  };
  const payload = base64UrlEncode(JSON.stringify(payloadData));
  const signature = generateSignature(`${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, sig] = parts;
    const expectedSig = generateSignature(`${header}.${payload}`);
    if (sig !== expectedSig) return null;

    const data: JWTPayload = JSON.parse(base64UrlDecode(payload));
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

// In-memory sliding window rate limiter (max 5 requests per 60 seconds)
const rateLimitStore: Record<string, { timestamps: number[] }> = {};

function checkRateLimit(key: string, maxAttempts = 5, windowSeconds = 60): boolean {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  if (!rateLimitStore[key]) {
    rateLimitStore[key] = { timestamps: [now] };
    return true;
  }

  rateLimitStore[key].timestamps = rateLimitStore[key].timestamps.filter(
    (t) => now - t < windowMs
  );

  if (rateLimitStore[key].timestamps.length >= maxAttempts) {
    return false;
  }

  rateLimitStore[key].timestamps.push(now);
  return true;
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
  identifier: string; // email or register number
  password: string;
}

export const authService = {
  // Student registration endpoint
  async register(input: RegisterInput): Promise<{ success: boolean; message: string }> {
    if (!checkRateLimit(`reg_${input.email.toLowerCase()}`, 5, 60)) {
      throw new Error('Too many registration attempts. Please wait a minute and try again.');
    }

    const cleanEmail = input.email.trim().toLowerCase();
    const cleanRegNo = input.registerNumber.trim().toUpperCase();
    const cleanName = input.name.trim();

    // 1. Validate college email domain
    const expectedDomain = COLLEGE_EMAIL_DOMAIN.toLowerCase();
    if (!cleanEmail.endsWith(expectedDomain)) {
      throw new Error(`College email must belong to ${expectedDomain}`);
    }

    // 2. Validate password length
    if (!input.password || input.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    // 3. Reject any unauthorized role request (server-side check)
    if (input.role && input.role !== 'student') {
      throw new Error('Unauthorized role request. Only student accounts are permitted.');
    }

    // 4. Check if account already exists
    const currentUser = db.getUser();
    if (
      currentUser.email.toLowerCase() === cleanEmail ||
      currentUser.registerNumber.toUpperCase() === cleanRegNo
    ) {
      throw new Error('An account already exists. Sign in instead.');
    }

    // 5. Verify against college student enrollment records (whitelist)
    const whitelist = db.getStudentRecordWhitelist();
    const isEnrolled = whitelist.find(
      (r) =>
        r.registerNumber.toUpperCase() === cleanRegNo &&
        r.email.toLowerCase() === cleanEmail
    );

    if (!isEnrolled) {
      throw new Error("We couldn't find you in the college records. Contact your admin.");
    }

    // 6. Hash password with bcrypt
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(input.password, salt);

    // 7. Initialize student user
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      registerNumber: cleanRegNo,
      department: input.department.trim() || isEnrolled.department,
      semester: Number(input.semester) || isEnrolled.semester,
      passwordHash,
      settings: currentUser.settings,
      createdAt: new Date().toISOString(),
    };

    db.updateUserProfile(newUser);

    return {
      success: true,
      message: 'Account registered successfully! Please sign in with your credentials.',
    };
  },

  // Student login
  async login(input: LoginInput): Promise<{ user: User; token: string }> {
    const cleanId = input.identifier.trim().toLowerCase();

    if (!checkRateLimit(`login_${cleanId}`, 5, 60)) {
      throw new Error('Too many login attempts. Please wait 60 seconds before trying again.');
    }

    const user = db.getUser();
    const matches =
      user.email.toLowerCase() === cleanId ||
      user.registerNumber.toLowerCase() === cleanId;

    if (!matches) {
      throw new Error('Invalid email/register number or password.');
    }

    const isValid = bcrypt.compareSync(input.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email/register number or password.');
    }

    const token = createJWT(user);
    this.setSession(user, token);

    return { user, token };
  },

  // Instant Demo Student Login
  async loginAsDemo(): Promise<{ user: User; token: string }> {
    if (!IS_DEMO_ENABLED) {
      throw new Error('Demo login is disabled in this environment.');
    }

    const demoUser = db.getUser();
    const token = createJWT(demoUser);
    this.setSession(demoUser, token);

    return { user: demoUser, token };
  },

  setSession(user: User, token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  },

  getCurrentUser(): User | null {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;
      const payload = verifyJWT(token);
      if (!payload) {
        this.logout();
        return null;
      }
      return db.getUser();
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  logout() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  },
};
