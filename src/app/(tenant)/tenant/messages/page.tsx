"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  read: boolean;
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
        const unread = data.filter((m) => m.recipient_id === user.id && !m.read);
        unread.forEach((m) => {
          supabase.from("messages").update({ read: true }).eq("id", m.id);
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
      setMessages((prev) => [...prev, { id: Date.now().toString(), content: newMessage, sender_id: user.id, read: true, created_at: new Date().toISOString() }]);
      setNewMessage("");
    }
  };

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Messages</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 min-h-[400px] flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-zinc-500">No messages yet</p>
          </div>
        ) : (
          <div className="flex-1 space-y-4 mb-4">
            {messages.map((message) => (
              <div key={message.id} className={`p-4 rounded-xl ${message.sender_id === message.recipient_id ? "bg-zinc-800" : "bg-zinc-800/50"}`}>
                <p className="text-zinc-300">{message.content}</p>
                <p className="text-zinc-500 text-xs mt-2">{new Date(message.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="flex gap-3 mt-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
            placeholder="Type a message..."
          />
          <button type="submit" className="px-6 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}