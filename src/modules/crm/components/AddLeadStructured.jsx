import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Loader2, Database } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const AddLeadStructured = ({ isOpen, onClose, pipeline, stages, onSuccess }) => {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        job_title: '',
        company_name: '',
        deal_value: '0',
    });

    const [dynamicFields, setDynamicFields] = useState({});

    if (!isOpen) return null;

    const mandatoryList = pipeline?.mandatory_fields || [];

    const normalizeFieldName = (name) => name.toLowerCase().replace(/[\s_-]/g, '');

    const hasField = (fieldName) => {
        return mandatoryList.some(f => normalizeFieldName(f) === normalizeFieldName(fieldName));
    };

    const dynamicCustomFields = mandatoryList.filter(
        f => !['name', 'email', 'phone', 'jobtitle', 'job_title', 'company', 'companyname', 'company_name', 'dealvalue', 'deal_value', 'value'].includes(normalizeFieldName(f))
    );

    const handleSubmit = async (e, selfAssign = false) => {
        e.preventDefault();
        setError(null);

        // Validate all configured mandatory fields
        for (const field of mandatoryList) {
            const norm = normalizeFieldName(field);
            if (norm === 'name' && !formData.name.trim()) {
                setError("Name is required.");
                return;
            }
            if (norm === 'email' && !formData.email.trim()) {
                setError("Email is required.");
                return;
            }
            if (norm === 'phone' && !formData.phone.trim()) {
                setError("Phone is required.");
                return;
            }
            if (['jobtitle', 'job_title'].includes(norm) && !formData.job_title.trim()) {
                setError(`${field} is required.`);
                return;
            }
            if (['company', 'companyname', 'company_name'].includes(norm) && !formData.company_name.trim()) {
                setError(`${field} is required.`);
                return;
            }
            if (['dealvalue', 'deal_value', 'value'].includes(norm) && (!formData.deal_value || parseFloat(formData.deal_value) <= 0)) {
                setError(`${field} must be greater than 0.`);
                return;
            }
            
            // Dynamic custom fields validation
            if (!['name', 'email', 'phone', 'jobtitle', 'job_title', 'company', 'companyname', 'company_name', 'dealvalue', 'deal_value', 'value'].includes(norm)) {
                const val = dynamicFields[field] || '';
                if (!val.trim()) {
                    setError(`${field} is required.`);
                    return;
                }
            }
        }

        if (!pipeline || !stages || stages.length === 0) {
            setError("Cannot add lead: Selected pipeline has no stages configured.");
            return;
        }

        setIsSubmitting(true);

        try {
            const customFieldsObj = {};
            dynamicCustomFields.forEach(field => {
                customFieldsObj[field] = dynamicFields[field] || '';
            });

            const contactPayload = {
                name: formData.name,
                email: formData.email || null,
                phone: formData.phone || null,
                job_title: formData.job_title || null,
                company_name: formData.company_name || null,
                custom_fields: customFieldsObj
            };

            const contactRes = await axios.post('/api/contacts/', contactPayload);
            const contactId = contactRes.data.id;

            const firstStage = stages.sort((a, b) => a.order - b.order)[0];
            
            const dealPayload = {
                contact: contactId,
                pipeline: pipeline.id,
                stage: firstStage.id,
                value: parseFloat(formData.deal_value) || 0,
                priority: 'Medium',
                ...(selfAssign && user?.id ? { assigned_user: user.id } : {})
            };

            const dealRes = await axios.post('/api/crm/pipeline/', dealPayload);

            if (onSuccess) onSuccess(dealRes.data);
            onClose();

            setFormData({
                name: '', email: '', phone: '', job_title: '', company_name: '', deal_value: '0'
            });
            setDynamicFields({});

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

    const isSubmitDisabled = () => {
        if (isSubmitting) return true;
        if (!formData.name.trim()) return true;
        
        for (const field of mandatoryList) {
            const norm = normalizeFieldName(field);
            if (norm === 'email' && !formData.email.trim()) return true;
            if (norm === 'phone' && !formData.phone.trim()) return true;
            if (['jobtitle', 'job_title'].includes(norm) && !formData.job_title.trim()) return true;
            if (['company', 'companyname', 'company_name'].includes(norm) && !formData.company_name.trim()) return true;
            if (['dealvalue', 'deal_value', 'value'].includes(norm) && (!formData.deal_value || parseFloat(formData.deal_value) <= 0)) return true;
            if (!['name', 'email', 'phone', 'jobtitle', 'job_title', 'company', 'companyname', 'company_name', 'dealvalue', 'deal_value', 'value'].includes(norm)) {
                if (!(dynamicFields[field] || '').trim()) return true;
            }
        }
        return false;
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => !isSubmitting && onClose()}
            />
            
            {/* The Industrial Registry Modal Base */}
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
                                    <span className="text-[9px] px-2 py-0.5 rounded border uppercase bg-amber-500/10 text-amber-400 border-amber-500/20">
                                        Custom Fields Enabled
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

                {/* Form Content */}
                <form id="add-lead-structured-form" onSubmit={handleSubmit} className="overflow-hidden p-6 flex flex-col min-h-0 bg-zinc-900/30">
                    
                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-[0.2em] font-medium shrink-0">
                            {error}
                        </div>
                    )}

                    <div className="flex relative min-h-0 flex-1">
                        
                        {/* Strict Configured Fields Layout - Centered and Streamlined */}
                        <div className="w-full overflow-y-auto custom-scrollbar pr-3 space-y-6" style={{ maxHeight: '420px' }}>
                            <div className="flex items-center gap-2 mb-2 border-b border-zinc-900 pb-3">
                                <Database size={14} className="text-blue-400" />
                                <p className="text-[10px] uppercase text-white/60">Configured Mandatory Profile</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                {/* Name - Always present and mandatory */}
                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
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

                                {/* Email - Show if in mandatory fields */}
                                {hasField('email') && (
                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <label className="text-[10px] text-white/40 uppercase flex items-center gap-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-black/40 border border-zinc-800 focus:border-blue-500/50 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all hover:bg-white/[0.02]"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                )}

                                {/* Phone - Show if in mandatory fields */}
                                {hasField('phone') && (
                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <label className="text-[10px] text-white/40 uppercase flex items-center gap-1">
                                            Phone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-black/40 border border-zinc-800 focus:border-blue-500/50 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all hover:bg-white/[0.02]"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                )}

                                {/* Deal Value - Show if in mandatory fields */}
                                {hasField('deal_value') && (
                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <label className="text-[10px] text-emerald-500/80 uppercase flex items-center gap-1">
                                            Deal Value <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.deal_value}
                                            onChange={(e) => setFormData({ ...formData, deal_value: e.target.value })}
                                            className="w-full bg-black/40 border border-zinc-800 focus:border-emerald-500/50 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all hover:bg-white/[0.02]"
                                            placeholder="0.00"
                                        />
                                    </div>
                                )}

                                {/* Job Title - Show if in mandatory fields */}
                                {hasField('job_title') && (
                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <label className="text-[10px] text-white/40 uppercase flex items-center gap-1">
                                            Job Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.job_title}
                                            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                            className="w-full bg-black/40 border border-zinc-800 focus:border-blue-500/50 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all hover:bg-white/[0.02]"
                                            placeholder="CEO"
                                        />
                                    </div>
                                )}

                                {/* Company Name - Show if in mandatory fields */}
                                {hasField('company_name') && (
                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <label className="text-[10px] text-white/40 uppercase flex items-center gap-1">
                                            Company <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.company_name}
                                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                            className="w-full bg-black/40 border border-zinc-800 focus:border-blue-500/50 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all hover:bg-white/[0.02]"
                                            placeholder="Acme Corp"
                                        />
                                    </div>
                                )}

                                {/* Dynamic User Custom Fields */}
                                {dynamicCustomFields.map(field => (
                                    <div key={field} className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <label className="text-[10px] text-white/40 uppercase flex items-center gap-1">
                                            {field} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={dynamicFields[field] || ''}
                                            onChange={(e) => setDynamicFields({ ...dynamicFields, [field]: e.target.value })}
                                            className="w-full bg-black/40 border border-zinc-800 focus:border-blue-500/50 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all hover:bg-white/[0.02]"
                                            placeholder={`Enter ${field}`}
                                        />
                                    </div>
                                ))}
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
                        disabled={isSubmitting || isSubmitDisabled()}
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
                        disabled={isSubmitting || isSubmitDisabled()}
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

export default AddLeadStructured;
