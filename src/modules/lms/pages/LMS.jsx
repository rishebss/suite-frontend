import React from 'react';
import { GraduationCap, Plus, Search, BookOpen, Clock, Star, Users } from 'lucide-react';
import Button from '@/components/Button';

const LMS = () => {
  return (
    <div className="flex flex-col min-h-full">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 relative z-20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <GraduationCap size={10} />
            Learning Management
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">LMS</h1>
          <p className="text-sm text-white/40 font-medium">Training programs and course management</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="primary" className="w-auto px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-black shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Plus size={14} className="mr-2" />
            Create Course
          </Button>
        </div>
      </header>

      <main className="flex-1 p-10 relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300">
            <div className="h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center border-b border-white/5">
              <BookOpen size={48} className="text-white/10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Development</span>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="fill-yellow-500 text-yellow-500" />
                    <span className="text-[10px] font-bold text-white/60">4.9</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">Advanced React Patterns for Enterprise SaaS</h3>
              </div>
              
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-white/20" />
                  <span className="text-[10px] text-white/40 font-medium uppercase tracking-widest">12 Hours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={12} className="text-white/20" />
                  <span className="text-[10px] text-white/40 font-medium uppercase tracking-widest">1.2k Students</span>
                </div>
              </div>

              <Button variant="secondary" className="w-full mt-2 py-2.5 bg-white/5 border-none hover:bg-white/10">
                View Curriculum
              </Button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default LMS;
