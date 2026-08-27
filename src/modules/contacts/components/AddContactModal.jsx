import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Loader2, Plus, Trash2, Layout, Check } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

const STATUSES = ['Lead', 'Prospect', 'Customer', 'Inactive'];

const emptyField = () => ({ key: '', value: '' });

const AddContactModal = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState('Lead');
    const [customFields, setCustomFields] = useState([]);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [pipelines, setPipelines] = useState([]);
    const [isPipelinesLoading, setIsPipelinesLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setIsPipelinesLoading(true);
            axios.get('/api/crm/pipelines/')
                .then(res => setPipelines(res.data.results || res.data))
                .catch(() => setPipelines([]))
                .finally(() => setIsPipelinesLoading(false));
        }
    }, [isOpen]);

    const reset = () => {
        setName(''); setEmail(''); setPhone(''); setStatus('Lead');
        setCustomFields([]); setSelectedPipeline(null); setError('');
    };

    const handleClose = () => { reset(); onClose(); };

    const addCustomField = () => setCustomFields(prev => [...prev, emptyField()]);

    const updateField = (idx, key, val) =>
        setCustomFields(prev => prev.map((f, i) => i === idx ? { ...f, [key]: val } : f));

    const removeField = (idx) =>
        setCustomFields(prev => prev.filter((_, i) => i !== idx));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) { setError('Name is required.'); return; }
        if (!email.trim() && !phone.trim()) { setError('Either email or phone is required.'); return; }
        setIsSubmitting(true);
        setError('');
        try {
            // Build additional_data from custom fields
            const additional_data = {};
            customFields.forEach(f => {
                if (f.key.trim()) additional_data[f.key.trim()] = f.value;
            });

            const contactRes = await axios.post('/api/contacts/', {
                name, email, phone, status,
                additional_data,
            });

            // Optionally add to CRM pipeline
            if (selectedPipeline) {
                const firstStage = (selectedPipeline.stages || [])
                    .sort((a, b) => a.order - b.order)[0];
                if (firstStage) {
                    await axios.post('/api/crm/pipeline/', {
                        contact: contactRes.data.id,
                        pipeline: selectedPipeline.id,
                        stage: firstStage.id,
                    });
                }
            }

            reset();
            onSuccess?.();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create contact.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <UserPlus size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-medium text-white uppercase tracking-wider">Add Contact</h2>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">New Repository Entry</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} id="add-contact-form">
                        <div className="px-8 py-6 space-y-5">

                            {/* Core Fields */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Name *</label>
                                <input autoFocus value={name} onChange={e => setName(e.target.value)}
                                    placeholder="Full name"
                                    className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Phone</label>
                                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                                        placeholder="+91 00000 00000"
                                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Email</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                        placeholder="email@example.com"
                                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
                                </div>
                            </div>

                            {/* Custom Fields */}
                            {customFields.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Additional Fields</label>
                                    <div className="space-y-2">
                                        {customFields.map((field, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <input
                                                    value={field.key}
                                                    onChange={e => updateField(idx, 'key', e.target.value)}
                                                    placeholder="Field name"
                                                    className="w-2/5 bg-white/5 border border-zinc-800 rounded-md h-9 px-3 text-xs text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all"
                                                />
                                                <input
                                                    value={field.value}
                                                    onChange={e => updateField(idx, 'value', e.target.value)}
                                                    placeholder="Value"
                                                    className="flex-1 bg-white/5 border border-zinc-800 rounded-md h-9 px-3 text-xs text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all"
                                                />
                                                <button type="button" onClick={() => removeField(idx)}
                                                    className="p-2 rounded-md hover:bg-red-500/10 text-red-500/40 hover:text-red-400 transition-colors shrink-0">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add Column Button */}
                            <button type="button" onClick={addCustomField}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-zinc-700 text-white/30 hover:text-white/60 hover:border-zinc-600 transition-all text-xs">
                                <Plus size={12} />
                                 Additional Fields
                            </button>

                            {/* Divider */}
                            <div className="border-t border-zinc-800/60 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">CRM Pipeline</label>
                                    <span className="text-[10px] text-white/20">Optional</span>
                                </div>

                                {isPipelinesLoading ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 size={16} className="animate-spin text-blue-500/50" />
                                    </div>
                                ) : pipelines.length === 0 ? (
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest text-center py-3">No pipelines available</p>
                                ) : (
                                    <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                                        {/* None option */}
                                        <button type="button"
                                            onClick={() => setSelectedPipeline(null)}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-lg flex items-center justify-between transition-all border text-left",
                                                !selectedPipeline
                                                    ? "bg-zinc-900/60 border-zinc-700"
                                                    : "bg-zinc-950/30 border-zinc-800/50 hover:border-zinc-700"
                                            )}>
                                            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">None</span>
                                            {!selectedPipeline && <Check size={12} className="text-white/30" />}
                                        </button>

                                        {pipelines.map(p => {
                                            const restricted = p.custom_fields_enabled;
                                            const isSelected = selectedPipeline?.id === p.id;
                                            return (
                                                <div
                                                    key={p.id}
                                                    className="relative group/pip"
                                                >
                                                <button
                                                    type="button"
                                                    onClick={() => !restricted && setSelectedPipeline(p)}
                                                    disabled={restricted}
                                                    className={cn(
                                                        "w-full px-4 py-3 rounded-lg flex items-center justify-between transition-all border",
                                                        restricted
                                                            ? "opacity-40 bg-zinc-950/20 border-zinc-900/40 cursor-not-allowed"
                                                            : isSelected
                                                                ? "bg-blue-500/10 border-blue-500/40"
                                                                : "bg-zinc-950/30 border-zinc-800/50 hover:bg-zinc-900/50 hover:border-zinc-700"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-7 h-7 rounded-md border flex items-center justify-center",
                                                            isSelected && !restricted ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-zinc-800 border-zinc-700 text-white/20"
                                                        )}>
                                                            <Layout size={12} />
                                                        </div>
                                                        <span className={cn(
                                                            "text-[10px] font-medium uppercase tracking-[0.2em]",
                                                            isSelected && !restricted ? "text-blue-400" : "text-white/60"
                                                        )}>{p.name}</span>
                                                    </div>
                                                    {restricted ? (
                                                        <span className="text-[7px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 font-extrabold uppercase tracking-widest shrink-0">
                                                            Restricted
                                                        </span>
                                                    ) : isSelected ? (
                                                        <Check size={12} className="text-blue-400 shrink-0" />
                                                    ) : null}
                                                </button>
                                                {restricted && (
                                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 hidden group-hover/pip:block pointer-events-none">
                                                        <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-[10px] text-white/60 whitespace-nowrap shadow-xl">
                                                            Custom fields are enabled — create through the CRM pipeline
                                                        </div>
                                                        <div className="w-2 h-2 bg-zinc-900 border-r border-b border-zinc-700 rotate-45 mx-auto -mt-1" />
                                                    </div>
                                                )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {error && (
                                <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-zinc-800 bg-white/[0.01] shrink-0">
                    <button
                        type="submit"
                        form="add-contact-form"
                        disabled={isSubmitting || !name.trim()}
                        className="w-full h-12 bg-blue-500/10 hover:bg-blue-500/20 disabled:bg-zinc-900/50 border border-blue-500/30 hover:border-blue-500/50 disabled:border-zinc-800/50 text-blue-400 disabled:text-white/20 font-medium text-[10px] uppercase tracking-[0.3em] rounded-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    >
                        {isSubmitting
                            ? <Loader2 size={16} className="animate-spin" />
                            : <><UserPlus size={14} />Save Contact{selectedPipeline ? ' & Add to CRM' : ''}</>
                        }
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AddContactModal;
