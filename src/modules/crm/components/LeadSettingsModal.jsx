import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, ShieldAlert, Activity, Loader2, Scan } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

const LeadSettingsModal = ({ isOpen, onClose, pipeline, onSave }) => {
    const systemFields = ['Name', 'Email', 'Phone'];
    const [customFields, setCustomFields] = useState([]);
    const [newField, setNewField] = useState('');
    const [customFieldsEnabled, setCustomFieldsEnabled] = useState(true);

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [isTracking, setIsTracking] = useState(false);
    const [trackError, setTrackError] = useState('');

    useEffect(() => {
        if (isOpen && pipeline) {
            if (pipeline.mandatory_fields) {
                setCustomFields(pipeline.mandatory_fields.filter(f => !systemFields.includes(f)));
            } else {
                setCustomFields([]);
            }
            if (pipeline.custom_fields_enabled !== undefined) {
                setCustomFieldsEnabled(pipeline.custom_fields_enabled);
            } else {
                setCustomFieldsEnabled(true);
            }
            setNewField('');
            setError('');
            setIsSaving(false);
            setIsTracking(false);
            setTrackError('');
        }
    }, [isOpen, pipeline]);

    const handleAddField = (e) => {
        e?.preventDefault();
        const trimmed = newField.trim();
        if (trimmed && !systemFields.includes(trimmed) && !customFields.includes(trimmed)) {
            setCustomFields([...customFields, trimmed]);
            setNewField('');
        }
    };

    const handleRemoveField = (fieldToRemove) => {
        setCustomFields(customFields.filter(f => f !== fieldToRemove));
    };

    const handleTrackFields = async () => {
        setIsTracking(true);
        setTrackError('');
        try {
            const res = await axios.get('/api/contacts/track-fields/', {
                params: { pipeline_id: pipeline?.id }
            });
            const tracked = res.data.fields || [];
            const allSystem = systemFields.map(f => f.toLowerCase());
            const newFields = tracked.filter(f => !allSystem.includes(f.toLowerCase()) && !customFields.includes(f));
            if (newFields.length === 0) {
                setTrackError('No new fields found to track.');
                return;
            }
            setCustomFields(prev => [...prev, ...newFields]);
        } catch (err) {
            console.error('Failed to track fields:', err);
            setTrackError('Failed to track fields.');
        } finally {
            setIsTracking(false);
        }
    };

    const handleSave = async () => {
        if (!pipeline?.id) return;
        setIsSaving(true);
        setError('');
        try {
            const allFields = [...systemFields, ...customFields];
            const response = await axios.patch(`/api/crm/pipelines/${pipeline.id}/`, {
                mandatory_fields: allFields,
                custom_fields_enabled: customFieldsEnabled
            });
            if (onSave) {
                onSave(response.data);
            }
            onClose();
        } catch (err) {
            console.error("Failed to save lead settings:", err);
            setError("Failed to save settings. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-medium text-white uppercase tracking-wider">Lead Settings</h2>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
                                Registry: <span className="text-blue-400 font-semibold">{pipeline?.name || 'GLOBAL'}</span>
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-white/20 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-8 space-y-6">
                    

                    {/* Enable Custom Fields Toggle Switch */}
                    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-zinc-900 rounded-lg">
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-medium uppercase text-white">Enable Custom Fields</p>
                            <p className="text-[9px] text-white/30 uppercase leading-relaxed">
                                Allow setting custom mandatory ingestion fields
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCustomFieldsEnabled(!customFieldsEnabled)}
                            className={cn(
                                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
                                customFieldsEnabled ? "bg-blue-500" : "bg-zinc-800"
                            )}
                        >
                            <span
                                className={cn(
                                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                    customFieldsEnabled ? "translate-x-4" : "translate-x-0"
                                )}
                            />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 block">
                                    Configured Fields
                                </label>
                                <button
                                    type="button"
                                    onClick={handleTrackFields}
                                    disabled={!customFieldsEnabled || isTracking}
                                    className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                                >
                                    {isTracking ? <Loader2 size={10} className="animate-spin" /> : <Scan size={10} />}
                                    <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Track Fields</span>
                                </button>
                            </div>
                            {trackError && (
                                <p className="text-[8px] text-amber-400 font-medium uppercase tracking-wider mb-2">{trackError}</p>
                            )}
                            
                            <div className={cn(
                                "flex flex-wrap gap-2 p-4 bg-white/[0.02] border border-zinc-900 rounded-lg h-[140px] overflow-y-auto custom-scrollbar items-start content-start transition-all duration-300",
                                !customFieldsEnabled && "opacity-40"
                            )}>
                                {/* System Pills */}
                                {systemFields.map(field => (
                                    <div 
                                        key={field} 
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800/80 text-white/30 text-[10px] uppercase tracking-widest font-bold rounded-md cursor-not-allowed select-none"
                                    >
                                        {field}
                                    </div>
                                ))}
                                
                                {/* Custom Pills */}
                                {customFields.map(field => (
                                    <div 
                                        key={field} 
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-md group transition-colors duration-300",
                                            customFieldsEnabled 
                                                ? "bg-blue-500/5 border border-blue-500/20 text-blue-400" 
                                                : "bg-zinc-900/30 border border-zinc-800/50 text-white/20"
                                        )}
                                    >
                                        <span>{field}</span>
                                        {customFieldsEnabled && (
                                            <button 
                                                onClick={() => handleRemoveField(field)}
                                                className="text-blue-400/30 hover:text-blue-400 hover:bg-blue-500/10 rounded p-0.5 transition-colors cursor-pointer"
                                            >
                                                <X size={10} strokeWidth={3} />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {systemFields.length === 0 && customFields.length === 0 && (
                                    <p className="text-[10px] text-white/10 uppercase tracking-widest font-medium m-auto">
                                        No fields configured
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Add Field Section */}
                        <form onSubmit={handleAddField} className="space-y-2 pt-2">
                            <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 block">
                                Register Custom Mandatory Field
                            </label>
                            <div className="flex gap-2">
                                <input 
                                    value={newField}
                                    onChange={(e) => setNewField(e.target.value)}
                                    disabled={!customFieldsEnabled}
                                    placeholder={customFieldsEnabled ? "e.g., Company Name, Value, Source" : "Custom fields disabled"}
                                    className="flex-1 bg-white/5 border border-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-md py-2 px-4 text-[10px] text-white placeholder:text-white/10 focus:border-blue-500/40 outline-none transition-all uppercase tracking-widest font-medium"
                                />
                                <button 
                                    type="button" 
                                    disabled={!customFieldsEnabled || !newField.trim()}
                                    onClick={handleAddField}
                                    className="flex items-center justify-center w-10 h-10 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 disabled:bg-zinc-900/50 disabled:text-white/10 disabled:border-zinc-800/50 rounded-md transition-all cursor-pointer disabled:cursor-not-allowed"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <p className="text-[9px] text-white/20 uppercase tracking-widest leading-relaxed">
                                Enter your custom fields here.
                            </p>
                            {error && (
                                <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider mt-2">
                                    {error}
                                </p>
                            )}
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-end gap-3 shrink-0">
                    <button 
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-zinc-900/50 border border-zinc-800/80 text-[10px] font-bold text-white/40 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 uppercase tracking-widest transition-all rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 text-[10px] font-bold uppercase tracking-widest transition-all rounded-md cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving && <Loader2 size={12} className="animate-spin" />}
                        Save 
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LeadSettingsModal;
