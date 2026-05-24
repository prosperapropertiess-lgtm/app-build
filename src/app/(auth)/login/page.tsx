"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) { setError(signInError.message); setLoading(false); return; }

    if (data.user) {
      const { data: landlord } = await supabase.from("landlords").select("id").eq("id", data.user.id).single();
      router.push(landlord ? "/dashboard" : "/tenant/dashboard");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--navy-950)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12" style={{ background: "var(--navy-900)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gold-500)" }}>
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Prospera</span>
        </div>
        <div>
          <blockquote className="text-2xl font-light leading-relaxed mb-6" style={{ color: "var(--gold-400)" }}>
            "Landlording, redefined."
          </blockquote>
          <p className="text-sm" style={{ color: "#6b8aad" }}>
            Manage your properties, tenants, and finances — all in one place.
          </p>
        </div>
        <div className="flex gap-6 text-xs" style={{ color: "#4a6480" }}>
          <span>London, Ontario</span>
          <span>·</span>
          <span>prosperaproperties.co</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-10">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gold-500)" }}>
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Prospera</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: "#6b8aad" }}>Sign in to your account</p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border text-sm font-medium text-white transition-all mb-6 disabled:opacity-50"
            style={{ borderColor: "var(--navy-600)", background: "var(--navy-800)" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.038l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/></svg>
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: "var(--navy-700)" }} />
            <span className="text-xs" style={{ color: "#4a6480" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--navy-700)" }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#8aabcc" }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background: "var(--navy-800)", border: "1px solid var(--navy-600)" }}
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#8aabcc" }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: "var(--navy-800)", border: "1px solid var(--navy-600)" }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "#2d0f0f", border: "1px solid #5a1a1a", color: "#f87171" }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: "var(--gold-500)", color: "#060d1a" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: "#4a6480" }}>
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium" style={{ color: "var(--gold-400)" }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
