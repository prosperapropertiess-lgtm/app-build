"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchWorkOrders = async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("*, contractors(name), maintenance_requests(title)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error) setWorkOrders(data || []);
      setLoading(false);
    };

    fetchWorkOrders();
  }, []);

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Work Orders</h1>
          <p className="text-zinc-400">Manage contractor work</p>
        </div>
        <Link href="/work-orders/new" className="px-6 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors">
          + New Work Order
        </Link>
      </div>

      {workOrders.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-3xl mb-4">📋</p>
          <h3 className="text-xl font-semibold text-white mb-2">No work orders yet</h3>
          <p className="text-zinc-400">Create work orders to track contractor jobs</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-6 py-4 text-zinc-400 text-sm">Description</th>
                <th className="text-left px-6 py-4 text-zinc-400 text-sm">Contractor</th>
                <th className="text-right px-6 py-4 text-zinc-400 text-sm">Est. Cost</th>
                <th className="text-right px-6 py-4 text-zinc-400 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((order) => (
                <tr key={order.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50">
                  <td className="px-6 py-4">
                    <Link href={`/work-orders/${order.id}`} className="text-white hover:text-green-400">
                      <p className="font-medium line-clamp-1">{order.description}</p>
                      <p className="text-zinc-500 text-xs">{order.maintenance_requests?.title || "No request"}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-zinc-300 text-sm">{order.contractors?.name || "Unassigned"}</td>
                  <td className="px-6 py-4 text-right text-white font-medium">${order.estimated_cost || "0.00"}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      order.status === "completed" ? "bg-green-500/20 text-green-400" :
                      order.status === "in_progress" ? "bg-blue-500/20 text-blue-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}