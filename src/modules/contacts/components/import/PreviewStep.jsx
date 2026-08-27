import React from 'react';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const PreviewStep = ({ previewData, selectedHeaders, mapping, isImporting, importProgress }) => {
    // Reorder headers to ensure mapped columns come first in a logical order if desired, 
    // but here we'll just follow the user's request to have Status after Email conceptually.
    // We'll just render exactly what they mapped/selected in the grid.

    return (
        <div className="space-y-6 outline-none h-full flex flex-col">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Eye size={14} className="text-blue-500/50" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 whitespace-nowrap">Data Verification</span>
                </div>

                {isImporting && (
                    <div className="flex-1 max-w-[300px] flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 transition-all duration-500 ease-out" 
                                style={{ width: `${importProgress}%` }} 
                            />
                        </div>
                        <span className="text-[10px] font-black tabular-nums text-blue-400 w-8">{importProgress}%</span>
                    </div>
                )}
            </div>

            <div className="flex-1 min-h-0 rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto no-scrollbar-y custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5 sticky top-0 z-20">
                                {selectedHeaders.map((header) => {
                                    const sysField = Object.keys(mapping).find(key => mapping[key] === header);
                                    return (
                                        <th key={header} className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/20 whitespace-nowrap">
                                            <div className="flex flex-col gap-0.5">
                                                <span className={cn(sysField ? "text-blue-400" : "text-white/20")}>
                                                    {header}
                                                </span>
                                                {sysField && (
                                                    <span className="text-[7px] text-white/40 font-black tracking-widest leading-none uppercase">
                                                        → {sysField}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                                {/* Fallback for Status if not mapped but set as default */}
                                {!selectedHeaders.some(h => mapping.status === h) && (
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-blue-500/50 whitespace-nowrap">
                                        Default Status
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {previewData.map((row, i) => (
                                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                    {selectedHeaders.map((header) => (
                                        <td key={header} className="px-6 py-3 text-xs text-white/60 whitespace-nowrap group-hover:text-white transition-colors">
                                            {mapping.status === header ? (
                                                <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/10">
                                                    {row._status}
                                                </span>
                                            ) : (
                                                row._raw[header] || <span className="text-white/10 font-mono italic">null</span>
                                            )}
                                        </td>
                                    ))}
                                    {!selectedHeaders.some(h => mapping.status === h) && (
                                        <td className="px-6 py-3">
                                            <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/10">
                                                {row._status}
                                            </span>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PreviewStep;
