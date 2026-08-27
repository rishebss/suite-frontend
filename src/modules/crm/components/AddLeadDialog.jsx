import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Loader2, Plus, Trash2, Database } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const AddLeadDialog = ({ isOpen, onClose, pipeline, stages, onSuccess }) => {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    const [customFields, setCustomFields] = useState([]);

    if (!isOpen) return null;

    const handleAddCustomField = () => {
        setCustomFields([...customFields, { key: '', value: '' }]);
    };

    const handleUpdateCustomField = (index, field, val) => {
        const updated = [...customFields];
        updated[index][field] = val;
        setCustomFields(updated);
    };

    const handleRemoveCustomField = (index) => {
        const updated = customFields.filter((_, i) => i !== index);
        setCustomFields(updated);
    };

    const handleSubmit = async (e, selfAssign = false) => {
        e.preventDefault();
        setError(null);

        if (!formData.name.trim()) {
            setError("Name is required.");
            return;
        }

        if (!formData.email.trim() && !formData.phone.trim()) {
            setError("Either Email or Phone is required.");
            return;
        }

        if (!pipeline || !stages || stages.length === 0) {
            setError("Cannot add lead: Selected pipeline has no stages configured.");
            return;
        }

        setIsSubmitting(true);

        try {
            const customFieldsObj = {};
            customFields.forEach(f => {
                if (f.key.trim()) {
                    customFieldsObj[f.key.trim()] = f.value;
                }
            });

            const contactPayload = {
                name: formData.name,
                email: formData.email.trim() || null,
                phone: formData.phone.trim() || null,
                job_title: null,
                company_name: null,
                custom_fields: customFieldsObj
            };

            const contactRes = await axios.post('/api/contacts/', contactPayload);
            const contactId = contactRes.data.id;

            const firstStage = stages.sort((a, b) => a.order - b.order)[0];
            
            const dealPayload = {
                contact: contactId,
                pipeline: pipeline.id,
                stage: firstStage.id,
                value: 0,
                priority: 'Medium',
                ...(selfAssign && user?.id ? { assigned_user: user.id } : {})
            };

            const dealRes = await axios.post('/api/crm/pipeline/', dealPayload);

            if (onSuccess) onSuccess(dealRes.data);
            onClose();

            setFormData({
                name: '', email: '', phone: ''
            });
            setCustomFields([]);

        } catch (err) {
            console.error("Failed to add lead:", err);
            if (err.response?.data) {
                const data = err.response.data;
                const msg = typeof data === 'object' ? Object.values(data).flat().join(', ') : data;
                setError(msg);
            } else {
                setError("An error occurred while adding the lead.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => !isSubmitting && onClose()}
            />
            
            {/* Redesigned Snug Container Base */}
            <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                
                {/* Header (Top-Down Illumination) */}
                <div className="px-6 py-5 border-b border-zinc-800 flex items-start justify-between shrink-0 bg-black/50 backdrop-blur-xl rounded-t-lg">
                    <div className="flex items-start justify-between gap-4 w-full">
                        <div className="flex items-center gap-5">
                            <div>
                                <h2 className="text-lg font-medium text-white">Add New Lead</h2>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[9px] px-2 py-0.5 rounded border uppercase bg-blue-500/10 text-blue-400 border-blue-500/20">
                                        Pipeline: {pipeline?.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="p-2 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Form Content - High Density Single Column */}
                <form id="add-lead-form" onSubmit={handleSubmit} className="overflow-hidden p-6 flex flex-col min-h-0 bg-zinc-900/30">
                    
                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-[0.2em] font-medium shrink-0">
                            {error}
                        </div>
                    )}

                    <div className="relative min-h-0 flex-1">
                        
                        <div className="w-full overflow-y-auto overflow-x-hidden custom-scrollbar pr-3 space-y-6" style={{ maxHeight: '420px' }}>
                            {/* Primary Details Header */}
                            <div className="flex items-center gap-2 mb-2 border-b border-zinc-900 pb-3">
                                <User size={14} className="text-blue-400" />
                                <p className="text-[10px] uppercase text-white/60">Primary Details</p>
                            </div>
                            
                            {/* Form Input Matrix */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                {/* Name - Full Width */}
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-[10px] text-white/40 uppercase flex items-center gap-1">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black/40 border border-zinc-800 focus:border-blue-500/50 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all hover:bg-white/[0.02]"
                                        placeholder="John Doe"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                    <label className="text-[10px] text-white/40 uppercase flex items-center gap-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-black/40 border border-zinc-800 focus:border-blue-500/50 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all hover:bg-white/[0.02]"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                    <label className="text-[10px] text-white/40 uppercase flex items-center gap-1">
                                        Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-black/40 border border-zinc-800 focus:border-blue-500/50 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all hover:bg-white/[0.02]"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>

                            {/* Additional Registry Section */}
                            <div className="space-y-4 pt-4 border-t border-zinc-900">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Database size={14} className="text-amber-400" />
                                        <p className="text-[10px] uppercase text-white/60">Additional Registry</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddCustomField}
                                        className="h-7 px-3 rounded-md bg-zinc-900/50 border border-zinc-800 text-[9px] uppercase text-white/40 hover:text-white hover:bg-zinc-800 transition-all font-medium flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Add Field
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {customFields.length === 0 ? (
                                        <p className="text-[9px] uppercase text-white/20 text-center py-6 border border-dashed border-zinc-800 rounded-md bg-black/20">
                                            No registry entries
                                        </p>
                                    ) : (
                                        customFields.map((field, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    value={field.key}
                                                    onChange={(e) => handleUpdateCustomField(idx, 'key', e.target.value)}
                                                    className="flex-1 min-w-0 bg-black/40 border border-zinc-800 focus:border-amber-500/50 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all hover:bg-white/[0.02]"
                                                    placeholder="Key (e.g. Industry)"
                                                />
                                                <input
                                                    type="text"
                                                    value={field.value}
                                                    onChange={(e) => handleUpdateCustomField(idx, 'value', e.target.value)}
                                                    className="flex-1 min-w-0 bg-black/40 border border-zinc-800 focus:border-amber-500/50 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all hover:bg-white/[0.02]"
                                                    placeholder="Value"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCustomField(idx)}
                                                    className="h-9 w-9 rounded-md bg-zinc-900/50 border border-zinc-800 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all flex items-center justify-center shrink-0"
                                                    title="Delete Entry"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-zinc-800 bg-black/50 backdrop-blur-xl flex justify-end gap-3 shrink-0 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em]"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, true)}
                        disabled={isSubmitting || !formData.name.trim() || (!formData.email.trim() && !formData.phone.trim())}
                        className="px-6 py-2 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <><Loader2 size={14} className="animate-spin" /> Saving...</>
                        ) : (
                            <><User size={12} /> Self Assign & Save</>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, false)}
                        disabled={isSubmitting || !formData.name.trim() || (!formData.email.trim() && !formData.phone.trim())}
                        className="px-6 py-2 rounded-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <><Loader2 size={14} className="animate-spin" /> Saving...</>
                        ) : (
                            'Save'
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AddLeadDialog;
