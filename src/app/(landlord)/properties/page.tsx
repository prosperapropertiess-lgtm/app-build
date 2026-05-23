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

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchProperties = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("landlord_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setProperties(data || []);
      }
      setLoading(false);
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading properties...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Properties</h1>
          <p className="text-zinc-400">Manage your rental properties</p>
        </div>
        <Link
          href="/properties/new"
          className="px-6 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors"
        >
          + Add Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <EmptyPropertiesState />
      ) : (
        <div className="grid gap-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property }: { property: Property }) {
  const typeLabels: Record<string, string> = {
    single_family: "Single Family",
    duplex: "Duplex",
    triplex: "Triplex",
    fourplex: "Fourplex",
    multi_unit: "Multi-Unit",
  };

  return (
    <Link
      href={`/properties/${property.id}`}
      className="block bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            {property.address_line_1}
          </h3>
          {property.address_line_2 && (
            <p className="text-zinc-400 text-sm mb-1">{property.address_line_2}</p>
          )}
          <p className="text-zinc-500 text-sm">
            {property.city}, {property.province} {property.postal_code}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-violet-500/20 text-violet-400 text-xs font-medium rounded-full mb-2">
            {typeLabels[property.property_type] || property.property_type}
          </span>
          <p className="text-zinc-400 text-sm">
            {property.total_units} {property.total_units === 1 ? "unit" : "units"}
          </p>
        </div>
      </div>
    </Link>
  );
}

function EmptyPropertiesState() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
      <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl text-zinc-600">◈</span>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No properties yet</h3>
      <p className="text-zinc-400 mb-6">Add your first property to get started</p>
      <Link
        href="/properties/new"
        className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl transition-colors"
      >
        + Add Your First Property
      </Link>
    </div>
  );
}