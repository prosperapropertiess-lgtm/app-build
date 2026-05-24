"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/properties", label: "Properties", icon: "🏠" },
  { href: "/tenants", label: "Tenants", icon: "👤" },
  { href: "/leases", label: "Leases", icon: "📄" },
  { href: "/maintenance", label: "Maintenance", icon: "🔧" },
  { href: "/work-orders", label: "Work Orders", icon: "📋" },
  { href: "/contractors", label: "Contractors", icon: "👷" },
  { href: "/financials", label: "Financials", icon: "💰" },
  { href: "/messages", label: "Messages", icon: "💬" },
  { href: "/documents", label: "Documents", icon: "🗂" },
  { href: "/notifications", label: "Alerts", icon: "🔔" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export default function LandlordLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
      else setUser(data.user);
    });
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--navy-950)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gold-500)" }}>
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <p className="text-sm" style={{ color: "#6b8aad" }}>Loading…</p>
        </div>
      </div>
    );
  }

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map(item => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href} href={item.href} onClick={onClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={active
              ? { background: "rgba(201,168,76,0.12)", color: "var(--gold-400)", borderLeft: "2px solid var(--gold-500)" }
              : { color: "#6b8aad" }
            }
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "var(--navy-950)" }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 fixed h-full" style={{ background: "var(--navy-900)", borderRight: "1px solid var(--navy-700)" }}>
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid var(--navy-700)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--gold-500)" }}>
            <span className="text-white font-bold">P</span>
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-none">Prospera</p>
            <p className="text-xs mt-0.5" style={{ color: "#4a6480" }}>Landlord Portal</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-3" style={{ borderTop: "1px solid var(--navy-700)" }}>
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--navy-700)", color: "var(--gold-400)" }}>
              {user.email?.[0]?.toUpperCase()}
            </div>
            <p className="text-xs truncate" style={{ color: "#6b8aad" }}>{user.email}</p>
          </div>
          <button
            onClick={async () => { const s = createClient(); await s.auth.signOut(); router.push("/login"); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{ color: "#6b8aad" }}
          >
            <span className="w-5 text-center">↩</span><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3" style={{ background: "var(--navy-900)", borderBottom: "1px solid var(--navy-700)" }}>
        <button onClick={() => setSidebarOpen(true)} className="text-xl" style={{ color: "#6b8aad" }}>☰</button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "var(--gold-500)" }}>
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-bold text-white">Prospera</span>
        </div>
        <div className="w-8" />
      </div>

      {sidebarOpen && <div className="lg:hidden fixed inset-0 z-30 bg-black/60" onClick={() => setSidebarOpen(false)} />}

      <div className={`lg:hidden fixed top-0 left-0 bottom-0 z-40 w-64 flex flex-col transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "var(--navy-900)", borderRight: "1px solid var(--navy-700)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--navy-700)" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "var(--gold-500)" }}>
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-white">Prospera</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ color: "#6b8aad" }}>✕</button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <NavLinks onClick={() => setSidebarOpen(false)} />
        </nav>
        <div className="p-3" style={{ borderTop: "1px solid var(--navy-700)" }}>
          <button onClick={async () => { const s = createClient(); await s.auth.signOut(); router.push("/login"); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm" style={{ color: "#6b8aad" }}>
            <span>↩</span><span>Sign Out</span>
          </button>
        </div>
      </div>

      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0">
        <div className="p-4 lg:p-8">{children}</div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 flex justify-around py-2 z-20" style={{ background: "var(--navy-900)", borderTop: "1px solid var(--navy-700)" }}>
        {navItems.slice(0, 5).map(item => (
          <Link key={item.href} href={item.href}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5"
            style={{ color: pathname === item.href ? "var(--gold-400)" : "#4a6480" }}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
