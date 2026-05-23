"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [workOrder, setWorkOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchWorkOrder = async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          contractors (name, phone, email),
          maintenance_requests (title, description)
        `)
        .eq("id", params.id as string)
        .single();

      if (!error && data) setWorkOrder(data);
      setLoading(false);
    };

    fetchWorkOrder();
  }, [params.id]);

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;
  if (!workOrder) return <div className="text-red-400 py-8">Work order not found</div>;

  return (
    <div className="space-y-8">
      <div>
        <button onClick={() => router.push("/maintenance")} className="text-zinc-400 hover:text-white text-sm mb-3">← Back</button>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">Work Order</h1>
          <span className={`px-4 py-2 text-sm font-medium rounded-full ${
            workOrder.status === "completed" ? "bg-green-500/20 text-green-400" :
            workOrder.status === "in_progress" ? "bg-blue-500/20 text-blue-400" :
            "bg-yellow-500/20 text-yellow-400"
          }`}>
            {workOrder.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm mb-2">Estimated Cost</p>
          <p className="text-3xl font-bold text-white">${workOrder.estimated_cost || "0.00"}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm mb-2">Contractor</p>
          <p className="text-white font-medium">{workOrder.contractors?.name || "Unassigned"}</p>
          {workOrder.contractors?.phone && <p className="text-zinc-500 text-sm">{workOrder.contractors.phone}</p>}
        </div>
      </div>

      {workOrder.maintenance_requests && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-3">Maintenance Request</h3>
          <p className="text-lg text-white">{workOrder.maintenance_requests.title}</p>
          <p className="text-zinc-400 text-sm mt-2">{workOrder.maintenance_requests.description}</p>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Update Status</h3>
        <div className="flex gap-2 flex-wrap">
          {["pending", "assigned", "in_progress", "completed", "paid"].map((status) => (
            <button
              key={status}
              onClick={async () => {
                const supabase = createClient();
                await supabase.from("work_orders").update({ status }).eq("id", workOrder.id);
                setWorkOrder((p: any) => ({ ...p, status }));
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                workOrder.status === status
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