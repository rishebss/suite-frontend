import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X, Wallet, ChevronRight } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import { cn } from "@/lib/utils";
import RingLoader from "@/components/ui/RingLoader";
import axios from "axios";

const STATUS_STYLES = {
  Paid: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  Due: 'bg-red-500/10 border-red-500/20 text-red-400',
  "Payment Pending": 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  Lead: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
};
const fmtINR=v=>`₹${Number(v||0).toLocaleString("en-IN")}`;

export default function PaymentSearchModal({ isOpen, onClose, search, setSearch }){
  const inputRef=useRef(null);
  const [results,setResults]=useState([]);
  const [isSearching,setIsSearching]=useState(false);
  useEffect(()=>{ if(isOpen) setTimeout(()=>inputRef.current?.focus(), 100); },[isOpen]);
  useEffect(()=>{
    if(!isOpen) return;
    if(!search?.trim()){ setResults([]); return; }
    setIsSearching(true);
    const t=setTimeout(async()=>{
      try{
        const res=await axios.get("/api/payments/", { params:{ search: search.trim(), page_size:40 }});
        setResults(res.data.results||res.data||[]);
      } catch{ setResults([]); } finally{ setIsSearching(false); }
    },300);
    return ()=>clearTimeout(t);
  },[search,isOpen]);
  if(!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet size={18} />
            </div>
            <div>
              <h2 className="text-base font-medium text-white uppercase tracking-wider">Payment Search</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Registry: <span className="text-emerald-400 font-semibold">{results.length} Records</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/20 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="px-8 py-4 border-b border-zinc-800 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by contact, pipeline, payment for or invoice..."
              value={search}
              onChange={e=>setSearch(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Escape') onClose(); }}
              className="w-full bg-white/5 border border-zinc-800 rounded-md py-2 pl-9 pr-4 text-[11px] text-white placeholder:text-white/10 focus:border-emerald-500/40 outline-none transition-all font-medium tracking-wide"
            />
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-2 bg-black/40">
          {isSearching ? (
            <div className="py-14 flex flex-col items-center justify-center gap-4">
              <RingLoader className="scale-75" />
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/20 animate-pulse">Scanning Registry...</p>
            </div>
          ) : !search?.trim() ? (
            <div className="py-14 text-center">
              <Search size={36} className="mx-auto mb-4 text-white/5" />
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">Awaiting Input Parameters</p>
            </div>
          ) : results.length===0 ? (
            <div className="py-14 text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/20">No Matching Records Found</p>
              <p className="text-[9px] text-white/10 mt-1 uppercase tracking-widest">Adjust query parameters and retry</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Results · {results.length}</p>
              </div>
              {results.map(r=>{
                const name=r.contact_details?.name||r.contact__name||"Unnamed";
                const pipeline=r.crm_details?.pipeline_name||r.pipeline_name||r.crm__pipeline__name||"—";
                const status=r.contact_details?.status;
                return (
                  <div key={r.id} className="w-full group flex items-center gap-3 rounded-lg bg-white/[0.02] border border-zinc-900 hover:border-emerald-500/30 px-3 py-2.5 text-left transition-all duration-200 hover:bg-white/[0.04]">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-xs font-semibold text-white uppercase tracking-wide">{name}</h4>
                        {status && <span className={cn("shrink-0 px-1.5 py-0.5 rounded border text-[8px] font-bold uppercase tracking-[0.15em] inline-flex items-center gap-1", STATUS_STYLES[status]||'border-white/10 bg-white/5 text-white/40')}>{(status==="Payment Pending"||status==="Due"||status==="Paid") && <FaRupeeSign size={7}/>}{status==="Payment Pending"?"Pending":status}</span>}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-white/40">
                        <span className="flex items-center gap-1 truncate"><Wallet size={9} className="shrink-0"/>{r.payment_for}</span>
                        <span className="truncate">{r.invoice||"—"}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-bold uppercase tracking-[0.15em] text-white/50">{pipeline}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-bold uppercase tracking-[0.15em] text-emerald-400">{fmtINR(r.amount)}</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-bold uppercase tracking-[0.15em] text-white/50">{r.payment_method}</span>
                      <ChevronRight size={12} className="ml-0.5 text-white/15 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
        <div className="px-8 py-4 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-between shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-zinc-800 text-white/40">Select</kbd>Open Record</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-zinc-800 text-white/40">Esc</kbd>Dismiss</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
