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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
    </div>
  );

  const cardStyle = { background: "var(--navy-900)", border: "1px solid var(--navy-700)" };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Tenant</p>
        <h1 className="text-2xl font-bold text-white">Payment History</h1>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={cardStyle}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(201,168,76,0.08)" }}>
            <p className="text-3xl">📜</p>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No payments yet</h3>
          <p style={{ color: "#6b8aad" }}>Your payment history will appear here</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--navy-700)" }}>
                <th className="text-left px-6 py-4 text-sm" style={{ color: "#6b8aad" }}>Date</th>
                <th className="text-right px-6 py-4 text-sm" style={{ color: "#6b8aad" }}>Amount</th>
                <th className="text-right px-6 py-4 text-sm" style={{ color: "#6b8aad" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="last:border-0" style={{ borderBottom: "1px solid var(--navy-700)" }}>
                  <td className="px-6 py-4" style={{ color: "#c8d6e5" }}>
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
