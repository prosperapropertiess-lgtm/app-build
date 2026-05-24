"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalProperties: number;
  totalUnits: number;
  totalTenants: number;
  openMaintenance: number;
  rentCollected: number;
  rentPending: number;
  recentPayments: any[];
  recentMaintenance: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0, totalUnits: 0, totalTenants: 0, openMaintenance: 0,
    rentCollected: 0, rentPending: 0, recentPayments: [], recentMaintenance: [],
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserName(user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "");

      const [
        { count: propertyCount },
        { count: unitCount },
        { count: tenantCount },
        { count: maintenanceCount },
        { data: payments },
        { data: maintenance },
      ] = await Promise.all([
        supabase.from("properties").select("*", { count: "exact", head: true }).eq("landlord_id", user.id),
        supabase.from("units").select("*", { count: "exact", head: true }),
        supabase.from("tenants").select("*", { count: "exact", head: true }).eq("landlord_id", user.id),
        supabase.from("maintenance_requests").select("*", { count: "exact", head: true }).eq("landlord_id", user.id).not("status", "eq", "completed").not("status", "eq", "closed"),
        supabase.from("payments").select("*").eq("landlord_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("maintenance_requests").select("*").eq("landlord_id", user.id).order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        totalProperties: propertyCount || 0, totalUnits: unitCount || 0,
        totalTenants: tenantCount || 0, openMaintenance: maintenanceCount || 0,
        rentCollected: 0, rentPending: 0,
        recentPayments: payments || [], recentMaintenance: maintenance || [],
      });
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
      </div>
    );
  }

  const statCards = [
    { label: "Properties", value: stats.totalProperties, icon: "🏠", href: "/properties" },
    { label: "Units", value: stats.totalUnits, icon: "🔑", href: "/properties" },
    { label: "Tenants", value: stats.totalTenants, icon: "👤", href: "/tenants" },
    { label: "Open Issues", value: stats.openMaintenance, icon: "🔧", href: "/maintenance", alert: stats.openMaintenance > 0 },
  ];

  const quickActions = [
    { href: "/properties/new", label: "Add Property", icon: "🏠" },
    { href: "/tenants/invite", label: "Invite Tenant", icon: "✉️" },
    { href: "/leases/new", label: "New Lease", icon: "📄" },
    { href: "/financials", label: "Financials", icon: "💰" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm mb-1" style={{ color: "#4a6480" }}>Good to see you back</p>
        <h1 className="text-2xl font-bold text-white">{userName ? `Hello, ${userName}` : "Dashboard"}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(card => (
          <Link key={card.label} href={card.href}
            className="rounded-2xl p-5 flex flex-col gap-3 transition-all hover:scale-[1.02]"
            style={{ background: "var(--navy-900)", border: `1px solid ${card.alert ? "rgba(201,168,76,0.4)" : "var(--navy-700)"}` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">{card.icon}</span>
              {card.alert && (
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--gold-500)" }} />
              )}
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{card.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "#6b8aad" }}>{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#4a6480" }}>Quick Actions</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(action => (
            <Link key={action.href} href={action.href}
              className="rounded-xl p-4 flex items-center gap-3 transition-all hover:scale-[1.02]"
              style={{ background: "var(--navy-800)", border: "1px solid var(--navy-700)" }}
            >
              <span className="text-lg">{action.icon}</span>
              <span className="text-sm font-medium text-white">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Payments */}
        <div className="rounded-2xl p-5" style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Payments</h2>
            <Link href="/financials" className="text-xs" style={{ color: "var(--gold-400)" }}>View all →</Link>
          </div>
          {stats.recentPayments.length === 0 ? (
            <EmptyState message="No payments yet" />
          ) : (
            <div className="space-y-1">
              {stats.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-3"
                  style={{ borderBottom: "1px solid var(--navy-800)" }}>
                  <div>
                    <p className="text-white font-medium text-sm">${payment.amount?.toFixed(2) || "0.00"}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#4a6480" }}>{payment.type || "Rent"}</p>
                  </div>
                  <StatusBadge status={payment.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Maintenance */}
        <div className="rounded-2xl p-5" style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Maintenance</h2>
            <Link href="/maintenance" className="text-xs" style={{ color: "var(--gold-400)" }}>View all →</Link>
          </div>
          {stats.recentMaintenance.length === 0 ? (
            <EmptyState message="No maintenance requests" />
          ) : (
            <div className="space-y-1">
              {stats.recentMaintenance.map((req) => (
                <div key={req.id} className="flex items-center justify-between py-3"
                  style={{ borderBottom: "1px solid var(--navy-800)" }}>
                  <div>
                    <p className="text-white font-medium text-sm">{req.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#4a6480" }}>
                      {new Date(req.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <PriorityBadge priority={req.priority} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    completed: { bg: "rgba(52,211,153,0.15)", color: "#34d399" },
    pending: { bg: "rgba(201,168,76,0.15)", color: "var(--gold-400)" },
    failed: { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
  };
  const s = styles[status] || { bg: "rgba(107,138,173,0.15)", color: "#6b8aad" };
  return (
    <span className="text-xs px-2 py-1 rounded-full capitalize" style={{ background: s.bg, color: s.color }}>
      {status || "unknown"}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    emergency: { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
    urgent: { bg: "rgba(251,146,60,0.15)", color: "#fb923c" },
    normal: { bg: "rgba(201,168,76,0.15)", color: "var(--gold-400)" },
    low: { bg: "rgba(107,138,173,0.15)", color: "#6b8aad" },
  };
  const s = styles[priority] || { bg: "rgba(107,138,173,0.15)", color: "#6b8aad" };
  return (
    <span className="text-xs px-2 py-1 rounded-full capitalize" style={{ background: s.bg, color: s.color }}>
      {priority || "—"}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8" style={{ color: "#4a6480" }}>
      <p className="text-sm">{message}</p>
    </div>
  );
}
