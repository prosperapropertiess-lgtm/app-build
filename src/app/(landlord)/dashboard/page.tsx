"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Stats {
  totalProperties: number;
  totalUnits: number;
  totalTenants: number;
  openMaintenance: number;
  recentPayments: any[];
  recentMaintenance: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const name = user.user_metadata?.full_name?.split(" ")[0]
        || user.user_metadata?.name?.split(" ")[0]
        || user.email?.split("@")[0]
        || "";
      setUserName(name);

      const [
        { count: props },
        { count: units },
        { count: tenants },
        { count: maint },
        { data: payments },
        { data: maintenance },
      ] = await Promise.all([
        supabase.from("properties").select("*", { count: "exact", head: true }).eq("landlord_id", user.id),
        supabase.from("units").select("*", { count: "exact", head: true }),
        supabase.from("tenants").select("*", { count: "exact", head: true }).eq("landlord_id", user.id),
        supabase.from("maintenance_requests").select("*", { count: "exact", head: true })
          .eq("landlord_id", user.id).not("status", "eq", "completed").not("status", "eq", "closed"),
        supabase.from("payments").select("*").eq("landlord_id", user.id)
          .order("created_at", { ascending: false }).limit(4),
        supabase.from("maintenance_requests").select("*").eq("landlord_id", user.id)
          .order("created_at", { ascending: false }).limit(4),
      ]);

      setStats({
        totalProperties: props || 0,
        totalUnits: units || 0,
        totalTenants: tenants || 0,
        openMaintenance: maint || 0,
        recentPayments: payments || [],
        recentMaintenance: maintenance || [],
      });
      setLoading(false);
    })();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });

  if (loading) return <PageLoader />;

  const s = stats!;
  const hasData = s.totalProperties > 0;

  return (
    <div className="space-y-8 bg-ambient min-h-screen -m-4 lg:-m-8 p-4 lg:p-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm mb-0.5" style={{ color: "var(--muted-subtle)" }}>{today}</p>
          <h1 className="text-2xl font-bold font-display text-white">
            {greeting}{userName ? `, ${userName}` : ""} 👋
          </h1>
        </div>
        {hasData && (
          <Link href="/properties/new"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "var(--gold-500)", color: "#060d1a" }}>
            + Add Property
          </Link>
        )}
      </div>

      {/* Empty onboarding state */}
      {!hasData ? (
        <OnboardingCTA />
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Properties" value={s.totalProperties} icon="🏠" href="/properties" />
            <StatCard label="Tenants" value={s.totalTenants} icon="👤" href="/tenants" />
            <StatCard label="Units" value={s.totalUnits} icon="🔑" href="/properties" />
            <StatCard
              label="Open Issues"
              value={s.openMaintenance}
              icon="🔧"
              href="/maintenance"
              alert={s.openMaintenance > 0}
            />
          </div>

          {/* Quick actions */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted-subtle)" }}>
              Quick Actions
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { href: "/properties/new", icon: "🏠", label: "Add Property" },
                { href: "/tenants/invite", icon: "✉️", label: "Invite Tenant" },
                { href: "/leases/new", icon: "📄", label: "New Lease" },
                { href: "/financials", icon: "💰", label: "Financials" },
              ].map(a => (
                <Link key={a.href} href={a.href}
                  className="card-hover flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                  style={{ background: "var(--navy-900)", border: "1px solid var(--border)" }}>
                  <span className="text-xl">{a.icon}</span>
                  <span className="text-sm font-medium text-white">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="grid lg:grid-cols-2 gap-4">
            <ActivityCard title="Recent Payments" linkHref="/financials" linkLabel="View all">
              {s.recentPayments.length === 0 ? (
                <Empty text="No payments recorded yet" />
              ) : s.recentPayments.map(p => (
                <Row key={p.id}
                  left={<>
                    <p className="text-sm font-semibold text-white tabular-nums">${Number(p.amount || 0).toFixed(2)}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-subtle)" }}>{p.type || "Rent"}</p>
                  </>}
                  right={<StatusPill status={p.status} />}
                />
              ))}
            </ActivityCard>

            <ActivityCard title="Maintenance" linkHref="/maintenance" linkLabel="View all">
              {s.recentMaintenance.length === 0 ? (
                <Empty text="No maintenance requests" />
              ) : s.recentMaintenance.map(r => (
                <Row key={r.id}
                  left={<>
                    <p className="text-sm font-semibold text-white">{r.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-subtle)" }}>
                      {new Date(r.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                    </p>
                  </>}
                  right={<PriorityPill priority={r.priority} />}
                />
              ))}
            </ActivityCard>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────── */

function StatCard({ label, value, icon, href, alert }: {
  label: string; value: number; icon: string; href: string; alert?: boolean;
}) {
  return (
    <Link href={href}
      className="card-hover block rounded-2xl p-5"
      style={{
        background: "var(--navy-900)",
        border: `1px solid ${alert ? "rgba(201,168,76,0.3)" : "var(--border)"}`,
      }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xl">{icon}</span>
        {alert && <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--gold-500)" }} />}
      </div>
      <p className="text-3xl font-bold font-display text-white tabular-nums">{value}</p>
      <p className="text-xs mt-1 font-medium" style={{ color: "var(--muted)" }}>{label}</p>
    </Link>
  );
}

function ActivityCard({ title, linkHref, linkLabel, children }: {
  title: string; linkHref: string; linkLabel: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--navy-900)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-white font-display">{title}</p>
        <Link href={linkHref} className="text-xs font-medium" style={{ color: "var(--gold-400)" }}>
          {linkLabel} →
        </Link>
      </div>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3"
      style={{ borderBottom: "1px solid var(--border)" }}>
      <div>{left}</div>
      <div className="ml-3 flex-shrink-0">{right}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    completed: ["rgba(52,211,153,0.15)", "#34d399"],
    pending: ["rgba(201,168,76,0.15)", "var(--gold-400)"],
    failed: ["rgba(248,113,113,0.15)", "#f87171"],
  };
  const [bg, color] = map[status] || ["rgba(107,138,173,0.12)", "var(--muted)"];
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
      style={{ background: bg, color }}>{status || "—"}</span>
  );
}

function PriorityPill({ priority }: { priority: string }) {
  const map: Record<string, [string, string]> = {
    emergency: ["rgba(248,113,113,0.15)", "#f87171"],
    urgent: ["rgba(251,146,60,0.15)", "#fb923c"],
    normal: ["rgba(201,168,76,0.15)", "var(--gold-400)"],
    low: ["rgba(107,138,173,0.12)", "var(--muted)"],
  };
  const [bg, color] = map[priority] || ["rgba(107,138,173,0.12)", "var(--muted)"];
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
      style={{ background: bg, color }}>{priority || "—"}</span>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm" style={{ color: "var(--muted-subtle)" }}>{text}</p>
    </div>
  );
}

function OnboardingCTA() {
  return (
    <div className="rounded-3xl p-8 sm:p-12 text-center"
      style={{ background: "var(--navy-900)", border: "1px solid var(--border)" }}>
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
        <span className="text-4xl">🏠</span>
      </div>
      <h2 className="text-2xl font-bold font-display text-white mb-3">Welcome to Prospera</h2>
      <p className="text-sm max-w-sm mx-auto mb-8 leading-relaxed" style={{ color: "var(--muted)" }}>
        Add your first property to get started. It only takes 2 minutes.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/properties/new"
          className="px-8 py-3 rounded-xl text-sm font-semibold"
          style={{ background: "var(--gold-500)", color: "#060d1a" }}>
          + Add Your First Property
        </Link>
        <Link href="/onboarding"
          className="px-8 py-3 rounded-xl text-sm font-medium"
          style={{ background: "var(--navy-800)", border: "1px solid var(--border)", color: "var(--muted)" }}>
          Take the Tour
        </Link>
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
        <p className="text-xs" style={{ color: "var(--muted-subtle)" }}>Loading your dashboard…</p>
      </div>
    </div>
  );
}
