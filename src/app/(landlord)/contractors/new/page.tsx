"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewContractorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", specialty: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: insertError } = await supabase.from("contractors").insert({
      landlord_id: user.id,
      name: formData.name,
      phone: formData.phone || null,
      email: formData.email || null,
      specialty: formData.specialty || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/contractors");
  };

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Add Contractor</h1>
        <p className="text-zinc-400">Add a new contractor to your network</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white" placeholder="John Smith" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Specialty</label>
            <input type="text" value={formData.specialty} onChange={(e) => setFormData((p) => ({ ...p, specialty: e.target.value }))} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white" placeholder="Plumbing, Electrical, HVAC..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Phone</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white" placeholder="+1 (519) 555-0123" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white" placeholder="john@contractor.com" />
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"><p className="text-red-400 text-sm">{error}</p></div>}

        <div className="flex gap-4">
          <button type="button" onClick={() => router.back()} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors disabled:opacity-50">
            {loading ? "Adding..." : "Add Contractor"}
          </button>
        </div>
      </form>
    </div>
  );
}