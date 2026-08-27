import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkManagement } from "../../context/WorkManagementContext";

const ISSUE_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "EPIC", label: "Epic" },
  { value: "STORY", label: "Story" },
  { value: "TASK", label: "Task" },
  { value: "BUG", label: "Bug" },
  { value: "DEAL", label: "Deal" },
  { value: "TICKET", label: "Ticket" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "All Priorities" },
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const FilterBar = ({ projects = [], className }) => {
  const { filters, setFilter, clearFilters } = useWorkManagement();

  const hasActiveFilters = Object.values(filters).some((v) => v !== null);

  return (
    <div className={cn("flex items-center gap-3 flex-wrap", className)}>
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          type="text"
          value={filters.search || ""}
          onChange={(e) => setFilter("search", e.target.value || null)}
          placeholder="Search items..."
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-blue-500/50 placeholder:text-white/20"
        />
      </div>

      {/* Issue Type */}
      <select
        value={filters.issue_type || ""}
        onChange={(e) => setFilter("issue_type", e.target.value || null)}
        className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50"
      >
        {ISSUE_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Priority */}
      <select
        value={filters.priority || ""}
        onChange={(e) => setFilter("priority", e.target.value || null)}
        className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50"
      >
        {PRIORITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-zinc-800 text-[10px] text-white/40 hover:text-white hover:border-zinc-700 transition-all"
        >
          <X size={12} />
          Clear
        </button>
      )}
    </div>
  );
};

export default FilterBar;
