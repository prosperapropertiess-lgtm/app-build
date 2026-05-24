"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Lease {
  id: string;
  unit_id: string;
  status: string;
  rent_amount: number;
  rent_due_day: number;
  start_date: string;
  end_date: string;
  tenants: { full_name: string; email: string };
  units: { unit_number: string; properties: { address_line_1: string } };
}

export default function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchLeases = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("leases")
        .select(`
          *,
          tenants (full_name, email),
          units (unit_number, properties (address_line_1))
        `)
        .order("created_at", { ascending: false });

      if (!error) setLeases(data || []);
      setLoading(false);
    };

    fetchLeases();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Management</p>
          <h1 className="text-2xl font-bold text-white">Leases</h1>
          <p className="mt-1" style={{ color: "#6b8aad" }}>Manage your lease agreements</p>
        </div>
        <Link href="/leases/new" className="px-6 py-3 font-semibold rounded-xl hover:opacity-90 transition-opacity" style={{ background: "var(--gold-500)", color: "#060d1a" }}>
          + New Lease
        </Link>
      </div>

      {leases.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(201,168,76,0.08)" }}>
            <p className="text-3xl">📋</p>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No leases yet</h3>
          <p className="mb-6" style={{ color: "#6b8aad" }}>Create your first lease to get started</p>
          <Link href="/leases/new" className="inline-block px-6 py-3 font-semibold rounded-xl hover:opacity-90 transition-opacity" style={{ background: "var(--gold-500)", color: "#060d1a" }}>
            + Create Your First Lease
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {leases.map((lease) => (
            <Link key={lease.id} href={`/leases/${lease.id}`} className="rounded-2xl p-6 block hover:scale-[1.01] transition-transform" style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {lease.units?.properties?.address_line_1} — Unit {lease.units?.unit_number}
                  </h3>
                  <p className="text-sm" style={{ color: "#6b8aad" }}>{lease.tenants?.full_name || "No tenant"}</p>
                  <p className="text-sm" style={{ color: "#4a6480" }}>
                    {new Date(lease.start_date).toLocaleDateString()} → {new Date(lease.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">${lease.rent_amount}/mo</p>
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mt-2 ${
                    lease.status === "active" ? "bg-green-500/20 text-green-400" : ""
                  }`} style={lease.status !== "active" ? { background: "var(--navy-700)", color: "#6b8aad" } : undefined}>
                    {lease.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
