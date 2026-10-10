import React, { useState } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import type { Notification } from '../../services/db';
import { navigate } from '../../utils/navigation';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Clock,
  FileCheck2,
  Award,
  BookOpen,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(() => db.getNotifications());

  const handleMarkRead = (id: string) => {
    db.markNotificationAsRead(id);
    setNotifications([...db.getNotifications()]);
  };

  const handleMarkAllRead = () => {
    db.markAllNotificationsAsRead();
    setNotifications([...db.getNotifications()]);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'attendance':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'deadline':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'request':
        return <FileCheck2 className="w-4 h-4 text-emerald-500" />;
      case 'badge':
        return <Award className="w-4 h-4 text-[var(--accent-yellow)]" />;
      default:
        return <BookOpen className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <PortalLayout currentPath="/notifications" title="Notifications">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[var(--accent-yellow)]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--app-text)]">
              Activity Alerts
            </h2>
          </div>

          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-xs font-bold text-[var(--app-text)] transition flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                handleMarkRead(n.id);
                if (n.link) navigate(n.link);
              }}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                n.read
                  ? 'bg-[var(--app-surface)] border-[var(--app-border)] opacity-80'
                  : 'bg-[var(--app-surface)] border-[var(--app-border)] shadow-[var(--card-shadow)] ring-1 ring-[var(--accent-yellow)]/50'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-extrabold text-[var(--app-text)]">{n.title}</h3>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[var(--accent-yellow)] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[var(--app-text-muted)] mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-[var(--app-text-muted)] font-mono mt-2 block">
                    {n.date}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkRead(n.id);
                  }}
                  className="text-[10px] font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] shrink-0 underline"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
};
