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

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Contractors</h1>
          <p className="text-zinc-400">Manage your contractor network</p>
        </div>
        <Link href="/contractors/new" className="px-6 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors">
          + Add Contractor
        </Link>
      </div>

      {contractors.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-3xl mb-4">🔨</p>
          <h3 className="text-xl font-semibold text-white mb-2">No contractors yet</h3>
          <p className="text-zinc-400 mb-6">Add contractors to assign them to maintenance jobs</p>
          <Link href="/contractors/new" className="inline-block px-6 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors">
            + Add Your First Contractor
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {contractors.map((contractor) => (
            <div key={contractor.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{contractor.name}</h3>
                  <p className="text-zinc-500 text-sm">{contractor.specialty}</p>
                </div>
                <div className="text-right text-sm">
                  {contractor.phone && <p className="text-zinc-300">{contractor.phone}</p>}
                  {contractor.email && <p className="text-zinc-500">{contractor.email}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}