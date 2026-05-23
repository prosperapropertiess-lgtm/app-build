"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Payment {
  id: string;
  amount: number;
  status: string;
  method: string;
  created_at: string;
  tenants: { full_name: string; email: string };
  leases: { units: { properties: { address_line_1: string } } };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchPayments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          tenants (full_name, email),
          leases (units (properties (address_line_1)))
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error) setPayments(data || []);
      setLoading(false);
    };

    fetchPayments();
  }, []);

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Payments</h1>
        <p className="text-zinc-400">Track rent payments from tenants</p>
      </div>

      {payments.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-3xl mb-4">💰</p>
          <h3 className="text-xl font-semibold text-white mb-2">No payments yet</h3>
          <p className="text-zinc-400">Payments will appear here once tenants start paying</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-6 py-4 text-zinc-400 text-sm font-medium">Date</th>
                <th className="text-left px-6 py-4 text-zinc-400 text-sm font-medium">Tenant</th>
                <th className="text-left px-6 py-4 text-zinc-400 text-sm font-medium">Property</th>
                <th className="text-right px-6 py-4 text-zinc-400 text-sm font-medium">Amount</th>
                <th className="text-right px-6 py-4 text-zinc-400 text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-zinc-800 last:border-0">
                  <td className="px-6 py-4 text-zinc-300 text-sm">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{payment.tenants?.full_name || "—"}</p>
                    <p className="text-zinc-500 text-xs">{payment.tenants?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-zinc-300 text-sm">
                    {payment.leases?.units?.properties?.address_line_1 || "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-white font-bold">${payment.amount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
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