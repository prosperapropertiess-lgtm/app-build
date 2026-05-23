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

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;
  if (!lease) return <div className="text-red-400 py-8">Lease not found</div>;

  return (
    <div className="space-y-8">
      <div>
        <a href="/leases" className="text-zinc-400 hover:text-white text-sm mb-3 block">← Back to Leases</a>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {lease.units?.properties?.address_line_1} — Unit {lease.units?.unit_number}
            </h1>
            <p className="text-zinc-400">{lease.tenants?.full_name}</p>
          </div>
          <span className={`px-4 py-2 text-sm font-medium rounded-full ${
            lease.status === "active" ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"
          }`}>
            {lease.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm mb-2">Monthly Rent</p>
          <p className="text-3xl font-bold text-white">${lease.rent_amount}/mo</p>
          <p className="text-zinc-500 text-sm mt-1">Due day {lease.rent_due_day}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm mb-2">Security Deposit</p>
          <p className="text-3xl font-bold text-white">${lease.deposit_amount || "0.00"}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm mb-2">Start Date</p>
          <p className="text-xl font-semibold text-white">{new Date(lease.start_date).toLocaleDateString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm mb-2">End Date</p>
          <p className="text-xl font-semibold text-white">{new Date(lease.end_date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Tenant Contact</h2>
        <p className="text-white">{lease.tenants?.full_name}</p>
        <p className="text-zinc-400 text-sm">{lease.tenants?.email}</p>
        {lease.tenants?.phone && <p className="text-zinc-400 text-sm">{lease.tenants.phone}</p>}
      </div>
    </div>
  );
}