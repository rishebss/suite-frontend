import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
    Mail, Phone, Tag, Calendar, Database, ExternalLink, Copy, Check, 
    Trash2, User, Plus, Loader2, Save, Wallet, Clock, ChevronDown, MessageSquare, History,

} from 'lucide-react';
import { TbEdit } from "react-icons/tb";
import axios from 'axios';
import { cn } from '@/lib/utils';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import AddToCRMModal from './AddToCRMModal';
import UpdateFollowUpModal from '@/modules/calendar/components/UpdateFollowUpModal';
import ContactLogs from './contactlog';

const STATUS_STYLES = {
    Lead:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Prospect: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Customer: 'bg-green-500/10 text-green-400 border-green-500/20',
    Inactive: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    Retarget: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Imports:  'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

const Field = ({ icon: Icon, label, value, actions, isEditing, children, colorClass }) => {
    if (!value && !isEditing) return null;
    return (
        <div className="flex items-start gap-3 py-3.5 border-b border-zinc-900 last:border-0">
            <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white/30 shrink-0 mt-0.5">
                <Icon size={12} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] text-white/30 mb-1 uppercase tracking-wider font-semibold">{label}</p>
                {isEditing ? (
                    children
                ) : (
                    <p className={cn("text-xs text-white uppercase tracking-wider font-semibold truncate", colorClass)}>{value}</p>
                )}
            </div>
            {!isEditing && actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
        </div>
    );
};

const CopyButton = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-emerald-500/10 text-emerald-500/60 hover:text-emerald-400 transition-colors cursor-pointer" title="Copy">
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
        </button>
    );
};

const ContactDetailModal = ({ contact, onClose, onDeleted, onUpdated }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Tab Control state ('profile', 'payments', 'activity')
    const [activeTab, setActiveTab] = useState('profile');
    
    // Inline editing states
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        status: 'Lead',
        source: '',
    });
    const [editAdditionalData, setEditAdditionalData] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [pipelines, setPipelines] = useState([]);
    const [deletingDealId, setDeletingDealId] = useState(null);
    const [pipelineDealToDelete, setPipelineDealToDelete] = useState(null);
    const [showAddToCRM, setShowAddToCRM] = useState(false);

    // Payments Ledger States
    const [payments, setPayments] = useState([]);
    const [isLoadingPayments, setIsLoadingPayments] = useState(false);
    const [expandedPayments, setExpandedPayments] = useState({});
    const [paymentSubTab, setPaymentSubTab] = useState('pay'); // 'pay' or 'ledger'
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentFor, setPaymentFor] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [isPaymentMethodDropdownOpen, setIsPaymentMethodDropdownOpen] = useState(false);
    const [paymentRemarks, setPaymentRemarks] = useState('');
    const [paymentInvoice, setPaymentInvoice] = useState('');
    const [paymentError, setPaymentError] = useState('');
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const [selectedCrmId, setSelectedCrmId] = useState(''); // Link payment to an active pipeline deal
    const [isCrmDropdownOpen, setIsCrmDropdownOpen] = useState(false); // Custom CRM Dropdown open state

    const paymentMethodDropdownRef = useRef(null);
    const crmDropdownRef = useRef(null);

    // Click outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (paymentMethodDropdownRef.current && !paymentMethodDropdownRef.current.contains(event.target)) {
                setIsPaymentMethodDropdownOpen(false);
            }
            if (crmDropdownRef.current && !crmDropdownRef.current.contains(event.target)) {
                setIsCrmDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load Payments Ledger
    const fetchPayments = async () => {
        if (!contact?.id) return;
        setIsLoadingPayments(true);
        try {
            const res = await axios.get(`/api/payments/?contact=${contact.id}`);
            setPayments(res.data.results || res.data);
        } catch (err) {
            console.error("Failed to fetch payments:", err);
        } finally {
            setIsLoadingPayments(false);
        }
    };

    // Activity Log States
    const [logs, setLogs] = useState([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    const fetchLogs = async () => {
        if (!contact?.id) return;
        setIsLoadingLogs(true);
        try {
            const res = await axios.get(`/api/contacts/logs/?contact=${contact.id}`);
            setLogs(res.data.results || res.data);
        } catch (err) {
            console.error("Failed to fetch activity logs:", err);
        } finally {
            setIsLoadingLogs(false);
        }
    };

    // Deal Follow-up States
    const [followUps, setFollowUps] = useState([]);
    const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(false);
    const [activeFollowUp, setActiveFollowUp] = useState(null);

    const fetchFollowUps = async () => {
        if (!contact?.id) return;
        setIsLoadingFollowUps(true);
        try {
            const res = await axios.get(`/api/calendar/todos/?todo_type=followup&contact=${contact.id}`);
            setFollowUps(res.data.results || res.data);
        } catch (err) {
            console.error("Failed to fetch follow-ups:", err);
        } finally {
            setIsLoadingFollowUps(false);
        }
    };

    // Remarks / Update States
    const [newRemarkText, setNewRemarkText] = useState('');
    const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);
    const [isAddingActivityRemark, setIsAddingActivityRemark] = useState(false);
    const [isLogsDrawerOpen, setIsLogsDrawerOpen] = useState(false);

    const handleAddRemark = async (e) => {
        e.preventDefault();
        if (!newRemarkText.trim() || !contact?.id) return;
        setIsSubmittingRemark(true);
        try {
            await axios.post('/api/contacts/remarks/', {
                contact: contact.id,
                text: newRemarkText.trim()
            });
            setNewRemarkText('');
            setIsAddingActivityRemark(false);
            await fetchLogs();
        } catch (err) {
            console.error("Failed to add remark:", err);
        } finally {
            setIsSubmittingRemark(false);
        }
    };

    useEffect(() => {
        if (contact?.id && activeTab === 'activity') {
            fetchLogs();
            fetchFollowUps();
        }
    }, [contact?.id, activeTab]);

    useEffect(() => {
        if (contact?.id && activeTab === 'profile') {
            fetchLogs();
            fetchFollowUps();
        }
    }, [contact?.id, activeTab]);

    useEffect(() => {
        if (contact?.id) {
            fetchPayments();
        }
    }, [contact?.id]);

    useEffect(() => {
        if (!contact) return;

        const applyContactData = (c) => {
            setEditForm({
                name: c.name || '',
                email: c.email || '',
                phone: c.phone || '',
                status: c.status || 'Lead',
                source: c.source || '',
            });
            const mapped = Object.entries(c.additional_data || {}).map(([k, v], idx) => ({
                id: `${idx}-${Date.now()}`,
                key: k,
                value: String(v || ''),
            }));
            setEditAdditionalData(mapped);
            setPipelines(c.pipelines || []);
            setIsEditing(false);
            setValidationError('');
            setPaymentSubTab('pay');
            setPaymentError('');
            setPaymentAmount('');
            setPaymentFor('');
            setPaymentRemarks('');
            setPaymentInvoice('');
            setSelectedCrmId('');
            setIsCrmDropdownOpen(false);
        };

        if (contact.pipelines) {
            // Full data already provided (create/update response or detail fetch)
            applyContactData(contact);
        } else {
            // Lightweight list data — fetch full contact detail
            axios.get(`/api/contacts/${contact.id}/`).then(res => {
                applyContactData(res.data);
            }).catch(err => {
                console.error('Failed to load contact details', err);
                applyContactData(contact);
            });
        }
    }, [contact?.id]);

    const handleConfirmDeletePipelineDeal = async () => {
        if (!pipelineDealToDelete) return;
        const dealId = pipelineDealToDelete.deal_id;
        setDeletingDealId(dealId);
        try {
            await axios.delete(`/api/crm/pipeline/${dealId}/`);
            const updatedPipelines = pipelines.filter(p => p.deal_id !== dealId);
            setPipelines(updatedPipelines);
            
            if (onUpdated) {
                onUpdated({
                    ...contact,
                    pipelines: updatedPipelines
                });
            }
            setPipelineDealToDelete(null);
        } catch (err) {
            console.error("Failed to remove contact from pipeline:", err);
            alert("An error occurred while removing the contact from the pipeline.");
        } finally {
            setDeletingDealId(null);
        }
    };

    const handleConfirmAddToCRM = async (pipelineId, stageId) => {
        if (!stageId) return;
        try {
            await axios.post('/api/crm/pipeline/', { 
                contact: contact.id, 
                stage: stageId,
                pipeline: pipelineId
            });
            // POST response lacks pipeline details, so re-fetch authoritative pipelines
            const detail = await axios.get(`/api/contacts/${contact.id}/`);
            const updatedPipelines = detail.data.pipelines || [];
            setPipelines(updatedPipelines);
            
            if (onUpdated) {
                onUpdated({
                    ...contact,
                    pipelines: updatedPipelines
                });
            }
            setShowAddToCRM(false);
        } catch (err) {
            console.error('Failed to add to CRM:', err);
            alert('Failed to add contact to the selected CRM pipeline.');
        }
    };

    if (!contact) return null;

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await axios.delete(`/api/contacts/${contact.id}/`);
            onDeleted?.(contact.id);
            onClose();
        } catch (err) {
            console.error('Delete failed:', err);
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const handleStartEdit = () => {
        setValidationError('');
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm({
            name: contact.name || '',
            email: contact.email || '',
            phone: contact.phone || '',
            status: contact.status || 'Lead',
            source: contact.source || '',
        });
        const mapped = Object.entries(contact.additional_data || {}).map(([k, v], idx) => ({
            id: `${idx}-${Date.now()}`,
            key: k,
            value: String(v || ''),
        }));
        setEditAdditionalData(mapped);
        setValidationError('');
    };

    const handleAddAdditionalField = () => {
        setEditAdditionalData(prev => [
            ...prev,
            { id: `new-${Date.now()}-${Math.random()}`, key: '', value: '' }
        ]);
    };

    const handleRemoveAdditionalField = (idx) => {
        setEditAdditionalData(prev => prev.filter((_, i) => i !== idx));
    };

    const handleUpdateAdditionalKey = (idx, newKey) => {
        setEditAdditionalData(prev => prev.map((item, i) => i === idx ? { ...item, key: newKey } : item));
    };

    const handleUpdateAdditionalValue = (idx, newValue) => {
        setEditAdditionalData(prev => prev.map((item, i) => i === idx ? { ...item, value: newValue } : item));
    };

    const handleSaveEdit = async () => {
        if (!editForm.name?.trim()) {
            setValidationError("Name is required.");
            return;
        }
        if (!editForm.email?.trim() && !editForm.phone?.trim()) {
            setValidationError("Either Email Address or Phone Number must be provided.");
            return;
        }

        setIsSaving(true);
        setValidationError('');

        try {
            const additionalDataObj = {};
            editAdditionalData.forEach(item => {
                const cleanKey = item.key?.trim()?.replace(/\s+/g, '_')?.toLowerCase();
                if (cleanKey) {
                    additionalDataObj[cleanKey] = item.value?.trim() || '';
                }
            });

            const payload = {
                name: editForm.name.trim(),
                email: editForm.email.trim() || null,
                phone: editForm.phone.trim() || null,
                status: editForm.status,
                source: editForm.source.trim() || null,
                additional_data: additionalDataObj,
            };

            const response = await axios.patch(`/api/contacts/${contact.id}/`, payload);
            setIsEditing(false);
            if (onUpdated) {
                onUpdated(response.data);
            }
        } catch (err) {
            console.error("Failed to update contact:", err);
            setValidationError(err.response?.data?.detail || err.message || "Failed to update contact.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            setPaymentError("Please enter a valid amount.");
            return;
        }
        if (!paymentFor.trim()) {
            setPaymentError("Please specify what this payment is for.");
            return;
        }

        setIsSubmittingPayment(true);
        setPaymentError('');

        try {
            const payload = {
                contact: contact.id,
                amount: parseFloat(paymentAmount),
                payment_for: paymentFor.trim(),
                payment_method: paymentMethod,
                remarks: paymentRemarks.trim() || null,
                invoice: paymentInvoice.trim() || null,
                crm: selectedCrmId || null
            };

            await axios.post("/api/payments/", payload);
            
            // Clear payment form
            setPaymentAmount('');
            setPaymentFor('');
            setPaymentRemarks('');
            setPaymentInvoice('');
            setSelectedCrmId('');
            setPaymentSubTab('ledger');
            
            // Refresh ledger list
            await fetchPayments();
            await fetchLogs();
        } catch (err) {
            console.error("Failed to record payment:", err);
            setPaymentError(err.response?.data?.detail || err.message || "Failed to record payment.");
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    const togglePaymentExpand = (paymentId) => {
        setExpandedPayments(prev => ({
            ...prev,
            [paymentId]: !prev[paymentId]
        }));
    };

    const additionalEntries = Object.entries(contact.additional_data || {}).filter(
        ([, v]) => v !== null && v !== undefined && v !== ''
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (e) {
            return 'N/A';
        }
    };

    const totalPaymentsSum = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    return (
        <>
            {createPortal(
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
                    <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="px-8 py-6 border-b border-zinc-900 bg-white/[0.01] shrink-0">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-5 flex-1 min-w-0">
                                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg font-bold shrink-0">
                                        {(isEditing ? editForm.name : contact.name)?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={editForm.name} 
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                placeholder="Contact Name"
                                                className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-white uppercase tracking-wider font-semibold focus:border-blue-500/50 outline-none w-full"
                                            />
                                        ) : (
                                            <h2 className="text-base font-semibold text-white uppercase tracking-wider truncate">{contact.name || 'Unknown Contact'}</h2>
                                        )}
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{contact.contact_id}</span>
                                            <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-[0.15em]", STATUS_STYLES[contact.status] || STATUS_STYLES.Lead)}>
                                                {contact.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {/* Tab Switcher */}
                                    <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80 shrink-0">
                                        {[
                                            { id: 'profile', label: 'Profile', icon: User },
                                            { id: 'payments', label: 'Payments', icon: Wallet },
                                            { id: 'activity', label: 'Activity', icon: Clock },
                                        ].map(tab => {
                                            const Icon = tab.icon;
                                            const isActive = activeTab === tab.id;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => {
                                                        setActiveTab(tab.id);
                                                        setIsEditing(false);
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-1.5 px-3 py-1.5 rounded text-[9px] font-semibold uppercase tracking-[0.1em] transition-all cursor-pointer",
                                                        isActive 
                                                            ? "bg-white/10 text-white border border-white/5" 
                                                            : "text-white/40 hover:text-white hover:bg-white/[0.02] border border-transparent"
                                                    )}
                                                >
                                                    <Icon size={10} className={isActive ? (tab.id === 'payments' ? "text-emerald-400" : "text-blue-400") : "text-white/30"} />
                                                    {tab.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                </div>
                            </div>
                        </div>

                        {/* Body - Two Column Layout */}
                        <div className="overflow-hidden p-8 flex-1 min-h-0 flex flex-col">
                            <div className="flex relative flex-1 min-h-0">
                                
                                {/* Left Column: Persistent Primary Metadata Sidebar */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-6">
                                    <div className="space-y-6 pb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <User size={14} className="text-blue-400" />
                                                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Primary Identity</p>
                                            </div>
                                            {validationError && (
                                                <div className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-medium uppercase tracking-wider rounded">
                                                    {validationError}
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <Field 
                                                    icon={Mail} label="Email Address" value={contact.email} 
                                                    isEditing={isEditing}
                                                    actions={contact.email && (
                                                        <a href={`https://mail.google.com/mail/?view=cm&to=${contact.email}`} target="_blank" rel="noreferrer"
                                                            className="p-1.5 rounded-md hover:bg-blue-500/10 text-blue-500/60 hover:text-blue-400 transition-colors">
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    )}
                                                >
                                                    <input 
                                                        type="email" 
                                                        value={editForm.email} 
                                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                        placeholder="email@example.com"
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500/50"
                                                    />
                                                </Field>
                                                <Field 
                                                    icon={Phone} label="Phone Number" value={contact.phone} 
                                                    isEditing={isEditing}
                                                    actions={contact.phone && <CopyButton text={contact.phone} />}
                                                >
                                                    <input 
                                                        type="text" 
                                                        value={editForm.phone} 
                                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                        placeholder="+1 234 567 8900"
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500/50"
                                                    />
                                                </Field>
                                                <Field icon={Tag} label="Lead Source" value={contact.source} isEditing={isEditing}>
                                                    <input 
                                                        type="text" 
                                                        value={editForm.source} 
                                                        onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                                                        placeholder="Self-Registered, Import, etc."
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500/50"
                                                    />
                                                </Field>
                                                <Field icon={Calendar} label="Date Onboarded" value={formatDate(contact.created_at)} isEditing={false} />
                                                
                                                <Field 
                                                    icon={Wallet} 
                                                    label="Total Recorded Payments" 
                                                    value={`₹ ${totalPaymentsSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} 
                                                    colorClass="text-emerald-400" 
                                                    isEditing={false}
                                                />

                                                {/* Active Pipelines Track */}
                                                <div className="pt-5 border-t border-zinc-900 mt-4">
                                                    <div className="flex items-center justify-between gap-2 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <Database size={12} className="text-emerald-400" />
                                                            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 font-semibold">Active Pipelines</p>
                                                        </div>
                                                        <button
                                                            onClick={() => setShowAddToCRM(true)}
                                                            className="h-6 w-6 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                                                            title="Add to Pipeline"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                    {pipelines && pipelines.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {pipelines.map((deal) => (
                                                                <div 
                                                                    key={deal.deal_id} 
                                                                    className="px-3.5 py-3 rounded bg-emerald-500/[0.01] border border-emerald-500/10 hover:border-emerald-500/20 transition-all flex items-center justify-between group"
                                                                >
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-[10px] text-white uppercase tracking-wider font-semibold truncate">
                                                                            {deal.pipeline_name}
                                                                        </p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className="text-[8px] px-1.5 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800 text-white/40 uppercase tracking-widest font-mono">
                                                                                {deal.stage_name}
                                                                            </span>
                                                                            <span className={cn(
                                                                                "text-[8px] px-1.5 py-0.5 rounded-sm border uppercase tracking-wider font-bold",
                                                                                deal.priority === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                                deal.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                                                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                            )}>
                                                                                {deal.priority}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 shrink-0 ml-4">
                                                                        {deal.value > 0 && (
                                                                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                                                                ₹ {deal.value}
                                                                            </p>
                                                                        )}
                                                                        <button
                                                                            onClick={() => setPipelineDealToDelete(deal)}
                                                                            disabled={deletingDealId === deal.deal_id}
                                                                            className="h-7 w-7 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 shrink-0"
                                                                            title="Remove from Pipeline"
                                                                        >
                                                                            {deletingDealId === deal.deal_id ? (
                                                                                <Loader2 size={12} className="animate-spin" />
                                                                            ) : (
                                                                                <Trash2 size={12} />
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="py-4 px-3 rounded border border-dashed border-zinc-900 bg-white/[0.002] text-center">
                                                            <p className="text-[9px] text-white/20 uppercase tracking-[0.15em] font-medium">No Active Pipelines</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Vertical Separator */}
                                <div className="w-px bg-zinc-900 self-stretch shrink-0 pointer-events-none" />

                                {/* Right Column: Dynamic Workspace based on Active Tab */}
                                <div className="flex-1 pl-6 overflow-hidden flex flex-col">
                                    
                                    {/* PROFILE TAB: Additional Registry & Updates */}
                                    {activeTab === 'profile' && (
                                        <div className="flex flex-col h-full pb-4">
                                            {/* Top 70% */}
                                            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-6 pb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Database size={14} className="text-purple-400" />
                                                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Additional Registry</p>
                                                    </div>
                                                    {isEditing ? (
                                                        <div className="space-y-3 pb-4">
                                                            {editAdditionalData.map((item, idx) => (
                                                                <div key={item.id} className="flex items-center gap-2">
                                                                    <input 
                                                                        type="text" 
                                                                        value={item.key} 
                                                                        onChange={(e) => handleUpdateAdditionalKey(idx, e.target.value)} 
                                                                        placeholder="Field Name"
                                                                        className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-white font-medium uppercase tracking-wider outline-none focus:border-blue-500/50"
                                                                    />
                                                                    <input 
                                                                        type="text" 
                                                                        value={item.value} 
                                                                        onChange={(e) => handleUpdateAdditionalValue(idx, e.target.value)} 
                                                                        placeholder="Value"
                                                                        className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-white font-medium outline-none focus:border-blue-500/50"
                                                                    />
                                                                    <button 
                                                                        onClick={() => handleRemoveAdditionalField(idx)}
                                                                        className="p-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all shrink-0 cursor-pointer"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <button
                                                                onClick={handleAddAdditionalField}
                                                                className="w-full py-2 rounded-sm border border-dashed border-zinc-800 hover:border-zinc-700 text-white/40 hover:text-white/60 text-[9px] font-medium uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                                                            >
                                                                <Plus size={11} /> Add Field
                                                            </button>
                                                        </div>
                                                    ) : additionalEntries.length > 0 ? (
                                                        <div className="grid grid-cols-1 gap-3 pb-4">
                                                            {additionalEntries.map(([key, value]) => (
                                                                <div key={key} className="px-4 py-3.5 rounded-lg bg-zinc-900/50 border border-zinc-900 flex items-center justify-between group hover:bg-zinc-800/50 transition-all duration-300">
                                                                    <span className="text-[9px] font-medium text-white/60 uppercase tracking-[0.15em]">{key.replace(/_/g, ' ')}</span>
                                                                    <span className="text-[10px] text-white uppercase tracking-wider font-semibold">{String(value)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="min-h-[150px] rounded-lg border border-dashed border-zinc-900 flex flex-col items-center justify-center gap-3 bg-white/[0.005]">
                                                            <Database size={18} className="text-white/5" />
                                                            <p className="text-[9px] font-medium text-white/20 uppercase tracking-[0.15em]">No Extended Data</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Bottom 30% - Current Updates (Latest Activity Log) */}
                                            <div className="shrink-0 border-t border-zinc-900 pt-4 mt-6 flex flex-col mr-2">
                                                <div className="flex items-center gap-2 mb-3 shrink-0">
                                                    <MessageSquare size={14} className="text-pink-400" />
                                                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Current Update</p>
                                                </div>

                                                <div className="flex flex-col mb-3 pr-2">
                                                    {(() => {
                                                        const mergedItems = [
                                                            ...followUps.map(f => ({ kind: 'followup', data: f })),
                                                            ...logs.map(l => ({ kind: 'log', data: l })),
                                                        ].sort((a, b) => new Date(b.data.created_at) - new Date(a.data.created_at));

                                                        if (isLoadingLogs || isLoadingFollowUps) {
                                                            return (
                                                                <div className="flex items-center justify-center py-6">
                                                                    <Loader2 size={16} className="animate-spin text-white/20" />
                                                                </div>
                                                            );
                                                        }

                                                        if (mergedItems.length === 0) {
                                                            return (
                                                                <div className="flex-1 rounded-lg border border-dashed border-zinc-900 flex flex-col items-center justify-center gap-3 bg-white/[0.005]">
                                                                    <p className="text-[9px] font-medium text-white/20 uppercase tracking-[0.15em]">No recent updates</p>
                                                                </div>
                                                            );
                                                        }

                                                        const latest = mergedItems[0];
                                                        const date = new Date(latest.data.created_at);
                                                        const isFollowUp = latest.kind === 'followup';

                                                        return (
                                                            <div className="bg-zinc-950/50 border border-zinc-900 rounded-md p-4 flex flex-col justify-between h-full">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="flex flex-col gap-1 min-w-0">
                                                                        <p className="text-[12px] text-white/90 leading-relaxed break-words line-clamp-3">
                                                                            {isFollowUp ? latest.data.title : latest.data.description}
                                                                        </p>
                                                                        <span className="text-[8px] font-mono text-white/30 uppercase">
                                                                            {date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                    {isFollowUp && (
                                                                        <span className={cn(
                                                                            "shrink-0 px-1.5 py-0.5 rounded-full border text-[7.5px] font-bold uppercase tracking-wider",
                                                                            {
                                                                                follow_up: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
                                                                                failed: 'text-red-400 bg-red-500/10 border-red-500/20',
                                                                                complete: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                                                                                cancelled: 'text-white/40 bg-white/5 border-white/10',
                                                                            }[latest.data.status] || 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20'
                                                                        )}>
                                                                            {(latest.data.status || 'follow_up').replace('_', ' ')}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 shrink-0">
                                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                                        {latest.data.pipeline_name && (
                                                                            <span className="text-[8.5px] font-mono text-white/70 bg-zinc-900 border border-zinc-700 px-2.5 py-1 leading-none uppercase">
                                                                                {latest.data.pipeline_name}
                                                                            </span>
                                                                        )}
                                                                        {isFollowUp || !String(latest.data.activity_type || '').toLowerCase().includes('remark') ? (
                                                                            <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
                                                                                {isFollowUp ? 'Follow Up' : latest.data.activity_type}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                                        <span className="text-[9px] font-mono text-white/50 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded leading-none">
                                                                            {isFollowUp
                                                                                ? (latest.data.user_name || 'Unknown')
                                                                                : (latest.data.user_details 
                                                                                    ? `${latest.data.user_details.first_name || ''} ${latest.data.user_details.last_name || ''}`.trim() || latest.data.user_details.email
                                                                                    : 'System'
                                                                                )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* PAYMENTS TAB: Financial recording and listing */}
                                    {activeTab === 'payments' && (
                                        <div className="space-y-4 pb-4 h-full flex flex-col">
                                            {/* Sub-tab Bar */}
                                            <div className="flex border-b border-zinc-900 pb-2 shrink-0 gap-2">
                                                <button
                                                    onClick={() => setPaymentSubTab('pay')}
                                                    className={cn(
                                                        "px-3.5 py-1.5 text-[9px] font-medium uppercase transition-all rounded border font-mono cursor-pointer",
                                                        paymentSubTab === 'pay' 
                                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                                            : "bg-zinc-950/20 border-zinc-900 text-white/40 hover:text-white/60"
                                                    )}
                                                >
                                                    Record Payment
                                                </button>
                                                <button
                                                    onClick={() => setPaymentSubTab('ledger')}
                                                    className={cn(
                                                        "px-3.5 py-1.5 text-[9px] font-medium uppercase transition-all rounded border font-mono cursor-pointer",
                                                        paymentSubTab === 'ledger' 
                                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                                            : "bg-zinc-950/20 border-zinc-900 text-white/40 hover:text-white/60"
                                                    )}
                                                >
                                                    Ledger ({payments.length})
                                                </button>
                                            </div>

                                            {/* Sub-tab Content */}
                                            {paymentSubTab === 'pay' ? (
                                                <div className="flex-1 space-y-4 mt-2">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Plus size={14} className="text-emerald-400" />
                                                        <h3 className="text-[10px] font-semibold text-white uppercase tracking-widest">New Payment</h3>
                                                    </div>

                                                    <form onSubmit={handleAddPayment} className="space-y-4">
                                                        {paymentError && (
                                                            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] uppercase tracking-wider font-semibold font-mono">
                                                                {paymentError}
                                                            </div>
                                                        )}

                                                        <div>
                                                            <label className="block text-[8px] text-white/35 uppercase tracking-widest font-mono font-semibold mb-1.5">Amount (INR)</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[11px] font-semibold">₹</span>
                                                                <input 
                                                                    type="number"
                                                                    required
                                                                    min="1"
                                                                    placeholder="0"
                                                                    value={paymentAmount}
                                                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                                                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-7 py-2 text-xs text-white placeholder-white/10 outline-none focus:border-emerald-500/50 font-semibold font-mono"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-[8px] text-white/35 uppercase tracking-widest font-mono font-semibold mb-1.5">Payment For</label>
                                                            <input 
                                                                type="text"
                                                                required
                                                                placeholder="e.g. Licensing Fee, Setup, Milestone"
                                                                value={paymentFor}
                                                                onChange={(e) => setPaymentFor(e.target.value)}
                                                                className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder-white/15 outline-none focus:border-emerald-500/50"
                                                            />
                                                        </div>

                                                        {/* Optional CRM Deal selector if pipelines exist (Custom Styled Dropdown) */}
                                                        {pipelines && pipelines.length > 0 && (
                                                            <div className="relative" ref={crmDropdownRef}>
                                                                <label className="block text-[8px] text-white/35 uppercase tracking-widest font-mono font-semibold mb-1.5">Link to Pipeline (Optional)</label>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setIsCrmDropdownOpen(!isCrmDropdownOpen)}
                                                                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50 flex items-center justify-between cursor-pointer font-mono select-none"
                                                                >
                                                                    <span className="text-white/80 font-medium uppercase tracking-wider truncate mr-2">
                                                                        {selectedCrmId 
                                                                            ? pipelines.find(p => p.deal_id === selectedCrmId)
                                                                                ? `${pipelines.find(p => p.deal_id === selectedCrmId).pipeline_name} (${pipelines.find(p => p.deal_id === selectedCrmId).stage_name})`
                                                                                : "Contact Record"
                                                                            : "Contact Record"}
                                                                    </span>
                                                                    <ChevronDown 
                                                                        size={12} 
                                                                        className={cn(
                                                                            "text-white/30 transition-transform duration-200 shrink-0",
                                                                            isCrmDropdownOpen && "rotate-180 text-emerald-400"
                                                                        )} 
                                                                    />
                                                                </button>
                                                                
                                                                {isCrmDropdownOpen && (
                                                                    <div className="absolute left-0 right-0 mt-1.5 bg-zinc-900 border border-zinc-800 rounded-md shadow-2xl z-[100] overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSelectedCrmId('');
                                                                                setIsCrmDropdownOpen(false);
                                                                            }}
                                                                            className={cn(
                                                                                "w-full flex items-center justify-between px-3 py-2.5 text-xs transition-colors text-left font-mono",
                                                                                !selectedCrmId 
                                                                                    ? "bg-emerald-500/10 text-emerald-400 font-semibold" 
                                                                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                                                                            )}
                                                                        >
                                                                            <span className="uppercase tracking-wider">Contact Record</span>
                                                                            {!selectedCrmId && <Check size={11} className="text-emerald-400" />}
                                                                        </button>
                                                                        {pipelines.map(deal => {
                                                                            const isSelected = selectedCrmId === deal.deal_id;
                                                                            return (
                                                                                <button
                                                                                    key={deal.deal_id}
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setSelectedCrmId(deal.deal_id);
                                                                                        setIsCrmDropdownOpen(false);
                                                                                    }}
                                                                                    className={cn(
                                                                                        "w-full flex items-center justify-between px-3 py-2.5 text-xs transition-colors text-left font-mono border-t border-zinc-800/20",
                                                                                        isSelected 
                                                                                            ? "bg-emerald-500/10 text-emerald-400 font-semibold" 
                                                                                            : "text-white/70 hover:bg-white/5 hover:text-white"
                                                                                    )}
                                                                                >
                                                                                    <span className="uppercase tracking-wider truncate">{deal.pipeline_name} ({deal.stage_name})</span>
                                                                                    {isSelected && <Check size={11} className="text-emerald-400" />}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="relative" ref={paymentMethodDropdownRef}>
                                                            <label className="block text-[8px] text-white/35 uppercase tracking-widest font-mono font-semibold mb-1.5">Payment Method</label>
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsPaymentMethodDropdownOpen(!isPaymentMethodDropdownOpen)}
                                                                className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50 flex items-center justify-between cursor-pointer font-mono select-none"
                                                            >
                                                                <span className="text-white/80 font-medium uppercase tracking-wider">{paymentMethod}</span>
                                                                <ChevronDown 
                                                                    size={12} 
                                                                    className={cn(
                                                                        "text-white/30 transition-transform duration-200",
                                                                        isPaymentMethodDropdownOpen && "rotate-180 text-emerald-400"
                                                                    )} 
                                                                />
                                                            </button>
                                                            
                                                            {isPaymentMethodDropdownOpen && (
                                                                <div className="absolute left-0 right-0 mt-1.5 bg-zinc-900 border border-zinc-800 rounded-md shadow-2xl z-[100] overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                                                    {[
                                                                        'UPI',
                                                                        'Bank Transfer',
                                                                        'Cash',
                                                                        'Card',
                                                                        'Net Banking',
                                                                        'Other'
                                                                    ].map(method => {
                                                                        const isSelected = paymentMethod === method;
                                                                        return (
                                                                            <button
                                                                                key={method}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setPaymentMethod(method);
                                                                                    setIsPaymentMethodDropdownOpen(false);
                                                                                }}
                                                                                className={cn(
                                                                                    "w-full flex items-center justify-between px-3 py-2.5 text-xs transition-colors text-left font-mono",
                                                                                    isSelected 
                                                                                        ? "bg-emerald-500/10 text-emerald-400 font-semibold" 
                                                                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                                                                )}
                                                                            >
                                                                                <span className="uppercase tracking-wider">{method}</span>
                                                                                {isSelected && <Check size={11} className="text-emerald-400" />}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block text-[8px] text-white/35 uppercase tracking-widest font-mono font-semibold mb-1.5">Remarks (Optional)</label>
                                                            <textarea 
                                                                placeholder="References, remarks, transaction ID..."
                                                                value={paymentRemarks}
                                                                onChange={(e) => setPaymentRemarks(e.target.value)}
                                                                className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder-white/15 outline-none focus:border-emerald-500/50 min-h-[60px] resize-none"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-[8px] text-white/35 uppercase tracking-widest font-mono font-semibold mb-1.5">Invoice Number (Optional)</label>
                                                            <input 
                                                                type="text" 
                                                                placeholder="e.g. INV-2026-001"
                                                                value={paymentInvoice}
                                                                onChange={(e) => setPaymentInvoice(e.target.value)}
                                                                className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder-white/15 outline-none focus:border-emerald-500/50 font-mono"
                                                            />
                                                        </div>

                                                        <button 
                                                            type="submit"
                                                            disabled={isSubmittingPayment}
                                                            className="w-full py-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[9px] font-bold uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                                                        >
                                                            {isSubmittingPayment ? <Loader2 size={12} className="animate-spin" /> : <Wallet size={12} />} Record
                                                        </button>
                                                    </form>
                                                </div>
                                            ) : (
                                                <div className="flex-1 space-y-4 mt-2 flex flex-col">
                                                    <div className="flex items-center justify-between shrink-0">
                                                        <div className="flex items-center gap-2">
                                                            <Wallet size={14} className="text-emerald-400" />
                                                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Ledger Entries</p>
                                                        </div>
                                                        <span className="text-[9px] font-mono text-white/20 uppercase tracking-wider">{payments.length} Registered</span>
                                                    </div>

                                                    {isLoadingPayments ? (
                                                        <div className="flex-1 flex items-center justify-center min-h-[250px]">
                                                            <Loader2 className="animate-spin text-emerald-400" size={20} />
                                                        </div>
                                                    ) : payments.length > 0 ? (
                                                        <div className="space-y-2 overflow-y-auto pr-3 custom-scrollbar max-h-[380px] shrink-0">
                                                            {payments.map(payment => {
                                                                const isExpanded = !!expandedPayments[payment.id];
                                                                return (
                                                                    <div 
                                                                        key={payment.id} 
                                                                        className={cn(
                                                                            "border transition-all duration-300 rounded-md",
                                                                            isExpanded 
                                                                                ? "border-emerald-500/30 bg-emerald-500/[0.02] shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                                                                                : "border-zinc-900 bg-zinc-950/40 hover:border-zinc-800 hover:bg-zinc-900/10"
                                                                        )}
                                                                    >
                                                                        {/* Summary Header */}
                                                                        <div 
                                                                            onClick={() => togglePaymentExpand(payment.id)}
                                                                            className="px-4 py-3 flex items-center justify-between gap-3 cursor-pointer select-none"
                                                                        >
                                                                            <div className="flex items-center gap-3 min-w-0">
                                                                                <div className="text-[9px] font-mono text-white/30 shrink-0">
                                                                                    {new Date(payment.created_at).toLocaleDateString()}
                                                                                </div>
                                                                                <div className="truncate">
                                                                                    <p className="text-[10px] text-white font-semibold uppercase tracking-wider truncate">
                                                                                        {payment.payment_for}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-3 shrink-0">
                                                                                <span className="text-[7.5px] px-1.5 py-0.5 rounded-sm border border-zinc-900 bg-zinc-950/60 text-white/40 uppercase tracking-wider font-mono">
                                                                                    {payment.payment_method}
                                                                                </span>
                                                                                <span className="text-[10px] font-bold text-emerald-400 font-mono">
                                                                                    ₹{parseFloat(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                                </span>
                                                                                <ChevronDown 
                                                                                    size={12} 
                                                                                    className={cn(
                                                                                        "text-white/30 transition-transform duration-300",
                                                                                        isExpanded && "rotate-180 text-emerald-400"
                                                                                    )} 
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        {/* Expandable Details Area */}
                                                                        <div 
                                                                            className={cn(
                                                                                "grid transition-all duration-300 ease-in-out",
                                                                                isExpanded ? "grid-rows-[1fr] opacity-100 border-t border-zinc-900/50" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                                                                            )}
                                                                        >
                                                                            <div className="overflow-hidden">
                                                                                <div className="p-4 space-y-3.5 text-[9px] text-white/50 uppercase tracking-wider">
                                                                                    {payment.remarks ? (
                                                                                        <div className="space-y-1">
                                                                                            <span className="text-[7.5px] text-white/20 font-mono tracking-widest block">Remarks / Notes</span>
                                                                                            <p className="text-[9.5px] text-white/70 italic leading-relaxed font-sans normal-case">
                                                                                                {payment.remarks}
                                                                                            </p>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="space-y-1">
                                                                                            <span className="text-[7.5px] text-white/20 font-mono tracking-widest block">Remarks / Notes</span>
                                                                                            <p className="text-[9.5px] text-white/25 italic leading-relaxed font-sans normal-case">
                                                                                                No additional remarks registered.
                                                                                            </p>
                                                                                        </div>
                                                                                    )}
                                                                                    
                                                                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                                                                        <div className="flex gap-4">
                                                                                            <div>
                                                                                                <span className="text-[7.5px] text-white/20 font-mono block leading-none mb-1">Transaction ID</span>
                                                                                                <span className="text-[8.5px] text-white/40 font-mono font-medium">#{payment.id.toString().slice(0, 8)}...</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-[7.5px] text-white/20 font-mono block leading-none mb-1">Invoice Number</span>
                                                                                                {payment.invoice ? (
                                                                                                    <span className="text-[8.5px] text-white/70 font-mono font-medium">{payment.invoice}</span>
                                                                                                ) : (
                                                                                                    <span className="text-[8.5px] text-white/25 font-mono">—</span>
                                                                                                )}
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-[7.5px] text-white/20 font-mono block leading-none mb-1">Recorded By</span>
                                                                                                {payment.recorded_by_details ? (
                                                                                                    <span className="text-[8.5px] text-white/70 font-mono font-medium">
                                                                                                        {payment.recorded_by_details.first_name 
                                                                                                            ? `${payment.recorded_by_details.first_name} ${payment.recorded_by_details.last_name || ''}`.trim() 
                                                                                                            : payment.recorded_by_details.email}
                                                                                                    </span>
                                                                                                ) : (
                                                                                                    <span className="text-[8.5px] text-white/25 font-mono">System</span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="flex-1 min-h-[250px] rounded-lg border border-dashed border-zinc-900 flex flex-col items-center justify-center gap-3 bg-white/[0.005]">
                                                            <Wallet size={20} className="text-white/5" />
                                                            <p className="text-[9px] font-medium text-white/20 uppercase tracking-[0.15em]">No payments recorded yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ACTIVITY TAB: Audit Logs */}
                                    {activeTab === 'activity' && (
                                        <div className="relative flex-1 flex flex-col min-h-[300px] mt-2 overflow-hidden">
                                            <div className="flex items-center justify-between mb-4 shrink-0">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} className="text-white/40" />
                                                    <h3 className="text-[10px] font-semibold text-white uppercase tracking-widest">Activity History</h3>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddingActivityRemark(!isAddingActivityRemark)}
                                                    className="w-7 h-7 rounded bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/20 hover:border-pink-500/40 transition-all flex items-center justify-center cursor-pointer"
                                                    title="Add Update"
                                                >
                                                    <Plus size={13} className={cn("transition-transform duration-300", isAddingActivityRemark && "rotate-45")} />
                                                </button>
                                            </div>

                                            {isAddingActivityRemark && (
                                                <div className="mb-4 flex gap-2 shrink-0 ml-2 pl-5">
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={newRemarkText}
                                                        onChange={(e) => setNewRemarkText(e.target.value)}
                                                        placeholder="Add an update..."
                                                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 transition-colors"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddRemark(e)}
                                                    />
                                                    <button
                                                        onClick={handleAddRemark}
                                                        disabled={!newRemarkText.trim() || isSubmittingRemark}
                                                        className="px-3 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 text-pink-400 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                                                    >
                                                        {isSubmittingRemark ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                                                    </button>
                                                </div>
                                            )}

                                            {isLoadingLogs || isLoadingFollowUps ? (
                                                <div className="flex-1 flex items-center justify-center min-h-[250px]">
                                                    <Loader2 className="w-5 h-5 animate-spin text-white/20" />
                                                </div>
                                            ) : (() => {
                                                const mergedItems = [
                                                    ...followUps.map(f => ({ kind: 'followup', data: f })),
                                                    ...logs.map(l => ({ kind: 'log', data: l })),
                                                ].sort((a, b) => new Date(b.data.created_at) - new Date(a.data.created_at));

                                                if (mergedItems.length === 0) {
                                                    return (
                                                        <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[250px] rounded-lg border border-dashed border-zinc-900 bg-white/[0.005]">
                                                            <Clock size={20} className="text-white/5" />
                                                            <p className="text-[9px] font-medium text-white/20 uppercase tracking-[0.15em]">No activity logs recorded yet</p>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                                                    <div className="relative pl-5 border-l border-zinc-900 space-y-6 py-2 ml-2">
                                                    {mergedItems.map(({ kind, data }) => {
                                                        const date = new Date(data.created_at);
                                                        const formattedDate = date.toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        });
                                                        const formattedTime = date.toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        });

                                                        if (kind === 'followup') {
                                                            const statusStyle = {
                                                                follow_up: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
                                                                failed: 'text-red-400 bg-red-500/10 border-red-500/20',
                                                                complete: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                                                                cancelled: 'text-white/40 bg-white/5 border-white/10',
                                                            }[data.status] || 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20';

                                                            return (
                                                                <div key={`fu-${data.id}`} className="relative group">
                                                                    <div className="absolute -left-[25px] top-1 w-2 h-2 rounded-full border transition-colors bg-fuchsia-500/40 border-fuchsia-500/60" />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setActiveFollowUp(data)}
                                                                        className="w-full text-left flex flex-col space-y-1.5 rounded p-3.5 transition-all duration-300 bg-fuchsia-500/[0.06] border border-fuchsia-500/20 hover:bg-fuchsia-500/[0.1] hover:border-fuchsia-500/30 cursor-pointer"
                                                                    >
                                                                        <div className="flex items-start justify-between gap-4">
                                                                            <span className="text-[9.5px] font-semibold text-white/90 uppercase tracking-wide leading-relaxed truncate min-w-0">
                                                                                {data.title}
                                                                            </span>
                                                                            <span className={cn("shrink-0 px-1.5 py-0.5 rounded-full border text-[7.5px] font-bold uppercase tracking-wider", statusStyle)}>
                                                                                {(data.status || 'follow_up').replace('_', ' ')}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-[8px] font-mono text-white/30 uppercase">
                                                                            {formattedDate} • {formattedTime}
                                                                        </span>
                                                                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                                            {data.pipeline_name && (
                                                                                <span className="text-[8.5px] font-mono text-white/70 bg-zinc-900 border border-zinc-700 px-2.5 py-1 leading-none uppercase">
                                                                                    {data.pipeline_name}
                                                                                </span>
                                                                            )}
                                                                            <div className="flex items-center gap-1.5 ml-auto">
                                                                                <span className="text-[7.5px] font-mono text-white/30 uppercase tracking-widest">Created by</span>
                                                                                <span className="text-[8.5px] font-mono text-white/70 bg-zinc-900 border border-zinc-700 px-2.5 py-1 leading-none">
                                                                                    {data.user_name || 'Unknown'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div key={data.id} className="relative group">
                                                                {/* Timeline node */}
                                                                <div className={cn("absolute -left-[25px] top-1 w-2 h-2 rounded-full border transition-colors",
                                                                    data.activity_type === 'Pipeline Changed' || data.activity_type === 'Pipeline Added'
                                                                        ? "bg-amber-500/40 border-amber-500/60"
                                                                        : data.activity_type === 'Deal Deleted'
                                                                        ? "bg-red-500/40 border-red-500/60"
                                                                        : "bg-zinc-950 border-zinc-800 group-hover:border-emerald-500/50"
                                                                )} />

                                                                <div className={cn("flex flex-col space-y-1.5 rounded p-3.5 transition-all duration-300",
                                                                    data.activity_type === 'Pipeline Changed' || data.activity_type === 'Pipeline Added'
                                                                        ? "bg-amber-500/[0.06] border border-amber-500/20 hover:bg-amber-500/[0.1] hover:border-amber-500/30"
                                                                        : data.activity_type === 'Deal Deleted'
                                                                        ? "bg-red-500/[0.06] border border-red-500/20 hover:bg-red-500/[0.1] hover:border-red-500/30"
                                                                        : "bg-white/[0.04] border border-zinc-800 hover:bg-white/[0.06] hover:border-zinc-700"
                                                                )}>
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="text-[9.5px] font-semibold text-white/90 uppercase tracking-wide leading-relaxed">
                                                                            {data.description}
                                                                        </span>
                                                                        <span className="text-[8px] font-mono text-white/30 uppercase">
                                                                            {formattedDate} • {formattedTime}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                                        {data.pipeline_name && (
                                                                            <span className="text-[8.5px] font-mono text-white/70 bg-zinc-900 border border-zinc-700 px-2.5 py-1 leading-none uppercase">
                                                                                {data.pipeline_name}
                                                                            </span>
                                                                        )}
                                                                        
                                                                        <div className="flex items-center gap-1.5 ml-auto">
                                                                            <span className="text-[7.5px] font-mono text-white/30 uppercase tracking-widest">Actor</span>
                                                                            <span className="text-[8.5px] font-mono text-white/70 bg-zinc-900 border border-zinc-700 px-2.5 py-1 leading-none">
                                                                                {data.user_details 
                                                                                    ? `${data.user_details.first_name || ''} ${data.user_details.last_name || ''}`.trim() || data.user_details.email
                                                                                    : 'System'
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    </div>
                                                </div>
                                                );
                                            })()}

                                        {/* Overlay Footer */}
                                        <div className="absolute bottom-0 right-0 rounded-tl-xl bg-zinc-950 p-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setIsLogsDrawerOpen(true)}
                                                className="px-4 py-2 rounded-tl-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 transition-all text-[9px] font-semibold uppercase tracking-[0.15em] cursor-pointer flex items-center gap-1.5"
                                            >
                                                <History size={11} /> View All
                                            </button>
                                        </div>
                                        </div>
                                    )}

                                </div>

                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 border-t border-zinc-900 bg-white/[0.005] flex items-center justify-between shrink-0 gap-3">
                            {/* Bottom Left Actions */}
                            <div className="flex items-center gap-2">
                                {!isEditing && activeTab === 'profile' && (
                                    <>
                                        <button 
                                            onClick={handleStartEdit}
                                            className="h-9 w-9 rounded bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center cursor-pointer"
                                            title="Edit Profile"
                                        >
                                            <TbEdit size={15} />
                                        </button>
                                        <button 
                                            onClick={() => setShowDeleteDialog(true)}
                                            className="h-9 w-9 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:text-white hover:bg-red-500 transition-all flex items-center justify-center cursor-pointer"
                                            title="Delete Lead"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </>
                                )}
                                {isEditing && activeTab === 'profile' && (
                                    <>
                                        <button 
                                            onClick={handleSaveEdit}
                                            disabled={isSaving}
                                            className="px-5 py-2 rounded-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 cursor-pointer"
                                        >
                                            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                                        </button>
                                        <button 
                                            onClick={handleCancelEdit}
                                            className="px-5 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em] cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>

                            <button 
                                onClick={onClose}
                                className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em] cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <ConfirmDeleteDialog
                isOpen={showDeleteDialog}
                title="Delete Contact"
                description={`Are you sure you want to delete ${contact.name}? This action cannot be undone.`}
                isDeleting={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteDialog(false)}
            />

            <ConfirmDeleteDialog
                isOpen={!!pipelineDealToDelete}
                title="Remove from Pipeline"
                description={`Are you sure you want to remove ${contact.name} from the pipeline "${pipelineDealToDelete?.pipeline_name}"?`}
                isDeleting={deletingDealId === pipelineDealToDelete?.deal_id}
                onConfirm={handleConfirmDeletePipelineDeal}
                onCancel={() => setPipelineDealToDelete(null)}
            />

            <AddToCRMModal
                isOpen={showAddToCRM}
                onClose={() => setShowAddToCRM(false)}
                contactCount={1}
                onConfirm={handleConfirmAddToCRM}
            />

            <UpdateFollowUpModal
                event={activeFollowUp}
                isOpen={!!activeFollowUp}
                onClose={() => setActiveFollowUp(null)}
                onSuccess={() => { setActiveFollowUp(null); fetchFollowUps(); fetchLogs(); }}
            />

            <ContactLogs
                isOpen={isLogsDrawerOpen}
                onClose={() => setIsLogsDrawerOpen(false)}
                contact={contact}
            />
        </>
    );
};

export default ContactDetailModal;
