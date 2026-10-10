import React, { useState } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import type { RequestItem } from '../../services/db';
import { navigate } from '../../utils/navigation';
import {
  ArrowLeft,
  Upload,
  Calendar,
  AlertCircle,
  Building,
  CheckCircle2,
} from 'lucide-react';

export const NewRequestPage: React.FC = () => {
  const [requestType, setRequestType] = useState<RequestItem['type']>('No-dues');
  const subjects = db.getSubjects();

  // Form states
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [durationDays, setDurationDays] = useState(2);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['sub-cn', 'sub-os']);
  const [concessionCategory, setConcessionCategory] = useState('Merit-cum-Means');
  const [eventName, setEventName] = useState('');
  const [clubName, setClubName] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleToggleSubject = (subId: string) => {
    if (selectedSubjects.includes(subId)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subId));
    } else {
      setSelectedSubjects([...selectedSubjects, subId]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let defaultTitle = title;
    if (!defaultTitle) {
      if (requestType === 'No-dues') defaultTitle = 'Semester 6 No-Dues Clearance';
      else if (requestType === 'OD letter') defaultTitle = `On-Duty Leave (${durationDays} Days) - Hackathon/Symposium`;
      else if (requestType === 'Scholarship') defaultTitle = `${concessionCategory} Fee Concession`;
      else defaultTitle = `${eventName || 'College Event'} Permission - ${clubName || 'Technical Club'}`;
    }

    const newReq = db.createRequest({
      type: requestType,
      title: defaultTitle,
      details: {
        eventName: requestType === 'Event' ? eventName : undefined,
        clubName: requestType === 'Event' ? clubName : undefined,
        concessionCategory: requestType === 'Scholarship' ? concessionCategory : undefined,
        durationDays: requestType === 'OD letter' ? durationDays : undefined,
        reason: reason || 'Application submitted for official processing.',
        affectedSubjectIds: requestType === 'OD letter' ? selectedSubjects : undefined,
      },
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedId(newReq.id);
    }, 400);
  };

  return (
    <PortalLayout currentPath="/requests" title="New Approval Request">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate('/requests')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Approvals</span>
        </button>

        {submittedId ? (
          <div className="portal-card p-8 text-center space-y-5 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-green)]/10 text-[var(--accent-green)] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="portal-heading text-xl text-[var(--app-text)]">
                Application Submitted Successfully!
              </h2>
              <p className="text-sm text-[var(--app-text-muted)] mt-1">
                Your request ID is <span className="font-mono font-bold text-[var(--app-text)]">{submittedId}</span>.
              </p>
              <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 max-w-md mx-auto text-left">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  <strong>Simulated Demo Engine Active:</strong> Since there are no faculty/admin logins in this student-only portal, the backend simulation scheduler will automatically process and advance your request stages shortly.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/requests/${submittedId}`)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs cursor-pointer shadow-xs hover:opacity-90"
              >
                Track Live Progress
              </button>
              <button
                type="button"
                onClick={() => navigate('/requests')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-[var(--app-border)] text-[var(--app-text)] font-extrabold text-xs cursor-pointer hover:bg-[var(--app-surface-subtle)]"
              >
                View All Requests
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="portal-card p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="portal-heading text-xl text-[var(--app-text)]">
                Submit an Official Request
              </h2>
              <p className="text-xs text-[var(--app-text-muted)] mt-1">
                Paperless approvals with automated stage tracking, parallel department clearances, and digitally signed certificates.
              </p>
            </div>

            {/* Request Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-[var(--app-text)] uppercase tracking-wider">
                Select Request Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {(['No-dues', 'OD letter', 'Scholarship', 'Event', 'Attendance correction'] as RequestItem['type'][]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRequestType(type)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      requestType === type
                        ? 'border-black dark:border-white bg-[var(--app-surface-subtle)] font-extrabold text-[var(--app-text)] shadow-2xs'
                        : 'border-[var(--app-border)] text-[var(--app-text-muted)] hover:border-[var(--app-text-muted)]'
                    }`}
                  >
                    <span className="text-xs font-black">{type}</span>
                    <span className="text-[10px] opacity-75 mt-1">
                      {type === 'No-dues' && '4-dept clearance'}
                      {type === 'OD letter' && 'Attendance credit'}
                      {type === 'Scholarship' && 'Fee concession'}
                      {type === 'Event' && 'Club permission'}
                      {type === 'Attendance correction' && 'Mismatch report'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--app-text)]">
                Application Title
              </label>
              <input
                type="text"
                placeholder={
                  requestType === 'No-dues'
                    ? 'e.g. End of Semester 6 No-Dues Clearance'
                    : requestType === 'OD letter'
                    ? 'e.g. On-Duty Leave for Smart India Hackathon'
                    : requestType === 'Scholarship'
                    ? 'e.g. Merit-cum-Means Fee Waiver Application'
                    : 'e.g. TechFest Annual Robotics Workshop Permission'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-text)]"
              />
            </div>

            {/* Dynamic Type-specific fields */}
            {requestType === 'OD letter' && (
              <div className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--accent-yellow)]">
                  <Calendar className="w-4 h-4" />
                  <span>On-Duty Leave & Attendance Recovery</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--app-text)] block mb-1">
                      Number of Days Needed
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={durationDays}
                      onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--app-text)] block mb-1">
                      Attendance Impact
                    </label>
                    <p className="text-[11px] text-[var(--app-text-muted)]">
                      When approved, these {durationDays} days will automatically be credited to your attendance calculator as official 'OD' entries.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--app-text)] block mb-1.5">
                    Select Affected Subjects for OD Credit
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {subjects.map((sub) => (
                      <label
                        key={sub.id}
                        className="flex items-center gap-2 text-xs p-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(sub.id)}
                          onChange={() => handleToggleSubject(sub.id)}
                          className="rounded text-black"
                        />
                        <span className="font-bold">{sub.code}</span>
                        <span className="text-[var(--app-text-muted)] truncate">{sub.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {requestType === 'No-dues' && (
              <div className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--app-text)]">
                  <Building className="w-4 h-4" />
                  <span>Four Parallel Department Clearances</span>
                </div>
                <p className="text-xs text-[var(--app-text-muted)]">
                  This request creates 4 parallel verification stages: <strong>Library</strong>, <strong>Hostel</strong>, <strong>Accounts</strong>, and <strong>Laboratories</strong>. Each department verifies independently. The digital No-Dues Certificate will be generated once all four stages are cleared.
                </p>
              </div>
            )}

            {requestType === 'Scholarship' && (
              <div className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-4">
                <div>
                  <label className="text-xs font-bold text-[var(--app-text)] block mb-1">
                    Concession Category
                  </label>
                  <select
                    value={concessionCategory}
                    onChange={(e) => setConcessionCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)]"
                  >
                    <option value="Merit-cum-Means">Merit-cum-Means Fee Waiver (50%)</option>
                    <option value="First Graduate Scholarship">First Graduate State Scholarship</option>
                    <option value="Sports Excellence">Sports Excellence Concession (100%)</option>
                    <option value="Alumni Endowment">Alumni Memorial Endowment</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--app-text)] block mb-1">
                    Annual Family Income (INR)
                  </label>
                  <input
                    type="text"
                    defaultValue="₹ 2,50,000"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)]"
                  />
                </div>
              </div>
            )}

            {requestType === 'Event' && (
              <div className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--app-text)] block mb-1">
                      Event / Workshop Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. National Hackathon 2026"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--app-text)] block mb-1">
                      Student Club / Society
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. IEEE Student Branch"
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Justification / Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--app-text)]">
                Statement of Purpose / Justification
              </label>
              <textarea
                rows={3}
                placeholder="Provide necessary background details, event brochure dates, or semester clearance context..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-text)] resize-none"
              />
            </div>

            {/* Supporting Document Attachment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--app-text)]">
                Supporting Documents (PDF or Images, Max 5MB)
              </label>
              <div className="border border-dashed border-[var(--app-border)] rounded-xl p-4 text-center hover:bg-[var(--app-surface-subtle)] transition relative cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 mx-auto text-[var(--app-text-muted)] mb-1" />
                <p className="text-xs font-extrabold text-[var(--app-text)]">
                  {fileName ? fileName : 'Click or drag files here to upload'}
                </p>
                <p className="text-[10px] text-[var(--app-text-muted)] mt-0.5">
                  Attach certificates, invitation letters, or income verification proofs.
                </p>
              </div>
            </div>

            {/* Simulated Approver Note */}
            <div className="p-3 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-[var(--app-text-muted)]">
                <strong>CampusConnect Guarantee:</strong> Student requests are protected by immutable digital records. Approvals include a cryptographically signed QR verification token readable by any campus authority.
              </p>
            </div>

            {/* Submit CTA */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/requests')}
                className="px-5 py-2.5 rounded-full border border-[var(--app-border)] text-[var(--app-text)] font-extrabold text-xs cursor-pointer hover:bg-[var(--app-surface-subtle)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black text-xs cursor-pointer shadow-xs hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </PortalLayout>
  );
};
