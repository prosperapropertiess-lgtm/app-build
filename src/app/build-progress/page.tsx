'use client';

import { useEffect, useState } from 'react';
import { getEntries, getProgress, logBuild, type BuildEntry, type BuildStatus } from '@/lib/build-log';

const statusConfig: Record<BuildStatus, { label: string; color: string; bg: string }> = {
  todo: { label: 'Todo', color: 'text-gray-400', bg: 'bg-gray-100' },
  building: { label: 'Building', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  done: { label: 'Done', color: 'text-green-600', bg: 'bg-green-50' },
  blocked: { label: 'Blocked', color: 'text-red-600', bg: 'bg-red-50' },
};

const tagColors: Record<string, string> = {
  setup: 'bg-purple-100 text-purple-700',
  spec: 'bg-blue-100 text-blue-700',
  frontend: 'bg-cyan-100 text-cyan-700',
  backend: 'bg-orange-100 text-orange-700',
  db: 'bg-emerald-100 text-emerald-700',
  ai: 'bg-violet-100 text-violet-700',
  auth: 'bg-pink-100 text-pink-700',
  payments: 'bg-indigo-100 text-indigo-700',
  default: 'bg-gray-100 text-gray-600',
};

function StatusBadge({ status }: { status: BuildStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      {status === 'done' ? '✓' : status === 'building' ? '⚡' : status === 'blocked' ? '✕' : '○'} {config.label}
    </span>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>Overall Progress</span>
        <span className="font-medium text-gray-700">{percent}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function EntryCard({ entry }: { entry: BuildEntry }) {
  const config = statusConfig[entry.status];
  const tagColor = tagColors[entry.tag || 'default'];

  return (
    <div className={`p-4 rounded-xl border ${entry.status === 'done' ? 'border-green-200 bg-green-50/50' : entry.status === 'building' ? 'border-yellow-200 bg-yellow-50/50' : 'border-gray-200 bg-white'} mb-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={entry.status} />
            {entry.tag && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tagColor}`}>
                {entry.tag}
              </span>
            )}
          </div>
          <p className="text-gray-800 text-sm font-medium">{entry.message}</p>
          <p className="text-gray-400 text-xs mt-1">
            {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false })}
          </p>
        </div>
        {entry.status === 'building' && (
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        )}
      </div>
    </div>
  );
}

function LiveIndicator() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span className="text-xs text-green-600 font-medium">Live</span>
    </div>
  );
}

export default function BuildProgressPage() {
  const [entries, setEntries] = useState<BuildEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load initial data
    setEntries(getEntries());
    setProgress(getProgress());

    // Poll every 3 seconds for updates
    const interval = setInterval(() => {
      setEntries(getEntries());
      setProgress(getProgress());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Log that the dashboard was viewed
  useEffect(() => {
    if (mounted) {
      logBuild('Build dashboard opened', 'building', 'setup');
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Project X — Build Progress</h1>
              <p className="text-sm text-gray-500">landlording redefined</p>
            </div>
            <LiveIndicator />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Progress Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <ProgressBar percent={progress} />
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{entries.filter(e => e.status === 'done').length}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{entries.filter(e => e.status === 'building').length}</div>
              <div className="text-xs text-gray-500">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-400">{entries.filter(e => e.status === 'todo').length}</div>
              <div className="text-xs text-gray-500">Todo</div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Activity Feed</h2>
          <span className="text-xs text-gray-400">Auto-refreshes every 3s</span>
        </div>

        <div className="space-y-2">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No build activity yet. Tasks will appear here as work begins.
          </div>
        )}
      </div>
    </div>
  );
}