"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender: { full_name: string; email: string };
}

export default function LandlordMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:profiles(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error) setMessages(data || []);
      setLoading(false);
    };

    fetchMessages();
  }, []);

  const unreadCount = messages.filter((m) => !m.read).length;

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
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Communication</p>
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="mt-1" style={{ color: "#6b8aad" }}>Communicate with your tenants</p>
        </div>
        {unreadCount > 0 && (
          <span className="px-3 py-1 text-sm font-semibold rounded-full" style={{ background: "var(--gold-500)", color: "#060d1a" }}>
            {unreadCount} unread
          </span>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={cardStyle}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(201,168,76,0.08)" }}>
            <p className="text-3xl">💬</p>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
          <p style={{ color: "#6b8aad" }}>Start a conversation with your tenants</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          {messages.map((message) => (
            <div
              key={message.id}
              className="p-4 last:border-0 transition-colors"
              style={{
                borderBottom: "1px solid var(--navy-700)",
                background: !message.read ? "rgba(201,168,76,0.04)" : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <p className="text-white font-medium">{message.sender?.full_name || "Unknown"}</p>
                <span className="text-xs" style={{ color: "#4a6480" }}>{new Date(message.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm line-clamp-2" style={{ color: "#c8d6e5" }}>{message.content}</p>
              {!message.read && <span className="inline-block w-2 h-2 rounded-full mt-2" style={{ background: "var(--gold-500)" }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
