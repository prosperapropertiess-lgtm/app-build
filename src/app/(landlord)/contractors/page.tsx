"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Contractor {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialty: string;
  created_at: string;
}

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchContractors = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("contractors")
        .select("*")
        .order("name");

      if (!error) setContractors(data || []);
      setLoading(false);
    };

    fetchContractors();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
    </div>
  );

  const cardStyle = { background: "var(--navy-900)", border: "1px solid var(--navy-700)" };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Network</p>
          <h1 className="text-2xl font-bold text-white">Contractors</h1>
          <p className="mt-1" style={{ color: "#6b8aad" }}>Manage your contractor network</p>
        </div>
        <Link href="/contractors/new" className="px-6 py-3 font-semibold rounded-xl hover:opacity-90 transition-opacity" style={{ background: "var(--gold-500)", color: "#060d1a" }}>
          + Add Contractor
        </Link>
      </div>

      {contractors.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={cardStyle}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(201,168,76,0.08)" }}>
            <p className="text-3xl">🔨</p>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No contractors yet</h3>
          <p className="mb-6" style={{ color: "#6b8aad" }}>Add contractors to assign them to maintenance jobs</p>
          <Link href="/contractors/new" className="inline-block px-6 py-3 font-semibold rounded-xl hover:opacity-90 transition-opacity" style={{ background: "var(--gold-500)", color: "#060d1a" }}>
            + Add Your First Contractor
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {contractors.map((contractor) => (
            <div key={contractor.id} className="rounded-2xl p-6" style={cardStyle}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{contractor.name}</h3>
                  <p className="text-sm" style={{ color: "#4a6480" }}>{contractor.specialty}</p>
                </div>
                <div className="text-right text-sm">
                  {contractor.phone && <p style={{ color: "#c8d6e5" }}>{contractor.phone}</p>}
                  {contractor.email && <p style={{ color: "#4a6480" }}>{contractor.email}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
