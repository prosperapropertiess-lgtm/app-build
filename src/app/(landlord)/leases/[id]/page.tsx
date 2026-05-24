"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function LeaseDetailPage() {
  const [lease, setLease] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const path = window.location.pathname;
    const id = path.split("/leases/")[1];

    const fetchLease = async () => {
      const { data, error } = await supabase
        .from("leases")
        .select("*, tenants(full_name, email, phone), units(unit_number, properties(address_line_1))")
        .eq("id", id)
        .single();

      if (!error && data) setLease(data);
      setLoading(false);
    };

    fetchLease();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
    </div>
  );
  if (!lease) return <div className="text-red-400 py-8">Lease not found</div>;

  const cardStyle = { background: "var(--navy-900)", border: "1px solid var(--navy-700)" };

  return (
    <div className="space-y-8">
      <div>
        <a href="/leases" className="text-sm mb-3 block hover:text-white transition-colors" style={{ color: "#6b8aad" }}>← Back to Leases</a>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {lease.units?.properties?.address_line_1} — Unit {lease.units?.unit_number}
            </h1>
            <p style={{ color: "#6b8aad" }}>{lease.tenants?.full_name}</p>
          </div>
          <span className={`px-4 py-2 text-sm font-medium rounded-full ${
            lease.status === "active" ? "bg-green-500/20 text-green-400" : ""
          }`} style={lease.status !== "active" ? { background: "var(--navy-700)", color: "#6b8aad" } : undefined}>
            {lease.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-6" style={cardStyle}>
          <p className="text-sm mb-2" style={{ color: "#6b8aad" }}>Monthly Rent</p>
          <p className="text-3xl font-bold text-white">${lease.rent_amount}/mo</p>
          <p className="text-sm mt-1" style={{ color: "#4a6480" }}>Due day {lease.rent_due_day}</p>
        </div>
        <div className="rounded-2xl p-6" style={cardStyle}>
          <p className="text-sm mb-2" style={{ color: "#6b8aad" }}>Security Deposit</p>
          <p className="text-3xl font-bold text-white">${lease.deposit_amount || "0.00"}</p>
        </div>
        <div className="rounded-2xl p-6" style={cardStyle}>
          <p className="text-sm mb-2" style={{ color: "#6b8aad" }}>Start Date</p>
          <p className="text-xl font-semibold text-white">{new Date(lease.start_date).toLocaleDateString()}</p>
        </div>
        <div className="rounded-2xl p-6" style={cardStyle}>
          <p className="text-sm mb-2" style={{ color: "#6b8aad" }}>End Date</p>
          <p className="text-xl font-semibold text-white">{new Date(lease.end_date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="rounded-2xl p-6" style={cardStyle}>
        <h2 className="text-white font-semibold mb-4">Tenant Contact</h2>
        <p className="text-white">{lease.tenants?.full_name}</p>
        <p className="text-sm" style={{ color: "#6b8aad" }}>{lease.tenants?.email}</p>
        {lease.tenants?.phone && <p className="text-sm" style={{ color: "#6b8aad" }}>{lease.tenants.phone}</p>}
      </div>
    </div>
  );
}
