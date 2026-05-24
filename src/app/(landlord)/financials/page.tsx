"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function FinancialsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get total income
      const { data: income } = await supabase
        .from("income")
        .select("amount")
        .eq("landlord_id", user.id);

      // Get total expenses
      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount")
        .eq("landlord_id", user.id);

      // Get payment data
      const { data: payments } = await supabase
        .from("payments")
        .select("amount, status")
        .eq("status", "completed");

      const totalIncome = income?.reduce((sum, i) => sum + i.amount, 0) || 0;
      const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
      const totalRentCollected = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

      setSummary({
        totalIncome,
        totalExpenses,
        netCashFlow: totalIncome - totalExpenses,
        totalRentCollected,
        expenseCount: expenses?.length || 0,
        incomeCount: income?.length || 0,
      });

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
    </div>
  );

  const cardStyle = { background: "var(--navy-900)", border: "1px solid var(--navy-700)" };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Overview</p>
        <h1 className="text-2xl font-bold text-white">Financials</h1>
        <p className="mt-1" style={{ color: "#6b8aad" }}>Income, expenses, and cash flow overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl p-6" style={cardStyle}>
          <p className="text-sm mb-2" style={{ color: "#6b8aad" }}>Total Income</p>
          <p className="text-3xl font-bold text-green-400">${(summary?.totalIncome || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-2xl p-6" style={cardStyle}>
          <p className="text-sm mb-2" style={{ color: "#6b8aad" }}>Total Expenses</p>
          <p className="text-3xl font-bold text-red-400">${(summary?.totalExpenses || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-2xl p-6" style={cardStyle}>
          <p className="text-sm mb-2" style={{ color: "#6b8aad" }}>Net Cash Flow</p>
          <p className="text-3xl font-bold text-white">${(summary?.netCashFlow || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-2xl p-6" style={cardStyle}>
          <p className="text-sm mb-2" style={{ color: "#6b8aad" }}>Rent Collected</p>
          <p className="text-3xl font-bold text-green-400">${(summary?.totalRentCollected || 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Income vs Expenses */}
      <div className="rounded-2xl p-6" style={cardStyle}>
        <h2 className="text-xl font-semibold text-white mb-4">Income vs Expenses</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span style={{ color: "#6b8aad" }}>Income transactions</span>
            <span className="text-green-400">{summary?.incomeCount || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: "#6b8aad" }}>Expense transactions</span>
            <span className="text-red-400">{summary?.expenseCount || 0}</span>
          </div>
          <div className="pt-4 flex items-center justify-between" style={{ borderTop: "1px solid var(--navy-700)" }}>
            <span className="text-white font-medium">Net</span>
            <span className={`text-xl font-bold ${summary?.netCashFlow >= 0 ? "text-green-400" : "text-red-400"}`}>
              ${(summary?.netCashFlow || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <a href="/financials/income" className="rounded-2xl p-6 hover:scale-[1.01] transition-transform block" style={cardStyle}>
          <p className="text-2xl mb-2">📈</p>
          <p className="text-white font-semibold">Income</p>
          <p className="text-sm" style={{ color: "#4a6480" }}>Track rental income</p>
        </a>
        <a href="/financials/expenses" className="rounded-2xl p-6 hover:scale-[1.01] transition-transform block" style={cardStyle}>
          <p className="text-2xl mb-2">📉</p>
          <p className="text-white font-semibold">Expenses</p>
          <p className="text-sm" style={{ color: "#4a6480" }}>Track property expenses</p>
        </a>
      </div>
    </div>
  );
}
