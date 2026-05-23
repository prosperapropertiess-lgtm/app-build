"use client";

export default function ExportPage() {
  const handleExport = (type: string) => {
    // For MVP, just show an alert
    // In production, this would trigger CSV generation via API
    alert(`Exporting ${type}... This feature would generate a CSV file.`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Export Data</h1>
        <p className="text-zinc-400">Download your data as CSV</p>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => handleExport("properties")}
          className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 text-left transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Properties</h3>
              <p className="text-zinc-400 text-sm">All property details and units</p>
            </div>
            <span className="text-2xl">📋</span>
          </div>
        </button>

        <button
          onClick={() => handleExport("tenants")}
          className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 text-left transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Tenants</h3>
              <p className="text-zinc-400 text-sm">All tenant information and contacts</p>
            </div>
            <span className="text-2xl">👤</span>
          </div>
        </button>

        <button
          onClick={() => handleExport("payments")}
          className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 text-left transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Payments</h3>
              <p className="text-zinc-400 text-sm">All payment records and history</p>
            </div>
            <span className="text-2xl">💰</span>
          </div>
        </button>

        <button
          onClick={() => handleExport("financials")}
          className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 text-left transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Financials</h3>
              <p className="text-zinc-400 text-sm">Income and expenses summary</p>
            </div>
            <span className="text-2xl">📊</span>
          </div>
        </button>

        <button
          onClick={() => handleExport("maintenance")}
          className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 text-left transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Maintenance</h3>
              <p className="text-zinc-400 text-sm">All maintenance requests and work orders</p>
            </div>
            <span className="text-2xl">🔧</span>
          </div>
        </button>
      </div>
    </div>
  );
}