"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
  properties: { address_line_1: string };
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchExpenses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("expenses")
        .select("*, properties(address_line_1)")
        .eq("landlord_id", user.id)
        .order("date", { ascending: false });

      if (!error) setExpenses(data || []);
      setLoading(false);
    };

    fetchExpenses();
  }, []);

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Expenses</h1>
          <p className="text-zinc-400">Track property expenses</p>
        </div>
        <button className="px-6 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors">
          + Add Expense
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <p className="text-zinc-400 text-sm mb-2">Total Expenses</p>
        <p className="text-4xl font-bold text-red-400">${total.toFixed(2)}</p>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-3xl mb-4">📉</p>
          <h3 className="text-xl font-semibold text-white mb-2">No expenses recorded</h3>
          <p className="text-zinc-400">Property expenses will appear here</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-6 py-4 text-zinc-400 text-sm">Date</th>
                <th className="text-left px-6 py-4 text-zinc-400 text-sm">Category</th>
                <th className="text-left px-6 py-4 text-zinc-400 text-sm">Description</th>
                <th className="text-right px-6 py-4 text-zinc-400 text-sm">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-zinc-800 last:border-0">
                  <td className="px-6 py-4 text-zinc-300 text-sm">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full">{expense.category || "general"}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300 text-sm">{expense.description || "—"}</td>
                  <td className="px-6 py-4 text-right text-red-400 font-bold">${expense.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}