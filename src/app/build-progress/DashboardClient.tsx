"use client";

import { useState, useEffect, useCallback } from "react";

interface Screen {
  id: number;
  screen_folder: string;
  route: string | null;
  component_path: string | null;
  phase: number;
  phase_name: string;
  status: string;
  priority: number;
  notes: string | null;
  built_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  done: number;
  inProgress: number;
  todo: number;
}

const STATUS_CONFIG = {
  todo: { label: "To Do", color: "#78767d", bg: "#e7e8e9" },
  in_progress: { label: "In Progress", color: "#C5A059", bg: "#fff8e1" },
  done: { label: "Done", color: "#1A1A2E", bg: "#e8eaf6" },
};

const PHASE_COLORS = [
  "#1A1A2E", "#631919", "#9b433f", "#C5A059",
  "#4a6480", "#5d5c74", "#782828", "#45455b",
  "#3d7a5a", "#6b5a3d", "#5c3d6b", "#3d6b5c",
  "#8b6914", "#2e5a7e", "#7e2e5a", "#5a7e2e",
];

export function DashboardClient({ screens, initialStats }: { screens: Screen[]; initialStats: Stats }) {
  const [data, setData] = useState(screens);
  const [stats, setStats] = useState(initialStats);
  const [claimed, setClaimed] = useState<Screen | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "todo" | "in_progress" | "done">("all");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refresh = useCallback(async () => {
    const res = await fetch("/api/build-queue");
    if (res.ok) {
      const fresh = await res.json();
      setData(fresh);
      const total = fresh.length;
      const done = fresh.filter((s: Screen) => s.status === "done").length;
      const inProgress = fresh.filter((s: Screen) => s.status === "in_progress").length;
      setStats({ total, done, inProgress, todo: total - done - inProgress });
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  const claimNext = async () => {
    setLoading(true);
    const res = await fetch("/api/build-queue", { method: "POST" });
    if (res.ok) {
      const screen = await res.json();
      setClaimed(screen);
      await refresh();
    }
    setLoading(false);
  };

  const markDone = async (screen: Screen) => {
    await fetch("/api/build-queue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: screen.id, status: "done" }),
    });
    setClaimed(null);
    await refresh();
  };

  const markTodo = async (screen: Screen) => {
    await fetch("/api/build-queue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: screen.id, status: "todo" }),
    });
    await refresh();
  };

  const filtered = data.filter((s) => filter === "all" || s.status === filter);
  const grouped = filtered.reduce<Record<number, Screen[]>>((acc, s) => {
    (acc[s.phase] = acc[s.phase] || []).push(s);
    return acc;
  }, {});

  const percent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "Manrope, sans-serif" }}>
              Build Progress
            </h1>
            <p className="text-sm text-[#78767d]" style={{ fontFamily: "Inter, sans-serif" }}>
              Live tracker · last refresh {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={refresh}
            className="px-4 py-2 rounded-lg bg-[#1A1A2E] text-white text-sm font-semibold hover:bg-[#2e3142] transition-colors"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Refresh
          </button>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-xl border border-[#e1e3e4] p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl font-bold text-[#1A1A2E]">{percent}%</span>
            <span className="text-[#78767d]" style={{ fontFamily: "Inter, sans-serif" }}>
              {stats.done}/{stats.total} screens complete
            </span>
          </div>
          <div className="w-full bg-[#e7e8e9] rounded-full h-3 mb-4">
            <div
              className="bg-[#1A1A2E] rounded-full h-3 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex gap-6 text-sm">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span style={{ color: cfg.color, fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>
                  {cfg.label}: {data.filter((s) => s.status === key).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Claim Next Button */}
        <div className="bg-white rounded-xl border border-[#e1e3e4] p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#1A1A2E]" style={{ fontFamily: "Manrope, sans-serif" }}>
                Next Screen to Build
              </h2>
              <p className="text-sm text-[#78767d]" style={{ fontFamily: "Inter, sans-serif" }}>
                Click to atomically claim the highest priority todo screen
              </p>
            </div>
            <button
              onClick={claimNext}
              disabled={loading || stats.todo === 0}
              className="px-6 py-3 rounded-lg bg-[#C5A059] text-[#1A1A2E] font-bold text-sm hover:bg-[#b08940] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {loading ? "Claiming..." : stats.todo === 0 ? "All Done!" : "Claim Next Screen"}
            </button>
          </div>
        </div>

        {/* Claimed screen action */}
        {claimed && (
          <div className="bg-[#fff8e1] border border-[#C5A059] rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#C5A059] uppercase" style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em" }}>
                  Currently Building
                </span>
                <h3 className="font-bold text-[#1A1A2E] mt-1" style={{ fontFamily: "Manrope, sans-serif" }}>
                  {claimed.screen_folder}
                </h3>
                <p className="text-sm text-[#78767d]" style={{ fontFamily: "Inter, sans-serif" }}>
                  {claimed.route || "—"} · {claimed.component_path || "—"}
                </p>
                {claimed.notes && (
                  <p className="text-sm text-[#47464c] mt-1">{claimed.notes}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => markDone(claimed)}
                  className="px-6 py-3 rounded-lg bg-[#1A1A2E] text-white font-bold text-sm hover:bg-[#2e3142]"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  ✓ Mark Done
                </button>
                <button
                  onClick={() => { setClaimed(null); markTodo(claimed); }}
                  className="px-6 py-3 rounded-lg border border-[#c8c5cd] text-[#47464c] font-semibold text-sm hover:bg-[#f3f4f5]"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Release
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "todo", "in_progress", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors capitalize"
              style={{
                fontFamily: "Manrope, sans-serif",
                background: filter === f ? "#1A1A2E" : "#ffffff",
                color: filter === f ? "#ffffff" : "#78767d",
                border: "1px solid #e1e3e4",
              }}
            >
              {f.replace("_", " ")} ({f === "all" ? stats.total : data.filter((s) => s.status === f).length})
            </button>
          ))}
        </div>

        {/* Phase Groups */}
        {Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b)).map(([phase, phaseScreens]) => {
          const phaseInfo = phaseScreens[0];
          const phaseColor = PHASE_COLORS[Number(phase) % PHASE_COLORS.length];
          const doneInPhase = phaseScreens.filter((s) => s.status === "done").length;
          return (
            <div key={phase} className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: phaseColor }} />
                <h2 className="font-bold text-[#1A1A2E]" style={{ fontFamily: "Manrope, sans-serif", fontSize: "16px" }}>
                  Phase {phase}: {phaseInfo.phase_name}
                </h2>
                <span className="text-xs text-[#78767d]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {doneInPhase}/{phaseScreens.length} done
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {phaseScreens.map((screen) => {
                  const cfg = STATUS_CONFIG[screen.status as keyof typeof STATUS_CONFIG];
                  return (
                    <div
                      key={screen.id}
                      className="bg-white rounded-lg border border-[#e1e3e4] p-4 hover:border-[#C5A059] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{ backgroundColor: cfg.bg, color: cfg.color, fontFamily: "JetBrains Mono, monospace" }}
                        >
                          {cfg.label}
                        </span>
                        <span className="text-xs text-[#78767d]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                          #{screen.id}
                        </span>
                      </div>
                      <h3 className="font-semibold text-[#1A1A2E] text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>
                        {screen.screen_folder}
                      </h3>
                      <p className="text-xs text-[#78767d] mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
                        {screen.route || "—"}
                      </p>
                      {screen.notes && (
                        <p className="text-xs text-[#47464c] mt-2 line-clamp-2">{screen.notes}</p>
                      )}
                      {screen.status !== "todo" && (
                        <button
                          onClick={() => markTodo(screen)}
                          className="mt-3 text-xs text-[#78767d] hover:text-[#E63946] transition-colors"
                          style={{ fontFamily: "JetBrains Mono, monospace" }}
                        >
                          Reset to Todo
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}