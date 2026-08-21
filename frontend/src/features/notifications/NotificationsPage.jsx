import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, CheckCheck, Sparkles, FolderKanban } from 'lucide-react';
import { notificationService } from '../../services/collaboration.service';
import { Card, Button, Badge, LoadingSpinner, EmptyState } from '../../components/ui';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading notifications..." />;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time updates regarding task assignments, comments, and project updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button size="sm" variant="outline" icon={CheckCheck} onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <Card className="divide-y divide-slate-100 overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                !notif.isRead ? 'bg-[#F0FDFA]' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    !notif.isRead ? 'bg-[#0F766E] text-white' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkRead(notif._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#0F766E] hover:bg-teal-50 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="You don't have any notifications right now."
        />
      )}
    </div>
  );
};
