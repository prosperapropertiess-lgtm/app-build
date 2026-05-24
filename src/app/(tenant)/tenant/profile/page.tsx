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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
    </div>
  );
  if (!tenant) return <div className="text-red-400 py-8">Profile not found</div>;

  const cardStyle = { background: "var(--navy-900)", border: "1px solid var(--navy-700)" };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Tenant</p>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
      </div>

      <div className="rounded-2xl p-6 space-y-6" style={cardStyle}>
        <div>
          <label className="text-sm" style={{ color: "#6b8aad" }}>Full Name</label>
          <p className="text-white text-xl font-semibold">{tenant.full_name || "—"}</p>
        </div>
        <div>
          <label className="text-sm" style={{ color: "#6b8aad" }}>Email</label>
          <p className="text-white">{tenant.email}</p>
        </div>
        <div>
          <label className="text-sm" style={{ color: "#6b8aad" }}>Phone</label>
          <p className="text-white">{tenant.phone || "—"}</p>
        </div>
        {tenant.units && (
          <div>
            <label className="text-sm" style={{ color: "#6b8aad" }}>Unit</label>
            <p className="text-white">
              {tenant.units.properties?.address_line_1} — Unit {tenant.units.unit_number}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
