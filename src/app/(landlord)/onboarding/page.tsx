"use client";

import { createClient } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: 1, title: "Welcome", icon: "👋" },
  { id: 2, title: "Add Your First Property", icon: "🏠" },
  { id: 3, title: "Invite a Tenant", icon: "👤" },
  { id: 4, title: "Set Up Payments", icon: "💳" },
  { id: 5, title: "All Done!", icon: "✅" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    address_line_1: "",
    city: "London",
    property_type: "single_family",
    total_units: 1,
    tenant_email: "",
  });

  const handleNext = async () => {
    if (step < 5) setStep(step + 1);

    if (step === 2) {
      // Create property
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && formData.address_line_1) {
        const { data } = await supabase.from("properties").insert({
          landlord_id: user.id,
          address_line_1: formData.address_line_1,
          city: formData.city,
          province: "Ontario",
          postal_code: "",
          property_type: formData.property_type,
          total_units: formData.total_units,
        }).select().single();

        if (data) {
          // Create units
          const units = [];
          for (let i = 1; i <= formData.total_units; i++) {
            units.push({ property_id: data.id, unit_number: i.toString(), bedrooms: 1, bathrooms: 1, rent_amount: 0, status: "vacant" });
          }
          await supabase.from("units").insert(units);
        }
      }
    }

    if (step === 3 && formData.tenant_email) {
      // Create tenant invite
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        await supabase.from("tenant_invites").insert({
          landlord_id: user.id,
          email: formData.tenant_email,
          token: crypto.randomUUID(),
        });
      }
    }

    if (step === 5) {
      router.push("/dashboard");
    }
  };

  const inputStyle = { background: "var(--navy-800)", border: "1px solid var(--navy-600)" };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--navy-900)" }}>
      <div className="max-w-lg w-full">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className="w-3 h-3 rounded-full transition-colors"
              style={{ background: s.id <= step ? "var(--gold-500)" : "var(--navy-700)" }}
            />
          ))}
        </div>

        <div className="text-center mb-8">
          <span className="text-6xl mb-4 block">{STEPS[step - 1].icon}</span>
          <h1 className="text-3xl font-bold text-white mb-2">{STEPS[step - 1].title}</h1>
        </div>

        <div className="rounded-2xl p-6 space-y-5" style={{ background: "var(--navy-800)", border: "1px solid var(--navy-700)" }}>
          {step === 1 && (
            <div className="space-y-4 text-center">
              <p style={{ color: "#6b8aad" }}>Welcome to Prospera! Let's get you set up so you can start managing your properties.</p>
              <p style={{ color: "#6b8aad" }}>This quick setup will have you ready in under 2 minutes.</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p style={{ color: "#6b8aad" }}>Let's start with your first property.</p>
              <input
                type="text"
                value={formData.address_line_1}
                onChange={(e) => setFormData((p) => ({ ...p, address_line_1: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-white"
                style={inputStyle}
                placeholder="123 Main Street, London ON"
              />
              <select
                value={formData.property_type}
                onChange={(e) => setFormData((p) => ({ ...p, property_type: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-white"
                style={inputStyle}
              >
                <option value="single_family">Single Family</option>
                <option value="duplex">Duplex</option>
                <option value="multi_unit">Multi-Unit</option>
              </select>
              <input
                type="number"
                min="1"
                value={formData.total_units}
                onChange={(e) => setFormData((p) => ({ ...p, total_units: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-3 rounded-xl text-white"
                style={inputStyle}
                placeholder="Number of units"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p style={{ color: "#6b8aad" }}>Invite a tenant to get started. They&apos;ll receive an email with login instructions.</p>
              <input
                type="email"
                value={formData.tenant_email}
                onChange={(e) => setFormData((p) => ({ ...p, tenant_email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-white"
                style={inputStyle}
                placeholder="tenant@email.com (optional)"
              />
              <p className="text-sm" style={{ color: "#4a6480" }}>You can skip this and invite tenants later.</p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center">
              <p style={{ color: "#6b8aad" }}>Set up Stripe to accept rent payments online.</p>
              <div className="rounded-xl p-6" style={{ background: "var(--navy-900)" }}>
                <span className="text-4xl mb-4 block">💳</span>
                <p className="text-sm" style={{ color: "#c8d6e5" }}>Stripe Connect integration coming soon</p>
              </div>
              <p className="text-sm" style={{ color: "#4a6480" }}>Skip for now — you can enable payments anytime.</p>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 text-center">
              <p style={{ color: "#6b8aad" }}>You&apos;re all set! Your property management portal is ready.</p>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(201,168,76,0.08)" }}>
                  <span className="text-2xl">🏠</span>
                  <p className="text-xs mt-2" style={{ color: "#6b8aad" }}>Properties</p>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(201,168,76,0.08)" }}>
                  <span className="text-2xl">👤</span>
                  <p className="text-xs mt-2" style={{ color: "#6b8aad" }}>Tenants</p>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(201,168,76,0.08)" }}>
                  <span className="text-2xl">💰</span>
                  <p className="text-xs mt-2" style={{ color: "#6b8aad" }}>Payments</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-6">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 text-white font-medium rounded-xl hover:opacity-80 transition-opacity"
              style={{ background: "var(--navy-700)" }}
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3 font-semibold rounded-xl hover:opacity-90 transition-opacity"
            style={{ background: "var(--gold-500)", color: "#060d1a" }}
          >
            {step === 5 ? "Go to Dashboard" : step === 4 ? "Skip" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
