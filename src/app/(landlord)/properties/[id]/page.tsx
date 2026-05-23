"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const id = params.id as string;

    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prop } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .eq("landlord_id", user.id)
        .single();

      const { data: unitData } = await supabase
        .from("units")
        .select("*")
        .eq("property_id", id)
        .order("unit_number");

      setProperty(prop);
      setUnits(unitData || []);
      setLoading(false);
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Property not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={() => router.push("/properties")} className="text-zinc-400 hover:text-white text-sm mb-3">
            ← Back to Properties
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">{property.address_line_1}</h1>
          {property.address_line_2 && <p className="text-zinc-400">{property.address_line_2}</p>}
          <p className="text-zinc-500 text-sm">
            {property.city}, {property.province} {property.postal_code}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm transition-colors">
            Edit
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-white">{units.length}</p>
          <p className="text-zinc-400 text-sm">Units</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">
            {units.filter((u: any) => u.status === "occupied").length}
          </p>
          <p className="text-zinc-400 text-sm">Occupied</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-yellow-400">
            {units.filter((u: any) => u.status === "vacant").length}
          </p>
          <p className="text-zinc-400 text-sm">Vacant</p>
        </div>
      </div>

      {/* Units */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Units</h2>
          <button className="px-4 py-2 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-xl text-sm transition-colors">
            + Add Unit
          </button>
        </div>

        {units.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No units found</p>
        ) : (
          <div className="space-y-3">
            {units.map((unit: any) => (
              <div key={unit.id} className="flex items-center justify-between py-4 border-b border-zinc-800 last:border-0">
                <div>
                  <p className="text-white font-medium">Unit {unit.unit_number}</p>
                  <p className="text-zinc-500 text-sm">
                    {unit.bedrooms}bd / {unit.bathrooms}ba
                    {unit.rent_amount > 0 && ` — $${unit.rent_amount}/mo`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    unit.status === "occupied"
                      ? "bg-green-500/20 text-green-400"
                      : unit.status === "vacant"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-orange-500/20 text-orange-400"
                  }`}>
                    {unit.status}
                  </span>
                  <button className="text-zinc-400 hover:text-white text-sm">Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}