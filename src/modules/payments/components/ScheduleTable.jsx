import React, { useState, useEffect } from "react";
import { Repeat, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import PaymentActionsModal from "@/modules/crm/components/PaymentActionsModal";
import RingLoader from "@/components/ui/RingLoader";

const fmtINR = v => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const STATUS_STYLES = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  cancelled: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

const ScheduleCard = ({ s, onEdit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = s.status === 'active';
  const isRecurring = String(s.cycle_count) !== '1';

  const prefill = {
    id: s.pipeline,
    name: s.pipeline_name || "Client",
    scheduleId: s.id,
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative flex flex-col items-start p-6 rounded-xl transition-all duration-300 text-left overflow-hidden active:scale-[0.98] cursor-pointer bg-gradient-to-b from-[#1a1a1a] via-[#111111] to-[#0a0a0a] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_8px_30px_-4px_rgba(0,0,0,0.8)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_12px_40px_-4px_rgba(0,0,0,0.9),0_0_20px_rgba(139,92,246,0.06)]"
      >
        {/* Glass Border */}
        <div className="absolute inset-0 rounded-xl border border-white/[0.07] pointer-events-none" />
        <div className="absolute inset-0 rounded-xl border border-transparent opacity-0 group-hover:border-white/[0.12] group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Top Gloss Reflection Strip */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent rounded-t-xl" />

        {/* Bottom Edge Highlight */}
        <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

        {/* Ambient Background Glow */}
        <div className="absolute -right-8 -top-8 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-white pointer-events-none" />

        <div className="w-full flex items-start justify-between mb-6 relative z-10">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110 bg-gradient-to-b from-white/[0.07] to-transparent border border-white/[0.08] text-white/80">
            <Repeat size={24} />
          </div>
          <span className="max-w-[130px] truncate px-3 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-medium text-white/40 uppercase tracking-[0.2em]">
            {s.pipeline_name || s.pipeline_details?.name || "—"}
          </span>
        </div>

        <div className="space-y-2 flex-1 relative z-10">
          <h3 className="text-sm font-medium uppercase tracking-wider text-white group-hover:text-blue-400 transition-colors truncate">
            {s.payment_for}
          </h3>
          <p className="text-xs text-white/40 leading-relaxed font-medium">
            {isRecurring ? `Recurring · ${s.cycle_count} cycles every ${s.cycle_period_days} days` : 'One-time payment rule'}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.2em] transition-colors relative z-10">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-white">{fmtINR(s.amount)}</span>
            {isRecurring && <span className="text-white/30">× {s.cycle_count}</span>}
          </div>
        </div>

        <div className="absolute bottom-4 right-6 flex items-center gap-2 z-10">
          <span className={cn("px-3 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-medium text-white/40 uppercase tracking-[0.2em]", STATUS_STYLES[s.status] || STATUS_STYLES.cancelled)}>
            {s.status}
          </span>
          <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-medium text-white/40 uppercase tracking-[0.2em]">
            {isRecurring ? 'Recurring' : 'One-time'}
          </span>
        </div>
      </button>
      <PaymentActionsModal isOpen={isOpen} onClose={() => setIsOpen(false)} pipeline={prefill} schedule={s} />
    </>
  );
};

export default function ScheduleTable({ rows, loading=false }) {
  if (loading && !rows.length) return (
    <div className="flex-1 flex items-center justify-center py-20">
      <RingLoader />
    </div>
  );
  if (!rows.length) return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
      <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-zinc-800 flex items-center justify-center text-white/10 mb-4">
        <Repeat size={26} />
      </div>
      <p className="text-sm text-white/20">No pipeline rules yet</p>
      <p className="text-xs text-white/10 mt-1">Create via CRM Actions → Payment Actions</p>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {rows.map(s => <ScheduleCard key={s.id} s={s} />)}
      </div>
    </div>
  );
}
