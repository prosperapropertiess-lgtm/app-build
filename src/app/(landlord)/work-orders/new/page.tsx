"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function NewWorkOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contractors, setContractors] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    maintenance_request_id: "",
    contractor_id: "",
    description: "",
    estimated_cost: "",
    priority: "normal",
  });

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [contractorsRes, requestsRes] = await Promise.all([
        supabase.from("contractors").select("*").order("name"),
        supabase.from("maintenance_requests").select("*").order("created_at", { ascending: false }),
      ]);

      setContractors(contractorsRes.data || []);
      setMaintenanceRequests(requestsRes.data || []);
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error: insertError } = await supabase.from("work_orders").insert({
      maintenance_request_id: formData.maintenance_request_id || null,
      contractor_id: formData.contractor_id || null,
      landlord_id: (await supabase.auth.getUser()).data.user?.id,
      description: formData.description,
      estimated_cost: parseFloat(formData.estimated_cost) || 0,
      priority: formData.priority,
      status: "pending",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/maintenance");
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Work Order</h1>
        <p className="text-zinc-400">Create a work order for a contractor</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Maintenance Request</label>
            <select
              value={formData.maintenance_request_id}
              onChange={(e) => setFormData((p) => ({ ...p, maintenance_request_id: e.target.value }))}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
            >
              <option value="">Select a request (optional)</option>
              {maintenanceRequests.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Contractor</label>
            <select
              value={formData.contractor_id}
              onChange={(e) => setFormData((p) => ({ ...p, contractor_id: e.target.value }))}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
            >
              <option value="">Select a contractor (optional)</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.specialty}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white min-h-[100px]"
              placeholder="Describe the work to be done..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Estimated Cost</label>
              <input
                type="number"
                value={formData.estimated_cost}
                onChange={(e) => setFormData((p) => ({ ...p, estimated_cost: e.target.value }))}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData((p) => ({ ...p, priority: e.target.value }))}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button type="button" onClick={() => router.back()} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors disabled:opacity-50">
            {loading ? "Creating..." : "Create Work Order"}
          </button>
        </div>
      </form>
    </div>
  );
}