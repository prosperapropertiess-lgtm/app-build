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

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Financials</h1>
        <p className="text-zinc-400">Income, expenses, and cash flow overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm mb-2">Total Income</p>
          <p className="text-3xl font-bold text-green-400">${(summary?.totalIncome || 0).toFixed(2)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm mb-2">Total Expenses</p>
          <p className="text-3xl font-bold text-red-400">${(summary?.totalExpenses || 0).toFixed(2)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm mb-2">Net Cash Flow</p>
          <p className="text-3xl font-bold text-white">${(summary?.netCashFlow || 0).toFixed(2)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm mb-2">Rent Collected</p>
          <p className="text-3xl font-bold text-green-400">${(summary?.totalRentCollected || 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Income vs Expenses */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Income vs Expenses</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Income transactions</span>
            <span className="text-green-400">{summary?.incomeCount || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Expense transactions</span>
            <span className="text-red-400">{summary?.expenseCount || 0}</span>
          </div>
          <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
            <span className="text-white font-medium">Net</span>
            <span className={`text-xl font-bold ${summary?.netCashFlow >= 0 ? "text-green-400" : "text-red-400"}`}>
              ${(summary?.netCashFlow || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <a href="/financials/income" className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 transition-colors">
          <p className="text-2xl mb-2">📈</p>
          <p className="text-white font-semibold">Income</p>
          <p className="text-zinc-500 text-sm">Track rental income</p>
        </a>
        <a href="/financials/expenses" className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 transition-colors">
          <p className="text-2xl mb-2">📉</p>
          <p className="text-white font-semibold">Expenses</p>
          <p className="text-zinc-500 text-sm">Track property expenses</p>
        </a>
      </div>
    </div>
  );
}