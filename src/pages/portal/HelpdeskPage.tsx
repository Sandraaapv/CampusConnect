import React, { useState, useEffect, useMemo } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import type {
  HelpdeskTicket,
  HelpdeskAttachment,
} from '../../services/collegeRecords';
import {
  Plus,
  CheckCircle2,
  Send,
  RotateCcw,
  X,
  FileImage,
} from 'lucide-react';

const CATEGORIES: HelpdeskTicket['category'][] = [
  'Wi-Fi / Network',
  'Hostel Maintenance',
  'Academic / Administrative',
  'Library',
  'Transport',
  'Other',
];

const STATUS_STAGES: HelpdeskTicket['status'][] = [
  'Open',
  'Assigned',
  'In progress',
  'Resolved',
  'Closed',
];

export const HelpdeskPage: React.FC = () => {
  const [tickets, setTickets] = useState<HelpdeskTicket[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // New Ticket Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCategory, setNewCategory] = useState<HelpdeskTicket['category']>('Wi-Fi / Network');
  const [newPriority, setNewPriority] = useState<HelpdeskTicket['priority']>('Medium');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [attachments, setAttachments] = useState<HelpdeskAttachment[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Comment input state for selected ticket
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    setTickets(db.getHelpdeskTickets());
  }, []);

  const refreshData = () => {
    setTickets([...db.getHelpdeskTickets()]);
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus = selectedStatus === 'All' || t.status === selectedStatus;
      const matchCat = selectedCategory === 'All' || t.category === selectedCategory;
      return matchStatus && matchCat;
    });
  }, [tickets, selectedStatus, selectedCategory]);

  const activeTicketData = useMemo(() => {
    if (!selectedTicketId) return null;
    return db.getHelpdeskTicketById(selectedTicketId);
  }, [selectedTicketId, tickets]);

  // Handle Image File Attachments (Validation: max 3 images, max 5MB each)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    const files = Array.from(e.target.files || []);
    if (attachments.length + files.length > 3) {
      setFormError('Maximum 3 image attachments allowed.');
      return;
    }

    for (const f of files) {
      if (!f.type.startsWith('image/')) {
        setFormError(`File ${f.name} is not an image. Only PNG, JPG, or WEBP allowed.`);
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setFormError(`File ${f.name} exceeds 5MB size limit.`);
        return;
      }
      const newAtt: HelpdeskAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: f.name,
        size: f.size,
        type: f.type,
        url: URL.createObjectURL(f),
      };
      setAttachments((prev) => [...prev, newAtt]);
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!newTitle.trim() || !newDescription.trim() || !newLocation.trim()) {
      setFormError('Please complete all required fields.');
      return;
    }

    const res = db.createHelpdeskTicket({
      category: newCategory,
      priority: newPriority,
      title: newTitle,
      description: newDescription,
      location: newLocation,
      attachments,
    });

    if (res.success && res.ticket) {
      setShowNewModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewLocation('');
      setAttachments([]);
      refreshData();
      setSelectedTicketId(res.ticket.id);
    } else {
      setFormError(res.error || 'Failed to submit ticket.');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !newComment.trim()) return;

    db.addHelpdeskComment(selectedTicketId, newComment);
    setNewComment('');
    refreshData();
  };

  const handleReopen = () => {
    if (!selectedTicketId) return;
    const res = db.updateHelpdeskTicket(selectedTicketId, 'reopen');
    if (!res.success) {
      alert(res.error);
    }
    refreshData();
  };

  const handleConfirmClose = () => {
    if (!selectedTicketId) return;
    db.updateHelpdeskTicket(selectedTicketId, 'close', rating);
    refreshData();
  };

  return (
    <PortalLayout currentPath="/helpdesk" title="Campus Helpdesk">
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>SUPPORT & FACILITIES · SIMULATED DISPATCH RESPONSE</span>
            </div>
            <h1 className="font-montserrat font-black text-xl sm:text-2xl text-[var(--app-text)] tracking-tight uppercase mt-0.5">
              Helpdesk & Support
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Raise New Ticket</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-xs font-bold text-[var(--app-text)] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {STATUS_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-xs font-bold text-[var(--app-text)] cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* =========================================================================
            TICKET LIST / DETAIL SPLIT VIEW
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Ticket Cards List (5/12 or full width) */}
          <div className={`space-y-3 ${selectedTicketId ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
            {filteredTickets.length === 0 ? (
              <div className="p-10 text-center rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] space-y-4">
                <img
                  src="/mascots/06-Request tracker.png"
                  alt="No helpdesk tickets"
                  className="w-36 h-36 object-contain mx-auto opacity-70"
                />
                <h3 className="font-montserrat font-black text-lg text-[var(--app-text)] uppercase">
                  No Support Tickets Logged
                </h3>
                {/* One-line explanation distinguishing Approvals from Helpdesk */}
                <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                  <strong>Notice:</strong> Approvals are for formal documents and permissions (OD letters, scholarships, no-dues); Helpdesk is for everyday campus issues and queries (Wi-Fi, hostel maintenance, facilities).
                </p>
                <button
                  type="button"
                  onClick={() => setShowNewModal(true)}
                  className="px-5 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs"
                >
                  Create Your First Ticket
                </button>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicketId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-4 sm:p-5 rounded-3xl bg-[var(--app-surface)] border cursor-pointer transition shadow-xs space-y-3 ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-[var(--app-border)] hover:border-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-neutral-400">
                        {t.ticketNumber} · {t.category}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          t.status === 'Open'
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                            : t.status === 'Assigned'
                            ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
                            : t.status === 'In progress'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : t.status === 'Resolved'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-neutral-500/15 text-neutral-500 border-neutral-500/30'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-montserrat font-black text-sm text-[var(--app-text)] leading-snug">
                        {t.title}
                      </h3>
                      <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                        {t.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--app-border)] text-[10px] text-neutral-400 font-mono">
                      <span>{t.location}</span>
                      <span>Priority: {t.priority}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Ticket Detail View (7/12) */}
          {activeTicketData && (
            <div className="lg:col-span-7 p-6 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-6">
              {/* Detail Header */}
              <div className="flex items-start justify-between gap-4 border-b border-[var(--app-border)] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-400">
                      {activeTicketData.ticket.ticketNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                      {activeTicketData.ticket.assignedDepartment}
                    </span>
                  </div>
                  <h2 className="font-montserrat font-black text-lg text-[var(--app-text)] leading-tight">
                    {activeTicketData.ticket.title}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Location: <strong className="text-[var(--app-text)]">{activeTicketData.ticket.location}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTicketId(null)}
                  className="p-1 rounded-full text-neutral-400 hover:text-[var(--app-text)] lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Timeline: Open > Assigned > In progress > Resolved > Closed */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">
                  Resolution Progress
                </span>
                <div className="flex items-center gap-1">
                  {STATUS_STAGES.map((st, idx) => {
                    const currentIdx = STATUS_STAGES.indexOf(activeTicketData.ticket.status);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={st} className="flex-1 space-y-1">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isPassed
                              ? isCurrent
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                              : 'bg-neutral-200 dark:bg-neutral-800'
                          }`}
                        />
                        <span
                          className={`text-[9px] font-mono block text-center truncate ${
                            isCurrent
                              ? 'font-black text-[var(--app-text)]'
                              : 'text-neutral-400'
                          }`}
                        >
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description & Attachments */}
              <div className="p-4 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-2 text-xs">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                  Problem Description
                </span>
                <p className="text-[var(--app-text)] leading-relaxed">
                  {activeTicketData.ticket.description}
                </p>

                {activeTicketData.ticket.attachments.length > 0 && (
                  <div className="pt-2 border-t border-[var(--app-border)] space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                      Photos ({activeTicketData.ticket.attachments.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeTicketData.ticket.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[11px] font-bold"
                        >
                          <FileImage className="w-3.5 h-3.5 text-blue-500" />
                          <span>{att.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Resolved State: Reopen within 7 days or confirm closure with rating */}
              {activeTicketData.ticket.status === 'Resolved' && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Technician has marked this ticket as Resolved.</span>
                  </div>

                  <p className="text-neutral-500 text-[11px]">
                    If your issue is solved, please confirm closure and leave a satisfaction rating. You can also reopen within 7 days if the issue persists.
                  </p>

                  <div className="flex items-center gap-2 py-1">
                    <span className="text-xs font-bold text-[var(--app-text)]">Rating:</span>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          rating >= s
                            ? 'bg-amber-400 text-black font-black'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        ★ {s}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmClose}
                      className="px-4 py-2 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Confirm Closure ({rating}/5)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReopen}
                      className="px-4 py-2 rounded-full border border-neutral-400 text-neutral-600 dark:text-neutral-300 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reopen Ticket (7 Days Window)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Comment Thread between Student and Support Team */}
              <div className="space-y-3">
                <span className="text-xs font-montserrat font-black text-[var(--app-text)] uppercase">
                  Activity & Communication Thread
                </span>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {activeTicketData.comments.map((comm) => {
                    const isSupport = comm.authorType === 'support';

                    return (
                      <div
                        key={comm.id}
                        className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                          isSupport
                            ? 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-100 ml-4'
                            : 'bg-[var(--app-surface-subtle)] border-[var(--app-border)] mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400">
                          <span className="font-bold text-[var(--app-text)]">{comm.authorName}</span>
                          <span>{comm.createdAt.slice(0, 10)}</span>
                        </div>
                        <p className="text-[var(--app-text)] leading-relaxed">{comm.message}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Comment Box */}
                {activeTicketData.ticket.status !== 'Closed' && (
                  <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add an update or reply to technician..."
                      className="flex-1 px-4 py-2.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-xs text-[var(--app-text)] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="px-4 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            NEW TICKET MODAL (Rate limiting, 3 image attachments validation)
            ========================================================================= */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setShowNewModal(false)}
            />

            <div className="relative bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl z-10 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between border-b border-[var(--app-border)] pb-3">
                <div>
                  <h2 className="font-montserrat font-black text-base text-[var(--app-text)] uppercase">
                    Raise New Support Ticket
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Campus IT, Hostel Maintenance, Facilities, and Administrative queries.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-[var(--app-text)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                {/* Category & Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[var(--app-text)] block mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] font-bold text-[var(--app-text)]"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[var(--app-text)] block mb-1">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] font-bold text-[var(--app-text)]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="font-bold text-[var(--app-text)] block mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Hostel B, Room 214 or LH-201"
                    className="w-full p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-[var(--app-text)]"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="font-bold text-[var(--app-text)] block mb-1">Issue Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Brief summary of the issue"
                    className="w-full p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-[var(--app-text)]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="font-bold text-[var(--app-text)] block mb-1">Detailed Description</label>
                  <textarea
                    required
                    rows={4}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Please explain the problem and any troubleshooting steps already attempted..."
                    className="w-full p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-[var(--app-text)]"
                  />
                </div>

                {/* Image Attachments */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[var(--app-text)]">Photo Attachments (Max 3, 5MB)</label>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {attachments.length} / 3 photos
                    </span>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={attachments.length >= 3}
                    onChange={handleFileUpload}
                    className="w-full text-xs text-neutral-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[var(--app-surface-subtle)] file:text-[var(--app-text)] cursor-pointer"
                  />

                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {attachments.map((att, idx) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-2 p-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-[11px]"
                        >
                          <span className="truncate max-w-[120px]">{att.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setAttachments((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-neutral-400 hover:text-rose-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--app-border)]">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="px-4 py-2 rounded-full border border-[var(--app-border)] text-neutral-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs cursor-pointer shadow-xs"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
