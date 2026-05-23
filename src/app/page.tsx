import { supabase } from "@/lib/supabase";
import { cycleTaskStatus } from "./actions";

const PHASE_COLORS: Record<number, string> = {
  1: "bg-violet-500",
  2: "bg-blue-500",
  3: "bg-cyan-500",
  4: "bg-teal-500",
  5: "bg-green-500",
  6: "bg-lime-500",
  7: "bg-yellow-500",
  8: "bg-orange-500",
  9: "bg-red-500",
  10: "bg-pink-500",
};

const STATUS_STYLES: Record<string, string> = {
  done: "bg-green-100 text-green-700 border-green-200",
  in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
  todo: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

const STATUS_LABEL: Record<string, string> = {
  done: "Done",
  in_progress: "In Progress",
  todo: "To Do",
};

export default async function Dashboard() {
  const { data: tasks } = await supabase
    .from("build_tasks")
    .select("*")
    .order("id");

  if (!tasks) return null;

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const pct = Math.round((done / total) * 100);

  // Group by phase
  const phases = tasks.reduce<Record<number, { name: string; tasks: typeof tasks }>>((acc, t) => {
    if (!acc[t.phase]) acc[t.phase] = { name: t.phase_name, tasks: [] };
    acc[t.phase].tasks.push(t);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Project X — Build Tracker</h1>
            <span className="text-sm text-zinc-400">MVP · 55 tasks · 10 phases</span>
          </div>
          <p className="text-sm text-zinc-500">Property management PWA for small-scale landlords in Ontario</p>
        </div>

        {/* Overall progress */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-4xl font-bold">{pct}%</p>
              <p className="text-sm text-zinc-400 mt-0.5">Overall completion</p>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-xl font-semibold text-green-400">{done}</p>
                <p className="text-xs text-zinc-500">Done</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-yellow-400">{inProgress}</p>
                <p className="text-xs text-zinc-500">In Progress</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-zinc-400">{todo}</p>
                <p className="text-xs text-zinc-500">To Do</p>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Phase overview pills */}
        <div className="grid grid-cols-5 gap-2 mb-8">
          {Object.entries(phases).map(([phaseNum, { name, tasks: phaseTasks }]) => {
            const pDone = phaseTasks.filter((t) => t.status === "done").length;
            const pTotal = phaseTasks.length;
            const pPct = Math.round((pDone / pTotal) * 100);
            const color = PHASE_COLORS[Number(phaseNum)];
            return (
              <div key={phaseNum} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-xs text-zinc-400 font-medium">Phase {phaseNum}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-snug mb-2">{name}</p>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mb-1">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pPct}%` }} />
                </div>
                <p className="text-xs text-zinc-500">{pDone}/{pTotal}</p>
              </div>
            );
          })}
        </div>

        {/* Task list by phase */}
        <div className="space-y-6">
          {Object.entries(phases).map(([phaseNum, { name, tasks: phaseTasks }]) => {
            const pDone = phaseTasks.filter((t) => t.status === "done").length;
            const color = PHASE_COLORS[Number(phaseNum)];
            return (
              <div key={phaseNum} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                {/* Phase header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="font-semibold text-sm">Phase {phaseNum} — {name}</span>
                  </div>
                  <span className="text-xs text-zinc-500">{pDone}/{phaseTasks.length} done</span>
                </div>
                {/* Tasks */}
                <ul className="divide-y divide-zinc-800">
                  {phaseTasks.map((task) => (
                    <li key={task.id} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-600 w-5 text-right">{task.id}</span>
                        <span className={`text-sm ${task.status === "done" ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                          {task.title}
                        </span>
                      </div>
                      <form action={cycleTaskStatus.bind(null, task.id, task.status)}>
                        <button
                          type="submit"
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${STATUS_STYLES[task.status]}`}
                        >
                          {STATUS_LABEL[task.status]}
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
