"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Property {
  id: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  province: string;
  postal_code: string;
  property_type: string;
  total_units: number;
  created_at: string;
}

const typeLabels: Record<string, string> = {
  single_family: "Single Family", duplex: "Duplex", triplex: "Triplex",
  fourplex: "Fourplex", multi_unit: "Multi-Unit",
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("properties").select("*")
        .eq("landlord_id", user.id).order("created_at", { ascending: false });
      if (!error) setProperties(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--navy-700)", borderTopColor: "var(--gold-500)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Portfolio</p>
          <h1 className="text-2xl font-bold text-white">Properties</h1>
        </div>
        <Link href="/properties/new"
          className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "var(--gold-500)", color: "#060d1a" }}
        >
          + Add Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <EmptyPropertiesState />
      ) : (
        <div className="grid gap-3">
          {properties.map(p => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property: p }: { property: Property }) {
  return (
    <Link href={`/properties/${p.id}`}
      className="block rounded-2xl p-5 transition-all hover:scale-[1.01]"
      style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 flex-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "rgba(201,168,76,0.12)" }}>
            <span className="text-lg">🏠</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">{p.address_line_1}</p>
            {p.address_line_2 && <p className="text-sm mt-0.5" style={{ color: "#6b8aad" }}>{p.address_line_2}</p>}
            <p className="text-sm mt-0.5" style={{ color: "#4a6480" }}>
              {p.city}, {p.province} {p.postal_code}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-2"
            style={{ background: "rgba(201,168,76,0.12)", color: "var(--gold-400)" }}>
            {typeLabels[p.property_type] || p.property_type}
          </span>
          <p className="text-xs" style={{ color: "#4a6480" }}>
            {p.total_units} {p.total_units === 1 ? "unit" : "units"}
          </p>
        </div>
      </div>
    </Link>
  );
}

function EmptyPropertiesState() {
  return (
    <div className="rounded-2xl p-12 text-center" style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: "rgba(201,168,76,0.08)" }}>
        <span className="text-3xl">🏠</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No properties yet</h3>
      <p className="text-sm mb-6" style={{ color: "#6b8aad" }}>Add your first property to get started</p>
      <Link href="/properties/new"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
        style={{ background: "var(--gold-500)", color: "#060d1a" }}
      >
        + Add Your First Property
      </Link>
    </div>
  );
}
