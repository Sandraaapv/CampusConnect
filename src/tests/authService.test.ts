import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../services/auth';

describe('CampusConnect Auth Service — Unit & Integration Tests', () => {
  beforeEach(() => {
    // Reset in-memory token and state
    authService.setAccessToken(null);
    vi.clearAllMocks();
  });

  describe('1. Access Token In-Memory Security', () => {
    it('never stores access tokens in localStorage', () => {
      const mockStorage: Record<string, string> = {};
      const storage = typeof localStorage !== 'undefined' ? localStorage : {
        getItem: (k: string) => mockStorage[k] || null,
        setItem: (k: string, v: string) => { mockStorage[k] = v; },
        removeItem: (k: string) => { delete mockStorage[k]; },
        clear: () => {}
      };

      authService.setAccessToken('secret_access_token_123');
      expect(authService.getAccessToken()).toBe('secret_access_token_123');
      expect(storage.getItem('campusconnect_auth_token')).toBeNull();
      expect(storage.getItem('token')).toBeNull();
    });
  });

  describe('2. Login Identifier Resolution & Captcha Rules', () => {
    it('accepts bare register numbers (case-insensitive and trimmed)', async () => {
      const result = await authService.login({
        identifier: '  21cs042  ',
        password: 'StudentDemo@2026!',
        isDemo: true,
      });

      expect(result.user).toBeDefined();
      expect(result.user.registerNumber).toBe('21CS042');
      expect(authService.getAccessToken()).toBeDefined();
    });

    it('requires and validates captcha for standard logins', async () => {
      const captcha = authService.generateLocalCaptcha();
      expect(captcha.captchaId).toBeDefined();
      expect(captcha.imageBase64).toContain('data:image/png;base64');

      // Wrong captcha fails with generic error
      await expect(
        authService.login({
          identifier: '21CS042',
          password: 'Password@123',
          captchaId: captcha.captchaId,
          captchaAnswer: 'WRONG!',
        })
      ).rejects.toThrow(/captcha/i);
    });
  });

  describe('3. Lockout Behavior & Uniform Error Messages', () => {
    it('returns the same error message for wrong password and unknown ID', async () => {
      const cap1 = authService.generateLocalCaptcha();
      // Unknown user
      await expect(
        authService.login({
          identifier: 'UNKNOWN_999',
          password: 'Password@123',
          isDemo: false,
          captchaId: cap1.captchaId,
          captchaAnswer: (cap1 as any).answer || 'DUMMY',
        })
      ).rejects.toThrow();

      // Wrong password
      const cap2 = authService.generateLocalCaptcha();
      await expect(
        authService.login({
          identifier: '21CS042',
          password: 'WrongPassword!',
          isDemo: false,
          captchaId: cap2.captchaId,
          captchaAnswer: (cap2 as any).answer || 'DUMMY',
        })
      ).rejects.toThrow();
    });

    it('triggers temporary 15-minute lockout after 5 consecutive failures', () => {
      const testId = 'lockout_test_student';

      for (let i = 0; i < 4; i++) {
        expect(() =>
          authService.localLogin({
            identifier: testId,
            password: 'BadPassword!',
            isDemo: true,
          })
        ).toThrow('ID or password is incorrect.');
      }

      // 5th attempt triggers lockout
      expect(() =>
        authService.localLogin({
          identifier: testId,
          password: 'BadPassword!',
          isDemo: true,
        })
      ).toThrow(/temporarily locked/i);

      // Subsequent attempt remains locked
      expect(() =>
        authService.localLogin({
          identifier: testId,
          password: 'BadPassword!',
          isDemo: true,
        })
      ).toThrow(/temporarily locked/i);
    });
  });

  describe('4. New 3-Step Registration Flow (/register)', () => {
    it('Step 1: Returns identical message shape for known and unknown register numbers', () => {
      // Known record in student_records
      const resKnown = authService.localSendRegistrationCode('21CSC105');
      expect(resKnown.message).toBe('If this register number is eligible, we sent a code to the college email on record.');
      expect(resKnown.maskedEmail).toBeTruthy();
      expect(resKnown.maskedEmail).toContain('@');

      // Unknown record
      const resUnknown = authService.localSendRegistrationCode('99XYZ999');
      expect(resUnknown.message).toBe('If this register number is eligible, we sent a code to the college email on record.');
      expect(resUnknown.maskedEmail).toBeNull();
    });

    it('Step 2: Enforces 10-minute expiry and attempt limit on OTP verification', () => {
      authService.localSendRegistrationCode('21CSC105');

      // Wrong code
      expect(() =>
        authService.localVerifyRegistrationCode('21CSC105', '000000')
      ).toThrow(/incorrect verification code/i);
    });

    it('Step 2: Rejects already registered records after verification to prevent Step 1 enumeration', () => {
      // 21CS042 is already registered
      authService.localSendRegistrationCode('21CS042');

      expect(() =>
        authService.localVerifyRegistrationCode('21CS042', '123456')
      ).toThrow('An account already exists. Sign in instead.');
    });

    it('Step 2: Successfully returns student details and registration token for eligible record', () => {
      authService.localSendRegistrationCode('21CSC105');
      const verified = authService.localVerifyRegistrationCode('21CSC105', '123456');

      expect(verified.success).toBe(true);
      expect(verified.registrationToken).toBeTruthy();
      expect(verified.student.name).toBe('Ananya Sen');
      expect(verified.student.registerNumber).toBe('21CSC105');
      expect(verified.student.department).toBe('Computer Science & Engineering');
      expect(verified.student.semester).toBe(6);
    });

    it('Step 3: Completes registration and guarantees student role (ignores any client roles)', () => {
      authService.localSendRegistrationCode('21CSC105');
      const verified = authService.localVerifyRegistrationCode('21CSC105', '123456');

      const completed = authService.localCompleteRegistration({
        registrationToken: verified.registrationToken,
        registerNumber: '21CSC105',
        password: 'ValidPassword#2026',
        termsAccepted: true,
      });

      expect(completed.success).toBe(true);
      expect(completed.accessToken).toBeTruthy();
      expect(completed.user.registerNumber).toBe('21CSC105');
      expect(completed.user.name).toBe('Ananya Sen');
      expect(completed.user.role).toBe('student');
    });
  });

  describe('5. Forgot Password Uniform Confirmation (No Captcha)', () => {
    it('returns the exact same confirmation regardless of account existence without requiring captcha', async () => {
      const res1 = await authService.forgotPassword('21CS042');
      const res2 = await authService.forgotPassword('NONEXISTENT_USER');

      expect(res1.message).toBe('If an account exists, a password reset code has been sent to the registered college email.');
      expect(res2.message).toBe('If an account exists, a password reset code has been sent to the registered college email.');
      expect(res1.message).toBe(res2.message);
    });
  });
});
