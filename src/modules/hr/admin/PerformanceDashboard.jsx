import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Star, Loader, ChevronLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PerformanceDashboard() {
  const navigate = useNavigate();
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/hr/appraisal-cycles/');
      setCycles(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <button onClick={() => navigate('/hr/admin')} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
            <ChevronLeft size={16} /> Back to HR Admin
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <TrendingUp size={32} className="text-orange-500" />
            Performance Management (PMS)
          </h1>
          <p className="text-sm text-white/40 font-medium">Manage goals, OKRs, and continuous appraisal cycles.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/20 transition-colors font-medium text-sm">
          <Plus size={18} /> New Appraisal Cycle
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={24} className="text-orange-500 animate-spin mr-2" />
            <span className="text-white/40">Loading performance data...</span>
          </div>
        ) : (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-white">Appraisal Cycles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cycles.length === 0 ? (
                <div className="col-span-full p-8 rounded-xl border border-dashed border-white/10 text-center">
                  <p className="text-white/40 mb-4">No appraisal cycles configured yet.</p>
                  <button className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10">Create First Cycle</button>
                </div>
              ) : cycles.map((cycle) => (
                <div key={cycle.id} className="p-6 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-white text-lg">{cycle.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${cycle.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                      {cycle.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-white/60 mb-6">
                    <div className="flex justify-between"><span>Start Date:</span> <span>{cycle.start_date}</span></div>
                    <div className="flex justify-between"><span>End Date:</span> <span>{cycle.end_date}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors text-sm">View Goals</button>
                    <button className="flex-1 px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors text-sm">Manage Reviews</button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Target size={18} className="text-blue-400"/> Company Goals Library</h3>
                <p className="text-sm text-white/40 mb-4">Create templates for goals to cascade down to departments and individuals.</p>
                <button className="text-sm text-blue-400 hover:text-blue-300">Browse Library &rarr;</button>
              </div>
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Star size={18} className="text-yellow-400"/> 360° Feedback</h3>
                <p className="text-sm text-white/40 mb-4">Configure peer feedback forms, anonymity settings, and upward feedback.</p>
                <button className="text-sm text-yellow-400 hover:text-yellow-300">Configure Feedback &rarr;</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
