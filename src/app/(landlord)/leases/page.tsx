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

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Leases</h1>
          <p className="text-zinc-400">Manage your lease agreements</p>
        </div>
        <Link href="/leases/new" className="px-6 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors">
          + New Lease
        </Link>
      </div>

      {leases.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-3xl mb-4">📋</p>
          <h3 className="text-xl font-semibold text-white mb-2">No leases yet</h3>
          <p className="text-zinc-400 mb-6">Create your first lease to get started</p>
          <Link href="/leases/new" className="inline-block px-6 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors">
            + Create Your First Lease
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {leases.map((lease) => (
            <Link key={lease.id} href={`/leases/${lease.id}`} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {lease.units?.properties?.address_line_1} — Unit {lease.units?.unit_number}
                  </h3>
                  <p className="text-zinc-400 text-sm">{lease.tenants?.full_name || "No tenant"}</p>
                  <p className="text-zinc-500 text-sm">
                    {new Date(lease.start_date).toLocaleDateString()} → {new Date(lease.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">${lease.rent_amount}/mo</p>
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mt-2 ${
                    lease.status === "active" ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"
                  }`}>
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