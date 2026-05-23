"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface WorkOrder {
  id: string;
  description: string;
  status: string;
  priority: string;
  estimated_cost: number;
  created_at: string;
  maintenance_requests: { title: string };
}

export default function ContractorDashboardPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchWorkOrders = async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("*, maintenance_requests(title)")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error) setWorkOrders(data || []);
      setLoading(false);
    };

    fetchWorkOrders();
  }, []);

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Contractor Portal</h1>
        <p className="text-zinc-400">View and manage your work orders</p>
      </div>

      {workOrders.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-3xl mb-4">🔨</p>
          <h3 className="text-xl font-semibold text-white mb-2">No work orders</h3>
          <p className="text-zinc-400">You&apos;ll see work orders here when landlords assign them to you</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {workOrders.map((order) => (
            <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {order.maintenance_requests?.title || "Work Order"}
                  </h3>
                  <p className="text-zinc-500 text-sm">#{order.id.slice(0, 8)}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  order.status === "completed" ? "bg-green-500/20 text-green-400" :
                  order.status === "in_progress" ? "bg-blue-500/20 text-blue-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {order.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-zinc-400 text-sm mb-4">{order.description}</p>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded ${
                  order.priority === "urgent" ? "bg-red-500/20 text-red-400" :
                  order.priority === "high" ? "bg-orange-500/20 text-orange-400" :
                  "bg-zinc-700 text-zinc-400"
                }`}>
                  {order.priority}
                </span>
                <span className="text-zinc-500 text-sm">
                  Est: ${order.estimated_cost || "0.00"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}