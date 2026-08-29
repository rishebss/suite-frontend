import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import KpiCard from "../components/KpiCard";
import ModuleCard from "../components/ModuleCard";
import ActivityFeed from "../components/ActivityFeed";
import MiniBarChart from "../components/MiniBarChart";
import { Donut, Legend, Stat, ProgressBar } from "../components/charts";
import { useOwnerDashboard } from "../hooks/useOwnerDashboard";
import {
  Users, Briefcase, Layers, Wallet, CalendarDays, AlertTriangle,
  TrendingUp, Phone, CreditCard, UserCheck, Clock, ArrowUpRight, ImageIcon,
} from "lucide-react";

const fmtINR = (v) => {
  if (v===null||v===undefined) return "₹0";
  const n=Number(v);
  if (n>=1e7) return `₹${(n/1e7).toFixed(2)}Cr`;
  if (n>=1e5) return `₹${(n/1e5).toFixed(1)}L`;
  if (n>=1e3) return `₹${(n/1e3).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
};
const fmtNum=(v)=>Number(v||0).toLocaleString("en-IN");
const COLORS=["#3b82f6","#6366f1","#a855f7","#ec4899","#f59e0b","#10b981","#06b6d4","#ef4444"];

export default function Dashboard(){
  const {user}=useAuth();
  const nav=useNavigate();
  const {data,loading,error,refetch,lastUpdated}=useOwnerDashboard();
  const org=data?.org?.name||user?.organization?.name||"Workspace";
  const contacts=data?.contacts||{};
  const crm=data?.crm||{};
  const pipelines=data?.pipelines||{};
  const payments=data?.payments||{};
  const crmPay=data?.crm_payments||{};
  const calendar=data?.calendar||{};
  const media=data?.media||{};
  const users=data?.users||{};
  const recent=data?.recent_activity||[];

  const stageSegments=(crm.by_stage||[]).map((s,i)=>({label:s.stage__name||"—",value:s.count,color:COLORS[i%COLORS.length]}));
  const pipelineBars=(crm.by_pipeline||[]).map(p=>({label:(p.pipeline__name||"—").slice(0,12),value:Number(p.value||0)}));
  const contactSegments=(contacts.by_status||[]).map((s,i)=>({label:s.status,value:s.count,color:COLORS[i%COLORS.length]}));
  const payBars=(payments.by_month||[]).map(m=>({label:m.label.slice(0,3),value:m.value}));
  const payPipelineBars=(payments.by_pipeline||[]).map(p=>({label:(p.crm__pipeline__name||"—").slice(0,10),value:Number(p.total||0)}));
  const payStatusSegments=(crmPay.by_payment_status||[]).filter(s=>["Paid","Due","Payment Pending","Lead"].includes(s.contact__status)).map((s,i)=>({label:s.contact__status==="Payment Pending"?"Pending":s.contact__status,value:s.count,color:s.contact__status==="Paid"?"#10b981":s.contact__status==="Due"?"#ef4444":s.contact__status==="Payment Pending"?"#a855f7":"#3b82f6"}));

  if(loading) return <div className="p-10 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">{Array.from({length:6}).map((_,i)=><div key={i} className="h-32 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse"/> )}</div>;
  if(error) return <div className="p-10"><div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-300"><p className="font-bold">Couldn't load dashboard</p><p className="mt-1 opacity-80">{error}</p><button onClick={refetch} className="mt-4 rounded bg-red-500 px-4 py-1.5 text-xs font-bold text-white">Retry</button></div></div>;

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-white/5 px-6 lg:px-10 py-6 lg:py-8 sticky top-0 bg-zinc-950 z-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-sm text-white/40 font-medium">Welcome, {user?.first_name||user?.email} — {org} overview across contacts, pipelines & calendar.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-white/25">Synced {lastUpdated?lastUpdated.toLocaleTimeString(): "—"}</span>
            <button onClick={refetch} className="h-8 px-3 rounded border border-white/10 bg-white/5 text-xs font-bold text-white/70 hover:bg-white/10">Refresh</button>
            <button onClick={()=>nav("/crm")} className="h-8 px-4 rounded bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1">Open CRM <ArrowUpRight size={12}/></button>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-6 lg:space-y-8 px-6 lg:px-10 py-6 lg:py-8 overflow-y-auto custom-scrollbar">
        {/* KPI — Contacts→Deals→Payments flow */}
        <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
          <KpiCard label="Contacts → Deals" value={`${crmPay.conversion_rate||0}%`} icon={Users} accent="blue" suffix={`${fmtNum(crm.deals)}/${fmtNum(contacts.total)}`} />
          <KpiCard label="Pending" value={fmtNum(crmPay.pending)} icon={Clock} accent="violet" suffix={`${fmtNum(crmPay.due)} due`} />
          <KpiCard label="Paid Deals" value={fmtNum(crmPay.paid)} icon={Wallet} accent="emerald" suffix={`${fmtNum(crmPay.unpaid||0)} unpaid`} />
          <KpiCard label="Collection Rate" value={`${payments.collection_rate||0}%`} icon={TrendingUp} accent="cyan" suffix={fmtINR(payments.outstanding||0)+" outstanding"} />
          <KpiCard label="Revenue Collected" value={fmtINR(payments.revenue_total)} icon={CreditCard} accent="amber" suffix={fmtINR(payments.revenue_30)+" 30d"} />
          <KpiCard label="Expected Revenue" value={fmtINR(payments.expected_total)} icon={Briefcase} accent="rose" suffix={`${fmtNum(payments.by_pipeline?.length||0)} pipelines`} />
        </section>

        {/* Row 1: Funnel + Revenue + Contacts — now payment-aware */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ModuleCard title="Collection Health" subtitle={`${crmPay.paid||0} paid · ${crmPay.pending||0} pending · ${crmPay.due||0} due`} icon={Wallet} action={<button onClick={()=>nav("/crm")} className="text-[11px] font-bold text-emerald-400 hover:underline">Collect →</button>}>
            {payStatusSegments.length?(
              <div className="flex items-center gap-5">
                <Donut segments={payStatusSegments} />
                <div className="flex-1 space-y-1"><Legend items={payStatusSegments} /></div>
              </div>
            ):<p className="text-sm text-white/30">No payment status yet</p>}
            <div className="mt-4 border-t border-white/5 pt-3">
              <div className="flex justify-between text-xs"><span className="text-white/50">Collected vs Expected</span><span className="font-bold text-white">{payments.collection_rate||0}%</span></div>
              <ProgressBar value={Number(payments.revenue_total||0)} max={Number(payments.expected_total||1)} color="#10b981" />
              <div className="mt-2 grid grid-cols-3 gap-2"><Stat label="Collected" value={fmtINR(payments.revenue_total)} color="text-emerald-400"/><Stat label="Outstanding" value={fmtINR(payments.outstanding)} color="text-rose-400"/><Stat label="Avg Deal" value={fmtINR(crmPay.avg_deal_value)} /></div>
            </div>
          </ModuleCard>

          <ModuleCard title="Revenue Trend" subtitle="Payments · last 6 months" icon={CreditCard}>
            <MiniBarChart data={payBars.length?payBars:[{label:"—",value:0}]} color="#f59e0b" format={fmtINR} />
            <div className="mt-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1">By Pipeline</p>
              {payPipelineBars.length? <MiniBarChart data={payPipelineBars} color="#6366f1" format={fmtINR} /> : <p className="text-xs text-white/30">No pipeline revenue</p>}
            </div>
            <div className="mt-3 flex gap-2 border-t border-white/5 pt-3">
              <Stat label="Total" value={fmtINR(payments.revenue_total)} color="text-amber-400" />
              <Stat label="Methods" value={fmtNum((payments.by_method||[]).length)} />
            </div>
          </ModuleCard>

          <ModuleCard title="Contacts by Status" subtitle={`${contacts.total||0} total · ${contacts.new_30||0} new 30d`} icon={Phone} action={<button onClick={()=>nav("/contacts")} className="text-[11px] font-bold text-blue-400 hover:underline">View →</button>}>
            {contactSegments.length?(
              <div className="flex items-center gap-5">
                <Donut segments={contactSegments} />
                <div className="flex-1 space-y-2"><Legend items={contactSegments.slice(0,6)} /></div>
              </div>
            ):<p className="text-sm text-white/30">No contacts yet.</p>}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/5 pt-3"><Stat label="Deals" value={fmtNum(crm.deals)} /><Stat label="Conversion" value={`${crmPay.conversion_rate||0}%`} color="text-emerald-400"/></div>
          </ModuleCard>
        </section>

        {/* Row 2: Pipeline value + Top deals + Calendar */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ModuleCard title="Value by Pipeline" subtitle="Deal value concentration" icon={Briefcase}>
            {pipelineBars.length? <MiniBarChart data={pipelineBars} color="#6366f1" format={fmtINR} /> : <p className="text-sm text-white/30">No pipeline data</p>}
            <div className="mt-4 space-y-2">
              {(crm.by_pipeline||[]).map(p=>(
                <div key={p.pipeline__name} className="flex items-center justify-between text-xs">
                  <span className="truncate pr-2 text-white/60">{p.pipeline__name}</span>
                  <span className="font-bold text-white">{fmtINR(p.value)} <span className="text-white/30">· {p.count}</span></span>
                </div>
              ))}
            </div>
          </ModuleCard>

          <ModuleCard title="Top Deals" subtitle="Highest value opportunities" icon={TrendingUp}>
            <div className="space-y-2">
              {(crm.top_deals||[]).length? crm.top_deals.map(d=>(
                <div key={d.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-white">{d.contact__name||"—"} <span className="text-white/30">· {d.contact__contact_id}</span></p>
                    <p className="text-[11px] text-white/40">{d.pipeline__name} → {d.stage__name} · {d.priority}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{fmtINR(d.value)}</span>
                </div>
              )): <p className="text-sm text-white/30">No deals</p>}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
              <Stat label="Assigned" value={fmtNum(crm.assigned)} color="text-emerald-400"/>
              <Stat label="Unassigned" value={fmtNum(crm.unassigned)} color="text-amber-400"/>
              <Stat label="Priorities" value={(crm.by_priority||[]).map(p=>p.priority).join(", ")||"—"} />
            </div>
          </ModuleCard>

          <ModuleCard title="Calendar & Follow-ups" subtitle={`${calendar.total||0} todos · ${calendar.upcoming_7||0} next 7d`} icon={CalendarDays} action={<button onClick={()=>nav("/calendar")} className="text-[11px] font-bold text-blue-400 hover:underline">Calendar →</button>}>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Stat label="Today" value={fmtNum(calendar.today)} color="text-blue-400"/>
              <Stat label="Overdue" value={fmtNum(calendar.overdue)} color={calendar.overdue?"text-rose-400":"text-emerald-400"}/>
              <Stat label="Upcoming" value={fmtNum(calendar.upcoming_7)} color="text-violet-400"/>
            </div>
            <div className="space-y-1.5">
              {(calendar.upcoming_items||[]).slice(0,4).map(t=>(
                <div key={t.id} className="flex items-center gap-2 rounded border border-white/5 px-2.5 py-1.5">
                  <Clock size={12} className="text-white/30 shrink-0"/>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-white">{t.title}</p>
                    <p className="text-[10px] text-white/30">{t.todo_type} · {t.start?new Date(t.start).toLocaleDateString():""} {t.contact__name||t.crm__contact__name||""}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-white/40">{t.status||t.priority||""}</span>
                </div>
              ))}
              {!calendar.upcoming_items?.length && <p className="text-xs text-white/30">No upcoming items</p>}
            </div>
            {calendar.overdue_items?.length>0 && (
              <div className="mt-3 border-t border-white/5 pt-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-rose-400 mb-1.5">Overdue</p>
                {calendar.overdue_items.slice(0,2).map(t=><p key={t.id} className="text-xs text-white/60 truncate">• {t.title} — {new Date(t.start).toLocaleDateString()}</p>)}
              </div>
            )}
          </ModuleCard>
        </section>

        {/* Row 3: Payments + Activity + Quick stats */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ModuleCard title="Recent Payments" subtitle="Latest collections" icon={Wallet}>
            <div className="space-y-1.5">
              {(payments.recent||[]).length? payments.recent.map(p=>(
                <div key={p.id} className="flex items-center justify-between rounded border border-white/5 px-3 py-2">
                  <div>
                    <p className="text-xs font-bold text-white">{fmtINR(p.amount)} <span className="text-white/30 font-normal">· {p.payment_method}</span></p>
                    <p className="text-[11px] text-white/40 truncate">{p.contact__name} · {p.crm__pipeline__name||""} — {p.payment_for}</p>
                  </div>
                  <span className="text-[10px] text-white/25">{p.created_at?new Date(p.created_at).toLocaleDateString():""}</span>
                </div>
              )): <p className="text-sm text-white/30">No payments yet</p>}
            </div>
            <button onClick={()=>nav("/accounts")} className="mt-3 w-full h-7 rounded border border-white/10 text-[11px] font-bold text-white/60 hover:bg-white/5">View all →</button>
          </ModuleCard>

          <ModuleCard title="Recent Activity" subtitle="Across contacts & pipelines" icon={UserCheck}>
            <ActivityFeed items={recent.slice(0,6)} />
          </ModuleCard>

          <ModuleCard title="Workspace Health" subtitle="System snapshot" icon={ImageIcon}>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Users" value={fmtNum(users.total)} color="text-cyan-400"/>
              <Stat label="Media Assets" value={fmtNum(media.assets)} color="text-violet-400"/>
              <Stat label="Pipelines" value={fmtNum(pipelines.total)} />
              <Stat label="Contacts" value={fmtNum(contacts.total)} />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs"><span className="text-white/50">Assigned deals</span><span className="font-bold text-white">{crm.assigned||0}/{crm.deals||0}</span></div>
              <ProgressBar value={crm.assigned||0} max={crm.deals||1} color="#10b981" />
              <div className="flex justify-between text-xs"><span className="text-white/50">Contacts → Deals</span><span className="font-bold text-white">{contacts.total? Math.round((crm.deals/contacts.total)*100):0}%</span></div>
              <ProgressBar value={crm.deals||0} max={contacts.total||1} color="#6366f1" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={()=>nav("/contacts")} className="h-8 rounded bg-white text-xs font-bold text-zinc-900">Contacts</button>
              <button onClick={()=>nav("/media")} className="h-8 rounded border border-white/10 bg-white/5 text-xs font-bold text-white">Media</button>
            </div>
          </ModuleCard>
        </section>
      </main>
    </div>
  );
}
