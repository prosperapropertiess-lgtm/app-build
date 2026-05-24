"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/tenant/dashboard", label: "Home", icon: "🏠" },
  { href: "/tenant/pay", label: "Pay Rent", icon: "💳" },
  { href: "/tenant/maintenance", label: "Maintenance", icon: "🔧" },
  { href: "/tenant/messages", label: "Messages", icon: "💬" },
];

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/tenant/login");
      else setUser(data.user);
    });
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--navy-950)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gold-500)" }}>
          <span className="text-white font-bold">P</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--navy-950)" }}>
      <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-3" style={{ background: "var(--navy-900)", borderBottom: "1px solid var(--navy-700)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "var(--gold-500)" }}>
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-none">Prospera</p>
            <p className="text-xs" style={{ color: "#4a6480" }}>Tenant Portal</p>
          </div>
        </div>
        <button
          onClick={async () => { const s = createClient(); await s.auth.signOut(); router.push("/tenant/login"); }}
          className="text-xs px-3 py-1.5 rounded-lg" style={{ color: "#6b8aad", border: "1px solid var(--navy-700)" }}
        >
          Sign Out
        </button>
      </header>

      <main className="p-4 pb-24">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 flex justify-around py-2 z-20" style={{ background: "var(--navy-900)", borderTop: "1px solid var(--navy-700)" }}>
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className="flex flex-col items-center gap-0.5 px-4 py-2"
            style={{ color: pathname === item.href ? "var(--gold-400)" : "#4a6480" }}>
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
