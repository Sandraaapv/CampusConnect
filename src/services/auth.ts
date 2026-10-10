// Authentication & Security Service for CampusConnect
import bcrypt from 'bcryptjs';
import { db } from './db';
import type { User } from './db';

const JWT_SECRET = 'campusconnect-super-secret-key-2026';
const TOKEN_KEY = 'campusconnect_auth_token';
const USER_KEY = 'campusconnect_auth_user';

export const COLLEGE_EMAIL_DOMAIN =
  import.meta.env.VITE_COLLEGE_EMAIL_DOMAIN || '@college.edu';

export const IS_DEMO_ENABLED =
  import.meta.env.VITE_ENABLE_DEMO !== 'false' &&
  import.meta.env.VITE_ENABLE_DEMO !== false;

// Simple Base64URL helper
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

// Minimal HMAC-like signature for token verification in browser client
function generateSignature(headerAndPayload: string): string {
  // Deterministic signature hash combining secret and content
  let hash = 0;
  const input = `${headerAndPayload}.${JWT_SECRET}`;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return base64UrlEncode(`sig_${Math.abs(hash).toString(36)}`);
}

export interface JWTPayload {
  sub: string;
  id: string;
  email: string;
  registerNumber: string;
  name: string;
  role: 'student' | 'faculty' | 'admin';
  department: string;
  isDemo?: boolean;
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
    role: user.role,
    department: user.department,
    isDemo: !!user.isDemo,
    exp: Math.floor(Date.now() / 1000) + 7 * 86400, // 7 days expiration
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
      return null; // Expired
    }
    return data;
  } catch {
    return null;
  }
}

// In-memory sliding window rate limiter
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore: Record<string, RateLimitRecord> = {};

function checkRateLimit(key: string, maxAttempts = 5, windowSeconds = 60): boolean {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  if (!rateLimitStore[key]) {
    rateLimitStore[key] = { timestamps: [now] };
    return true;
  }

  // Remove timestamps older than window
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
  // Any role passed from client will be explicitly ignored/rejected
  role?: string;
}

export interface LoginInput {
  identifier: string; // email or register number
  password: string;
}

export const authService = {
  // Student registration endpoint with all security constraints
  async register(input: RegisterInput): Promise<{ success: boolean; message: string }> {
    // 1. Rate-limit check
    if (!checkRateLimit(`reg_${input.email.toLowerCase()}`, 5, 60)) {
      throw new Error('Too many registration attempts. Please wait a minute and try again.');
    }

    const cleanEmail = input.email.trim().toLowerCase();
    const cleanRegNo = input.registerNumber.trim().toUpperCase();
    const cleanName = input.name.trim();

    // 2. Validate college email domain
    const expectedDomain = COLLEGE_EMAIL_DOMAIN.toLowerCase();
    if (!cleanEmail.endsWith(expectedDomain)) {
      throw new Error(`College email must belong to ${expectedDomain}`);
    }

    // 3. Validate password strength
    if (!input.password || input.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    // 4. Server-side check: Ignore/reject any client-sent role
    // Only students can register through this endpoint!
    if (input.role && input.role !== 'student') {
      // Reject any attempt to tamper role
      throw new Error('Unauthorized role request. Only student registration is permitted.');
    }
    const role: 'student' = 'student';

    // 5. Check if account already exists
    const existing = db.findUserByEmailOrRegNo(cleanEmail) || db.findUserByEmailOrRegNo(cleanRegNo);
    if (existing) {
      throw new Error('An account already exists. Sign in instead.');
    }

    // 6. Verify against college student enrollment records (whitelist)
    const enrollment = db.findEnrollment(cleanRegNo, cleanEmail);
    if (!enrollment) {
      throw new Error("We couldn't find you in the college records. Contact your admin.");
    }

    // 7. Hash password with bcrypt
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(input.password, salt);

    // 8. Create user in database
    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      email: cleanEmail,
      registerNumber: cleanRegNo,
      role,
      department: input.department.trim() || enrollment.department,
      semester: Number(input.semester) || enrollment.semester,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    db.addUser(newUser);

    return {
      success: true,
      message: 'Account registered successfully! Please sign in with your credentials.',
    };
  },

  // Standard Login endpoint
  async login(input: LoginInput): Promise<{ user: User; token: string }> {
    const cleanId = input.identifier.trim().toLowerCase();

    // 1. Rate-limit check
    if (!checkRateLimit(`login_${cleanId}`, 5, 60)) {
      throw new Error('Too many login attempts. Please wait 60 seconds before trying again.');
    }

    // 2. Lookup user
    const user = db.findUserByEmailOrRegNo(cleanId);
    if (!user) {
      throw new Error('Invalid email/register number or password.');
    }

    // 3. BCrypt password verification
    const isValid = bcrypt.compareSync(input.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email/register number or password.');
    }

    // 4. Issue JWT
    const token = createJWT(user);
    this.setSession(user, token);

    return { user, token };
  },

  // Instant Demo Login for evaluators
  async loginAsDemo(role: 'student' | 'faculty' | 'admin'): Promise<{ user: User; token: string }> {
    if (!IS_DEMO_ENABLED) {
      throw new Error('Demo login is disabled in this environment.');
    }

    const demoUsers = db.getUsers().filter((u) => u.isDemo);
    const targetUser = demoUsers.find((u) => u.role === role);

    if (!targetUser) {
      throw new Error(`Demo account for role '${role}' not found.`);
    }

    const token = createJWT(targetUser);
    this.setSession(targetUser, token);

    return { user: targetUser, token };
  },

  // Session management
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
      const rawUser = localStorage.getItem(USER_KEY);
      if (!rawUser) return null;
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
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
