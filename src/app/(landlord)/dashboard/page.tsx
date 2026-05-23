"use client";

import { createClient } from "@/lib/supabase";
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
    totalProperties: 0,
    totalUnits: 0,
    totalTenants: 0,
    openMaintenance: 0,
    rentCollected: 0,
    rentPending: 0,
    recentPayments: [],
    recentMaintenance: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      // Get landlord ID from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch properties count
      const { count: propertyCount } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("landlord_id", user.id);

      // Fetch units count
      const { count: unitCount } = await supabase
        .from("units")
        .select("*", { count: "exact", head: true });

      // Fetch tenants count
      const { count: tenantCount } = await supabase
        .from("tenants")
        .select("*", { count: "exact", head: true })
        .eq("landlord_id", user.id);

      // Fetch open maintenance
      const { count: maintenanceCount } = await supabase
        .from("maintenance_requests")
        .select("*", { count: "exact", head: true })
        .eq("landlord_id", user.id)
        .not("status", "eq", "completed")
        .not("status", "eq", "closed");

      // Fetch recent payments
      const { data: payments } = await supabase
        .from("payments")
        .select("*")
        .eq("landlord_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch recent maintenance
      const { data: maintenance } = await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("landlord_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalProperties: propertyCount || 0,
        totalUnits: unitCount || 0,
        totalTenants: tenantCount || 0,
        openMaintenance: maintenanceCount || 0,
        rentCollected: 0,
        rentPending: 0,
        recentPayments: payments || [],
        recentMaintenance: maintenance || [],
      });

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">Here's an overview of your properties</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Properties" value={stats.totalProperties} icon="◈" color="text-violet-400" />
        <StatCard label="Units" value={stats.totalUnits} icon="◉" color="text-blue-400" />
        <StatCard label="Tenants" value={stats.totalTenants} icon="◐" color="text-cyan-400" />
        <StatCard label="Open Maintenance" value={stats.openMaintenance} icon="◑" color="text-orange-400" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction href="/properties/new" label="Add Property" icon="+" />
        <QuickAction href="/tenants/invite" label="Invite Tenant" icon="→" />
        <QuickAction href="/maintenance" label="View Maintenance" icon="◑" />
        <QuickAction href="/financials" label="Financials" icon="◎" />
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Payments</h2>
          {stats.recentPayments.length === 0 ? (
            <EmptyState message="No payments yet" />
          ) : (
            <div className="space-y-3">
              {stats.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                  <div>
                    <p className="text-white font-medium">${payment.amount?.toFixed(2) || "0.00"}</p>
                    <p className="text-zinc-500 text-sm">{payment.type || "Rent"}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${payment.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Maintenance */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Maintenance</h2>
          {stats.recentMaintenance.length === 0 ? (
            <EmptyState message="No maintenance requests" />
          ) : (
            <div className="space-y-3">
              {stats.recentMaintenance.map((request) => (
                <div key={request.id} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                  <div>
                    <p className="text-white font-medium">{request.title}</p>
                    <p className="text-zinc-500 text-sm">{new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className={`text-2xl ${color}`}>{icon}</span>
        <span className="text-zinc-400 text-sm">{label}</span>
      </div>
      <p className="text-4xl font-bold text-white">{value}</p>
    </div>
  );
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      className="bg-zinc-800 border border-zinc-700 hover:border-zinc-600 rounded-2xl p-6 flex items-center gap-4 transition-colors group"
    >
      <span className="text-2xl text-green-400 group-hover:text-green-300">{icon}</span>
      <span className="text-white font-medium">{label}</span>
    </a>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-zinc-500">
      <p>{message}</p>
    </div>
  );
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "urgent":
    case "emergency":
      return "bg-red-500/20 text-red-400";
    case "normal":
      return "bg-yellow-500/20 text-yellow-400";
    case "low":
      return "bg-blue-500/20 text-blue-400";
    default:
      return "bg-zinc-500/20 text-zinc-400";
  }
}