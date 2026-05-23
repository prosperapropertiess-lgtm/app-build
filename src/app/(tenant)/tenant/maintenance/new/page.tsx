"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewMaintenanceRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "normal",
    category: "general",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get tenant's unit
    const { data: tenant } = await supabase
      .from("tenants")
      .select("unit_id")
      .eq("id", user.id)
      .single();

    if (!tenant?.unit_id) {
      setError("No unit associated with your account");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("maintenance_requests").insert({
      tenant_id: user.id,
      unit_id: tenant.unit_id,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      category: formData.category,
      status: "open",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/tenant/dashboard");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">New Maintenance Request</h1>
        <p className="text-zinc-400">Describe the issue you're experiencing</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Issue Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
              placeholder="e.g., Leaking faucet in bathroom"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
            >
              <option value="general">General</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="hvac">Heating/Cooling</option>
              <option value="appliance">Appliance</option>
              <option value="structural">Structural</option>
              <option value="pest">Pest Control</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white min-h-[120px]"
              placeholder="Describe the issue in detail..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Priority</label>
            <div className="flex gap-2">
              {["low", "normal", "urgent"].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, priority }))}
                  className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors ${
                    formData.priority === priority
                      ? priority === "urgent"
                        ? "bg-red-500 text-white"
                        : priority === "low"
                        ? "bg-zinc-600 text-zinc-300"
                        : "bg-green-500 text-zinc-950"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}