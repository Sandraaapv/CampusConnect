import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import type { FeedbackForm, FeedbackQuestion } from '../../services/collegeRecords';
import {
  CheckCircle2,
  AlertTriangle,
  Star,
  Lock,
  ChevronRight,
  X,
} from 'lucide-react';

export const FeedbackPage: React.FC = () => {
  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active form modal state
  const [activeForm, setActiveForm] = useState<FeedbackForm | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [isReviewStep, setIsReviewStep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Dismissible banner
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    try {
      setLoading(true);
      const f = db.getFeedbackForms();
      const q = db.getFeedbackQuestions();
      setForms(f);
      setQuestions(q);
      setError(null);
    } catch {
      setError('Could not retrieve course feedback forms from college system.');
    } finally {
      setLoading(false);
    }
  }, []);

  const totalForms = forms.length;
  const submittedCount = forms.filter((f) => f.status === 'submitted').length;
  const pendingCount = forms.filter((f) => f.status === 'pending').length;

  // Open Form Handler
  const handleOpenForm = (form: FeedbackForm) => {
    setActiveForm(form);
    setIsReviewStep(false);
    setSubmitError(null);
    setComment('');
    // Initialize default answer 5/5 for smooth UX
    const initAnswers: Record<string, number> = {};
    questions.forEach((q) => {
      initAnswers[q.id] = 5;
    });
    setAnswers(initAnswers);
  };

  const handleRatingChange = (qId: string, rating: number) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: rating,
    }));
  };

  // Submit Feedback Handler (Anonymity by Design: strictly without student_id)
  const handleSubmitFinal = () => {
    if (!activeForm) return;
    setSubmitting(true);
    setSubmitError(null);

    const result = db.submitFeedback(activeForm.id, answers, comment);
    setSubmitting(false);

    if (result.success) {
      setForms([...db.getFeedbackForms()]);
      setActiveForm(null);
      setSubmitSuccess(`Evaluation for ${activeForm.subjectCode} submitted successfully.`);
      setTimeout(() => setSubmitSuccess(null), 3500);
    } else {
      setSubmitError(result.error || 'Submission failed.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <PortalLayout currentPath="/feedback" title="Course Feedback">
        <div className="space-y-6 animate-pulse">
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-2xl w-1/3" />
          <div className="h-72 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
        </div>
      </PortalLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <PortalLayout currentPath="/feedback" title="Course Feedback">
        <div className="p-8 text-center rounded-3xl bg-[var(--app-surface)] border border-rose-500/30 space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="font-montserrat font-black text-xl text-[var(--app-text)] uppercase">
            Evaluation Portal Offline
          </h2>
          <p className="text-sm text-neutral-400">{error}</p>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout currentPath="/feedback" title="Course Feedback">
      <div className="space-y-6">
        {/* Top Control Bar with Progress Line */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>COLLEGE RECORDS · SEMESTER 6 EVALUATION WINDOW</span>
            </div>
            <h1 className="font-montserrat font-black text-xl sm:text-2xl text-[var(--app-text)] tracking-tight uppercase mt-0.5">
              Course Feedback
            </h1>
          </div>

          {/* Progress Pill: e.g. "3 of 6 submitted" */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-right">
              <span className="font-montserrat font-black text-sm text-[var(--app-text)]">
                {submittedCount} of {totalForms} submitted
              </span>
              <p className="text-[10px] text-neutral-400 font-mono">
                Deadline: Oct 14, 2026 (48 hours left)
              </p>
            </div>
            <div className="w-16 h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${(submittedCount / totalForms) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {submitSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{submitSuccess}</span>
          </div>
        )}

        {/* Anonymity Guarantee & Mandatory Notice Banner */}
        {!bannerDismissed && pendingCount > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-800 dark:text-amber-200 block">
                  Mandatory Student Evaluation: Required before exam hall ticket generation
                </span>
                <p className="text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                  <strong>Your feedback is completely anonymous.</strong> Answers and comments are stored in an isolated table with NO student identifiers. College records only track completion status to unlock hall tickets.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="text-neutral-400 hover:text-neutral-600 p-1 rounded-full cursor-pointer"
              title="Dismiss for today"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =========================================================================
            LIST OF FEEDBACK FORMS (One per subject & faculty)
            States: Pending, Submitted, Not open yet, Closed (missed)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {forms.map((form) => {
            const isPending = form.status === 'pending';
            const isSubmitted = form.status === 'submitted';
            const isClosed = form.status === 'closed';

            return (
              <div
                key={form.id}
                className={`p-5 rounded-3xl bg-[var(--app-surface)] border shadow-[var(--card-shadow)] flex flex-col justify-between space-y-4 transition ${
                  isPending
                    ? 'border-amber-500/30 hover:border-amber-500'
                    : isSubmitted
                    ? 'border-emerald-500/30 opacity-90'
                    : 'border-[var(--app-border)] opacity-60'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">
                      {form.subjectCode}
                    </span>

                    {/* Status Chip */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        isPending
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : isSubmitted
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : isClosed
                          ? 'bg-neutral-500/15 text-neutral-500 border-neutral-500/30'
                          : 'bg-blue-500/15 text-blue-500 border-blue-500/30'
                      }`}
                    >
                      {isPending
                        ? 'Pending'
                        : isSubmitted
                        ? 'Submitted'
                        : isClosed
                        ? 'Closed (missed)'
                        : 'Not open yet'}
                    </span>
                  </div>

                  <h3 className="font-montserrat font-black text-sm text-[var(--app-text)] leading-snug">
                    {form.subjectName}
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium">
                    Instructor: <span className="text-[var(--app-text)] font-bold">{form.facultyName}</span>
                  </p>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    Evaluation Window: Closes on {form.closesAt}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--app-border)] flex items-center justify-between">
                  {isSubmitted ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Response recorded (Final)</span>
                    </div>
                  ) : isPending ? (
                    <button
                      type="button"
                      onClick={() => handleOpenForm(form)}
                      className="w-full py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:opacity-95 transition"
                    >
                      <span>Fill feedback form</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs text-neutral-400 font-medium">
                      {isClosed ? 'Window expired' : 'Scheduled to open later'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            STRUCTURED FEEDBACK FORM MODAL (1 to 5 ratings, comments, review step)
            ========================================================================= */}
        {activeForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setActiveForm(null)}
            />

            <div className="relative bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-7 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl z-10 animate-in fade-in zoom-in-95">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-[var(--app-border)] pb-4">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                    <Lock className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                      100% Anonymous Evaluation
                    </span>
                  </div>
                  <h2 className="font-montserrat font-black text-base text-[var(--app-text)] mt-1">
                    {activeForm.subjectName} ({activeForm.subjectCode})
                  </h2>
                  <p className="text-xs text-neutral-400 font-medium">
                    Faculty: {activeForm.facultyName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  className="p-1 rounded-full text-neutral-400 hover:text-[var(--app-text)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold">
                  {submitError}
                </div>
              )}

              {!isReviewStep ? (
                /* Step 1: Questionnaire with 1 to 5 ratings */
                <div className="space-y-5">
                  <div className="space-y-4">
                    {questions.map((q, idx) => {
                      const curVal = answers[q.id] || 5;

                      return (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <label className="text-xs font-bold text-[var(--app-text)]">
                              {idx + 1}. {q.text}
                            </label>
                            <span className="font-mono text-xs font-black text-amber-500 shrink-0">
                              {curVal} / 5
                            </span>
                          </div>

                          {/* 1 to 5 Buttons */}
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleRatingChange(q.id, star)}
                                className={`flex-1 py-1.5 rounded-xl border text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1 ${
                                  curVal === star
                                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black shadow-xs'
                                    : 'border-[var(--app-border)] hover:bg-[var(--app-surface)] text-neutral-400'
                                }`}
                              >
                                <Star className={`w-3 h-3 ${curVal >= star ? 'fill-current' : ''}`} />
                                <span>{star}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Optional Comment with character counter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-[var(--app-text)]">
                        Constructive Comments (Optional)
                      </label>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {comment.length} / 500 characters
                      </span>
                    </div>
                    <textarea
                      maxLength={500}
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share constructive insights on syllabus pacing, doubts clearance, or course materials..."
                      className="w-full p-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-xs text-[var(--app-text)] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveForm(null)}
                      className="px-4 py-2.5 rounded-full border border-[var(--app-border)] text-xs font-bold text-neutral-400 hover:text-[var(--app-text)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsReviewStep(true)}
                      className="px-5 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs cursor-pointer shadow-xs"
                    >
                      Review & Confirm
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 2: Review Step before final submission */
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200">
                    <p className="font-bold">Please review your responses before final submission.</p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Submissions are final and cannot be edited. Remember that your evaluation is stored strictly anonymously.
                    </p>
                  </div>

                  {/* Summary of ratings */}
                  <div className="space-y-2 text-xs">
                    {questions.map((q) => (
                      <div key={q.id} className="flex items-center justify-between py-1 border-b border-[var(--app-border)]">
                        <span className="text-neutral-400">{q.text}</span>
                        <span className="font-mono font-black text-[var(--app-text)]">
                          {answers[q.id]} / 5
                        </span>
                      </div>
                    ))}
                  </div>

                  {comment && (
                    <div className="p-3 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-xs space-y-1">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Comments</span>
                      <p className="text-[var(--app-text)] italic">"{comment}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--app-border)]">
                    <button
                      type="button"
                      onClick={() => setIsReviewStep(false)}
                      className="px-4 py-2.5 rounded-full border border-[var(--app-border)] text-xs font-bold text-neutral-400 hover:text-[var(--app-text)]"
                    >
                      Back to Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitFinal}
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {submitting ? 'Encrypting & Submitting...' : 'Confirm Final Submission'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
