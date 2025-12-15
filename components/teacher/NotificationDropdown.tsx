'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/notifications";
import { formatDate, formatTime } from "@/lib/utils";
import type { Notification } from "@/types";

interface NotificationDropdownProps {
  teacherId: string;
}

export default function NotificationDropdown({ teacherId }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadNotifications();

    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [teacherId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadNotifications = () => {
    const notifs = getNotifications(teacherId);
    setNotifications(notifs);
  };

  const handleNotificationClick = (notification: Notification) => {
    markNotificationRead(notification.id);
    setNotifications(prev => prev.filter(n => n.id !== notification.id));

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }

    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead(teacherId);
    setNotifications([]);
  };

  const unreadCount = notifications.length;

  const notificationIcon = (category: Notification['category']) => {
    switch (category) {
      case 'at-risk': return '⚠️';
      case 'new-result': return '📊';
      case 'deadline': return '⏰';
      case 'system': return '🔔';
      default: return '💬';
    }
  };

  const notificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'alert': return { bg: '#ff6b6b20', text: '#ff6b6b', border: '#ff6b6b40' };
      case 'success': return { bg: '#00ff8820', text: '#00ff88', border: '#00ff8840' };
      case 'reminder': return { bg: '#ffd06020', text: '#ffd060', border: '#ffd06040' };
      default: return { bg: '#00d4ff20', text: '#00d4ff', border: '#00d4ff40' };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-11 w-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#00d4ff]/40 transition grid place-content-center"
        aria-label="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-white text-xs font-bold grid place-content-center ring-2 ring-[#0f0f1a]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-[500px] overflow-y-auto rounded-2xl glass-surface border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-50">
          <div className="sticky top-0 glass-surface border-b border-white/10 p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#0f172a]">Notifications</h3>
              <p className="text-xs text-[#334155]">{unreadCount} unread</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#00d4ff] hover:text-[#00d4ff]/80 font-semibold"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-500 grid place-content-center text-3xl mx-auto mb-3">
                ✅
              </div>
              <p className="text-sm text-[#334155]">All caught up!</p>
              <p className="text-xs text-[#334155]">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map(notification => {
                const colors = notificationColor(notification.type);

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="w-full p-4 text-left hover:bg-white/5 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="h-10 w-10 rounded-lg grid place-content-center text-xl flex-shrink-0 ring-1"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                          borderColor: colors.border
                        }}
                      >
                        {notificationIcon(notification.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#0f172a] text-sm mb-1">{notification.title}</h4>
                        <p className="text-xs text-[#334155] mb-2">{notification.message}</p>
                        <p className="text-[10px] text-[#334155]">
                          {formatDate(notification.timestamp)} at {formatTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
