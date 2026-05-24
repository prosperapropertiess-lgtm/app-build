"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  url: string;
  created_at: string;
  leases: { units: { properties: { address_line_1: string } } };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchDocuments = async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*, leases(units(properties(address_line_1)))")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error) setDocuments(data || []);
      setLoading(false);
    };

    fetchDocuments();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
    </div>
  );

  const cardStyle = { background: "var(--navy-900)", border: "1px solid var(--navy-700)" };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Storage</p>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="mt-1" style={{ color: "#6b8aad" }}>Store and manage your property documents</p>
        </div>
        <button className="px-6 py-3 font-semibold rounded-xl hover:opacity-90 transition-opacity" style={{ background: "var(--gold-500)", color: "#060d1a" }}>
          + Upload Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={cardStyle}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(201,168,76,0.08)" }}>
            <p className="text-3xl">📄</p>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No documents yet</h3>
          <p style={{ color: "#6b8aad" }}>Upload leases, agreements, and other documents</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="rounded-2xl p-6 flex items-center justify-between" style={cardStyle}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(201,168,76,0.08)" }}>
                  <span className="text-2xl">📄</span>
                </div>
                <div>
                  <p className="text-white font-medium">{doc.name}</p>
                  <p className="text-sm" style={{ color: "#4a6480" }}>
                    {doc.leases?.units?.properties?.address_line_1 || "General"} • {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: "var(--navy-800)", color: "#6b8aad" }}>{doc.category || "general"}</span>
                <a href={doc.url} target="_blank" rel="noopener" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "var(--gold-400)" }}>View</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
