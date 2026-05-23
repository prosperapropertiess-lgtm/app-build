"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function TenantProfilePage() {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("tenants")
        .select("*, units(unit_number, properties(address_line_1))")
        .eq("id", user.id)
        .single();

      if (!error && data) setTenant(data);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;
  if (!tenant) return <div className="text-red-400 py-8">Profile not found</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">My Profile</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
        <div>
          <label className="text-zinc-400 text-sm">Full Name</label>
          <p className="text-white text-xl font-semibold">{tenant.full_name || "—"}</p>
        </div>
        <div>
          <label className="text-zinc-400 text-sm">Email</label>
          <p className="text-white">{tenant.email}</p>
        </div>
        <div>
          <label className="text-zinc-400 text-sm">Phone</label>
          <p className="text-white">{tenant.phone || "—"}</p>
        </div>
        {tenant.units && (
          <div>
            <label className="text-zinc-400 text-sm">Unit</label>
            <p className="text-white">
              {tenant.units.properties?.address_line_1} — Unit {tenant.units.unit_number}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}