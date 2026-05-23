"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ContractorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/contractor/dashboard");
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">🔨</span>
          <h1 className="text-3xl font-bold text-white mb-2">Contractor Login</h1>
          <p className="text-zinc-400">Access your work orders</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white" placeholder="contractor@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white" placeholder="••••••••" required />
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"><p className="text-red-400 text-sm">{error}</p></div>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}