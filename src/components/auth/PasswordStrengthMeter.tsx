import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  identifier?: string;
  name?: string;
}

const COMMON_PASSWORDS = [
  'password', 'password123', 'password@123', '1234567890', '12345678',
  'qwertyuiop', 'campusconnect', 'college123', 'student123', 'admin12345',
  'welcome123', 'letmein123', 'iloveyou123', 'monkey1234', 'dragon1234',
];

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  identifier = '',
  name = '',
}) => {
  const hasMinLength = password.length >= 10;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const cleanId = identifier.trim().toLowerCase();
  const cleanName = name.trim().toLowerCase();
  const lowerPass = password.toLowerCase();

  const notContainsId = !cleanId || cleanId.length < 3 || !lowerPass.includes(cleanId);
  const notContainsName =
    !cleanName ||
    cleanName
      .split(/\s+/)
      .filter((part) => part.length > 2)
      .every((part) => !lowerPass.includes(part));

  const notCommon = !COMMON_PASSWORDS.includes(lowerPass);

  const requirements = [
    { label: 'Minimum 10 characters', met: hasMinLength },
    { label: 'Uppercase & lowercase letters', met: hasUpper && hasLower },
    { label: 'At least one number (0-9)', met: hasNumber },
    { label: 'At least one special symbol (!@#$%^&*)', met: hasSymbol },
    { label: 'Does not contain your ID or name', met: notContainsId && notContainsName },
    { label: 'Not an easily guessed common password', met: notCommon },
  ];

  const metCount = requirements.filter((r) => r.met).length;

  // Strength score
  let strengthLabel = 'Very weak';
  let barColor = 'bg-red-500';
  let percentage = (metCount / requirements.length) * 100;

  if (metCount >= 6) {
    strengthLabel = 'Strong';
    barColor = 'bg-emerald-500';
  } else if (metCount >= 4) {
    strengthLabel = 'Good';
    barColor = 'bg-amber-500';
  } else if (metCount >= 2) {
    strengthLabel = 'Fair';
    barColor = 'bg-orange-500';
  }

  return (
    <div className="space-y-3 pt-1">
      {/* Visual meter bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold mb-1">
          <span className="text-[var(--app-text-muted)] uppercase tracking-wider text-[10px]">
            Password Strength
          </span>
          <span
            className={`font-black ${
              metCount >= 6
                ? 'text-emerald-500'
                : metCount >= 4
                ? 'text-amber-500'
                : 'text-red-500'
            }`}
          >
            {password ? strengthLabel : 'Enter password'}
          </span>
        </div>
        <div className="h-1.5 w-full bg-[var(--app-border)] rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${password ? percentage : 0}%` }}
          />
        </div>
      </div>

      {/* Live Requirement Checklist */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]" aria-live="polite">
        {requirements.map((req) => (
          <li
            key={req.label}
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              req.met
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-[var(--app-text-muted)]'
            }`}
          >
            {req.met ? (
              <Check className="w-3.5 h-3.5 shrink-0 text-emerald-500 font-bold" />
            ) : (
              <X className="w-3.5 h-3.5 shrink-0 opacity-40" />
            )}
            <span>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
