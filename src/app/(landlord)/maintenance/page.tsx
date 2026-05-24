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

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  completed: { bg: "rgba(52,211,153,0.15)", color: "#34d399", label: "Completed" },
  in_progress: { bg: "rgba(96,165,250,0.15)", color: "#60a5fa", label: "In Progress" },
  assigned: { bg: "rgba(167,139,250,0.15)", color: "#a78bfa", label: "Assigned" },
  open: { bg: "rgba(201,168,76,0.15)", color: "var(--gold-400)", label: "Open" },
};

const priorityStyle: Record<string, { bg: string; color: string }> = {
  emergency: { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
  urgent: { bg: "rgba(251,146,60,0.15)", color: "#fb923c" },
  high: { bg: "rgba(251,146,60,0.15)", color: "#fb923c" },
  normal: { bg: "rgba(201,168,76,0.15)", color: "var(--gold-400)" },
  low: { bg: "rgba(107,138,173,0.15)", color: "#6b8aad" },
};

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const supabase = createClient();
    const fetchRequests = async () => {
      const { data, error } = await supabase.from("maintenance_requests")
        .select(`*, units (unit_number, properties (address_line_1)), tenants (full_name)`)
        .order("created_at", { ascending: false });
      if (!error) setRequests(data || []);
      setLoading(false);
    };
    fetchRequests();
  }, []);

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
      </div>
    );
  }

  const counts = {
    all: requests.length,
    open: requests.filter(r => r.status === "open").length,
    in_progress: requests.filter(r => r.status === "in_progress").length,
    completed: requests.filter(r => r.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Operations</p>
        <h1 className="text-2xl font-bold text-white">Maintenance</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "open", "in_progress", "completed"] as const).map(status => (
          <button key={status} onClick={() => setFilter(status)}
            className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
            style={filter === status
              ? { background: "var(--gold-500)", color: "#060d1a" }
              : { background: "var(--navy-800)", color: "#6b8aad", border: "1px solid var(--navy-700)" }
            }
          >
            {status.replace("_", " ")} <span className="opacity-60">({counts[status]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}>
          <p className="text-3xl mb-3">🔧</p>
          <h3 className="text-lg font-semibold text-white mb-2">No maintenance requests</h3>
          <p className="text-sm" style={{ color: "#6b8aad" }}>Tenant requests will appear here</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(req => {
            const ss = statusStyle[req.status] || { bg: "rgba(107,138,173,0.15)", color: "#6b8aad", label: req.status };
            const ps = priorityStyle[req.priority] || { bg: "rgba(107,138,173,0.15)", color: "#6b8aad" };
            return (
              <Link key={req.id} href={`/maintenance/${req.id}`}
                className="block rounded-2xl p-5 transition-all hover:scale-[1.01]"
                style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{req.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#4a6480" }}>
                      {req.units?.properties?.address_line_1}
                      {req.units?.unit_number ? ` — Unit ${req.units.unit_number}` : ""}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                    style={{ background: ss.bg, color: ss.color }}>
                    {ss.label}
                  </span>
                </div>
                <p className="text-sm line-clamp-1 mb-3" style={{ color: "#6b8aad" }}>{req.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: "#4a6480" }}>
                    {req.tenants?.full_name} · {new Date(req.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                  </p>
                  {req.priority && (
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{ background: ps.bg, color: ps.color }}>
                      {req.priority}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
