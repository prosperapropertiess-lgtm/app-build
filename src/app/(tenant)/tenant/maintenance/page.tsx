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

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white mb-2">Maintenance</h1>
        <a href="/tenant/maintenance/new" className="px-6 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors">
          + New Request
        </a>
      </div>

      {requests.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-3xl mb-4">🔧</p>
          <h3 className="text-xl font-semibold text-white mb-2">No maintenance requests</h3>
          <p className="text-zinc-400 mb-6">Something broken? Let us know</p>
          <a href="/tenant/maintenance/new" className="inline-block px-6 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors">
            Submit a Request
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
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
              <p className="text-zinc-500 text-sm">
                Submitted {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}