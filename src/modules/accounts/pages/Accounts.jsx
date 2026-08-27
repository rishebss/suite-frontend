import React from 'react';
import { CreditCard, Plus, Search, Filter, TrendingDown, TrendingUp } from 'lucide-react';
import Button from '@/components/Button';

const Accounts = () => {
  return (
    <div className="flex flex-col min-h-full">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 relative z-20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <CreditCard size={10} />
            Financial Management
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Accounts</h1>
          <p className="text-sm text-white/40 font-medium">Manage your finances and transactions</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="secondary" className="w-auto px-4 py-2 border-none bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-widest">
            <Filter size={14} className="mr-2" />
            Export CSV
          </Button>
          <Button variant="primary" className="w-auto px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-black shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Plus size={14} className="mr-2" />
            Add Transaction
          </Button>
        </div>
      </header>

      <main className="flex-1 p-10 relative z-10 space-y-10">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Transaction</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Category</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-white/[0.01] transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold",
                        i % 2 === 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {i % 2 === 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Payment #{i*234}</p>
                        <p className="text-[10px] text-white/20">TRX-0923-{i}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-white/40">Marketing Services</td>
                  <td className={cn(
                    "px-6 py-4 text-sm font-bold",
                    i % 2 === 0 ? "text-green-500" : "text-white"
                  )}>
                    {i % 2 === 0 ? '+' : '-'}$1,240.00
                  </td>
                  <td className="px-6 py-4 text-xs text-white/20 font-medium">Apr 06, 2026</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default Accounts;
