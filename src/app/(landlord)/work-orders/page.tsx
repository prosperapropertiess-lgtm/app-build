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
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Maintenance</p>
          <h1 className="text-2xl font-bold text-white">Work Orders</h1>
          <p className="mt-1" style={{ color: "#6b8aad" }}>Manage contractor work</p>
        </div>
        <Link href="/work-orders/new" className="px-6 py-3 font-semibold rounded-xl hover:opacity-90 transition-opacity" style={{ background: "var(--gold-500)", color: "#060d1a" }}>
          + New Work Order
        </Link>
      </div>

      {workOrders.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={cardStyle}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(201,168,76,0.08)" }}>
            <p className="text-3xl">📋</p>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No work orders yet</h3>
          <p style={{ color: "#6b8aad" }}>Create work orders to track contractor jobs</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--navy-700)" }}>
                <th className="text-left px-6 py-4 text-sm" style={{ color: "#6b8aad" }}>Description</th>
                <th className="text-left px-6 py-4 text-sm" style={{ color: "#6b8aad" }}>Contractor</th>
                <th className="text-right px-6 py-4 text-sm" style={{ color: "#6b8aad" }}>Est. Cost</th>
                <th className="text-right px-6 py-4 text-sm" style={{ color: "#6b8aad" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((order) => (
                <tr key={order.id} className="last:border-0 hover:opacity-80 transition-opacity" style={{ borderBottom: "1px solid var(--navy-700)" }}>
                  <td className="px-6 py-4">
                    <Link href={`/work-orders/${order.id}`} className="hover:opacity-80 transition-opacity">
                      <p className="font-medium line-clamp-1 text-white">{order.description}</p>
                      <p className="text-xs" style={{ color: "#4a6480" }}>{order.maintenance_requests?.title || "No request"}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: "#c8d6e5" }}>{order.contractors?.name || "Unassigned"}</td>
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
