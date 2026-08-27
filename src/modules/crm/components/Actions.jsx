import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Layout, 
    Layers, 
    Activity, 
    Users, 
    CreditCard, 
    ChevronRight 
} from 'lucide-react';
import { TbTransform } from 'react-icons/tb';
import { cn } from '@/lib/utils';
import CreatePipelineModal from './CreatePipelineModal';
import ManageStageModal from './ManageStageModal';
import UserPipelineManager from './UserPipelineManager';
import LeadSettingsModal from './LeadSettingsModal';
import LeadNurtureModal from './LeadNurtureModal';
import PaymentActionsModal from './PaymentActionsModal';

const ActionCard = ({ icon: Icon, title, description, colorClass, pipelineName, badgeText, onClick, disabled = false, hoverText }) => {
    const handleClick = () => {
        if (disabled) return;
        onClick?.();
    };

    return (
        <button
            onClick={handleClick}
            className="group relative flex flex-col items-start p-6 rounded-xl transition-all duration-300 text-left overflow-hidden active:scale-[0.98] cursor-pointer bg-gradient-to-b from-[#1a1a1a] via-[#111111] to-[#0a0a0a] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_8px_30px_-4px_rgba(0,0,0,0.8)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_12px_40px_-4px_rgba(0,0,0,0.9),0_0_20px_rgba(139,92,246,0.06)]"
        >
                {/* Glass Border */}
                <div className="absolute inset-0 rounded-xl border border-white/[0.07] pointer-events-none" />
                <div className="absolute inset-0 rounded-xl border border-transparent opacity-0 group-hover:border-white/[0.12] group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* Top Gloss Reflection Strip */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent rounded-t-xl" />

                {/* Bottom Edge Highlight */}
                <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

                {/* Ambient Background Glow */}
                <div className="absolute -right-8 -top-8 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-white pointer-events-none" />

                <div className="w-full flex items-start justify-between mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110 bg-gradient-to-b from-white/[0.07] to-transparent border border-white/[0.08] text-white/80">
                        <Icon size={24} />
                    </div>

                    <div className="flex items-center gap-2">
                        {pipelineName && (
                            <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-medium text-white/40 uppercase tracking-[0.2em]">
                                {pipelineName}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2 flex-1 relative z-10">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-white">{title}</h3>
                    <p className="text-xs text-white/40 leading-relaxed font-medium">
                        {description}
                    </p>
                </div>

                <div className="mt-6 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors relative z-10">
                    {badgeText ? (
                        <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-medium text-white/40 uppercase tracking-[0.2em]">{badgeText}</span>
                    ) : hoverText ? (
                        <>
                            <span className="group-hover:hidden text-white/30 group-hover:text-white/60">Configure</span>
                            <span className="hidden group-hover:inline text-red-400/70 group-hover:text-red-300">Client pipelines only</span>
                            <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform text-white/30" />
                        </>
                    ) : (
                        <>
                            <span className="text-white/30 group-hover:text-white/60">Configure</span>
                            <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform text-white/30" />
                        </>
                    )}
                </div>
            </button>
    );
};

const Actions = ({ selectedPipeline, pipelines, stages, departments = [], users = [], onPipelineCreated, onPipelineDeleted, onPipelineUpdated, onPipelineUpdatedForUsers, onStagesChanged }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isManageStageOpen, setIsManageStageOpen] = useState(false);
    const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);
    const [isLeadSettingsOpen, setIsLeadSettingsOpen] = useState(false);
    const [isLeadNurtureOpen, setIsLeadNurtureOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const isClientPipeline = selectedPipeline?.pipeline_type === 'clients';
    const [activeRule, setActiveRule] = useState(null);
    useEffect(() => {
        if (!selectedPipeline?.id || !isClientPipeline) { setActiveRule(null); return; }
        axios.get('/api/payments/schedules/', { params: { pipeline: selectedPipeline.id } }).then(r => {
            const list = r.data.results || r.data || [];
            const active = list.find(s => s.status === 'active') || list[0] || null;
            setActiveRule(active);
        }).catch(() => setActiveRule(null));
    }, [selectedPipeline?.id, isClientPipeline, isPaymentOpen]);
    const actionItems = [
        {
            id: 'manage-pipeline',
            icon: Layout,
            title: "Manage Pipeline",
            description: "Configure sales funnels, conversion stages, and global pipeline logic.",
            hideBadge: true,
            onClick: () => setIsCreateModalOpen(true)
        },
        {
            id: 'manage-stage',
            icon: Layers,
            title: "Manage Stage",
            description: "Define Kanban columns, probability weights, and stage-gate requirements.",
            onClick: () => setIsManageStageOpen(true)
        },
        {
            id: 'manage-users',
            icon: Users,
            title: "Manage Users",
            description: "Assign territory permissions, role-based access, and seat management.",
            onClick: () => setIsUserManagerOpen(true)
        },
        {
            id: 'lead-settings',
            icon: Activity,
            title: "Lead Settings",
            description: "Customize deal outcome labels, lost reasons, and win state parameters.",
            onClick: () => setIsLeadSettingsOpen(true)
        },
        {
            id: 'lead-nurture',
            icon: TbTransform,
            title: "Deal Transforms",
            description: "Set up drip sequences, automated follow-ups, and engagement scoring.",
            onClick: () => setIsLeadNurtureOpen(true)
        },
        {
            id: 'manage-payment',
            icon: CreditCard,
            title: "Payment Actions",
            description: isClientPipeline ? "Record one-time or recurring revenue for this client pipeline." : "Available only for Client pipelines.",
            disabled: !isClientPipeline,
            hoverText: !isClientPipeline ? "Client pipelines only" : null,
            onClick: () => isClientPipeline && setIsPaymentOpen(true),
            badgeText: isClientPipeline && activeRule ? `₹${parseFloat(activeRule.amount).toLocaleString('en-IN', {minimumFractionDigits:2})} × ${activeRule.cycle_count}` : null,
        }
    ];

    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {actionItems.map((item, idx) => (
                    <ActionCard
                        key={item.id}
                        {...item}
                        pipelineName={item.hideBadge ? null : selectedPipeline?.name}
                    />
                ))}
            </div>

            <CreatePipelineModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)}
                pipelines={pipelines}
                onSuccess={(newPipeline) => {
                    if (onPipelineCreated) onPipelineCreated(newPipeline);
                }}
                onDelete={onPipelineDeleted}
                onUpdate={onPipelineUpdated}
            />

            <ManageStageModal
                isOpen={isManageStageOpen}
                onClose={() => setIsManageStageOpen(false)}
                pipeline={selectedPipeline}
                stages={stages}
                onStagesChanged={onStagesChanged}
            />

            <UserPipelineManager
                isOpen={isUserManagerOpen}
                onClose={() => setIsUserManagerOpen(false)}
                departments={departments}
                users={users}
                pipelines={pipelines}
                selectedPipeline={selectedPipeline}
                onPipelineUpdated={onPipelineUpdatedForUsers}
            />

            <LeadSettingsModal
                isOpen={isLeadSettingsOpen}
                onClose={() => setIsLeadSettingsOpen(false)}
                pipeline={selectedPipeline}
                onSave={onPipelineUpdated}
            />

            <LeadNurtureModal
                isOpen={isLeadNurtureOpen}
                onClose={() => setIsLeadNurtureOpen(false)}
                pipeline={selectedPipeline}
                stages={stages}
                departments={departments}
                users={users}
                onPipelineCreated={(newPipeline) => {
                    if (onPipelineCreated) onPipelineCreated(newPipeline);
                }}
            />
            <PaymentActionsModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} pipeline={selectedPipeline} />
        </div>
    );
};

export default Actions;

