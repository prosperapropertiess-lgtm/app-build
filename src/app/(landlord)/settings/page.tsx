"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [landlord, setLandlord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("landlords")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) setLandlord(data);
      setLoading(false);
    };

    fetchSettings();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
    </div>
  );

  const cardStyle = { background: "var(--navy-900)", border: "1px solid var(--navy-700)" };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Account</p>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1" style={{ color: "#6b8aad" }}>Manage your account and preferences</p>
      </div>

      <div className="rounded-2xl p-6 space-y-6" style={cardStyle}>
        <div>
          <label className="text-sm" style={{ color: "#6b8aad" }}>Full Name</label>
          <p className="text-white text-xl font-semibold">{landlord?.full_name || "—"}</p>
        </div>
        <div>
          <label className="text-sm" style={{ color: "#6b8aad" }}>Email</label>
          <p className="text-white">{landlord?.email || "—"}</p>
        </div>
        <div>
          <label className="text-sm" style={{ color: "#6b8aad" }}>Phone</label>
          <p className="text-white">{landlord?.phone || "—"}</p>
        </div>
      </div>

      <div className="rounded-2xl p-6" style={cardStyle}>
        <h2 className="text-white font-semibold mb-4">Connected Services</h2>
        <div className="space-y-3">
          <a href="/settings/stripe" className="flex items-center justify-between p-4 rounded-xl hover:opacity-80 transition-opacity" style={{ background: "var(--navy-800)" }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <p className="text-white font-medium">Stripe Connect</p>
                <p className="text-sm" style={{ color: "#4a6480" }}>Accept online payments</p>
              </div>
            </div>
            <span style={{ color: "#6b8aad" }}>→</span>
          </a>
        </div>
      </div>

      <div className="rounded-2xl p-6" style={cardStyle}>
        <h2 className="text-white font-semibold mb-4">Notifications</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span style={{ color: "#c8d6e5" }}>Email notifications</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
          </label>
          <label className="flex items-center justify-between">
            <span style={{ color: "#c8d6e5" }}>Push notifications</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
          </label>
          <label className="flex items-center justify-between">
            <span style={{ color: "#c8d6e5" }}>Payment alerts</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
          </label>
        </div>
      </div>
    </div>
  );
}
