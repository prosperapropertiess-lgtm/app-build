"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  units: { unit_number: string; properties: { address_line_1: string } };
  tenants: { full_name: string };
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const supabase = createClient();

    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select(`
          *,
          units (unit_number, properties (address_line_1)),
          tenants (full_name)
        `)
        .order("created_at", { ascending: false });

      if (!error) setRequests(data || []);
      setLoading(false);
    };

    fetchRequests();
  }, []);

  const filteredRequests = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;

  const statusCounts = {
    all: requests.length,
    open: requests.filter((r) => r.status === "open").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Maintenance</h1>
        <p className="text-zinc-400">Track and manage maintenance requests</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "open", "in_progress", "completed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === status
                ? "bg-green-500 text-zinc-950"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {status.replace("_", " ")} ({statusCounts[status as keyof typeof statusCounts]})
          </button>
        ))}
      </div>

      {/* List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-3xl mb-4">🔧</p>
          <h3 className="text-xl font-semibold text-white mb-2">No maintenance requests</h3>
          <p className="text-zinc-400">Requests from tenants will appear here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <Link
              key={request.id}
              href={`/maintenance/${request.id}`}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{request.title}</h3>
                  <p className="text-zinc-500 text-sm">
                    {request.units?.properties?.address_line_1} — Unit {request.units?.unit_number}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  request.status === "completed" ? "bg-green-500/20 text-green-400" :
                  request.status === "in_progress" ? "bg-blue-500/20 text-blue-400" :
                  request.status === "assigned" ? "bg-purple-500/20 text-purple-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {request.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-zinc-400 text-sm line-clamp-2">{request.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-zinc-500 text-xs">
                  {request.tenants?.full_name} • {new Date(request.created_at).toLocaleDateString()}
                </span>
                {request.priority && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    request.priority === "urgent" ? "bg-red-500/20 text-red-400" :
                    request.priority === "high" ? "bg-orange-500/20 text-orange-400" :
                    "bg-zinc-700 text-zinc-400"
                  }`}>
                    {request.priority}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}