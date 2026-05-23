"use client";

import { createClient } from "@/lib/supabase";
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

      // Fetch tenant data
      const { data: tenant } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", user.id)
        .single();

      // Fetch active lease
      const { data: lease } = await supabase
        .from("leases")
        .select("*")
        .eq("tenant_id", user.id)
        .eq("status", "active")
        .single();

      // Fetch recent payments
      const { data: payments } = await supabase
        .from("payments")
        .select("*")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch maintenance requests
      const { data: maintenance } = await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      setData({
        tenant,
        lease,
        upcomingPayment: payments?.find(p => p.status === "pending"),
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
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Hello, {data?.tenant?.full_name?.split(" ")[0] || "Tenant"}
        </h1>
        <p className="text-zinc-400">Here's your rental overview</p>
      </div>

      {/* Payment Streak */}
      {data?.paymentStreak && data.paymentStreak > 0 && (
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/20 rounded-2xl p-6 text-center">
          <p className="text-5xl mb-2">🔥</p>
          <p className="text-3xl font-bold text-white">{data.paymentStreak}</p>
          <p className="text-orange-300 text-sm">Month Streak — keep it up!</p>
        </div>
      )}

      {/* Rent Due Card */}
      {data?.lease ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Next Rent Payment</h2>
            <span className="text-xs text-zinc-500">
              Due day {data.lease.rent_due_day} of each month
            </span>
          </div>

          <div className="mb-4">
            <p className="text-4xl font-bold text-white">
              ${data.lease.rent_amount?.toFixed(2) || "0.00"}
            </p>
            <p className="text-zinc-400 text-sm">Monthly rent</p>
          </div>

          <a
            href="/tenant/pay"
            className="block w-full py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl text-center transition-colors"
          >
            Pay Now
          </a>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
          <p className="text-zinc-400">No active lease found</p>
        </div>
      )}

      {/* Maintenance */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Maintenance Requests</h2>
          <a href="/tenant/maintenance/new" className="text-green-400 text-sm hover:text-green-300">
            + New Request
          </a>
        </div>

        {data?.maintenanceRequests && data.maintenanceRequests.length > 0 ? (
          <div className="space-y-3">
            {data.maintenanceRequests.map((request: any) => (
              <div
                key={request.id}
                className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0"
              >
                <div>
                  <p className="text-white font-medium">{request.title}</p>
                  <p className="text-zinc-500 text-sm">{request.status}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-center py-4">No maintenance requests</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <a
          href="/tenant/payments"
          className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-center hover:border-zinc-600 transition-colors"
        >
          <span className="text-2xl mb-2 block">📜</span>
          <span className="text-white text-sm">Payment History</span>
        </a>
        <a
          href="/tenant/documents"
          className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-center hover:border-zinc-600 transition-colors"
        >
          <span className="text-2xl mb-2 block">📄</span>
          <span className="text-white text-sm">Documents</span>
        </a>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
    case "closed":
      return "bg-green-500/20 text-green-400";
    case "in_progress":
      return "bg-blue-500/20 text-blue-400";
    case "assigned":
      return "bg-purple-500/20 text-purple-400";
    default:
      return "bg-yellow-500/20 text-yellow-400";
  }
}