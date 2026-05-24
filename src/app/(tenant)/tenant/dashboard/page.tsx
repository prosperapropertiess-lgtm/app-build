"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TenantDashboardData {
  tenant: any;
  lease: any;
  upcomingPayment: any;
  maintenanceRequests: any[];
  paymentStreak: number;
}

export default function TenantDashboardPage() {
  const [data, setData] = useState<TenantDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: tenant }, { data: lease }, { data: payments }, { data: maintenance }] = await Promise.all([
        supabase.from("tenants").select("*").eq("id", user.id).single(),
        supabase.from("leases").select("*").eq("tenant_id", user.id).eq("status", "active").single(),
        supabase.from("payments").select("*").eq("tenant_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("maintenance_requests").select("*").eq("tenant_id", user.id).order("created_at", { ascending: false }).limit(3),
      ]);

      setData({
        tenant, lease,
        upcomingPayment: payments?.find((p: any) => p.status === "pending"),
        maintenanceRequests: maintenance || [],
        paymentStreak: tenant?.payment_streak || 0,
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

  const firstName = data?.tenant?.full_name?.split(" ")[0] || "there";

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div>
        <p className="text-xs mb-1" style={{ color: "#4a6480" }}>Tenant Portal</p>
        <h1 className="text-2xl font-bold text-white">Hello, {firstName}</h1>
      </div>

      {/* Payment Streak */}
      {data?.paymentStreak && data.paymentStreak > 0 && (
        <div className="rounded-2xl p-5 text-center"
          style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)" }}>
          <p className="text-4xl mb-1">🔥</p>
          <p className="text-3xl font-bold text-white">{data.paymentStreak}</p>
          <p className="text-sm mt-1" style={{ color: "var(--gold-400)" }}>month payment streak — keep it up!</p>
        </div>
      )}

      {/* Rent Due */}
      {data?.lease ? (
        <div className="rounded-2xl p-5" style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Next Rent</h2>
            <span className="text-xs" style={{ color: "#4a6480" }}>Due day {data.lease.rent_due_day}</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            ${data.lease.rent_amount?.toFixed(2) || "0.00"}
          </p>
          <p className="text-sm mb-5" style={{ color: "#6b8aad" }}>Monthly rent</p>
          <Link href="/tenant/pay"
            className="block w-full py-3 rounded-xl text-center text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "var(--gold-500)", color: "#060d1a" }}
          >
            Pay Now
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl p-6 text-center" style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}>
          <p className="text-sm" style={{ color: "#6b8aad" }}>No active lease on file</p>
        </div>
      )}

      {/* Maintenance */}
      <div className="rounded-2xl p-5" style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Maintenance</h2>
          <Link href="/tenant/maintenance/new" className="text-xs font-medium" style={{ color: "var(--gold-400)" }}>
            + New Request
          </Link>
        </div>
        {data?.maintenanceRequests && data.maintenanceRequests.length > 0 ? (
          <div>
            {data.maintenanceRequests.map((req: any) => (
              <div key={req.id} className="flex items-center justify-between py-3"
                style={{ borderBottom: "1px solid var(--navy-800)" }}>
                <div>
                  <p className="text-white text-sm font-medium">{req.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#4a6480" }}>{req.status}</p>
                </div>
                <StatusDot status={req.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-sm" style={{ color: "#4a6480" }}>No maintenance requests</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: "/tenant/payments", icon: "📜", label: "Payment History" },
          { href: "/tenant/profile", icon: "👤", label: "My Profile" },
          { href: "/tenant/messages", icon: "💬", label: "Messages" },
          { href: "/tenant/maintenance", icon: "🔧", label: "All Requests" },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:scale-[1.02]"
            style={{ background: "var(--navy-800)", border: "1px solid var(--navy-700)" }}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-medium text-white">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: "#34d399", closed: "#34d399",
    in_progress: "#60a5fa",
    assigned: "#a78bfa",
  };
  return (
    <span className="w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: colors[status] || "var(--gold-500)" }} />
  );
}
