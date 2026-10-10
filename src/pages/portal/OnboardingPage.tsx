import React, { useState } from 'react';
import { db } from '../../services/db';
import { navigate } from '../../utils/navigation';
import { useTheme } from '../../context/ThemeContext';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const user = db.getUser();

  const [step, setStep] = useState(1);
  const [semester, setSemester] = useState(user.semester);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'sub-cn',
    'sub-os',
    'sub-dbms',
    'sub-ai',
    'sub-daa',
  ]);

  const availableSubjects = db.getSubjects();

  const handleToggleSubject = (id: string) => {
    if (selectedSubjects.includes(id)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== id));
    } else {
      setSelectedSubjects([...selectedSubjects, id]);
    }
  };

  const handleComplete = () => {
    db.updateUserProfile({ semester });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans flex flex-col justify-between p-4 sm:p-8 selection:bg-amber-300 selection:text-black transition-colors duration-200">
      {/* Header */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between py-4 border-b border-[var(--app-border)]">
        <div className="flex items-center gap-3">
          <span className="font-montserrat font-black text-xs tracking-tight uppercase">
            CampusConnect Setup
          </span>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-full border border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)] transition cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-xl w-full mx-auto my-8">
        <div className="portal-card p-6 sm:p-8 space-y-6 animate-scale-in">
          {/* Step 1: Semester & Profile Confirmation */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-24 h-24 mx-auto mb-2">
                  <img
                    src="/mascots/01-welcome.png"
                    alt="Welcome Mascot"
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </div>
                <h2 className="portal-heading text-2xl text-[var(--app-text)]">
                  Welcome, {user.name}!
                </h2>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Let's personalize your portal in under 60 seconds. Confirm your academic details below.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[var(--app-text)] block mb-1">
                    Select Your Current Semester
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSemester(s)}
                        className={`py-2.5 rounded-xl border text-xs font-black transition cursor-pointer ${
                          semester === s
                            ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-transparent shadow-xs'
                            : 'border-[var(--app-border)] text-[var(--app-text-muted)] hover:border-[var(--app-text)]'
                        }`}
                      >
                        Sem {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-xs space-y-1">
                  <span className="font-bold text-[var(--app-text)] block">Academic Department</span>
                  <span className="text-[var(--app-text-muted)]">{user.department}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black text-xs inline-flex items-center gap-2 cursor-pointer shadow-xs hover:opacity-90"
                >
                  <span>Continue to Subjects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Choose Enrolled Subjects */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="portal-heading text-xl text-[var(--app-text)]">
                  Confirm Your Subjects
                </h2>
                <p className="text-xs text-[var(--app-text-muted)] mt-1">
                  These modules will populate your Attendance Calculator and Timetable schedule.
                </p>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {availableSubjects.map((sub) => {
                  const isSelected = selectedSubjects.includes(sub.id);
                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleToggleSubject(sub.id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isSelected
                          ? 'border-amber-400/80 bg-amber-400/5'
                          : 'border-[var(--app-border)] bg-[var(--app-surface-subtle)] opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected
                              ? 'bg-amber-400 border-amber-400 text-black'
                              : 'border-[var(--app-border)]'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="font-black text-xs text-[var(--app-text)]">
                            {sub.code} • {sub.name}
                          </div>
                          <div className="text-[10px] text-[var(--app-text-muted)]">
                            {sub.credits} Credits • Faculty: {sub.facultyName}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  className="px-6 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black text-xs inline-flex items-center gap-2 cursor-pointer shadow-xs hover:opacity-90"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch My Portal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl w-full mx-auto text-center py-4 text-[10px] text-[var(--app-text-muted)] border-t border-[var(--app-border)]">
        CampusConnect Student Setup • Automatic sync with College SIS
      </footer>
    </div>
  );
};
