import { Repeat, Wallet } from "lucide-react";
const fmtINR=v=>`₹${Number(v||0).toLocaleString("en-IN")}`;
export default function ScheduleTable({rows}){
  if(!rows.length) return <div className="p-10 text-center text-white/30 text-xs border border-zinc-800 bg-zinc-900/30 rounded-lg">No pipeline rules — create via CRM Actions → Payment Actions</div>;
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/30">
      <table className="w-full text-xs">
        <thead className="bg-white/[0.02] border-b border-white/5 text-[9px] uppercase tracking-widest text-white/30">
          <tr><th className="text-left px-4 py-3">Pipeline</th><th className="text-left px-4 py-3">Title</th><th className="text-right px-4 py-3">Amount</th><th className="text-center px-4 py-3">Cycle</th><th className="text-left px-4 py-3">Due</th><th className="text-left px-4 py-3">Status</th><th className="text-right px-4 py-3">Total</th></tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map(s=>(
            <tr key={s.id} className="hover:bg-white/[0.02] text-white/80 transition-colors">
              <td className="px-4 py-3 font-semibold text-white">{s.pipeline_details?.name || s.pipeline || "—"}</td>
              <td className="px-4 py-3 text-white/70">{s.payment_for}</td>
              <td className="px-4 py-3 text-right font-bold text-blue-400">{fmtINR(s.amount)}</td>
              <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 rounded-sm bg-white/[0.02] border border-white/5 text-[10px]">{s.cycle_count===1?"One-time":`${s.cycle_count}×${s.cycle_period_days}d`}</span></td>
              <td className="px-4 py-3 text-white/50 font-mono text-[11px]">{s.due_date||s.start_date||"—"}</td>
              <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-sm text-[10px] border uppercase tracking-widest ${s.status==="active"?"bg-emerald-500/10 border-emerald-500/20 text-emerald-400":"bg-white/5 border-white/10 text-white/40"}`}>{s.status}</span></td>
              <td className="px-4 py-3 text-right font-bold text-white">{fmtINR(s.total_amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
