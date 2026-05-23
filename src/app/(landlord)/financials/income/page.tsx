"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Income {
  id: string;
  amount: number;
  source: string;
  description: string;
  date: string;
  created_at: string;
  properties: { address_line_1: string };
}

export default function IncomePage() {
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchIncome = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("income")
        .select("*, properties(address_line_1)")
        .eq("landlord_id", user.id)
        .order("date", { ascending: false });

      if (!error) setIncome(data || []);
      setLoading(false);
    };

    fetchIncome();
  }, []);

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;

  const total = income.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Income</h1>
          <p className="text-zinc-400">Track rental income</p>
        </div>
        <button className="px-6 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors">
          + Add Income
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <p className="text-zinc-400 text-sm mb-2">Total Income</p>
        <p className="text-4xl font-bold text-green-400">${total.toFixed(2)}</p>
      </div>

      {income.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-3xl mb-4">📈</p>
          <h3 className="text-xl font-semibold text-white mb-2">No income recorded</h3>
          <p className="text-zinc-400">Income from rent payments will appear here</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-6 py-4 text-zinc-400 text-sm">Date</th>
                <th className="text-left px-6 py-4 text-zinc-400 text-sm">Source</th>
                <th className="text-left px-6 py-4 text-zinc-400 text-sm">Property</th>
                <th className="text-right px-6 py-4 text-zinc-400 text-sm">Amount</th>
              </tr>
            </thead>
            <tbody>
              {income.map((item) => (
                <tr key={item.id} className="border-b border-zinc-800 last:border-0">
                  <td className="px-6 py-4 text-zinc-300 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-white">{item.source || "Rent"}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{item.properties?.address_line_1 || "—"}</td>
                  <td className="px-6 py-4 text-right text-green-400 font-bold">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}