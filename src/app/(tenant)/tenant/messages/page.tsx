"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  is_read: boolean;
  created_at: string;
}

export default function TenantMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();

    const fetchMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: true });

      if (!error) setMessages(data || []);

      // Mark as read
      if (data) {
        const unread = data.filter((m) => m.recipient_id === user.id && !m.is_read);
        unread.forEach((m) => {
          supabase.from("messages").update({ is_read: true }).eq("id", m.id);
        });
      }

      setLoading(false);
    };

    fetchMessages();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      recipient_id: user.id, // Simplified for MVP
      content: newMessage,
    });

    if (!error) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), content: newMessage, sender_id: user.id, recipient_id: user.id, is_read: true, created_at: new Date().toISOString() }]);
      setNewMessage("");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Tenant</p>
        <h1 className="text-2xl font-bold text-white">Messages</h1>
      </div>

      <div className="rounded-2xl p-6 min-h-[400px] flex flex-col" style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}>
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p style={{ color: "#4a6480" }}>No messages yet</p>
          </div>
        ) : (
          <div className="flex-1 space-y-4 mb-4">
            {messages.map((message) => (
              <div key={message.id} className="p-4 rounded-xl" style={{ background: "var(--navy-800)" }}>
                <p style={{ color: "#c8d6e5" }}>{message.content}</p>
                <p className="text-xs mt-2" style={{ color: "#4a6480" }}>{new Date(message.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="flex gap-3 mt-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl text-white"
            style={{ background: "var(--navy-800)", border: "1px solid var(--navy-600)" }}
            placeholder="Type a message..."
          />
          <button type="submit" className="px-6 py-3 font-semibold rounded-xl hover:opacity-90 transition-opacity" style={{ background: "var(--gold-500)", color: "#060d1a" }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
