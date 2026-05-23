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

  if (loading) return <div className="text-zinc-400 py-8">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
          <p className="text-zinc-400">Store and manage your property documents</p>
        </div>
        <button className="px-6 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors">
          + Upload Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-3xl mb-4">📄</p>
          <h3 className="text-xl font-semibold text-white mb-2">No documents yet</h3>
          <p className="text-zinc-400">Upload leases, agreements, and other documents</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl">📄</span>
                <div>
                  <p className="text-white font-medium">{doc.name}</p>
                  <p className="text-zinc-500 text-sm">
                    {doc.leases?.units?.properties?.address_line_1 || "General"} • {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-3 py-1 bg-zinc-800 text-zinc-400 rounded-full">{doc.category || "general"}</span>
                <a href={doc.url} target="_blank" rel="noopener" className="text-green-400 hover:text-green-300 text-sm">View</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}