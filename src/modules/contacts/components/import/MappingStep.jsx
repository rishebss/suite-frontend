import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

const MappingStep = ({ systemFields, selectedHeaders, mapping, onMappingChange }) => (
    <div className="space-y-6 outline-none">
        <div className="flex items-center gap-2">
            <LinkIcon size={14} className="text-blue-500/50" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Match Fields</span>
        </div>
        <div className="grid gap-3 px-1">
            {systemFields.map(sf => (
                <div key={sf.key} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800">
                    <div className="w-28 shrink-0">
                        <p className="text-xs font-bold text-white">{sf.label}</p>
                        {sf.required && <p className="text-[9px] text-blue-500/60 font-black uppercase tracking-widest">Required</p>}
                    </div>
                    <div className="flex-1">
                        <Select
                            value={mapping[sf.key] || "IGNORE"}
                            onValueChange={(val) => onMappingChange(sf.key, val)}
                        >
                            <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-md h-9 text-xs text-white/80 focus:ring-0 focus:ring-offset-0 focus:border-white/20 transition-all outline-none">
                                <SelectValue placeholder="Map to storage" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white shadow-2xl">
                                <SelectItem value="IGNORE" className="text-white/40 focus:bg-white/5 focus:text-white">Additional Field (JSONB)</SelectItem>
                                {selectedHeaders.map(h => (
                                    <SelectItem key={h} value={h} className="focus:bg-white/5 focus:text-white">{h}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default MappingStep;
