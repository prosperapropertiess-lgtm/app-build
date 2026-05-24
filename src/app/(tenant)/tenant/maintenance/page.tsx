"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface MaintenanceRequest {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
}

export default function TenantMaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchRequests = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setRequests(data || []);
      setLoading(false);
    };

    fetchRequests();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
    </div>
  );

  const cardStyle = { background: "var(--navy-900)", border: "1px solid var(--navy-700)" };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Tenant</p>
          <h1 className="text-2xl font-bold text-white">Maintenance</h1>
        </div>
        <a href="/tenant/maintenance/new" className="px-6 py-3 font-semibold rounded-xl hover:opacity-90 transition-opacity" style={{ background: "var(--gold-500)", color: "#060d1a" }}>
          + New Request
        </a>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={cardStyle}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(201,168,76,0.08)" }}>
            <p className="text-3xl">🔧</p>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No maintenance requests</h3>
          <p className="mb-6" style={{ color: "#6b8aad" }}>Something broken? Let us know</p>
          <a href="/tenant/maintenance/new" className="inline-block px-6 py-3 font-semibold rounded-xl hover:opacity-90 transition-opacity" style={{ background: "var(--gold-500)", color: "#060d1a" }}>
            Submit a Request
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div key={request.id} className="rounded-2xl p-6" style={cardStyle}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-lg font-semibold text-white">{request.title}</h3>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  request.status === "completed" ? "bg-green-500/20 text-green-400" :
                  request.status === "in_progress" ? "bg-blue-500/20 text-blue-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {request.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm" style={{ color: "#4a6480" }}>
                Submitted {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
