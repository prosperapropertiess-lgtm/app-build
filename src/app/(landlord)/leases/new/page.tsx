"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function NewLeasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    property_id: "",
    unit_id: "",
    tenant_email: "",
    rent_amount: "",
    rent_due_day: "1",
    start_date: "",
    end_date: "",
    deposit_amount: "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("properties").select("*").eq("landlord_id", user.id).then(({ data }) => {
          setProperties(data || []);
        });
      }
    });
  }, []);

  const handlePropertyChange = async (propertyId: string) => {
    setFormData((prev) => ({ ...prev, property_id: propertyId, unit_id: "" }));
    const supabase = createClient();
    const { data } = await supabase.from("units").select("*").eq("property_id", propertyId);
    setUnits(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create or find tenant
    const { data: existingTenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("email", formData.tenant_email)
      .single();

    let tenantId = existingTenant?.id;

    if (!tenantId) {
      // Create tenant record
      const { data: newTenant, error: tenantError } = await supabase
        .from("tenants")
        .insert({
          landlord_id: user.id,
          email: formData.tenant_email,
          invite_status: "pending",
        })
        .select()
        .single();

      if (tenantError) {
        setError(tenantError.message);
        setLoading(false);
        return;
      }
      tenantId = newTenant.id;
    }

    // Create lease
    const { error: leaseError } = await supabase.from("leases").insert({
      tenant_id: tenantId,
      unit_id: formData.unit_id,
      status: "active",
      rent_amount: parseFloat(formData.rent_amount),
      rent_due_day: parseInt(formData.rent_due_day),
      start_date: formData.start_date,
      end_date: formData.end_date,
      deposit_amount: parseFloat(formData.deposit_amount) || 0,
    });

    if (leaseError) {
      setError(leaseError.message);
      setLoading(false);
      return;
    }

    // Update unit status
    await supabase.from("units").update({ status: "occupied" }).eq("id", formData.unit_id);

    router.push("/leases");
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Lease</h1>
        <p className="text-zinc-400">Create a new lease agreement</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Property & Unit</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Property *</label>
            <select value={formData.property_id} onChange={(e) => handlePropertyChange(e.target.value)} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white" required>
              <option value="">Select property</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.address_line_1}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Unit *</label>
            <select value={formData.unit_id} onChange={(e) => setFormData((p) => ({ ...p, unit_id: e.target.value }))} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white" required disabled={!formData.property_id}>
              <option value="">Select unit</option>
              {units.map((u) => <option key={u.id} value={u.id}>Unit {u.unit_number}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Lease Terms</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Tenant Email *</label>
            <input type="email" value={formData.tenant_email} onChange={(e) => setFormData((p) => ({ ...p, tenant_email: e.target.value }))} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white" placeholder="tenant@email.com" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Monthly Rent *</label>
              <input type="number" value={formData.rent_amount} onChange={(e) => setFormData((p) => ({ ...p, rent_amount: e.target.value }))} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white" placeholder="1500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Rent Due Day *</label>
              <input type="number" min="1" max="28" value={formData.rent_due_day} onChange={(e) => setFormData((p) => ({ ...p, rent_due_day: e.target.value }))} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Start Date *</label>
              <input type="date" value={formData.start_date} onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">End Date *</label>
              <input type="date" value={formData.end_date} onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Security Deposit</label>
            <input type="number" value={formData.deposit_amount} onChange={(e) => setFormData((p) => ({ ...p, deposit_amount: e.target.value }))} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white" placeholder="0" />
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"><p className="text-red-400 text-sm">{error}</p></div>}

        <div className="flex gap-4">
          <button type="button" onClick={() => router.back()} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors disabled:opacity-50">
            {loading ? "Creating..." : "Create Lease"}
          </button>
        </div>
      </form>
    </div>
  );
}