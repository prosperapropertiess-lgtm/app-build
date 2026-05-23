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

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
          <p className="text-zinc-400">Communicate with your tenants</p>
        </div>
        {unreadCount > 0 && (
          <span className="px-3 py-1 bg-green-500 text-zinc-950 text-sm font-semibold rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-3xl mb-4">💬</p>
          <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
          <p className="text-zinc-400">Start a conversation with your tenants</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors ${!message.read ? "bg-zinc-800/30" : ""}`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <p className="text-white font-medium">{message.sender?.full_name || "Unknown"}</p>
                <span className="text-zinc-500 text-xs">{new Date(message.created_at).toLocaleString()}</span>
              </div>
              <p className="text-zinc-300 text-sm line-clamp-2">{message.content}</p>
              {!message.read && <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}