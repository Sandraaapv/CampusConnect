import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import type { RequestItem } from '../../services/db';
import { navigate, useCurrentPath } from '../../utils/navigation';
import {
  FileCheck2,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  QrCode,
  Sparkles,
  Info,
} from 'lucide-react';

export const RequestDetailPage: React.FC = () => {
  const currentPath = useCurrentPath();
  const requestId = currentPath.split('/requests/')[1]?.split('?')[0];

  const [request, setRequest] = useState<RequestItem | undefined>(() =>
    requestId ? db.getRequestById(requestId) : undefined
  );
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const user = db.getUser();

  // Periodically refresh request data to show background simulated advances
  useEffect(() => {
    if (!requestId) return;
    const interval = setInterval(() => {
      const refreshed = db.getRequestById(requestId);
      if (refreshed) {
        setRequest({ ...refreshed });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [requestId]);

  if (!request) {
    return (
      <PortalLayout currentPath="/requests" title="Request Details">
        <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--app-surface-subtle)] border border-[var(--app-border)] flex items-center justify-center mx-auto text-[var(--app-text-muted)]">
            <FileCheck2 className="w-8 h-8" />
          </div>
          <h2 className="portal-heading text-lg">Request Not Found</h2>
          <p className="text-xs text-[var(--app-text-muted)]">
            The requested application identifier could not be located.
          </p>
          <button
            type="button"
            onClick={() => navigate('/requests')}
            className="px-6 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs cursor-pointer shadow-xs"
          >
            Return to Requests
          </button>
        </div>
      </PortalLayout>
    );
  }

  const isApproved = request.status === 'Approved';

  // Manual trigger for testing/demo simulation advancement
  const handleFastForwardSimulation = () => {
    if (request.type === 'No-dues' && request.departmentStages) {
      const nextUncleared = request.departmentStages.find((s) => !s.cleared);
      if (nextUncleared) {
        nextUncleared.cleared = true;
        nextUncleared.clearedAt = new Date().toISOString().split('T')[0];
        nextUncleared.remarks = `${nextUncleared.department} verified no outstanding dues.`;
        if (request.departmentStages.every((s) => s.cleared)) {
          request.status = 'Approved';
          request.comments.push({
            role: 'System',
            author: 'Clearance Engine',
            comment: 'All 4 departments cleared. Digital No-Dues Certificate issued.',
            date: new Date().toISOString().split('T')[0],
          });
        }
      }
    } else {
      request.status = 'Approved';
      if (request.type === 'OD letter' && request.details.durationDays) {
        request.odDaysCredited = request.details.durationDays;
        request.comments.push({
          role: 'Academic Office',
          author: 'Attendance Coordinator',
          comment: `Approved. Attendance credited: ${request.details.durationDays} days marked On-Duty.`,
          date: new Date().toISOString().split('T')[0],
        });
        const today = new Date().toISOString().split('T')[0];
        (request.details.affectedSubjectIds || ['sub-cn', 'sub-os']).forEach((subId) => {
          db.recordAttendance(subId, today, 'od');
        });
      } else {
        request.comments.push({
          role: 'Dean Office',
          author: 'Administration',
          comment: 'Approved with official clearance stamp.',
          date: new Date().toISOString().split('T')[0],
        });
      }
    }
    db.saveAll();
    setRequest({ ...request });
  };

  return (
    <PortalLayout currentPath="/requests" title="Approval Status Trail">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/requests')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Approvals</span>
          </button>

          <div className="flex items-center gap-2">
            {!isApproved && (
              <button
                type="button"
                onClick={handleFastForwardSimulation}
                className="px-3.5 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-extrabold text-[11px] flex items-center gap-1.5 cursor-pointer hover:bg-amber-500/20"
                title="Trigger simulated approval step immediately for demo"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Next Stage Step</span>
              </button>
            )}

            {isApproved && (
              <button
                type="button"
                onClick={() => setShowCertificateModal(true)}
                className="px-4 py-2 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-xs hover:opacity-90"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Approved PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Request Header Banner */}
        <div className="portal-card p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-[var(--accent-yellow)] px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                  {request.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-[var(--app-text)]">
                  {request.type}
                </span>
              </div>
              <h2 className="portal-heading text-xl sm:text-2xl text-[var(--app-text)] mt-2">
                {request.title}
              </h2>
              <p className="text-xs text-[var(--app-text-muted)] mt-1">
                Submitted on {request.submittedDate} by {user.name} ({user.registerNumber})
              </p>
            </div>

            {/* Current Status Pill */}
            <div className="shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  isApproved
                    ? 'bg-emerald-500/15 text-[var(--accent-green)] border border-emerald-500/30'
                    : request.status === 'Submitted'
                    ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                    : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                }`}
              >
                {isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span>{request.status}</span>
              </span>
            </div>
          </div>

          {/* Details summary */}
          <div className="pt-4 border-t border-[var(--app-border)] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[var(--app-text-muted)] block text-[10px] font-bold uppercase">Applicant Department</span>
              <span className="font-bold text-[var(--app-text)]">{user.department} (Sem {user.semester})</span>
            </div>
            {request.details.durationDays && (
              <div>
                <span className="text-[var(--app-text-muted)] block text-[10px] font-bold uppercase">On-Duty Duration</span>
                <span className="font-bold text-[var(--app-text)]">{request.details.durationDays} Academic Days</span>
              </div>
            )}
            {request.details.concessionCategory && (
              <div>
                <span className="text-[var(--app-text-muted)] block text-[10px] font-bold uppercase">Scholarship Category</span>
                <span className="font-bold text-[var(--app-text)]">{request.details.concessionCategory}</span>
              </div>
            )}
            <div>
              <span className="text-[var(--app-text-muted)] block text-[10px] font-bold uppercase">Verification Token</span>
              <span className="font-mono font-bold text-[var(--app-text)] text-[11px] truncate block">
                {request.verificationToken}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            PARALLEL DEPARTMENT CLEARANCES (For No-Dues)
            ========================================================================= */}
        {request.type === 'No-dues' && request.departmentStages && (
          <div className="portal-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="portal-heading text-base text-[var(--app-text)]">
                  Parallel Department Clearances
                </h3>
                <p className="text-xs text-[var(--app-text-muted)]">
                  All 4 departments stamp independently. Clearance completes once all stages are verified.
                </p>
              </div>
              <span className="text-xs font-mono font-extrabold text-[var(--accent-yellow)]">
                {request.departmentStages.filter((s) => s.cleared).length} / 4 Cleared
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {request.departmentStages.map((dept) => (
                <div
                  key={dept.department}
                  className={`p-4 rounded-xl border relative overflow-hidden transition-all duration-300 ${
                    dept.cleared
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-[var(--app-surface-subtle)] border-[var(--app-border)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-[var(--app-text)]">
                      {dept.department}
                    </span>
                    {dept.cleared ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--accent-green)]" />
                    ) : (
                      <Clock className="w-4 h-4 text-[var(--app-text-muted)]" />
                    )}
                  </div>

                  <p className="text-[11px] text-[var(--app-text-muted)] leading-tight">
                    {dept.cleared ? dept.remarks || 'Cleared with zero dues' : 'Pending verification review...'}
                  </p>

                  {dept.cleared && (
                    <div className="mt-3 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[10px]">
                      <span className="text-[var(--app-text-muted)]">{dept.clearedAt}</span>
                      {/* Stamp Badge */}
                      <span className="font-black px-2 py-0.5 rounded border border-emerald-500/50 text-[var(--accent-green)] tracking-wider uppercase rotate-[-6deg] inline-block shadow-2xs animate-scale-in">
                        CLEARED
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            OD ATTENDANCE RECOVERY NOTICE
            ========================================================================= */}
        {request.type === 'OD letter' && request.odDaysCredited && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[var(--accent-green)] shrink-0" />
            <div className="text-xs">
              <span className="font-extrabold text-[var(--app-text)] block">
                Attendance Credited Automatically
              </span>
              <span className="text-[var(--app-text-muted)]">
                {request.odDaysCredited} days have been officially credited to your subjects in the Attendance Calculator.
              </span>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATUS TRAIL TIMELINE WITH COMMENTS
            ========================================================================= */}
        <div className="portal-card p-6 space-y-6">
          <h3 className="portal-heading text-base text-[var(--app-text)]">
            Audit Trail & Reviewer Comments
          </h3>

          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--app-border)]">
            {request.comments.map((comment, idx) => (
              <div key={idx} className="relative">
                {/* Dot */}
                <div
                  className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 bg-[var(--app-surface)] ${
                    idx === request.comments.length - 1
                      ? 'border-[var(--accent-green)] bg-[var(--accent-green)]/20'
                      : 'border-[var(--app-border)]'
                  }`}
                />

                <div className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-1.5">
                  <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[var(--app-text)]">{comment.author}</span>
                      <span className="px-2 py-0.5 rounded-md bg-[var(--app-bg)] text-[10px] font-bold text-[var(--app-text-muted)] border border-[var(--app-border)]">
                        {comment.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--app-text-muted)]">{comment.date}</span>
                  </div>
                  <p className="text-xs text-[var(--app-text)] leading-relaxed">
                    {comment.comment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Simulation Notice */}
        <div className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p>
            <strong>Simulated Approval Engine:</strong> In adherence to strict student-only architectural boundaries, approvals in CampusConnect are simulated by an automated background worker. Real administrative authority webhooks can be wired directly into the Spring Boot backend layer without changing any student screens.
          </p>
        </div>
      </div>

      {/* =========================================================================
          DIGITALLY SIGNED CERTIFICATE MODAL / PDF PREVIEW
          ========================================================================= */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-black max-w-xl w-full rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative animate-scale-in">
            {/* Header with College Emblem representation */}
            <div className="text-center border-b border-black/10 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                CAMPUSCONNECT OFFICIAL DIGITAL DOCUMENT
              </span>
              <h2 className="font-black text-xl tracking-tight text-black mt-1">
                OFFICE OF ACADEMIC AFFAIRS
              </h2>
              <p className="text-xs text-neutral-600">
                Institutional Approval & Clearance Verification Certificate
              </p>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 text-xs text-neutral-800">
              <p>
                This is to officially certify that the application filed under identification reference{' '}
                <strong className="font-mono">{request.id}</strong> has been duly reviewed, audited, and approved by the competent institutional authorities.
              </p>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-bold">Student Name</span>
                  <strong className="text-black">{user.name}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-bold">Register Number</span>
                  <strong className="font-mono text-black">{user.registerNumber}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-bold">Department</span>
                  <strong className="text-black">{user.department}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-bold">Request Category</span>
                  <strong className="text-black">{request.type}</strong>
                </div>
              </div>

              {/* Clearance Stamp & QR Code */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 border border-neutral-300 rounded-lg p-1 bg-white flex items-center justify-center">
                    <QrCode className="w-14 h-14 text-black" />
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    <p className="font-bold text-black">Scan to verify authenticity</p>
                    <p className="font-mono truncate max-w-[140px]">{request.verificationToken}</p>
                    <p>Issued: {request.submittedDate}</p>
                  </div>
                </div>

                {/* Simulated Official Seal Stamp */}
                <div className="border-4 border-emerald-600 text-emerald-700 rounded-full w-20 h-20 flex flex-col items-center justify-center font-black text-[9px] uppercase tracking-tighter rotate-[-12deg] shadow-xs">
                  <span>CAMPUS</span>
                  <span className="text-xs">APPROVED</span>
                  <span>VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2 rounded-full border border-neutral-300 text-neutral-700 font-bold text-xs cursor-pointer hover:bg-neutral-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 rounded-full bg-black text-white font-black text-xs cursor-pointer shadow-xs hover:bg-neutral-800 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
};
