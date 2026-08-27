import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Loader, AlertCircle, CheckCircle2, XCircle, Gift, Calendar } from "lucide-react";
import { useHR } from "../context/HRContext";
import { compOffAPI } from "../services/hrAPI";
import { formatDate } from "../utils/helpers";

export const ESSCompOff = () => {
  const navigate = useNavigate();
  const { loading, setLoadingState, error, setErrorState } = useHR();
  const [compOffs, setCompOffs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchCompOffs();
  }, []);

  const fetchCompOffs = async () => {
    setLoadingData(true);
    try {
      const res = await compOffAPI.getCompOffs().catch(() => ({ data: [] }));
      setCompOffs(res.data?.results || res.data || []);
    } catch (err) {
      setErrorState(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  const stats = {
    earned: compOffs.filter(c => c.status === "EARNED").length,
    availed: compOffs.filter(c => c.status === "AVAILED").length,
    lapsed: compOffs.filter(c => c.status === "LAPSED").length,
    total: compOffs.length,
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "EARNED": return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "AVAILED": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "LAPSED": return "bg-red-500/10 text-red-400 border border-red-500/20";
      default: return "bg-white/10 text-white/40";
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-10 py-8 border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <button onClick={() => navigate('/hr/ess')} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">
          <Gift size={10} className="text-pink-400" /> Employee Self-Service
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          <Gift size={32} className="text-pink-500" /> Compensatory Off
        </h1>
        <p className="text-sm text-white/40 font-medium">Track and avail your earned compensatory off days.</p>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs text-white/40 mb-1">Total Earned</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="p-5 rounded-xl bg-green-500/5 border border-green-500/20">
            <p className="text-xs text-green-400/60 mb-1">Available (Earned)</p>
            <p className="text-2xl font-bold text-green-400">{stats.earned}</p>
            <p className="text-xs text-green-400/40 mt-1">Ready to avail</p>
          </div>
          <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <p className="text-xs text-blue-400/60 mb-1">Availed</p>
            <p className="text-2xl font-bold text-blue-400">{stats.availed}</p>
          </div>
          <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/20">
            <p className="text-xs text-red-400/60 mb-1">Lapsed</p>
            <p className="text-2xl font-bold text-red-400">{stats.lapsed}</p>
          </div>
        </div>

        {/* Comp-Off Records */}
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Gift size={18} className="text-white/50" /> Comp-Off History
        </h2>

        {loadingData ? (
          <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-pink-500" /></div>
        ) : compOffs.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full bg-[#0a0a0a]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Earned Date</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Hours Earned</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Availed Date</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {compOffs.map((co) => (
                  <tr key={co.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm text-white">{formatDate(co.earned_on_date)}</td>
                    <td className="px-6 py-4 text-center text-sm text-white/70">{co.earned_hours}h</td>
                    <td className="px-6 py-4 text-sm text-white/60">{co.availed_on_date ? formatDate(co.availed_on_date) : "—"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(co.status)}`}>
                        {co.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/40">{co.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 rounded-xl border border-dashed border-white/10 text-center">
            <Gift size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/60 text-sm">No compensatory off records found.</p>
            <p className="text-white/30 text-xs mt-1">Comp-offs are earned when you work on holidays or overtime.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ESSCompOff;
