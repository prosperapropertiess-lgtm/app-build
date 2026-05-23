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
        <h1 className="text-3xl font-bold text-white mb-2">Pay Rent</h1>
        <p className="text-zinc-400">Make a payment towards your rent</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Payment Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-2xl"
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

          <div className="bg-zinc-800 rounded-xl p-4 space-y-3">
            <h3 className="text-white font-medium mb-3">Payment Method</h3>
            <div className="flex items-center gap-3 p-3 border border-green-500/50 bg-green-500/10 rounded-xl">
              <span className="text-2xl">💳</span>
              <div>
                <p className="text-white font-medium">Credit/Debit Card</p>
                <p className="text-zinc-500 text-sm">Visa, Mastercard, Amex</p>
              </div>
              <span className="ml-auto text-green-400">✓</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-green-500 hover:bg-green-400 text-zinc-950 font-bold rounded-xl text-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>

          <p className="text-zinc-500 text-sm text-center">
            🔒 Payments are processed securely via Stripe
          </p>
        </form>
      </div>
    </div>
  );
}