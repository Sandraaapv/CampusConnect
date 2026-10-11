import React, { useState, useRef, useEffect } from 'react';
import { Search, KeyRound, MailCheck, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';
import { AuthLayout, type MascotPose } from '../components/auth/AuthLayout';
import { PasswordStrengthMeter } from '../components/auth/PasswordStrengthMeter';
import { OtpInput } from '../components/auth/OtpInput';
import { authService, type StudentRecordDetails } from '../services/auth';
import { navigate } from '../utils/navigation';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 State: Register number lookup
  const [registerNumber, setRegisterNumber] = useState('');
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);

  // Step 2 State: Verification & Confirmation
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentRecordDetails | null>(null);
  const [isAccountAlreadyExists, setIsAccountAlreadyExists] = useState(false);

  // Step 3 State: Password & Terms
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  const regNoInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const mascotPose: MascotPose =
    step === 1 ? 'waving' : step === 2 ? 'thinking' : 'celebrating';

  // -------------------------------------------------------------------------
  // STEP 1: Find your record
  // -------------------------------------------------------------------------
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAccountAlreadyExists(false);

    const cleanReg = registerNumber.trim().toUpperCase();
    if (!cleanReg) {
      setError('Please enter your register number.');
      regNoInputRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      const res = await authService.sendRegistrationCode(cleanReg);
      setMaskedEmail(res.maskedEmail);
      setInfoNotice(res.message);
      setResendCooldown(60);
      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to send verification code. Please try again.';
      setError(msg);
      regNoInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // STEP 2: Verify 6-digit code
  // -------------------------------------------------------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAccountAlreadyExists(false);

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.verifyRegistrationCode(registerNumber.trim().toUpperCase(), otp);
      setRegistrationToken(res.registrationToken);
      setStudentDetails(res.student);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed.';
      if (msg.toLowerCase().includes('already exists')) {
        setIsAccountAlreadyExists(true);
        setError('An account already exists. Sign in instead.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || loading) return;
    try {
      setError(null);
      setIsAccountAlreadyExists(false);
      setLoading(true);
      const res = await authService.sendRegistrationCode(registerNumber.trim().toUpperCase());
      setMaskedEmail(res.maskedEmail);
      setInfoNotice(res.message);
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToStep1 = () => {
    setStep(1);
    setOtp('');
    setRegistrationToken(null);
    setStudentDetails(null);
    setError(null);
    setIsAccountAlreadyExists(false);
  };

  // -------------------------------------------------------------------------
  // STEP 3: Create password & complete registration
  // -------------------------------------------------------------------------
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 10) {
      setError('Password must be at least 10 characters long.');
      passwordInputRef.current?.focus();
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      confirmPasswordInputRef.current?.focus();
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the Terms of Service and Privacy Notice.');
      return;
    }

    if (!registrationToken) {
      setError('Session expired. Please verify your code again.');
      setStep(2);
      return;
    }

    try {
      setLoading(true);
      await authService.completeRegistration({
        registrationToken,
        registerNumber: registerNumber.trim().toUpperCase(),
        password,
        termsAccepted: true,
      });

      // On success, redirect to dashboard or login with success notice
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Account creation failed.';
      setError(msg);
      passwordInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Student Registration"
      subtitle="Activate your student portal access using official college credentials."
      mascotPose={mascotPose}
      mascotTagline={
        step === 1
          ? 'Step 1 of 3: Enter your register number to find your record.'
          : step === 2
          ? 'Step 2 of 3: Enter the 6-digit verification code sent to your college email.'
          : 'Step 3 of 3: Create a strong password to complete your account setup.'
      }
    >
      {/* 3-Step Progress Indicator */}
      <div className="mb-8" role="region" aria-label="Registration Progress">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[var(--app-border)] -translate-y-1/2 -z-0" />

          {/* Step 1 Pill */}
          <div className="flex flex-col items-center gap-1.5 relative z-10">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition ${
                step >= 1
                  ? 'bg-amber-400 text-black shadow-sm ring-4 ring-amber-400/20'
                  : 'bg-[var(--app-surface-subtle)] text-[var(--app-text-muted)] border border-[var(--app-border)]'
              }`}
            >
              <Search className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
              1. Find Record
            </span>
          </div>

          {/* Step 2 Pill */}
          <div className="flex flex-col items-center gap-1.5 relative z-10">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition ${
                step >= 2
                  ? 'bg-amber-400 text-black shadow-sm ring-4 ring-amber-400/20'
                  : 'bg-[var(--app-surface-subtle)] text-[var(--app-text-muted)] border border-[var(--app-border)]'
              }`}
            >
              <MailCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
              2. Verify
            </span>
          </div>

          {/* Step 3 Pill */}
          <div className="flex flex-col items-center gap-1.5 relative z-10">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition ${
                step === 3
                  ? 'bg-amber-400 text-black shadow-sm ring-4 ring-amber-400/20'
                  : 'bg-[var(--app-surface-subtle)] text-[var(--app-text-muted)] border border-[var(--app-border)]'
              }`}
            >
              <KeyRound className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
              3. Password
            </span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs sm:text-sm font-bold flex items-start gap-2.5"
          aria-live="polite"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{error}</span>
            {isAccountAlreadyExists && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-1 text-xs font-black underline hover:text-amber-500 cursor-pointer"
                >
                  <span>Sign in now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 1: FIND YOUR RECORD
          ========================================================================= */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-4">
          <div>
            <label
              htmlFor="reg-regno"
              className="block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5"
            >
              Register number
            </label>
            <input
              id="reg-regno"
              ref={regNoInputRef}
              type="text"
              required
              autoFocus
              autoComplete="username"
              value={registerNumber}
              onChange={(e) => setRegisterNumber(e.target.value.trim().toUpperCase())}
              placeholder="e.g. 21CSC105"
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-2xl border border-[var(--app-border)] text-base font-bold uppercase tracking-wider focus:ring-2 focus:ring-[var(--app-text)] outline-none transition bg-[var(--app-surface-subtle)] text-[var(--app-text)] placeholder-[var(--app-text-muted)]/50 min-h-[44px]"
            />
          </div>

          <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
            We will check college records and send a one-time verification code directly to your official college email.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black text-sm hover:opacity-90 transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Send verification code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* =========================================================================
          STEP 2: VERIFY
          ========================================================================= */}
      {step === 2 && !studentDetails && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-500 mb-3">
              <MailCheck className="w-7 h-7" />
            </div>
            <h3 className="portal-heading text-lg font-black text-[var(--app-text)]">
              Enter verification code
            </h3>
            {maskedEmail ? (
              <p className="text-xs sm:text-sm text-[var(--app-text-muted)] mt-1.5 max-w-sm mx-auto">
                We sent a 6-digit verification code to{' '}
                <span className="font-mono font-bold text-[var(--app-text)]">
                  {maskedEmail}
                </span>
                . The code expires in 10 minutes.
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-[var(--app-text-muted)] mt-1.5 max-w-sm mx-auto">
                {infoNotice || 'If this register number is eligible, we sent a code to the college email on record.'}
              </p>
            )}
          </div>

          {/* 6-Digit OTP Box */}
          <div className="py-1">
            <OtpInput
              value={otp}
              onChange={setOtp}
              disabled={loading}
              error={Boolean(error && !isAccountAlreadyExists)}
            />
          </div>

          {/* Resend Cooldown */}
          <div className="text-xs text-[var(--app-text-muted)] flex items-center justify-center gap-2">
            <span>Didn't receive the email?</span>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || loading}
              className="font-bold text-[var(--app-text)] hover:underline cursor-pointer disabled:opacity-50 min-h-[44px] inline-flex items-center"
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetToStep1}
              disabled={loading}
              className="py-3.5 px-5 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-xs font-bold text-[var(--app-text)] transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex-1 py-3.5 px-6 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black text-sm hover:opacity-90 transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          STEP 2: CONFIRM OFFICIAL DETAILS ("Is this you?")
          ========================================================================= */}
      {step === 2 && studentDetails && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500 mb-3">
              <UserCheck className="w-7 h-7" />
            </div>
            <h3 className="portal-heading text-xl font-black text-[var(--app-text)]">
              Is this you?
            </h3>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)] mt-1">
              We found your official college academic record. Please confirm your details.
            </p>
          </div>

          {/* Official Record Card (Read-Only) */}
          <div className="p-5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] space-y-3.5 shadow-sm">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                Student Full Name
              </span>
              <p className="text-base font-extrabold text-[var(--app-text)]">
                {studentDetails.name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--app-border)]/60">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                  Register Number
                </span>
                <p className="text-sm font-mono font-bold text-[var(--app-text)]">
                  {studentDetails.registerNumber}
                </p>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                  Semester
                </span>
                <p className="text-sm font-bold text-[var(--app-text)]">
                  Semester {studentDetails.semester}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--app-border)]/60">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                Department
              </span>
              <p className="text-sm font-semibold text-[var(--app-text)]">
                {studentDetails.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetToStep1}
              className="flex-1 py-3.5 px-5 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-xs font-bold text-[var(--app-text)] transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <span>Not me</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep(3);
              }}
              className="flex-1 py-3.5 px-6 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black text-sm hover:opacity-90 transition shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <span>Yes, continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: CREATE YOUR PASSWORD
          ========================================================================= */}
      {step === 3 && (
        <form onSubmit={handleStep3Submit} className="space-y-4">
          <div>
            <label
              htmlFor="reg-password"
              className="block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5"
            >
              Create Account Password
            </label>
            <input
              id="reg-password"
              ref={passwordInputRef}
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={loading}
              className="w-full px-4 py-3 rounded-2xl border border-[var(--app-border)] text-sm font-medium focus:ring-2 focus:ring-[var(--app-text)] outline-none transition bg-[var(--app-surface-subtle)] text-[var(--app-text)] placeholder-[var(--app-text-muted)]/50 min-h-[44px]"
            />
          </div>

          <div>
            <label
              htmlFor="reg-confirmpass"
              className="block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5"
            >
              Confirm Password
            </label>
            <input
              id="reg-confirmpass"
              ref={confirmPasswordInputRef}
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={loading}
              className="w-full px-4 py-3 rounded-2xl border border-[var(--app-border)] text-sm font-medium focus:ring-2 focus:ring-[var(--app-text)] outline-none transition bg-[var(--app-surface-subtle)] text-[var(--app-text)] placeholder-[var(--app-text-muted)]/50 min-h-[44px]"
            />
          </div>

          {/* Live Password Strength Meter */}
          <PasswordStrengthMeter
            password={password}
            identifier={registerNumber}
            name={studentDetails?.name}
          />

          {/* Terms & Privacy Notice Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-[var(--app-text)] cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded accent-amber-500 cursor-pointer shrink-0"
              />
              <span className="leading-relaxed">
                I accept the{' '}
                <a
                  href="/terms"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/terms');
                  }}
                  className="font-bold underline hover:text-amber-500"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/privacy');
                  }}
                  className="font-bold underline hover:text-amber-500"
                >
                  Privacy Notice
                </a>
                .
              </span>
            </label>
          </div>

          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={loading}
              className="py-3 px-5 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-xs font-bold text-[var(--app-text)] transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              disabled={loading || !acceptedTerms}
              className="flex-1 py-3.5 px-6 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black text-sm hover:opacity-90 transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Create account</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Quiet Link to Sign In */}
      <div className="mt-6 text-center pt-4 border-t border-[var(--app-border)]">
        <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-black text-[var(--app-text)] hover:underline cursor-pointer"
          >
            Sign in instead
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};
