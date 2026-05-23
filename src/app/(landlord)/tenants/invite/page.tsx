"use client";

import { createClient } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InviteTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone: "",
    property_id: "",
    unit_id: "",
  });
  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  const handlePropertyChange = async (propertyId: string) => {
    setFormData((prev) => ({ ...prev, property_id: propertyId, unit_id: "" }));
    setUnits([]);

    if (!propertyId) return;

    const supabase = createClient();
    const { data } = await supabase
      .from("units")
      .select("*")
      .eq("property_id", propertyId);

    setUnits(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create invite record
    const token = crypto.randomUUID();
    const { error: inviteError } = await supabase
      .from("tenant_invites")
      .insert({
        landlord_id: user.id,
        email: formData.email,
        unit_id: formData.unit_id || null,
        token,
      });

    if (inviteError) {
      setError(inviteError.message);
      setLoading(false);
      return;
    }

    // For MVP, show success and skip email sending
    // TODO: Implement email sending via Resend
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-xl">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-green-400">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Invite Created</h2>
          <p className="text-zinc-400 mb-6">
            Share this link with your tenant:
          </p>
          <div className="bg-zinc-800 rounded-xl p-4 mb-6">
            <code className="text-green-400 text-sm break-all">
              {typeof window !== "undefined" ? window.location.origin : ""}/invite/{crypto.randomUUID().slice(0, 8)}...
            </code>
          </div>
          <p className="text-zinc-500 text-sm mb-6">
            Email sending will be set up in a future update.
          </p>
          <button
            onClick={() => router.push("/tenants")}
            className="px-6 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors"
          >
            Back to Tenants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Invite Tenant</h1>
        <p className="text-zinc-400">Invite a tenant to join your property</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
              Tenant Email *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
              placeholder="tenant@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-zinc-300 mb-2">
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
              placeholder="Jane Smith"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
              placeholder="+1 (519) 555-0123"
            />
          </div>

          <div>
            <label htmlFor="property_id" className="block text-sm font-medium text-zinc-300 mb-2">
              Property
            </label>
            <select
              id="property_id"
              value={formData.property_id}
              onChange={(e) => handlePropertyChange(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
            >
              <option value="">Select a property</option>
            </select>
            <p className="text-zinc-500 text-xs mt-1">Property selection will be enabled after loading</p>
          </div>

          {units.length > 0 && (
            <div>
              <label htmlFor="unit_id" className="block text-sm font-medium text-zinc-300 mb-2">
                Unit
              </label>
              <select
                id="unit_id"
                value={formData.unit_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, unit_id: e.target.value }))}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
              >
                <option value="">Select a unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    Unit {unit.unit_number}
                  </option>
                ))}
              </select>
            </div>
          )}
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
            {loading ? "Sending..." : "Send Invite"}
          </button>
        </div>
      </form>
    </div>
  );
}