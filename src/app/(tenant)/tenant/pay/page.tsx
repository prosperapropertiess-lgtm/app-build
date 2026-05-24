"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TenantPayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get active lease for this tenant
    const { data: lease } = await supabase
      .from("leases")
      .select("*")
      .eq("tenant_id", user.id)
      .eq("status", "active")
      .single();

    if (!lease) {
      setError("No active lease found");
      setLoading(false);
      return;
    }

    // Create payment record
    const { error: payError } = await supabase.from("payments").insert({
      tenant_id: user.id,
      lease_id: lease.id,
      amount: parseFloat(amount),
      method: "card",
      status: "pending",
    });

    if (payError) {
      setError(payError.message);
      setLoading(false);
      return;
    }

    // For MVP: Show success (Stripe integration comes in task 18)
    alert("Payment submitted! In production, this would redirect to Stripe.");
    router.push("/tenant/dashboard");
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Tenant</p>
        <h1 className="text-2xl font-bold text-white">Pay Rent</h1>
        <p className="mt-1" style={{ color: "#6b8aad" }}>Make a payment towards your rent</p>
      </div>

      <div className="rounded-2xl p-6" style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#c8d6e5" }}>Payment Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#6b8aad" }}>$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl text-white text-2xl"
                style={{ background: "var(--navy-800)", border: "1px solid var(--navy-600)" }}
                placeholder="0.00"
                step="0.01"
                min="1"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--navy-800)" }}>
            <h3 className="text-white font-medium mb-3">Payment Method</h3>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ border: "1px solid var(--gold-500)", background: "rgba(201,168,76,0.08)" }}>
              <span className="text-2xl">💳</span>
              <div>
                <p className="text-white font-medium">Credit/Debit Card</p>
                <p className="text-sm" style={{ color: "#4a6480" }}>Visa, Mastercard, Amex</p>
              </div>
              <span className="ml-auto" style={{ color: "var(--gold-400)" }}>✓</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 font-bold rounded-xl text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: "var(--gold-500)", color: "#060d1a" }}
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>

          <p className="text-sm text-center" style={{ color: "#4a6480" }}>
            🔒 Payments are processed securely via Stripe
          </p>
        </form>
      </div>
    </div>
  );
}
