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

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-zinc-400">Manage your account and preferences</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
        <div>
          <label className="text-zinc-400 text-sm">Full Name</label>
          <p className="text-white text-xl font-semibold">{landlord?.full_name || "—"}</p>
        </div>
        <div>
          <label className="text-zinc-400 text-sm">Email</label>
          <p className="text-white">{landlord?.email || "—"}</p>
        </div>
        <div>
          <label className="text-zinc-400 text-sm">Phone</label>
          <p className="text-white">{landlord?.phone || "—"}</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Connected Services</h2>
        <div className="space-y-3">
          <a href="/settings/stripe" className="flex items-center justify-between p-4 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <p className="text-white font-medium">Stripe Connect</p>
                <p className="text-zinc-500 text-sm">Accept online payments</p>
              </div>
            </div>
            <span className="text-zinc-400">→</span>
          </a>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Notifications</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-zinc-300">Email notifications</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-zinc-300">Push notifications</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-zinc-300">Payment alerts</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
          </label>
        </div>
      </div>
    </div>
  );
}