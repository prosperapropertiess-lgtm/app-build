// Build progress log — write entries here and the dashboard auto-updates
// Usage: import { logBuild } from '@/lib/build-log'; logBuild('Started auth setup', 'building');

export type BuildStatus = 'todo' | 'building' | 'done' | 'blocked';

export interface BuildEntry {
  id: string;
  timestamp: string;
  message: string;
  status: BuildStatus;
  tag?: string; // e.g. 'frontend', 'backend', 'ai', 'db'
}

// In production this would be Supabase or a file-based store.
// For now, using an in-memory store that persists during the dev server session.
let entries: BuildEntry[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    message: 'Project scaffolded — Next.js + TypeScript + Tailwind',
    status: 'done',
    tag: 'setup'
  },
  {
    id: '2',
    timestamp: new Date().toISOString(),
    message: 'Stack defined — Next.js, Supabase, Stripe, OpenClaw AI',
    status: 'done',
    tag: 'spec'
  }
];

export function getEntries(): BuildEntry[] {
  return [...entries].reverse(); // newest first
}

export function logBuild(message: string, status: BuildStatus = 'building', tag?: string): BuildEntry {
  const entry: BuildEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    message,
    status,
    tag
  };
  entries.unshift(entry);
  return entry;
}

export function updateEntry(id: string, status: BuildStatus): BuildEntry | null {
  const entry = entries.find(e => e.id === id);
  if (entry) {
    entry.status = status;
    return entry;
  }
  return null;
}

export function getProgress(): number {
  if (entries.length === 0) return 0;
  const done = entries.filter(e => e.status === 'done').length;
  return Math.round((done / entries.length) * 100);
}