import React, { useState } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import { Search, Tag, Calendar } from 'lucide-react';

export const CircularsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const user = db.getUser();

  const categories = ['All', 'Exam', 'Academic', 'Event', 'Hostel'];
  const circulars = db.getCirculars(search, category);

  return (
    <PortalLayout currentPath="/circulars" title="Official Circulars">
      <div className="space-y-6">
        {/* Search & Category Filter Strip */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--app-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search circulars by keyword, exam, or tag..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-xs font-medium text-[var(--app-text)] placeholder-[var(--app-text-muted)]/60 focus:ring-1 focus:ring-[var(--app-text)] outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  category === cat
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                    : 'border border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-subtle)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Circulars List */}
        <div className="space-y-4">
          {circulars.length === 0 ? (
            <div className="p-8 text-center bg-[var(--app-surface)] rounded-2xl border border-[var(--app-border)]">
              <p className="text-sm text-[var(--app-text-muted)]">No circulars found matching your query.</p>
            </div>
          ) : (
            circulars.map((c) => (
              <article
                key={c.id}
                className="p-5 sm:p-6 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-yellow)]/20 text-[var(--app-text)] border border-[var(--accent-yellow)]/30">
                      {c.category}
                    </span>
                    <span className="text-xs font-bold text-[var(--app-text-muted)]">
                      {c.department} &bull; Semester {c.semester || user.semester}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[var(--app-text-muted)] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {c.date}
                  </span>
                </div>

                <h2 className="text-base font-extrabold text-[var(--app-text)] leading-snug">
                  {c.title}
                </h2>

                <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
                  {c.content}
                </p>

                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--app-border)]">
                  {c.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono text-[var(--app-text-muted)] bg-[var(--app-surface-subtle)] px-2 py-0.5 rounded-md border border-[var(--app-border)] flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      #{tag}
                    </span>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </PortalLayout>
  );
};
