"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function MaintenanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchRequest = async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select(`
          *,
          units (unit_number, properties (address_line_1)),
          tenants (full_name, email, phone),
          contractors (name, phone, email)
        `)
        .eq("id", params.id as string)
        .single();

      if (!error && data) setRequest(data);
      setLoading(false);
    };

    fetchRequest();
  }, [params.id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
    </div>
  );
  if (!request) return <div className="text-red-400 py-8">Request not found</div>;

  const cardStyle = { background: "var(--navy-900)", border: "1px solid var(--navy-700)" };

  return (
    <div className="space-y-8">
      <div>
        <button onClick={() => router.push("/maintenance")} className="text-sm mb-3 hover:text-white transition-colors" style={{ color: "#6b8aad" }}>← Back</button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{request.title}</h1>
            <p className="text-sm" style={{ color: "#4a6480" }}>
              {request.units?.properties?.address_line_1} — Unit {request.units?.unit_number}
            </p>
          </div>
          <span className={`px-4 py-2 text-sm font-medium rounded-full ${
            request.status === "completed" ? "bg-green-500/20 text-green-400" :
            request.status === "in_progress" ? "bg-blue-500/20 text-blue-400" :
            "bg-yellow-500/20 text-yellow-400"
          }`}>
            {request.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 className="text-sm mb-3" style={{ color: "#6b8aad" }}>Tenant</h3>
          <p className="text-white font-medium">{request.tenants?.full_name || "—"}</p>
          <p className="text-sm" style={{ color: "#4a6480" }}>{request.tenants?.email}</p>
          {request.tenants?.phone && <p className="text-sm" style={{ color: "#4a6480" }}>{request.tenants.phone}</p>}
        </div>
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 className="text-sm mb-3" style={{ color: "#6b8aad" }}>Assigned Contractor</h3>
          {request.contractors ? (
            <>
              <p className="text-white font-medium">{request.contractors.name}</p>
              <p className="text-sm" style={{ color: "#4a6480" }}>{request.contractors.email}</p>
              {request.contractors.phone && <p className="text-sm" style={{ color: "#4a6480" }}>{request.contractors.phone}</p>}
            </>
          ) : (
            <p style={{ color: "#4a6480" }}>Not assigned</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl p-6" style={cardStyle}>
        <h3 className="text-white font-semibold mb-4">Description</h3>
        <p style={{ color: "#c8d6e5" }}>{request.description}</p>
      </div>

      <div className="rounded-2xl p-6" style={cardStyle}>
        <h3 className="text-white font-semibold mb-4">Update Status</h3>
        <div className="flex gap-2 flex-wrap">
          {["open", "assigned", "in_progress", "completed", "closed"].map((status) => (
            <button
              key={status}
              onClick={async () => {
                const supabase = createClient();
                await supabase.from("maintenance_requests").update({ status }).eq("id", request.id);
                setRequest((p: any) => ({ ...p, status }));
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
              style={
                request.status === status
                  ? { background: "var(--gold-500)", color: "#060d1a" }
                  : { background: "var(--navy-800)", color: "#c8d6e5" }
              }
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
