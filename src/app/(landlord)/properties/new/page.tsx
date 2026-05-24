"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PROPERTY_TYPES = [
  { value: "single_family", label: "Single Family" },
  { value: "duplex", label: "Duplex" },
  { value: "triplex", label: "Triplex" },
  { value: "fourplex", label: "Fourplex" },
  { value: "multi_unit", label: "Multi-Unit" },
];

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    address_line_1: "",
    address_line_2: "",
    city: "",
    province: "Ontario",
    postal_code: "",
    property_type: "single_family",
    total_units: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "total_units" ? parseInt(value) || 1 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error: insertError } = await supabase
      .from("properties")
      .insert({
        landlord_id: user.id,
        address_line_1: formData.address_line_1,
        address_line_2: formData.address_line_2 || null,
        city: formData.city,
        province: formData.province,
        postal_code: formData.postal_code,
        property_type: formData.property_type,
        total_units: formData.total_units,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Create units for this property
    const units = [];
    for (let i = 1; i <= formData.total_units; i++) {
      units.push({
        property_id: data.id,
        unit_number: i.toString(),
        bedrooms: 1,
        bathrooms: 1.0,
        rent_amount: 0,
        status: "vacant",
      });
    }

    await supabase.from("units").insert(units);

    router.push("/properties");
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-white placeholder-zinc-500 focus:outline-none";
  const inputStyle = {
    background: "var(--navy-800)",
    border: "1px solid var(--navy-600)",
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#4a6480" }}>Properties</p>
        <h1 className="text-2xl font-bold text-white">Add Property</h1>
        <p className="mt-1" style={{ color: "#6b8aad" }}>Add a new property to your portfolio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl p-6 space-y-5" style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}>
          <h2 className="text-lg font-semibold text-white">Address</h2>

          <div>
            <label htmlFor="address_line_1" className="block text-sm font-medium mb-2" style={{ color: "#c8d6e5" }}>
              Street Address *
            </label>
            <input
              id="address_line_1"
              name="address_line_1"
              type="text"
              value={formData.address_line_1}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
              placeholder="123 Main Street"
              required
            />
          </div>

          <div>
            <label htmlFor="address_line_2" className="block text-sm font-medium mb-2" style={{ color: "#c8d6e5" }}>
              Unit/Apt Number
            </label>
            <input
              id="address_line_2"
              name="address_line_2"
              type="text"
              value={formData.address_line_2}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
              placeholder="Apt 101 (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-2" style={{ color: "#c8d6e5" }}>
                City *
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                className={inputClass}
                style={inputStyle}
                placeholder="London"
                required
              />
            </div>

            <div>
              <label htmlFor="postal_code" className="block text-sm font-medium mb-2" style={{ color: "#c8d6e5" }}>
                Postal Code *
              </label>
              <input
                id="postal_code"
                name="postal_code"
                type="text"
                value={formData.postal_code}
                onChange={handleChange}
                className={inputClass}
                style={inputStyle}
                placeholder="N6A 1A1"
                required
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 space-y-5" style={{ background: "var(--navy-900)", border: "1px solid var(--navy-700)" }}>
          <h2 className="text-lg font-semibold text-white">Property Details</h2>

          <div>
            <label htmlFor="property_type" className="block text-sm font-medium mb-2" style={{ color: "#c8d6e5" }}>
              Property Type *
            </label>
            <select
              id="property_type"
              name="property_type"
              value={formData.property_type}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
              required
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="total_units" className="block text-sm font-medium mb-2" style={{ color: "#c8d6e5" }}>
              Number of Units *
            </label>
            <input
              id="total_units"
              name="total_units"
              type="number"
              min="1"
              max="50"
              value={formData.total_units}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
              required
            />
            <p className="text-sm mt-2" style={{ color: "#4a6480" }}>
              We'll create {formData.total_units} unit{formData.total_units > 1 ? "s" : ""} for this property
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 text-white font-medium rounded-xl hover:opacity-80 transition-opacity"
            style={{ background: "var(--navy-800)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: "var(--gold-500)", color: "#060d1a" }}
          >
            {loading ? "Creating..." : "Create Property"}
          </button>
        </div>
      </form>
    </div>
  );
}
