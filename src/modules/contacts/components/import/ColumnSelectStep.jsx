import React from 'react';
import { Columns, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const ColumnSelectStep = ({ allHeaders, selectedHeaders, onToggleHeader }) => (
    <div className="space-y-6 outline-none">
        <div className="flex items-center gap-2">
            <Columns size={14} className="text-blue-500/50" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Columns</span>
        </div>
        <div className="grid grid-cols-2 gap-3 pb-8">
            {allHeaders.map(header => (
                <div
                    key={header}
                    onClick={() => onToggleHeader(header)}
                    className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group",
                        selectedHeaders.includes(header) ? "bg-white/5 border-white/20" : "bg-transparent border-white/5 opacity-50"
                    )}
                >
                    <span className="text-xs font-bold text-white truncate">{header}</span>
                    <div className={cn(
                        "w-4 h-4 rounded border transition-all flex items-center justify-center",
                        selectedHeaders.includes(header) ? "bg-blue-500 border-blue-500 text-black shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "border-white/20 bg-transparent text-transparent"
                    )}>
                        <Check size={10} strokeWidth={4} />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default ColumnSelectStep;
