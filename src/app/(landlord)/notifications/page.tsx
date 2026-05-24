"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Notification {
  id: string;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error) setNotifications(data || []);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
    </div>
  );

  const cardStyle = { background: "var(--navy-900)", border: "1px solid var(--navy-700)" };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Alerts</p>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="mt-1" style={{ color: "#6b8aad" }}>Stay updated on your properties</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="px-4 py-2 text-white text-sm rounded-xl hover:opacity-80 transition-opacity"
            style={{ background: "var(--navy-800)" }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={cardStyle}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(201,168,76,0.08)" }}>
            <p className="text-3xl">🔔</p>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No notifications</h3>
          <p style={{ color: "#6b8aad" }}>You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 last:border-0"
              style={{
                borderBottom: "1px solid var(--navy-700)",
                background: !notification.is_read ? "rgba(201,168,76,0.04)" : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium" style={{ color: notification.is_read ? "#6b8aad" : undefined }}>
                    {!notification.is_read && <span className="text-white">{notification.title}</span>}
                    {notification.is_read && notification.title}
                  </p>
                  <p className="text-sm mt-1" style={{ color: "#4a6480" }}>{notification.content}</p>
                  <p className="text-xs mt-2" style={{ color: "#3d5473" }}>
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                {!notification.is_read && (
                  <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: "var(--gold-500)" }} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
