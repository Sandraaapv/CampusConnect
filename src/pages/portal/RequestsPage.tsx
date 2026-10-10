import React, { useState } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import type { RequestItem } from '../../services/db';
import { navigate } from '../../utils/navigation';
import { Plus } from 'lucide-react';

export const RequestsPage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('All');
  const requests = db.getRequests();

  const types = ['All', 'No-dues', 'OD letter', 'Scholarship', 'Event', 'Attendance correction'];
  const filteredRequests =
    filterType === 'All' ? requests : requests.filter((r) => r.type === filterType);

  const getStatusBadge = (status: RequestItem['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Faculty Review':
      case 'Admin Review':
      case 'In Review':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <PortalLayout currentPath="/requests" title="Approval Tracker">
      <div className="space-y-6">
        {/* Top Action Bar & Filters */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filterType === t
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                    : 'border border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-subtle)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate('/requests/new')}
            className="px-4 py-2 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs hover:opacity-90 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>New Approval Request</span>
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => navigate(`/requests/${req.id}`)}
              className="p-5 sm:p-6 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] hover:border-[var(--app-border-strong)] transition-all cursor-pointer space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[var(--app-text-muted)] bg-[var(--app-surface-subtle)] px-2 py-0.5 rounded border border-[var(--app-border)]">
                    {req.id}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-yellow)]/10 text-[var(--app-text)] border border-[var(--accent-yellow)]/20">
                    {req.type}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      req.status
                    )}`}
                  >
                    {req.status}
                  </span>
                  <span className="text-xs text-[var(--app-text-muted)] font-mono">
                    {req.submittedDate}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-[var(--app-text)]">
                  {req.title}
                </h3>
                {req.comments.length > 0 && (
                  <p className="text-xs text-[var(--app-text-muted)] mt-1">
                    Latest remark: &ldquo;{req.comments[req.comments.length - 1].comment}&rdquo;
                  </p>
                )}
              </div>

              {/* No-Dues Specific: Parallel 4 Department Clearance Nodes */}
              {req.type === 'No-dues' && req.departmentStages && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--app-border)]">
                  {req.departmentStages.map((stage) => (
                    <div
                      key={stage.department}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1 ${
                        stage.cleared
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : 'bg-[var(--app-surface-subtle)] border-[var(--app-border)] opacity-70'
                      }`}
                    >
                      <span className="text-[11px] font-bold text-[var(--app-text)]">
                        {stage.department}
                      </span>
                      <span
                        className={`text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                          stage.cleared
                            ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                            : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
                        }`}
                      >
                        {stage.cleared ? 'CLEARED' : 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer View Link */}
              <div className="flex items-center justify-between text-xs font-bold text-[var(--app-text)] pt-2 border-t border-[var(--app-border)]">
                <span className="text-[11px] text-[var(--app-text-muted)] font-medium">
                  {req.comments.length} Logged Audit Events
                </span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Timeline & Document &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
};
