import { Wallet, TrendingUp, AlertTriangle, CheckCircle, Clock, Layers } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
const fmtINR=(v)=>{const n=Number(v||0);if(n>=1e7)return`₹${(n/1e7).toFixed(2)}Cr`;if(n>=1e5)return`₹${(n/1e5).toFixed(1)}L`;if(n>=1e3)return`₹${(n/1e3).toFixed(1)}K`;return`₹${n.toLocaleString("en-IN")}`};
const Card=({label,value,sub,icon:Icon,color})=>(
  <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
    <div><p className="text-[9px] font-bold uppercase tracking-widest text-white/30">{label}</p><p className="text-lg font-bold text-white mt-1 tracking-tight">{value}</p>{sub && <p className="text-[11px] text-white/40 mt-0.5">{sub}</p>}</div>
    <div className={`w-9 h-9 rounded-md flex items-center justify-center border ${color}`}><Icon size={16}/></div>
  </div>
);
export default function PaymentStats({payments,crmPay}){
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      <Card label="Collected" value={fmtINR(payments?.revenue_total)} sub={`${payments?.collection_rate||0}% rate`} icon={Wallet} color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"/>
      <Card label="Expected" value={fmtINR(payments?.expected_total)} sub={fmtINR(payments?.outstanding)+" outstanding"} icon={TrendingUp} color="bg-blue-500/10 border-blue-500/20 text-blue-400"/>
      <Card label="Paid Deals" value={crmPay?.paid||0} sub={`${crmPay?.unpaid||0} unpaid`} icon={CheckCircle} color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"/>
      <Card label="Due" value={crmPay?.due||0} sub="overdue" icon={AlertTriangle} color="bg-red-500/10 border-red-500/20 text-red-400"/>
      <Card label="Pending" value={crmPay?.pending||0} sub="awaiting due" icon={Clock} color="bg-purple-500/10 border-purple-500/20 text-purple-400"/>
      <Card label="Avg Deal" value={fmtINR(crmPay?.avg_deal_value)} sub={`${crmPay?.conversion_rate||0}% conv`} icon={Layers} color="bg-amber-500/10 border-amber-500/20 text-amber-400"/>
    </div>
  );
}
