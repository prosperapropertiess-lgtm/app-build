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

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;
  if (!request) return <div className="text-red-400 py-8">Request not found</div>;

  return (
    <div className="space-y-8">
      <div>
        <button onClick={() => router.push("/maintenance")} className="text-zinc-400 hover:text-white text-sm mb-3">← Back</button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{request.title}</h1>
            <p className="text-zinc-500 text-sm">
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-zinc-400 text-sm mb-3">Tenant</h3>
          <p className="text-white font-medium">{request.tenants?.full_name || "—"}</p>
          <p className="text-zinc-500 text-sm">{request.tenants?.email}</p>
          {request.tenants?.phone && <p className="text-zinc-500 text-sm">{request.tenants.phone}</p>}
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-zinc-400 text-sm mb-3">Assigned Contractor</h3>
          {request.contractors ? (
            <>
              <p className="text-white font-medium">{request.contractors.name}</p>
              <p className="text-zinc-500 text-sm">{request.contractors.email}</p>
              {request.contractors.phone && <p className="text-zinc-500 text-sm">{request.contractors.phone}</p>}
            </>
          ) : (
            <p className="text-zinc-500">Not assigned</p>
          )}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Description</h3>
        <p className="text-zinc-300">{request.description}</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
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
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                request.status === status
                  ? "bg-green-500 text-zinc-950"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}