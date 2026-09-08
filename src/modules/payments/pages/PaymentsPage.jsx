import React, { useEffect, useState, useMemo } from "react";
import { Wallet, Search, Filter, X, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPayments, fetchSchedules, fetchPipelines, fetchAssignableUsers } from "../services/paymentsService";
import PaymentTable from "../components/PaymentTable";
import ScheduleTable from "../components/ScheduleTable";
import PaymentSearchModal from "../components/PaymentSearchModal";

const fmtINR=v=>`₹${Number(v||0).toLocaleString("en-IN")}`;
export default function PaymentsPage(){
  const [tab,setTab]=useState("logs");
  const [payments,setPayments]=useState([]);
  const [schedules,setSchedules]=useState([]);
  const [pipelines,setPipelines]=useState([]);
  const [loading,setLoading]=useState(true);
  const [schedulesLoading,setSchedulesLoading]=useState(false);
  const [filters,setFilters]=useState({search:"",pipeline:[],method:[],user:[]});
  const [draft,setDraft]=useState(null);
  const [filterOpen,setFilterOpen]=useState(false);
  const [pipeSubOpen,setPipeSubOpen]=useState(false);
  const [methodSubOpen,setMethodSubOpen]=useState(false);
  const [userSubOpen,setUserSubOpen]=useState(false);
  const [users,setUsers]=useState([]);
  const [usersLoading,setUsersLoading]=useState(false);
  const [userSearch,setUserSearch]=useState("");
  const loadUsers=async()=>{
    setUsersLoading(true);
    try{
      const res=await fetchAssignableUsers();
      setUsers(Array.isArray(res.data)?res.data:[]);
    } catch{ setUsers([]); } finally{ setUsersLoading(false); }
  };
  useEffect(()=>{
    if(userSubOpen && users.length===0) loadUsers();
  },[userSubOpen]);
  const [searchModalOpen,setSearchModalOpen]=useState(false);
  const [pipelinesLoading,setPipelinesLoading]=useState(false);
  const [pipelinePage,setPipelinePage]=useState(1);
  const [pipelineHasMore,setPipelineHasMore]=useState(false);
  const loadPipelines=async(page=1, append=false)=>{
    setPipelinesLoading(true);
    try{
      const res=await fetchPipelines({page, page_size:20, ordering:"-created_at"});
      const list=res.data.results||res.data||[];
      const arr=Array.isArray(list)? list : (list.list||[]);
      setPipelines(prev=> append ? [...prev, ...arr] : arr);
      setPipelineHasMore(!!res.data.next);
      setPipelinePage(page);
    } finally{ setPipelinesLoading(false); }
  };
  useEffect(()=>{
    setLoading(true);
    fetchPayments({page_size:200}).then(p=>{
      setPayments(p.data.results||p.data||[]);
    }).finally(()=>setLoading(false));
  },[]);
  // Rules tab loads its own content independently — fetched only when the tab is opened
  useEffect(()=>{
    if(tab!=="schedules") return;
    let cancelled=false;
    setSchedulesLoading(true);
    fetchSchedules()
      .then(s=>{ if(!cancelled) setSchedules(s.data.results||s.data||[]); })
      .catch(()=>{ if(!cancelled) setSchedules([]); })
      .finally(()=>{ if(!cancelled) setSchedulesLoading(false); });
    return ()=>{ cancelled=true; };
  },[tab]);
  useEffect(()=>{
    if(!pipeSubOpen) return;
    loadPipelines(1,false);
  },[pipeSubOpen]);
  const filteredForSearch = useMemo(()=> payments, [payments]);
  const filteredUsers = useMemo(()=>{
    const q=userSearch.trim().toLowerCase();
    if(!q) return users;
    return users.filter(u=>`${u.first_name||""} ${u.last_name||""} ${u.email||""}`.toLowerCase().includes(q));
  },[users,userSearch]);
  const pipeSummary=(arr)=>arr.length?arr.map(id=>pipelines.find(p=>String(p.id)===id)?.name).filter(Boolean).join(", "):"";
  const userSummary=(arr)=>arr.length?arr.map(id=>{const u=users.find(x=>String(x.id)===id);return u?`${u.first_name||""} ${u.last_name||""}`.trim()||u.email:""}).filter(Boolean).join(", "):"";
  const methodSummary=(arr)=>arr.join(", ");
  const toggleDraft=(key,val)=>setDraft(d=>d?({...d,[key]:d[key].includes(val)?d[key].filter(x=>x!==val):[...d[key],val]}):d);
  const applyFilters=()=>{ if(!draft)return; setFilters(f=>({...f,pipeline:draft.pipeline,method:draft.method,user:draft.user})); setFilterOpen(false); setDraft(null); };
  const openFilter=()=>{ if(filterOpen){ setFilterOpen(false); setDraft(null); setPipeSubOpen(false); setMethodSubOpen(false); setUserSubOpen(false); } else { setDraft({pipeline:[...filters.pipeline],method:[...filters.method],user:[...filters.user]}); setFilterOpen(true); } };
  const payByMonth=[];
  const payByPipeline=[];
  const payByMethod=[];
  return (
    <div className="flex flex-col h-full">
      <header className="px-10 py-8 flex justify-between items-end border-b border-zinc-800 relative z-10 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Payments</h1>
          <p className="text-sm text-white/40 font-medium">Pipeline payments, schedules & collection logs</p>
        </div>
      </header>
      <main className="flex-1 px-10 pt-5 pb-10 relative z-10 overflow-hidden flex flex-col gap-4 min-h-0">
        <div className="flex items-center justify-between gap-4 shrink-0 pb-4">
          <div className="relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md w-[360px]">
            <div className={cn("absolute inset-y-0 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out z-0", tab==="logs" ? "left-0 w-1/2 rounded-l rounded-r-none" : "left-1/2 w-1/2 rounded-r rounded-l-none")} />
            {[{id:"logs",label:"Logs"},{id:"schedules",label:"Rules"}].map(t=>{
              const active=tab===t.id;
              return <button key={t.id} onClick={()=>setTab(t.id)} className={cn("relative z-10 flex-1 flex items-center justify-center py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300", active?"text-blue-400":"text-white/50 hover:text-white/80")}>{t.label}</button>
            })}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setSearchModalOpen(true)} className="h-9 w-9 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 flex items-center justify-center"><Search size={14}/></button>
            <div className="relative">
              <button onClick={openFilter} className={cn("h-9 w-9 rounded-md border flex items-center justify-center transition-all", (filters.pipeline.length||filters.method.length||filters.user.length) ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-zinc-900/50 border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800")}>
                <Filter size={14} />
              </button>
              {filterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={()=>{setFilterOpen(false); setDraft(null); setPipeSubOpen(false); setMethodSubOpen(false); setUserSubOpen(false);}} />
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl z-20 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white">Filters</p>
                      {draft && (draft.pipeline.length||draft.method.length||draft.user.length) && <button onClick={()=>setDraft({pipeline:[],method:[],user:[]})} className="text-[10px] font-medium uppercase tracking-widest text-blue-400 hover:text-blue-300">Clear</button>}
                    </div>
                    <div className="p-2 space-y-2">
                      <div className="rounded-md border border-white/5 bg-white/[0.02] overflow-hidden">
                        <button onClick={()=>{setPipeSubOpen(v=>!v); setMethodSubOpen(false);}} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.04] transition-colors">
                          <div className="text-left">
                            <p className="text-[9px] uppercase tracking-widest text-white/30">Pipeline</p>
                            <p className="text-xs font-medium text-white truncate max-w-[160px]">{pipeSummary(draft?.pipeline||[]) || "All Pipelines"}</p>
                          </div>
                          <Plus size={16} className={cn("shrink-0 transition-all", pipeSubOpen ? "text-blue-400 rotate-45" : "text-white/60")} />
                        </button>
                        {pipeSubOpen && (
                          <div className="border-t border-white/5 bg-zinc-900 max-h-48 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-1">
                            {pipelinesLoading && pipelines.length===0 ? <p className="px-3 py-3 text-xs text-white/30">Loading pipelines…</p> : <>
                              {pipelines.map(p=>{
                                const on=draft?.pipeline.includes(String(p.id))||false;
                                return (
                                  <button key={p.id} onClick={()=>toggleDraft("pipeline", String(p.id))} className={cn("w-full flex items-center gap-2 text-left px-3 py-2 text-xs hover:bg-white/5 truncate", on ? "text-blue-400 bg-blue-500/10" : "text-white/70")}>
                                    <span className={cn("w-3.5 h-3.5 rounded-[4px] border shrink-0 flex items-center justify-center", on ? "bg-blue-500 border-blue-400" : "border-white/20")}>{on && <Check size={10} strokeWidth={3}/>}</span>
                                    <span className="truncate">{p.name}</span>
                                  </button>
                                );
                              })}
                              {pipelineHasMore && (
                                <button onClick={()=>loadPipelines(pipelinePage+1, true)} disabled={pipelinesLoading} className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:bg-white/5 border-t border-white/5 disabled:opacity-50">{pipelinesLoading?"Loading…":"Load more"}</button>
                              )}
                            </>}
                          </div>
                        )}
                      </div>
                      <div className="rounded-md border border-white/5 bg-white/[0.02] overflow-hidden">
                        <button onClick={()=>{setUserSubOpen(v=>!v); setPipeSubOpen(false); setMethodSubOpen(false);}} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.04] transition-colors">
                          <div className="text-left">
                            <p className="text-[9px] uppercase tracking-widest text-white/30">User</p>
                            <p className="text-xs font-medium text-white truncate max-w-[160px]">{userSummary(draft?.user||[]) || "All Users"}</p>
                          </div>
                          <Plus size={16} className={cn("shrink-0 transition-all", userSubOpen ? "text-blue-400 rotate-45" : "text-white/60")} />
                        </button>
                        {userSubOpen && (
                          <div className="border-t border-white/5 bg-zinc-900 max-h-48 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-1">
                            <div className="p-2 sticky top-0 bg-zinc-900">
                              <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search users…" className="w-full h-7 bg-white/[0.02] border border-white/10 rounded px-2 text-[11px] text-white placeholder:text-white/20 outline-none focus:border-white/20"/>
                            </div>
                            {usersLoading && users.length===0 ? <p className="px-3 py-3 text-xs text-white/30">Loading users…</p> : <>
                              {filteredUsers.map(u=>{
                                const on=draft?.user.includes(String(u.id))||false;
                                return (
                                  <button key={u.id} onClick={()=>toggleDraft("user", String(u.id))} className={cn("w-full flex items-center gap-2 text-left px-3 py-2 text-xs hover:bg-white/5 truncate", on ? "text-blue-400 bg-blue-500/10" : "text-white/70")}>
                                    <span className={cn("w-3.5 h-3.5 rounded-[4px] border shrink-0 flex items-center justify-center", on ? "bg-blue-500 border-blue-400" : "border-white/20")}>{on && <Check size={10} strokeWidth={3}/>}</span>
                                    <span className="truncate">{`${u.first_name||""} ${u.last_name||""}`.trim() || u.email}</span>
                                  </button>
                                );
                              })}
                              {!usersLoading && filteredUsers.length===0 && <p className="px-3 py-3 text-xs text-white/30">No users found</p>}
                            </>}
                          </div>
                        )}
                      </div>
                      <div className="rounded-md border border-white/5 bg-white/[0.02] overflow-hidden">
                        <button onClick={()=>{setMethodSubOpen(v=>!v); setPipeSubOpen(false); setUserSubOpen(false);}} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.04] transition-colors">
                          <div className="text-left">
                            <p className="text-[9px] uppercase tracking-widest text-white/30">Method</p>
                            <p className="text-xs font-medium text-white truncate max-w-[160px]">{methodSummary(draft?.method||[]) || "All Methods"}</p>
                          </div>
                          <Plus size={16} className={cn("shrink-0 transition-all", methodSubOpen ? "text-blue-400 rotate-45" : "text-white/60")} />
                        </button>
                        {methodSubOpen && (
                          <div className="border-t border-white/5 bg-zinc-900 animate-in slide-in-from-top-1">
                            {["UPI","Bank Transfer","Cash","Card","Net Banking","Any"].map(m=>{
                              const on=draft?.method.includes(m)||false;
                              return (
                                <button key={m} onClick={()=>toggleDraft("method", m)} className={cn("w-full flex items-center gap-2 text-left px-3 py-2 text-xs hover:bg-white/5 truncate", on ? "text-blue-400 bg-blue-500/10" : "text-white/70")}>
                                  <span className={cn("w-3.5 h-3.5 rounded-[4px] border shrink-0 flex items-center justify-center", on ? "bg-blue-500 border-blue-400" : "border-white/20")}>{on && <Check size={10} strokeWidth={3}/>}</span>
                                  <span>{m}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 px-2 pb-3 mt-2">
                      <button onClick={applyFilters} className="flex-1 h-8 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 text-[10px] font-bold uppercase tracking-widest transition-all">Apply</button>
                      <button onClick={()=>setDraft({pipeline:[],method:[],user:[]})} className="flex-1 h-8 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest transition-all">Clear</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {tab==="logs" && <PaymentTable searchQuery={filters.search} pipelineIds={filters.pipeline} methodFilter={filters.method} userFilter={filters.user} />}
        {tab==="schedules" && <ScheduleTable rows={schedules} loading={schedulesLoading}/>}
      </main>
      <PaymentSearchModal isOpen={searchModalOpen} onClose={()=>setSearchModalOpen(false)} search={filters.search} setSearch={v=>setFilters({...filters, search:v})} />
    </div>
  );
}
