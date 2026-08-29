import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Wallet, Eye, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { FaRupeeSign } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import RingLoader from '@/components/ui/RingLoader';

const fmtINR=v=>`₹${Number(v||0).toLocaleString("en-IN")}`;

export default function PaymentTable({ searchQuery="", pipelineId="", methodFilter="" }){
  const [rows,setRows]=useState([]);
  const [totalCount,setTotalCount]=useState(0);
  const [currentPage,setCurrentPage]=useState(1);
  const [isLoading,setIsLoading]=useState(true);
  const pageSize=20;
  const listRef=useRef(null);

  const fetchData=useCallback(async(page=1, search="", pipeline="", method="")=>{
    setIsLoading(true);
    try{
      const params={page, page_size:pageSize};
      if(search) params.search=search;
      if(pipeline) params.pipeline=pipeline;
      if(method) params.payment_method=method;
      const res=await axios.get('/api/payments/', {params});
      setRows(res.data.results||res.data||[]);
      setTotalCount(res.data.count ?? (res.data.results?.length||0));
    } catch{ setRows([]); } finally{ setIsLoading(false); }
  },[]);

  useEffect(()=>{
    const t=setTimeout(()=>{ setCurrentPage(1); fetchData(1, searchQuery, pipelineId, methodFilter); }, 400);
    return ()=>clearTimeout(t);
  },[searchQuery, pipelineId, methodFilter, fetchData]);

  const handlePageChange=(newPage)=>{
    setCurrentPage(newPage);
    fetchData(newPage, searchQuery, pipelineId, methodFilter);
    listRef.current?.scrollTo({top:0, behavior:'smooth'});
  };
  const totalPages=Math.ceil(totalCount/pageSize);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800 shadow-xl relative flex flex-col min-h-0 flex-1">
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] z-20 flex items-center justify-center">
            <RingLoader />
          </div>
        )}
        <div className="px-8 py-3 bg-zinc-900/20 border-b border-zinc-800 shrink-0 select-none">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-white/30 items-center">
            <div className="col-span-1">No</div>
            <div className="col-span-2">Payment Amount</div>
            <div className="col-span-2">Invoice</div>
            <div className="col-span-2">Pipeline</div>
            <div className="col-span-2">Method</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-2 text-right">Done by / Actor</div>
          </div>
        </div>
        {rows.length===0 && !isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
            <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-zinc-800 flex items-center justify-center text-white/10 mb-4"><Wallet size={28}/></div>
            <p className="text-sm text-white/20">No payments found</p>
          </div>
        ) : (
          <div ref={listRef} className="divide-y divide-zinc-800 overflow-y-auto custom-scrollbar flex-1">
            {rows.map((r, idx)=>(
              <div key={r.id} className="grid grid-cols-12 gap-4 px-8 py-3.5 items-center group hover:bg-white/[0.02] transition-all border-l-2 border-transparent hover:border-emerald-500/20">
                <div className="col-span-1 text-xs text-white/25">{(currentPage-1)*pageSize+idx+1}</div>
                <div className="col-span-2 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full border bg-white/5 border-white/10 text-white/40 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/5 group-hover:text-emerald-400 flex items-center justify-center text-xs shrink-0"><FaRupeeSign size={9}/></div>
                  <span className="text-sm font-bold text-emerald-400">{fmtINR(r.amount)}</span>
                </div>
                <div className="col-span-2 text-xs font-mono text-white/60 truncate">{r.invoice||"—"}</div>
                <div className="col-span-2"><span className="px-2 py-0.5 rounded-sm bg-white/[0.02] border border-white/10 text-[10px] text-white/60 truncate inline-block max-w-full">{r.crm_details?.pipeline_name||r.pipeline_name||r.crm__pipeline__name||"—"}</span></div>
                <div className="col-span-2"><span className="px-2 py-0.5 rounded-sm bg-white/[0.02] border border-white/10 text-[10px] text-white/60">{r.payment_method}</span></div>
                <div className="col-span-1 text-xs text-white/40">{r.created_at? new Date(r.created_at).toLocaleDateString():"—"}</div>
                <div className="col-span-2 text-right min-w-0">
                  <p className="text-xs font-medium text-white truncate">{r.recorded_by_details ? `${r.recorded_by_details.first_name||""} ${r.recorded_by_details.last_name||""}`.trim() || r.recorded_by_details.email : "—"}</p>
                  <p className="text-[11px] text-white/30 truncate">{r.recorded_by_details?.email||""}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="px-6 py-3 bg-white/[0.02] flex items-center justify-between shrink-0">
          <p className="text-xs text-white/30">Page {currentPage} of {Math.max(1,totalPages)} · {totalCount} total</p>
          <div className="flex items-center gap-1.5">
            <button disabled={currentPage===1||isLoading} onClick={()=>handlePageChange(currentPage-1)} className="p-2 rounded-xs bg-white/5 border border-white/5 text-white disabled:opacity-20 hover:bg-white/10 transition-all"><ChevronLeft size={14}/></button>
            <div className="flex items-center gap-1 px-1">
              {(()=>{
                const start=Math.max(1, currentPage-2);
                const end=Math.min(totalPages, currentPage+2);
                return [...Array(Math.max(0,end-start+1))].map((_,i)=>{
                  const pageNum=start+i;
                  return <button key={pageNum} onClick={()=>handlePageChange(pageNum)} className={cn("w-8 h-8 rounded-xs text-xs transition-all", currentPage===pageNum?"bg-white text-black font-semibold":"text-white/40 hover:bg-white/5")}>{pageNum}</button>
                });
              })()}
            </div>
            <button disabled={currentPage===totalPages||totalPages===0||isLoading} onClick={()=>handlePageChange(currentPage+1)} className="p-2 rounded-xs bg-white/5 border border-white/5 text-white disabled:opacity-20 hover:bg-white/10 transition-all"><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
