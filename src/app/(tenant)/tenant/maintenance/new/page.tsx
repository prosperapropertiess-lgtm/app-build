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

  const inputClass = "w-full px-4 py-3 rounded-xl text-white";
  const inputStyle = { background: "var(--navy-800)", border: "1px solid var(--navy-600)" };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Tenant</p>
        <h1 className="text-2xl font-bold text-white">New Maintenance Request</h1>
        <p className="mt-1" style={{ color: "#6b8aad" }}>Describe the issue you're experiencing</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl p-6 space-y-5" style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#c8d6e5" }}>Issue Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              className={inputClass}
              style={inputStyle}
              placeholder="e.g., Leaking faucet in bathroom"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#c8d6e5" }}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              className={inputClass}
              style={inputStyle}
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
            <label className="block text-sm font-medium mb-2" style={{ color: "#c8d6e5" }}>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className={`${inputClass} min-h-[120px]`}
              style={inputStyle}
              placeholder="Describe the issue in detail..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#c8d6e5" }}>Priority</label>
            <div className="flex gap-2">
              {["low", "normal", "urgent"].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, priority }))}
                  className="flex-1 py-3 rounded-xl font-medium text-sm transition-opacity hover:opacity-80"
                  style={
                    formData.priority === priority
                      ? priority === "urgent"
                        ? { background: "#ef4444", color: "#fff" }
                        : priority === "low"
                        ? { background: "var(--navy-700)", color: "#c8d6e5" }
                        : { background: "var(--gold-500)", color: "#060d1a" }
                      : { background: "var(--navy-800)", color: "#6b8aad" }
                  }
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
            className="flex-1 py-3 text-white font-medium rounded-xl hover:opacity-80 transition-opacity"
            style={{ background: "var(--navy-800)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: "var(--gold-500)", color: "#060d1a" }}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
