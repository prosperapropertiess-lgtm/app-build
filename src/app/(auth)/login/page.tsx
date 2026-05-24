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
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Check if landlord
      const { data: landlord } = await supabase
        .from("landlords")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (landlord) {
        router.push("/dashboard");
      } else {
        // Check if tenant
        const { data: tenant } = await supabase
          .from("tenants")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (tenant) {
          router.push("/tenant/dashboard");
        } else {
          router.push("/onboarding");
        }
      }
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8f9fa]">
      {/* Left Hero Image — Desktop only */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#edeeef] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80')",
          }}
        />
        {/* Subtle tonal wash */}
        <div className="absolute inset-0 bg-[#1A1A2E]/5 backdrop-blur-[1px]" />
      </div>

      {/* Right Content Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-[1rem] md:p-[2rem] bg-[#f8f9fa]">
        <div className="w-full max-w-[420px] bg-[#ffffff] rounded-xl border border-[#e1e3e4] p-8 md:p-10 shadow-sm">

          {/* Logo */}
          <div className="mb-8">
            <div className="w-[72px] h-[72px] rounded-xl overflow-hidden border border-[#e1e3e4] bg-[#f8f9fa] flex items-center justify-center">
              <div className="w-10 h-10 rounded-lg bg-[#1A1A2E] flex items-center justify-center">
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>P</span>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1
              className="hidden md:block text-[32px] font-bold text-[#191c1d] mb-2"
              style={{ fontFamily: 'Manrope, sans-serif', lineHeight: '40px', letterSpacing: '-0.01em' }}
            >
              Welcome back
            </h1>
            <h1
              className="md:hidden text-[24px] font-bold text-[#191c1d] mb-2"
              style={{ fontFamily: 'Manrope, sans-serif', lineHeight: '32px' }}
            >
              Welcome back
            </h1>
            <p className="text-[16px] text-[#47464c]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '24px' }}>
              Sign in to manage your properties and portfolio.
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full h-[48px] mb-6 bg-[#1A1A2E] text-white rounded-lg hover:bg-[#1a1a2e]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-sm"
            style={{ fontFamily: 'Manrope, sans-serif', fontSize: '14px', fontWeight: 600, lineHeight: '20px', letterSpacing: '0.01em' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.038l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
            </svg>
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="relative py-[0.5rem] flex items-center mb-6">
            <div className="flex-grow border-t border-[#e1e3e4]" />
            <span
              className="flex-shrink-0 mx-4 text-[12px] text-[#78767d]"
              style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', fontWeight: 500 }}
            >
              OR
            </span>
            <div className="flex-grow border-t border-[#e1e3e4]" />
          </div>

          {/* Email/Password Form */}
          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[12px] text-[#47464c]"
                style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', fontWeight: 500 }}
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="h-[48px] px-4 rounded-lg border border-[#c8c5cd] bg-[#f8f9fa] focus:outline-none focus:border-[#1A1A2E] focus:ring-1 focus:ring-[#1A1A2E] transition-colors text-[16px] text-[#191c1d] placeholder:text-[#78767d]"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '24px' }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label
                  className="text-[12px] text-[#47464c]"
                  style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', fontWeight: 500 }}
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[12px] text-[#1A1A2E] hover:text-[#C5A059] transition-colors"
                  style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', fontWeight: 500 }}
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-[48px] px-4 rounded-lg border border-[#c8c5cd] bg-[#f8f9fa] focus:outline-none focus:border-[#1A1A2E] focus:ring-1 focus:ring-[#1A1A2E] transition-colors text-[16px] text-[#191c1d] placeholder:text-[#78767d]"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '24px' }}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{ background: '#ffdad6', color: '#93000a', border: '1px solid #ba1a1a' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-[48px] mt-2 bg-[#1A1A2E] text-white rounded-lg hover:bg-[#2e3142] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Manrope, sans-serif', fontSize: '14px', fontWeight: 600, lineHeight: '20px', letterSpacing: '0.01em' }}
            >
              Sign In
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <span className="text-[14px] text-[#47464c]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Don't have an account?{" "}
              <Link href="/signup" className="font-semibold text-[#1A1A2E] hover:text-[#C5A059] transition-colors">
                Sign up
              </Link>
            </span>
          </div>

          {/* Tenant toggle */}
          <div className="mt-4 flex justify-center">
            <Link
              href="/tenant/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] text-[#47464c] hover:text-[#1A1A2E] hover:bg-[#f3f4f5] transition-colors"
              style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, lineHeight: '20px', letterSpacing: '0.01em' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Switch to Tenant Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}