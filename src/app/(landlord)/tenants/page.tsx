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
  units?: {
    unit_number: string;
    properties?: {
      address_line_1: string;
    };
  };
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchTenants = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("tenants")
        .select(`
          *,
          units (
            unit_number,
            properties (
              address_line_1
            )
          )
        `)
        .eq("landlord_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setTenants(data || []);
      }
      setLoading(false);
    };

    fetchTenants();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading tenants...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tenants</h1>
          <p className="text-zinc-400">Manage your tenants</p>
        </div>
        <Link
          href="/tenants/invite"
          className="px-6 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors"
        >
          + Invite Tenant
        </Link>
      </div>

      {tenants.length === 0 ? (
        <EmptyTenantsState />
      ) : (
        <div className="grid gap-4">
          {tenants.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}
    </div>
  );
}

function TenantCard({ tenant }: { tenant: Tenant }) {
  const property = tenant.units?.properties;
  const unitNumber = tenant.units?.unit_number;

  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            {tenant.full_name || "Unnamed Tenant"}
          </h3>
          <p className="text-zinc-400 text-sm mb-2">{tenant.email}</p>
          {property && (
            <p className="text-zinc-500 text-sm">
              {property.address_line_1}
              {unitNumber && ` — Unit ${unitNumber}`}
            </p>
          )}
        </div>
        <div className="text-right">
          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-2 ${
            tenant.invite_status === "accepted"
              ? "bg-green-500/20 text-green-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}>
            {tenant.invite_status === "accepted" ? "Active" : "Pending"}
          </span>
          {tenant.payment_streak > 0 && (
            <p className="text-zinc-400 text-sm">
              🔥 {tenant.payment_streak} month streak
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyTenantsState() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
      <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl text-zinc-600">◐</span>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No tenants yet</h3>
      <p className="text-zinc-400 mb-6">Invite your first tenant to get started</p>
      <Link
        href="/tenants/invite"
        className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors"
      >
        + Invite Your First Tenant
      </Link>
    </div>
  );
}