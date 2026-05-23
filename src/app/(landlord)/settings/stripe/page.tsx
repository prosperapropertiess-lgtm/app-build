"use client";

import { createClient } from "@/lib/supabase";
import { useState } from "react";

export default function StripeConnectPage() {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    // In production, this would redirect to Stripe Connect OAuth
    // For MVP, simulate the connection
    setTimeout(() => {
      setConnected(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Stripe Connect</h1>
        <p className="text-zinc-400">Accept rent payments online via Stripe</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        {connected ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl text-green-400">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Stripe Connected!</h2>
            <p className="text-zinc-400">You can now accept payments from tenants</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-6xl mb-4 block">💳</span>
              <h2 className="text-2xl font-bold text-white mb-2">Connect Stripe</h2>
              <p className="text-zinc-400">
                Accept credit/debit cards, bank transfers, and more
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-zinc-800 rounded-xl">
                <span className="text-green-400 text-xl">✓</span>
                <div>
                  <p className="text-white font-medium">Instant payouts</p>
                  <p className="text-zinc-500 text-sm">Get paid faster with direct deposits</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-zinc-800 rounded-xl">
                <span className="text-green-400 text-xl">✓</span>
                <div>
                  <p className="text-white font-medium">Auto-pay setup</p>
                  <p className="text-zinc-500 text-sm">Tenants can set up recurring payments</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-zinc-800 rounded-xl">
                <span className="text-green-400 text-xl">✓</span>
                <div>
                  <p className="text-white font-medium">Payment tracking</p>
                  <p className="text-zinc-500 text-sm">Automatic receipts and records</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full py-4 bg-[#6359FF] hover:bg-[#5248DD] text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Connecting..." : "Connect with Stripe"}
            </button>

            <p className="text-zinc-500 text-sm text-center">
              By connecting, you agree to Stripe&apos;s terms of service
            </p>
          </div>
        )}
      </div>
    </div>
  );
}