import React, { useState } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import type { Note } from '../../services/db';
import {
  Upload,
  ThumbsUp,
  Download,
  CheckCircle2,
} from 'lucide-react';

export const NotesPage: React.FC = () => {
  const subjects = db.getSubjects();
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [notes, setNotes] = useState<Note[]>(() => db.getNotes());
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubCode, setNewSubCode] = useState(subjects[0]?.code || 'CS3601');
  const [newType, setNewType] = useState<'PDF' | 'Notes' | 'PYQ'>('Notes');
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const filteredNotes =
    selectedSubject === 'All'
      ? notes
      : notes.filter((n) => n.subjectCode === selectedSubject);
  const user = db.getUser();

  const handleUpvote = (id: string) => {
    db.upvoteNote(id);
    setNotes([...db.getNotes()]);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetSub = subjects.find((s) => s.code === newSubCode) || subjects[0];
    db.addNote({
      subjectId: targetSub.id,
      subjectCode: targetSub.code,
      title: newTitle.trim(),
      fileType: newType,
      uploadedBy: `${user.name} (${user.registerNumber})`,
    });

    setNotes([...db.getNotes()]);
    setShowUploadModal(false);
    setNewTitle('');
    setUploadSuccess('Resource uploaded successfully!');
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  return (
    <PortalLayout currentPath="/notes" title="Notes & PYQ Hub">
      <div className="space-y-6">
        {/* Top Control Bar: Subject Filter & Upload CTA */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-[var(--app-text-muted)] shrink-0">Subject:</span>
            <button
              type="button"
              onClick={() => setSelectedSubject('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedSubject === 'All'
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                  : 'border border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-subtle)]'
              }`}
            >
              All Subjects
            </button>
            {subjects.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubject(sub.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedSubject === sub.code
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                    : 'border border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-subtle)]'
                }`}
              >
                {sub.code}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
          >
            <Upload className="w-3.5 h-3.5 text-amber-300" />
            <span>Upload Notes / PYQ</span>
          </button>
        </div>

        {uploadSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((n) => {
            const hasUpvoted = n.upvotedBy.includes(user.id);
            return (
              <div
                key={n.id}
                className="p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[var(--app-text-muted)] bg-[var(--app-surface-subtle)] px-2 py-0.5 rounded border border-[var(--app-border)]">
                      {n.subjectCode}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-yellow)]/10 text-[var(--app-text)] border border-[var(--accent-yellow)]/20">
                      {n.fileType}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-[var(--app-text)] leading-snug">
                    {n.title}
                  </h3>

                  <p className="text-[10px] text-[var(--app-text-muted)]">
                    By {n.uploadedBy} &bull; {n.uploadedDate}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--app-border)]">
                  <button
                    type="button"
                    onClick={() => handleUpvote(n.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                      hasUpvoted
                        ? 'bg-[var(--accent-yellow)] text-black border-[var(--accent-yellow)]'
                        : 'border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-[var(--app-text-muted)]'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{n.upvotes}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      alert(`Downloading: ${n.title} (${n.fileType})`);
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-xs font-bold text-[var(--app-text)] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[var(--app-surface)] rounded-2xl border border-[var(--app-border)] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-[var(--app-text)]">
                  Share Study Material
                </h3>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)] font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[var(--app-text-muted)] uppercase mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unit 3 Trees & Graphs Summary Notes"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-xs font-medium text-[var(--app-text)] outline-none focus:ring-1 focus:ring-[var(--app-text)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--app-text-muted)] uppercase mb-1">
                      Subject
                    </label>
                    <select
                      value={newSubCode}
                      onChange={(e) => setNewSubCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-xs font-medium text-[var(--app-text)] outline-none"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.code}>
                          {s.code} - {s.name.slice(0, 15)}...
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--app-text-muted)] uppercase mb-1">
                      Type
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-xs font-medium text-[var(--app-text)] outline-none"
                    >
                      <option value="Notes">Notes</option>
                      <option value="PYQ">Previous Question Paper</option>
                      <option value="PDF">Reference PDF</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--app-text-muted)] uppercase mb-1">
                    Attach File (PDF, Max 25MB)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-xs text-[var(--app-text-muted)]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-xl border border-[var(--app-border)] text-xs font-bold text-[var(--app-text-muted)] hover:bg-[var(--app-surface-subtle)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-xs font-extrabold hover:opacity-90 cursor-pointer"
                  >
                    Upload Resource
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
