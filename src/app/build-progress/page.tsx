'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

type Task = {
  id: number;
  phase: number;
  phase_name: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  updated_at: string;
};

const PHASE_COLORS: Record<number, string> = {
  1: 'bg-violet-500', 2: 'bg-blue-500', 3: 'bg-cyan-500',
  4: 'bg-teal-500', 5: 'bg-green-500', 6: 'bg-lime-500',
  7: 'bg-yellow-500', 8: 'bg-orange-500', 9: 'bg-red-500', 10: 'bg-pink-500',
};

export default function BuildProgressPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchTasks() {
    const supabase = createClient();
    const { data } = await supabase.from('build_tasks').select('*').order('id');
    if (data) { setTasks(data); setLastUpdated(new Date()); }
  }

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, []);

  const done = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const total = tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const phases = tasks.reduce<Record<number, { name: string; tasks: Task[] }>>((acc, t) => {
    if (!acc[t.phase]) acc[t.phase] = { name: t.phase_name, tasks: [] };
    acc[t.phase].tasks.push(t);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Project X — Build Tracker</h1>
            <p className="text-sm text-zinc-500 mt-0.5">landlording redefined · 55 tasks · 10 phases</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading…'}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-4xl font-bold">{pct}%</p>
              <p className="text-sm text-zinc-400 mt-0.5">Overall completion</p>
            </div>
            <div className="flex gap-6 text-right">
              <div><p className="text-xl font-semibold text-green-400">{done}</p><p className="text-xs text-zinc-500">Done</p></div>
              <div><p className="text-xl font-semibold text-yellow-400">{inProgress}</p><p className="text-xs text-zinc-500">Building</p></div>
              <div><p className="text-xl font-semibold text-zinc-400">{total - done - inProgress}</p><p className="text-xs text-zinc-500">To Do</p></div>
            </div>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-6">
          {Object.entries(phases).map(([n, { name, tasks: pt }]) => {
            const pDone = pt.filter(t => t.status === 'done').length;
            const pPct = Math.round((pDone / pt.length) * 100);
            const color = PHASE_COLORS[Number(n)];
            return (
              <div key={n} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-xs text-zinc-400 font-medium">Phase {n}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-snug mb-2">{name}</p>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mb-1">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pPct}%` }} />
                </div>
                <p className="text-xs text-zinc-500">{pDone}/{pt.length}</p>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          {Object.entries(phases).map(([n, { name, tasks: pt }]) => {
            const pDone = pt.filter(t => t.status === 'done').length;
            return (
              <div key={n} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${PHASE_COLORS[Number(n)]}`} />
                    <span className="text-sm font-semibold">Phase {n} — {name}</span>
                  </div>
                  <span className="text-xs text-zinc-500">{pDone}/{pt.length}</span>
                </div>
                <ul className="divide-y divide-zinc-800">
                  {pt.map(task => (
                    <li key={task.id} className="flex items-center justify-between px-5 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-600 w-5 text-right">{task.id}</span>
                        <span className={`text-sm ${task.status === 'done' ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                          {task.title}
                        </span>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                        task.status === 'done' ? 'bg-green-950 text-green-400 border-green-800' :
                        task.status === 'in_progress' ? 'bg-yellow-950 text-yellow-400 border-yellow-800 animate-pulse' :
                        'bg-zinc-800 text-zinc-500 border-zinc-700'
                      }`}>
                        {task.status === 'done' ? '✓ Done' : task.status === 'in_progress' ? '⚡ Building' : 'To Do'}
                      </span>
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
