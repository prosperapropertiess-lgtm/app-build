"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Tenant {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  invite_status: string;
  unit_id: string;
  payment_streak: number;
  created_at: string;
  units?: { unit_number: string; properties?: { address_line_1: string } };
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchTenants = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("tenants")
        .select(`*, units (unit_number, properties (address_line_1))`)
        .eq("landlord_id", user.id).order("created_at", { ascending: false });
      if (!error) setTenants(data || []);
      setLoading(false);
    };
    fetchTenants();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>People</p>
          <h1 className="text-2xl font-bold text-white">Tenants</h1>
        </div>
        <Link href="/tenants/invite"
          className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "var(--gold-500)", color: "#060d1a" }}
        >
          + Invite Tenant
        </Link>
      </div>

      {tenants.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(201,168,76,0.08)" }}>
            <span className="text-3xl">👤</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No tenants yet</h3>
          <p className="text-sm mb-6" style={{ color: "#6b8aad" }}>Invite your first tenant to get started</p>
          <Link href="/tenants/invite"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90"
            style={{ background: "var(--gold-500)", color: "#060d1a" }}
          >
            + Invite Your First Tenant
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {tenants.map(tenant => <TenantCard key={tenant.id} tenant={tenant} />)}
        </div>
      )}
    </div>
  );
}

function TenantCard({ tenant }: { tenant: Tenant }) {
  const active = tenant.invite_status === "accepted";
  const initials = tenant.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
        style={{ background: "rgba(201,168,76,0.15)", color: "var(--gold-400)" }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">{tenant.full_name || "Unnamed Tenant"}</p>
        <p className="text-xs truncate mt-0.5" style={{ color: "#6b8aad" }}>{tenant.email}</p>
        {tenant.units?.properties && (
          <p className="text-xs mt-0.5 truncate" style={{ color: "#4a6480" }}>
            {tenant.units.properties.address_line_1}
            {tenant.units.unit_number ? ` — Unit ${tenant.units.unit_number}` : ""}
          </p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium"
          style={active
            ? { background: "rgba(52,211,153,0.15)", color: "#34d399" }
            : { background: "rgba(201,168,76,0.15)", color: "var(--gold-400)" }
          }>
          {active ? "Active" : "Pending"}
        </span>
        {tenant.payment_streak > 0 && (
          <p className="text-xs mt-1" style={{ color: "#4a6480" }}>🔥 {tenant.payment_streak}mo</p>
        )}
      </div>
    </div>
  );
}
