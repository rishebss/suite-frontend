import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2, Check, ChevronDown, Search, X } from "lucide-react";
import axios from "axios";

const EmployeeSelect = ({ value, onChange, projectId, excludeMembers = false, placeholder = "Select employee..." }) => {
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        let url = "/api/hr/employees/";
        if (projectId && excludeMembers) {
          url += `?exclude_project=${projectId}`;
        }
        const res = await axios.get(url);
        const list = res.data.results || res.data || [];
        setEmployees(list.filter((e) => e.user));
      } catch {
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [projectId, excludeMembers]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = employees.find((e) => e.user === value);

  const filtered = search
    ? employees.filter(
        (e) =>
          `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
          e.department_name?.toLowerCase().includes(search.toLowerCase()) ||
          e.designation_name?.toLowerCase().includes(search.toLowerCase())
      )
    : employees;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 flex items-center justify-between gap-2"
      >
        {selected ? (
          <span className="truncate flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
              {(selected.first_name?.[0] || "?").toUpperCase()}
            </span>
            <span>{selected.first_name} {selected.last_name}</span>
          </span>
        ) : (
          <span className="text-white/30">{placeholder}</span>
        )}
        <ChevronDown size={14} className={cn("text-white/30 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50 max-h-60 overflow-hidden">
          <div className="p-2 border-b border-zinc-800">
            <div className="flex items-center gap-2 bg-zinc-800 rounded-md px-2.5 py-1.5">
              <Search size={14} className="text-white/30 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, dept..."
                className="bg-transparent border-none outline-none text-xs text-white w-full placeholder:text-white/20"
                autoFocus
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-white/30 hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto max-h-44">
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between",
                !value ? "bg-blue-500/10 text-blue-400" : "text-white/50 hover:bg-white/5"
              )}
            >
              -- Unassigned --
              {!value && <Check size={12} />}
            </button>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={16} className="animate-spin text-white/30" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-white/30 text-center py-6">No employees found</p>
            ) : (
              filtered.map((emp) => (
                <button
                  key={emp.user}
                  type="button"
                  onClick={() => { onChange(emp.user); setOpen(false); setSearch(""); }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2.5",
                    value === emp.user ? "bg-blue-500/10 text-blue-400" : "text-white/70 hover:bg-white/5"
                  )}
                >
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                    {(emp.first_name?.[0] || "?").toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{emp.first_name} {emp.last_name}</p>
                    <p className="text-[9px] text-white/30 truncate">
                      {emp.department_name || emp.designation_name || emp.official_email || ""}
                    </p>
                  </div>
                  {value === emp.user && <Check size={12} className="shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSelect;
