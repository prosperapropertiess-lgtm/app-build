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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
    </div>
  );

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const cardStyle = { background: "var(--navy-900)", border: "1px solid var(--navy-700)" };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Financials</p>
          <h1 className="text-2xl font-bold text-white">Expenses</h1>
          <p className="mt-1" style={{ color: "#6b8aad" }}>Track property expenses</p>
        </div>
        <button className="px-6 py-3 font-semibold rounded-xl hover:opacity-90 transition-opacity" style={{ background: "var(--gold-500)", color: "#060d1a" }}>
          + Add Expense
        </button>
      </div>

      <div className="rounded-2xl p-6" style={cardStyle}>
        <p className="text-sm mb-2" style={{ color: "#6b8aad" }}>Total Expenses</p>
        <p className="text-4xl font-bold text-red-400">${total.toFixed(2)}</p>
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={cardStyle}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(201,168,76,0.08)" }}>
            <p className="text-3xl">📉</p>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No expenses recorded</h3>
          <p style={{ color: "#6b8aad" }}>Property expenses will appear here</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--navy-700)" }}>
                <th className="text-left px-6 py-4 text-sm" style={{ color: "#6b8aad" }}>Date</th>
                <th className="text-left px-6 py-4 text-sm" style={{ color: "#6b8aad" }}>Category</th>
                <th className="text-left px-6 py-4 text-sm" style={{ color: "#6b8aad" }}>Description</th>
                <th className="text-right px-6 py-4 text-sm" style={{ color: "#6b8aad" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} style={{ borderBottom: "1px solid var(--navy-700)" }} className="last:border-0">
                  <td className="px-6 py-4 text-sm" style={{ color: "#c8d6e5" }}>{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs rounded-full" style={{ background: "var(--navy-800)", color: "#c8d6e5" }}>{expense.category || "general"}</span>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: "#c8d6e5" }}>{expense.description || "—"}</td>
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
