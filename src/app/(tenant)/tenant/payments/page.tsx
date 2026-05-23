"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Payment {
  id: string;
  amount: number;
  status: string;
  method: string;
  created_at: string;
  leases: { rent_amount: number; rent_due_day: number };
}

export default function TenantPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchPayments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("payments")
        .select("*, leases(rent_amount, rent_due_day)")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setPayments(data || []);
      setLoading(false);
    };

    fetchPayments();
  }, []);

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Payment History</h1>

      {payments.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-3xl mb-4">📜</p>
          <h3 className="text-xl font-semibold text-white mb-2">No payments yet</h3>
          <p className="text-zinc-400">Your payment history will appear here</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-6 py-4 text-zinc-400 text-sm">Date</th>
                <th className="text-right px-6 py-4 text-zinc-400 text-sm">Amount</th>
                <th className="text-right px-6 py-4 text-zinc-400 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-zinc-800 last:border-0">
                  <td className="px-6 py-4 text-zinc-300">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-white font-bold">${payment.amount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      payment.status === "completed" ? "bg-green-500/20 text-green-400" :
                      payment.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}