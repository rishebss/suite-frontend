import React from 'react';
import { FileText, Search, Filter, Plus, File } from 'lucide-react';
import Button from '@/components/Button';

const DocTools = () => {
  return (
    <div className="flex flex-col min-h-full">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 relative z-20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <FileText size={10} />
            Document Management
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Doc Tools</h1>
          <p className="text-sm text-white/40 font-medium">Manage your files and documents</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="secondary" className="w-auto px-4 py-2 border-none bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-widest">
            <Plus size={14} className="mr-2" />
            New Folder
          </Button>
          <Button variant="primary" className="w-auto px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-black shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Plus size={14} className="mr-2" />
            Upload File
          </Button>
        </div>
      </header>

      <main className="flex-1 p-10 relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="group p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 relative overflow-hidden cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/[0.02] transition-colors" />
            <div className="flex justify-between items-start relative z-10">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-white/40 group-hover:text-white transition-colors">
                <File size={20} />
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white/5 text-white/40 group-hover:text-white transition-colors">
                PDF
              </div>
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white/40 transition-colors">v2.4</p>
              <p className="text-sm font-bold tracking-tight text-white truncate">Contract-Agreement-#{i*234}.pdf</p>
              <p className="text-[10px] text-white/20 font-medium">Updated 2 days ago • 2.4 MB</p>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default DocTools;
