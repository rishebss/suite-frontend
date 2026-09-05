import React, { useEffect, useState, useMemo } from "react";
import { Wallet, Search, Filter, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPayments, fetchSchedules, fetchPipelines, fetchDashboard, fetchAssignableUsers } from "../services/paymentsService";
import PaymentStats from "../components/PaymentStats";
import PaymentTable from "../components/PaymentTable";
import ScheduleTable from "../components/ScheduleTable";
import PaymentSearchModal from "../components/PaymentSearchModal";
import { Donut, Legend } from "@/modules/dashboard/components/charts";
import MiniBarChart from "@/modules/dashboard/components/MiniBarChart";

const fmtINR=v=>`₹${Number(v||0).toLocaleString("en-IN")}`;
export default function PaymentsPage(){
  const [tab,setTab]=useState("logs");
  const [payments,setPayments]=useState([]);
  const [schedules,setSchedules]=useState([]);
  const [pipelines,setPipelines]=useState([]);
  const [dash,setDash]=useState(null);
  const [loading,setLoading]=useState(true);
  const [filters,setFilters]=useState({search:"",pipeline:"",method:"",user:""});
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
    Promise.all([fetchPayments({page_size:200}), fetchSchedules(), fetchDashboard().catch(()=>({data:{}}))]).then(([p,s,d])=>{
      setPayments(p.data.results||p.data||[]);
      setSchedules(s.data.results||s.data||[]);
      if(d?.data?.data) setDash(d.data.data); else if(d?.data) setDash(d.data);
    }).finally(()=>setLoading(false));
  },[]);
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
  const payByMonth=(dash?.payments?.by_month||[]).map(m=>({label:m.label.slice(0,3),value:m.value}));
  const payByPipeline=(dash?.payments?.by_pipeline||[]).map(p=>({label:(p.crm__pipeline__name||"—").slice(0,10),value:Number(p.total||0)}));
  const payByMethod=(dash?.payments?.by_method||[]).map((m,i)=>({label:m.payment_method,value:Number(m.total),color:["#f59e0b","#10b981","#6366f1","#ec4899"][i%4]}));
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
            <div className={cn("absolute inset-y-0 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out z-0", tab==="logs" ? "left-0 w-1/3 rounded-l rounded-r-none" : tab==="schedules" ? "left-1/3 w-1/3 rounded-none" : "left-2/3 w-1/3 rounded-r rounded-l-none")} />
            {[{id:"logs",label:"Logs"},{id:"schedules",label:"Rules"},{id:"analytics",label:"Analytics"}].map(t=>{
              const active=tab===t.id;
              return <button key={t.id} onClick={()=>setTab(t.id)} className={cn("relative z-10 flex-1 flex items-center justify-center py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300", active?"text-blue-400":"text-white/50 hover:text-white/80")}>{t.label}</button>
            })}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setSearchModalOpen(true)} className="h-9 w-9 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 flex items-center justify-center"><Search size={14}/></button>
            <div className="relative">
              <button onClick={()=>setFilterOpen(v=>!v)} className={cn("h-9 w-9 rounded-md border flex items-center justify-center transition-all", filters.pipeline||filters.method||filters.user ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-zinc-900/50 border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800")}>
                <Filter size={14} />
              </button>
              {filterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={()=>{setFilterOpen(false); setPipeSubOpen(false); setMethodSubOpen(false); setUserSubOpen(false);}} />
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl z-20 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white">Filters</p>
                      {(filters.pipeline||filters.method||filters.user) && <button onClick={()=>setFilters({...filters, pipeline:"",method:"",user:""})} className="text-[10px] font-medium uppercase tracking-widest text-blue-400 hover:text-blue-300">Clear</button>}
                    </div>
                    <div className="p-2 space-y-2">
                      <div className="rounded-md border border-white/5 bg-white/[0.02] overflow-hidden">
                        <button onClick={()=>{setPipeSubOpen(v=>!v); setMethodSubOpen(false);}} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.04] transition-colors">
                          <div className="text-left">
                            <p className="text-[9px] uppercase tracking-widest text-white/30">Pipeline</p>
                            <p className="text-xs font-medium text-white truncate max-w-[160px]">{pipelines.find(p=>String(p.id)===filters.pipeline)?.name || "All Pipelines"}</p>
                          </div>
                          <Plus size={16} className={cn("shrink-0 transition-all", pipeSubOpen ? "text-blue-400 rotate-45" : "text-white/60")} />
                        </button>
                        {pipeSubOpen && (
                          <div className="border-t border-white/5 bg-zinc-900 max-h-48 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-1">
                            {pipelinesLoading && pipelines.length===0 ? <p className="px-3 py-3 text-xs text-white/30">Loading pipelines…</p> : <>
                              <button onClick={()=>{setFilters({...filters, pipeline:""}); setPipeSubOpen(false);}} className={cn("w-full text-left px-3 py-2 text-xs hover:bg-white/5", !filters.pipeline ? "text-blue-400 bg-blue-500/10" : "text-white/70")}>All Pipelines</button>
                              {pipelines.map(p=>(
                                <button key={p.id} onClick={()=>{setFilters({...filters, pipeline:String(p.id)}); setPipeSubOpen(false);}} className={cn("w-full text-left px-3 py-2 text-xs hover:bg-white/5 truncate", String(filters.pipeline)===String(p.id) ? "text-blue-400 bg-blue-500/10" : "text-white/70")}>{p.name}</button>
                              ))}
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
                            <p className="text-xs font-medium text-white truncate max-w-[160px]">{users.find(u=>String(u.id)===filters.user)?.first_name ? `${users.find(u=>String(u.id)===filters.user)?.first_name} ${users.find(u=>String(u.id)===filters.user)?.last_name||""}`.trim() : filters.user ? `User #${filters.user}` : "All Users"}</p>
                          </div>
                          <Plus size={16} className={cn("shrink-0 transition-all", userSubOpen ? "text-blue-400 rotate-45" : "text-white/60")} />
                        </button>
                        {userSubOpen && (
                          <div className="border-t border-white/5 bg-zinc-900 max-h-48 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-1">
                            <div className="p-2 sticky top-0 bg-zinc-900">
                              <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search users…" className="w-full h-7 bg-white/[0.02] border border-white/10 rounded px-2 text-[11px] text-white placeholder:text-white/20 outline-none focus:border-white/20"/>
                            </div>
                            {usersLoading && users.length===0 ? <p className="px-3 py-3 text-xs text-white/30">Loading users…</p> : <>
                              <button onClick={()=>{setFilters({...filters, user:""}); setUserSubOpen(false);}} className={cn("w-full text-left px-3 py-2 text-xs hover:bg-white/5", !filters.user ? "text-blue-400 bg-blue-500/10" : "text-white/70")}>All Users</button>
                              {filteredUsers.map(u=>(
                                <button key={u.id} onClick={()=>{setFilters({...filters, user:String(u.id)}); setUserSubOpen(false);}} className={cn("w-full text-left px-3 py-2 text-xs hover:bg-white/5 truncate", String(filters.user)===String(u.id) ? "text-blue-400 bg-blue-500/10" : "text-white/70")}>{`${u.first_name||""} ${u.last_name||""}`.trim() || u.email}</button>
                              ))}
                              {!usersLoading && filteredUsers.length===0 && <p className="px-3 py-3 text-xs text-white/30">No users found</p>}
                            </>}
                          </div>
                        )}
                      </div>
                      <div className="rounded-md border border-white/5 bg-white/[0.02] overflow-hidden">
                        <button onClick={()=>{setMethodSubOpen(v=>!v); setPipeSubOpen(false); setUserSubOpen(false);}} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.04] transition-colors">
                          <div className="text-left">
                            <p className="text-[9px] uppercase tracking-widest text-white/30">Method</p>
                            <p className="text-xs font-medium text-white">{filters.method || "All Methods"}</p>
                          </div>
                          <Plus size={16} className={cn("shrink-0 transition-all", methodSubOpen ? "text-blue-400 rotate-45" : "text-white/60")} />
                        </button>
                        {methodSubOpen && (
                          <div className="border-t border-white/5 bg-zinc-900 animate-in slide-in-from-top-1">
                            {["", "UPI","Bank Transfer","Cash","Card","Net Banking","Any"].map(m=>(
                              <button key={m||"all"} onClick={()=>{setFilters({...filters, method:m}); setMethodSubOpen(false);}} className={cn("w-full text-left px-3 py-2 text-xs hover:bg-white/5", filters.method===m ? "text-blue-400 bg-blue-500/10" : "text-white/70")}>{m || "All Methods"}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 px-2 pb-3 mt-2">
                      <button onClick={()=>setFilterOpen(false)} className="flex-1 h-8 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 text-[10px] font-bold uppercase tracking-widest transition-all">Apply</button>
                      <button onClick={()=>setFilters({...filters, pipeline:"",method:"",user:""})} className="flex-1 h-8 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest transition-all">Clear</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {tab==="logs" && <PaymentTable searchQuery={filters.search} pipelineId={filters.pipeline} methodFilter={filters.method} userFilter={filters.user} />}
        {tab==="schedules" && <ScheduleTable rows={schedules}/>}
        {tab==="analytics" && (
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-1">
            <PaymentStats payments={dash?.payments} crmPay={dash?.crm_payments}/>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Revenue by Month</p>
              <MiniBarChart data={payByMonth.length?payByMonth:[{label:"—",value:0}]} color="#f59e0b" format={fmtINR}/>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Revenue by Pipeline</p>
              <MiniBarChart data={payByPipeline.length?payByPipeline:[{label:"—",value:0}]} color="#6366f1" format={fmtINR}/>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">By Method</p>
              {payByMethod.length? <div className="flex items-center gap-5"><Donut segments={payByMethod}/><div className="space-y-1"><Legend items={payByMethod}/></div></div> : <p className="text-xs text-white/30">No data</p>}
            </div>
            </div>
          </div>
        )}
      </main>
      <PaymentSearchModal isOpen={searchModalOpen} onClose={()=>setSearchModalOpen(false)} search={filters.search} setSearch={v=>setFilters({...filters, search:v})} />
    </div>
  );
}
