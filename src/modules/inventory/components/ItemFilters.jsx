import React from "react";
import { X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "ARCHIVED", label: "Archived" },
];

const ItemFilters = ({ filters, categories, onChange, onClose }) => {
  return (
    <div className="px-10 py-4 border-b border-white/5 bg-white/[0.01]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          Filters
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"
        >
          <X size={14} />
        </button>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange("status", e.target.value)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/20 appearance-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onChange("category", e.target.value)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/20 appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Show Archived Toggle */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">
            Show Archived
          </label>
          <button
            onClick={() =>
              onChange(
                "show_archived",
                filters.show_archived === "true" ? "false" : "true",
              )
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filters.show_archived === "true"
                ? "bg-white/10 text-white"
                : "bg-white/5 text-white/40 hover:text-white/60"
            }`}
          >
            {filters.show_archived === "true" ? "ON" : "OFF"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemFilters;
