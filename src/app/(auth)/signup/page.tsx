"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type Role = "landlord" | "tenant";

export default function SignupPage() {
  const [role, setRole] = useState<Role>("landlord");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, phone, role } },
    });

    if (signUpError) { setError(signUpError.message); setLoading(false); return; }

    if (data.user && role === "landlord") {
      await supabase.from("landlords").insert({
        id: data.user.id, email: data.user.email, full_name: fullName, phone,
      });
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { role },
      },
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--navy-950)" }}>
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(201,168,76,0.15)" }}>
            <span className="text-3xl" style={{ color: "var(--gold-400)" }}>✓</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
          <p className="text-sm mb-6" style={{ color: "#6b8aad" }}>
            We sent a confirmation link to <span className="text-white font-medium">{email}</span>
          </p>
          <Link href="/login" className="text-sm font-medium" style={{ color: "var(--gold-400)" }}>
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

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
        <div className="space-y-8">
          {[
            { icon: "🏠", title: "Landlords", desc: "Manage properties, collect rent, track maintenance — all in one place." },
            { icon: "🔑", title: "Tenants", desc: "Pay rent, submit maintenance requests, message your landlord." },
          ].map(item => (
            <div key={item.title} className="flex gap-4">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-semibold text-white">{item.title}</p>
                <p className="text-sm mt-0.5" style={{ color: "#6b8aad" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-6 text-xs" style={{ color: "#4a6480" }}>
          <span>London, Ontario</span><span>·</span><span>prosperaproperties.co</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-10">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gold-500)" }}>
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Prospera</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-sm mb-6" style={{ color: "#6b8aad" }}>Who are you joining as?</p>

          {/* Role toggle */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: "var(--navy-800)", border: "1px solid var(--navy-700)" }}>
            {(["landlord", "tenant"] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize"
                style={role === r
                  ? { background: "var(--gold-500)", color: "#060d1a" }
                  : { color: "#6b8aad" }
                }
              >
                {r === "landlord" ? "🏠 Landlord" : "🔑 Tenant"}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border text-sm font-medium text-white transition-all mb-5 disabled:opacity-50"
            style={{ borderColor: "var(--navy-600)", background: "var(--navy-800)" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.038l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/></svg>
            {googleLoading ? "Redirecting..." : `Continue with Google as ${role}`}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "var(--navy-700)" }} />
            <span className="text-xs" style={{ color: "#4a6480" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--navy-700)" }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#8aabcc" }}>Full Name</label>
              <input
                type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: "var(--navy-800)", border: "1px solid var(--navy-600)" }}
                placeholder="Jane Smith"
              />
            </div>
            {role === "landlord" && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#8aabcc" }}>Phone</label>
                <input
                  type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                  style={{ background: "var(--navy-800)", border: "1px solid var(--navy-600)" }}
                  placeholder="+1 (519) 555-0123"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#8aabcc" }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: "var(--navy-800)", border: "1px solid var(--navy-600)" }}
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#8aabcc" }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
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
              {loading ? "Creating account..." : `Create ${role} account`}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: "#4a6480" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium" style={{ color: "var(--gold-400)" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
