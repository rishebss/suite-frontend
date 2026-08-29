import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
export default function PaymentFilters({pipelines, filters, setFilters}){
  return (
    <div className="flex flex-wrap gap-3 items-center bg-zinc-900/30 border border-zinc-800 rounded-lg p-4">
      <div className="relative flex-1 min-w-[220px]">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"/>
        <input value={filters.search} onChange={e=>setFilters({...filters, search:e.target.value})} placeholder="Search contact / payment for / invoice" className="w-full h-9 bg-white/[0.02] border border-white/10 rounded-md pl-9 pr-3 text-xs text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"/>
      </div>
      <select value={filters.pipeline} onChange={e=>setFilters({...filters, pipeline:e.target.value})} className="h-9 bg-white/[0.02] border border-white/10 rounded-md px-3 text-xs text-white outline-none focus:border-white/20">
        <option value="">All Pipelines</option>
        {pipelines.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <select value={filters.method} onChange={e=>setFilters({...filters, method:e.target.value})} className="h-9 bg-white/[0.02] border border-white/10 rounded-md px-3 text-xs text-white outline-none focus:border-white/20">
        <option value="">All Methods</option>
        {["UPI","Bank Transfer","Cash","Card","Net Banking","Any"].map(m=> <option key={m} value={m}>{m}</option>)}
      </select>
      {(filters.pipeline||filters.method||filters.search) && <button onClick={()=>setFilters({search:"",pipeline:"",method:""})} className="h-9 px-4 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 text-[10px] font-medium uppercase tracking-widest flex items-center gap-1.5 transition-all"><X size={12}/>Clear</button>}
    </div>
  );
}
