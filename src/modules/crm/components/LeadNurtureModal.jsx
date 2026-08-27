import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, HeartPulse, Search, Check, ChevronRight, ChevronDown, Loader2, ArrowLeft, SlidersHorizontal, Plus } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import Tooltip from '@/components/ui/tooltip';
import RingLoader from '@/components/ui/RingLoader';

const STEPS = [
    { id: 1, title: 'Select Stages', desc: 'Choose source stages' },
    { id: 2, title: 'Target Deals', desc: 'Select deals to transform' },
    { id: 3, title: 'Choose Action', desc: 'Select transform action' },
    { id: 4, title: 'Pipeline Setup', desc: 'Configure target pipeline' }
];

const LeadNurtureModal = ({ isOpen, onClose, pipeline, stages, departments = [], users = [], onPipelineCreated }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedStages, setSelectedStages] = useState([]);
    const [activeTab, setActiveTab] = useState('stages');
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [expandedField, setExpandedField] = useState(null);
    const [fieldValues, setFieldValues] = useState({});
    const [loadingValues, setLoadingValues] = useState(null);
    
    // Step 2 state
    const [isLoadingDeals, setIsLoadingDeals] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false); // only for step 1→2 button
    const [deals, setDeals] = useState([]);
    const [deselectedDealIds, setDeselectedDealIds] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [searchFields, setSearchFields] = useState(['name']);
    const [filterOpen, setFilterOpen] = useState(false);
    const [dealPage, setDealPage] = useState(1);
    const [hasMoreDeals, setHasMoreDeals] = useState(false);
    const [isLoadingMoreDeals, setIsLoadingMoreDeals] = useState(false);
    const [totalDealCount, setTotalDealCount] = useState(0);
    const abortControllerRef = useRef(null);
    
    // Step 3 state
    const [newPipelineName, setNewPipelineName] = useState('');
    const [newPipelineDesc, setNewPipelineDesc] = useState('');
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [transformAction, setTransformAction] = useState('retarget');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [availablePipelines, setAvailablePipelines] = useState([]);
    const [selectedTargetPipeline, setSelectedTargetPipeline] = useState(null);
    const [assignmentType, setAssignmentType] = useState('manual');
    const [selectedSingleUser, setSelectedSingleUser] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressPhase, setProgressPhase] = useState('');
    const [progressCurrent, setProgressCurrent] = useState(0);
    const [progressTotal, setProgressTotal] = useState(0);
    const [error, setError] = useState('');
    const [showDepartments, setShowDepartments] = useState(false);
    const [deptSearchQuery, setDeptSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setSelectedStages([]);
            setDeals([]);
            setDeselectedDealIds(new Set());
            setHasMoreDeals(false);
            setIsLoadingMoreDeals(false);
            setSearchQuery('');
            setDebouncedSearchQuery('');
            setSearchFields(['name']);
            setActiveTab('stages');
            setSelectedFilter(null);
            setExpandedField(null);
            setFieldValues({});
            setLoadingValues(null);
            setFilterOpen(false);
            setDealPage(1);
            setTotalDealCount(0);
            setNewPipelineName('');
            setNewPipelineDesc('');
            setSelectedDepartments([]);
            setTransformAction('retarget');
            setShowCreateForm(false);
            setAvailablePipelines([]);
            setSelectedTargetPipeline(null);
            setAssignmentType('manual');
            setSelectedSingleUser('');
            setError('');
            setIsProcessing(false);
            setProgressPhase('');
            setProgressCurrent(0);
            setProgressTotal(0);
            setShowDepartments(false);
            setDeptSearchQuery('');
        }
    }, [isOpen]);

    const toggleStage = (stageId) => {
        setSelectedStages(prev => 
            prev.includes(stageId) ? prev.filter(id => id !== stageId) : [...prev, stageId]
        );
    };

    const selectValue = (field, value) => {
        setSelectedFilter(prev =>
            prev?.field === field && prev?.value === value ? null : { field, value }
        );
    };

    const fetchFieldValues = async (field) => {
        if (fieldValues[field]) return;
        setLoadingValues(field);
        try {
            const res = await axios.get('/api/contacts/track-field-values/', {
                params: { field, pipeline_id: pipeline?.id }
            });
            setFieldValues(prev => ({ ...prev, [field]: res.data }));
        } catch (err) {
            console.error('Failed to fetch field values:', err);
        } finally {
            setLoadingValues(null);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchDeals = async (search = '', isInitial = false, page = 1, append = false) => {
        if (activeTab === 'stages' && selectedStages.length === 0) return;
        if (activeTab === 'fields' && !selectedFilter) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        if (append) {
            setIsLoadingMoreDeals(true);
        } else {
            setIsLoadingDeals(true);
        }

        try {
            const params = { 
                pipeline: pipeline.id,
                search: search,
                search_by: searchFields.join(','),
                page: page,
                page_size: 50
            };
            if (activeTab === 'stages') {
                params.stages = selectedStages.join(',');
            } else if (selectedFilter) {
                params.additional_field = selectedFilter.field;
                params.additional_value = selectedFilter.value;
            }
            const response = await axios.get("/api/crm/pipeline/", {
                params,
                signal: controller.signal,
            });
            const results = response.data.results || [];

            setDealPage(page);
            setHasMoreDeals(!!response.data.next);
            setTotalDealCount(response.data.count || results.length);

            if (append) {
                setDeals(prev => [...prev, ...results]);
            } else {
                setDeals(results);
                setDeselectedDealIds(new Set());
            }
        } catch (err) {
            if (axios.isCancel(err) || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                return;
            }
            console.error("Failed to fetch deals", err);
            setError("Failed to fetch deals. Please try again.");
        } finally {
            if (abortControllerRef.current === controller) {
                if (append) {
                    setIsLoadingMoreDeals(false);
                } else {
                    setIsLoadingDeals(false);
                }
            }
        }
    };

    const toggleSearchField = (field) => {
        setSearchFields(prev => {
            if (prev.includes(field)) {
                // Prevent deselecting all — keep at least one
                if (prev.length === 1) return prev;
                return prev.filter(f => f !== field);
            }
            return [...prev, field];
        });
    };

    useEffect(() => {
        if (currentStep === 2) {
            fetchDeals(debouncedSearchQuery, false, 1, false);
        }
    }, [searchFields]);

    useEffect(() => {
        if (currentStep === 2) {
            fetchDeals(debouncedSearchQuery, false, 1, false);
        }
    }, [debouncedSearchQuery]);

    useEffect(() => {
        if (currentStep === 3) {
            if (transformAction === 'retarget') {
                axios.get('/api/crm/pipelines/', { params: { pipeline_type: 'retarget' } })
                    .then(res => setAvailablePipelines(res.data.results || res.data || []))
                    .catch(() => {});
            } else if (transformAction === 'move') {
                axios.get('/api/crm/pipelines/', { params: { pipeline_type: 'sales' } })
                    .then(res => setAvailablePipelines(res.data.results || res.data || []))
                    .catch(() => {});
            } else if (transformAction === 'add') {
                axios.get('/api/crm/pipelines/', { params: { pipeline_type: 'sales' } })
                    .then(res => setAvailablePipelines(res.data.results || res.data || []))
                    .catch(() => {});
            } else {
                setAvailablePipelines([]);
            }
        }
    }, [currentStep, transformAction]);

    const handleNext = () => {
        if (currentStep === 1) {
            if (activeTab === 'stages') {
                if (selectedStages.length === 0) {
                    setError("Please select at least one stage.");
                    return;
                }
            } else {
                if (!selectedFilter) {
                    setError("Please select a field value pair.");
                    return;
                }
            }
            setError('');
            setIsTransitioning(true);
            fetchDeals('', true, 1, false).then(() => {
                setCurrentStep(2);
                setIsTransitioning(false);
            }).catch(() => setIsTransitioning(false));
        } else if (currentStep === 2) {
            if (totalDealCount - deselectedDealIds.size === 0) {
                setError("Please select at least one deal.");
                return;
            }
            setError('');
            setCurrentStep(3);
        } else if (currentStep === 3) {
            setError('');
            setCurrentStep(4);
        }
    };

    const toggleDeal = (dealId) => {
        setDeselectedDealIds(prev => {
            const next = new Set(prev);
            if (next.has(dealId)) {
                next.delete(dealId);
            } else {
                next.add(dealId);
            }
            return next;
        });
    };

    const toggleSelectAllDeals = () => {
        if (deselectedDealIds.size > 0) {
            setDeselectedDealIds(new Set());
        } else {
            setDeselectedDealIds(new Set(deals.map(d => d.id)));
        }
    };

    const toggleDepartment = (deptId) => {
        setSelectedDepartments(prev => 
            prev.includes(deptId) ? [] : [deptId]
        );
    };

    const selectedGroupUsers = useMemo(() => {
        if (selectedDepartments.length === 0) return [];
        const deptId = selectedDepartments[0];
        return users.filter(user =>
            user.departments?.some(d => String(d.id) === String(deptId))
        );
    }, [selectedDepartments, users]);

    const filteredDepartments = useMemo(() => {
        if (!deptSearchQuery) return departments;
        return departments.filter(dept =>
            dept.name.toLowerCase().includes(deptSearchQuery.toLowerCase())
        );
    }, [departments, deptSearchQuery]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');

        try {
            // Step 1: Resolve target pipeline (existing or create new)
            let targetPipelineId;
            let createdPipeline;

            if ((transformAction === 'retarget' || transformAction === 'move' || transformAction === 'add') && !showCreateForm) {
                // Use existing pipeline
                if (!selectedTargetPipeline) {
                    setError("Please select a target pipeline.");
                    setIsSubmitting(false);
                    return;
                }
                targetPipelineId = selectedTargetPipeline;
                createdPipeline = availablePipelines.find(p => p.id === targetPipelineId) || { id: targetPipelineId };
            } else {
                // Create new pipeline
                if (!newPipelineName.trim()) {
                    setError("Pipeline name is required.");
                    setIsSubmitting(false);
                    return;
                }
                const pipelinePayload = {
                    name: newPipelineName,
                    description: newPipelineDesc,
                    department_ids: selectedDepartments,
                    assignment_type: assignmentType
                };
                if (transformAction === 'retarget') {
                    pipelinePayload.pipeline_type = 'retarget';
                }
                const pipelineRes = await axios.post("/api/crm/pipelines/", pipelinePayload);
                targetPipelineId = pipelineRes.data.id;
                createdPipeline = pipelineRes.data;
            }

            // Step 2: Process deals in pages
            const totalSelected = totalDealCount - deselectedDealIds.size;
            let processedCount = 0;
            if (totalSelected > 0) {
                setIsProcessing(true);
                setProgressPhase("Processing deals...");
                setProgressTotal(totalSelected);
                setProgressCurrent(0);

                let targetFirstStage = null;
                if (transformAction === 'move') {
                    const stagesRes = await axios.get(`/api/crm/pipelines/${targetPipelineId}/stages/`);
                    const stages = stagesRes.data.results || stagesRes.data || [];
                    targetFirstStage = stages.length > 0 ? stages[0] : null;
                }

                if (transformAction === 'add') {
                    if (!targetPipelineId) {
                        setError("Target pipeline not set. Please try again.");
                        setIsProcessing(false);
                        return;
                    }
                    // Add: uses DB-level exclude_pipeline_id filter — each POST
                    // creates CRM entries in the target pipeline, so the next
                    // GET naturally excludes contacts already in that pipeline
                    let firstCount = 0;
                    while (true) {
                        const submitParams = {
                            pipeline: pipeline.id,
                            page: 1,
                            page_size: 500,
                            exclude_pipeline_id: targetPipelineId
                        };
                        if (activeTab === 'stages') {
                            submitParams.stages = selectedStages.join(',');
                        } else if (selectedFilter) {
                            submitParams.additional_field = selectedFilter.field;
                            submitParams.additional_value = selectedFilter.value;
                        }
                        const res = await axios.get("/api/crm/pipeline/", {
                            params: submitParams
                        });
                        const results = res.data.results || [];
                        if (results.length === 0) break;

                        // Use the filtered total from the first response as the progress total
                        if (firstCount === 0) {
                            firstCount = res.data.count || results.length;
                            setProgressTotal(firstCount);
                        }

                        const selectedFromPage = results.filter(d => !deselectedDealIds.has(d.id));
                        if (selectedFromPage.length === 0) break;

                        // Guard: stop if we've processed more than the filtered total
                        if (firstCount > 0 && processedCount >= firstCount) break;

                        const dealIdsFromPage = selectedFromPage.map(d => d.id);
                        await axios.post("/api/crm/pipeline/bulk-add-to-pipeline/", {
                            pipeline_id: targetPipelineId,
                            deal_ids: dealIdsFromPage
                        });
                        processedCount += dealIdsFromPage.length;
                        setProgressCurrent(processedCount);
                    }
                } else {
                    // Move/Retarget: source drains with each chunk, re-fetch page 1
                    while (true) {
                        const submitParams = {
                            pipeline: pipeline.id,
                            page: 1,
                            page_size: 500
                        };
                        if (activeTab === 'stages') {
                            submitParams.stages = selectedStages.join(',');
                        } else if (selectedFilter) {
                            submitParams.additional_field = selectedFilter.field;
                            submitParams.additional_value = selectedFilter.value;
                        }
                        const res = await axios.get("/api/crm/pipeline/", {
                            params: submitParams
                        });
                        const results = res.data.results || [];
                        if (results.length === 0) break;

                        const selectedFromPage = results.filter(d => !deselectedDealIds.has(d.id));
                        if (selectedFromPage.length === 0) break;

                        const dealIdsFromPage = selectedFromPage.map(d => d.id);
                        const contactIdsFromPage = selectedFromPage.map(d => d.contact);

                        if (transformAction === 'move') {
                            await axios.post("/api/crm/pipeline/bulk-move-deals/", {
                                deal_ids: dealIdsFromPage,
                                pipeline_id: targetPipelineId,
                                stage_id: targetFirstStage?.id || null,
                            });
                        } else {
                            await axios.post("/api/crm/pipeline/bulk-add-contacts/", {
                                pipeline_id: targetPipelineId,
                                contact_ids: contactIdsFromPage,
                                source_pipeline: pipeline.id
                            });
                        }
                        processedCount += dealIdsFromPage.length;
                        setProgressCurrent(processedCount);
                    }
                }
            }

            // Step 3: Auto-assign if strategy is not manual
            if (showCreateForm) {
                // New pipeline: use user's selections
                if (assignmentType !== 'manual' && selectedDepartments.length > 0) {
                    const payload = { strategy: assignmentType };
                    if (assignmentType === 'single_user' && selectedSingleUser) {
                        payload.target_user_id = selectedSingleUser;
                    }
                    await axios.post(`/api/crm/pipelines/${targetPipelineId}/trigger-assignment/`, payload);
                }
            } else {
                // Existing pipeline: use pipeline's own strategy
                const pipelineStrategy = createdPipeline?.assignment_type;
                if (pipelineStrategy && pipelineStrategy !== 'manual' && pipelineStrategy !== 'single_user') {
                    await axios.post(`/api/crm/pipelines/${targetPipelineId}/trigger-assignment/`, {});
                }
            }

            if (onPipelineCreated) {
                onPipelineCreated(createdPipeline);
            }
            onClose();
        } catch (err) {
            console.error("Failed to process deals", err);
            setError("An error occurred during processing.");
            setIsProcessing(false);
        } finally {
            setIsSubmitting(false);
        }
    };



    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={!isSubmitting ? onClose : undefined} />
            
            <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <HeartPulse size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-medium text-white uppercase tracking-wider">Deal Transforms Setup</h2>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
                                Source: <span className="text-blue-400 font-semibold">{pipeline?.name}</span>
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2 text-white/20 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Subheader — Tabs (step 1) / Step Title (steps 2-3) + Step Indicators */}
                <div className="flex items-center justify-between px-8 py-5 bg-zinc-900/30 border-b border-zinc-800 shrink-0">
                    <div className="flex items-center gap-3 shrink-0">
                        {currentStep === 1 ? (
                            <div className="relative flex items-center p-0.5 bg-white/[0.02] border border-white/20 rounded-md">
                                <div
                                    className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded bg-blue-500/20 transition-transform duration-200"
                                    style={{ transform: activeTab === 'fields' ? 'translateX(100%)' : 'translateX(0)' }}
                                />
                                <button
                                    onClick={() => setActiveTab('stages')}
                                    className={cn(
                                        "relative z-10 px-2 py-1.5 rounded text-[9px] font-medium uppercase tracking-[0.2em] cursor-pointer transition-colors",
                                        activeTab === 'stages' ? "text-blue-400" : "text-white/50 hover:text-white/70"
                                    )}
                                >
                                    Select Stages
                                </button>
                                {pipeline?.custom_fields_enabled !== false ? (
                                    <button
                                        onClick={() => setActiveTab('fields')}
                                        className={cn(
                                            "relative z-10 px-2 py-1.5 rounded text-[9px] font-medium uppercase tracking-[0.2em] cursor-pointer transition-colors",
                                            activeTab === 'fields' ? "text-blue-400" : "text-white/50 hover:text-white/70"
                                        )}
                                    >
                                        Select Fields
                                    </button>
                                ) : (
                                    <Tooltip content="Custom field not enabled" className="whitespace-nowrap w-max">
                                        <button className="relative z-10 px-2 py-1.5 rounded text-[9px] font-medium uppercase tracking-[0.2em] text-white/50 cursor-not-allowed">
                                            Select Fields
                                        </button>
                                    </Tooltip>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <h3 className="text-sm font-medium text-white uppercase tracking-wider">{STEPS.find(s => s.id === currentStep)?.title}</h3>
                                {currentStep === 2 && totalDealCount > 0 && (
                                    <p className="text-[10px] text-blue-400 font-medium mt-1">
                                        Total leads: {totalDealCount - deselectedDealIds.size}
                                    </p>
                                )}
                                {currentStep >= 3 && (
                                    <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1 hidden sm:block">
                                        {STEPS.find(s => s.id === currentStep)?.desc}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {isProcessing ? (
                        <div className="w-48 space-y-1.5 shrink-0 ml-4">
                            <p className="text-[10px] text-blue-400 font-medium text-right">{progressPhase}</p>
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                    style={{ width: `${progressTotal > 0 ? (progressCurrent / progressTotal) * 100 : 0}%` }}
                                />
                            </div>
                            <p className="text-[9px] text-white/40 text-right">{progressCurrent} / {progressTotal}</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 shrink-0">
                            {STEPS.map((step, idx) => (
                                <React.Fragment key={step.id}>
                                    <div className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold transition-all duration-500 shrink-0",
                                        currentStep > step.id ? "bg-blue-500 text-white shadow-[0_0_10px rgba(59,130,246,0.3)]" :
                                        currentStep === step.id ? "bg-blue-500/20 border border-blue-500/50 text-blue-400" :
                                        "bg-zinc-900 border border-zinc-800 text-white/20"
                                    )}>
                                        {currentStep > step.id ? <Check size={9} strokeWidth={3} /> : step.id}
                                    </div>
                                    {idx < STEPS.length - 1 && (
                                        <div className="w-4 sm:w-10 h-0.5 bg-zinc-800 rounded-full overflow-hidden shrink-0">
                                            <div className={cn(
                                                "h-full transition-all duration-500 ease-out bg-blue-500 shadow-[0_0_6px rgba(59,130,246,0.5)]",
                                                currentStep > step.id ? "w-full" : "w-0"
                                            )} />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}</div>

                {/* Content */}
                <div className={cn(
                    "flex-1 min-h-0 relative",
                    currentStep === 2 ? "flex flex-col overflow-hidden" : "overflow-y-auto custom-scrollbar"
                )}>
                    {error && (
                        <div className="mx-8 mt-8 mb-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium uppercase tracking-wider text-center">
                            {error}
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="p-8 space-y-6 animate-in slide-in-from-right-4 duration-300">
                            {activeTab === 'stages' ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {stages.map(stage => {
                                        const isSelected = selectedStages.includes(stage.id);
                                        return (
                                            <button
                                                key={stage.id}
                                                onClick={() => toggleStage(stage.id)}
                                                className={cn(
                                                    "p-4 rounded-md border text-left transition-all duration-300 relative overflow-hidden group",
                                                    isSelected 
                                                        ? "bg-blue-500/10 border-blue-500/50" 
                                                        : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity",
                                                    isSelected && "opacity-100 to-blue-500/10"
                                                )} />
                                                <div className="relative flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <span className={cn(
                                                            "text-sm font-medium",
                                                            isSelected ? "text-blue-400" : "text-white/80"
                                                        )}>
                                                            {stage.name}
                                                        </span>
                                                    </div>
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                                        isSelected ? "bg-blue-500 border-blue-500 text-white" : "border-zinc-700 text-transparent"
                                                    )}>
                                                        <Check size={12} strokeWidth={3} />
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {(() => {
                                        const systemFields = ['Name', 'Email', 'Phone'];
                                        const allFields = pipeline?.mandatory_fields || systemFields;
                                        return allFields.map(field => {
                                            const isSystem = systemFields.includes(field);
                                            if (isSystem) {
                                                return (
                                                    <div
                                                        key={field}
                                                        className="p-4 rounded-md border border-zinc-800 bg-zinc-900/10 relative overflow-hidden opacity-40 select-none"
                                                    >
                                                        <div className="relative flex items-center justify-between">
                                                            <span className="text-sm font-medium text-white/40">{field}</span>
                                                            <span className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-semibold">System</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            const hasSelection = selectedFilter?.field === field;
                                            const activeValue = hasSelection ? selectedFilter.value : null;
                                            const isExpanded = expandedField === field;
                                            const values = fieldValues[field];
                                            const isLoading = loadingValues === field;
                                            return (
                                                <div key={field} className={cn(
                                                    "rounded-md border transition-all duration-300 overflow-hidden",
                                                    hasSelection
                                                        ? "border-blue-500/50"
                                                        : "border-zinc-800"
                                                )}>
                                                    <div
                                                        onClick={() => {
                                                            const newExpanded = isExpanded ? null : field;
                                                            setExpandedField(newExpanded);
                                                            if (newExpanded) fetchFieldValues(field);
                                                        }}
                                                        className={cn(
                                                            "p-4 text-left transition-all duration-300 cursor-pointer relative group",
                                                            hasSelection
                                                                ? "bg-blue-500/10"
                                                                : "bg-zinc-900/30 hover:bg-zinc-900/50"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity",
                                                            hasSelection && "opacity-100 to-blue-500/10"
                                                        )} />
                                                        <div className="relative flex items-center justify-between gap-4">
                                                            <span className={cn(
                                                                "text-sm font-medium",
                                                                hasSelection ? "text-blue-400" : "text-white/80"
                                                            )}>
                                                                {field}
                                                            </span>
                                                            <div className="flex items-center gap-3 shrink-0">
                                                                {hasSelection && (
                                                                    <span className="text-[10px] font-mono tabular-nums text-blue-400">1</span>
                                                                )}
                                                                {isLoading && (
                                                                    <span className="text-[10px] font-mono tabular-nums text-white/30">...</span>
                                                                )}
                                                                <ChevronDown size={14} className={cn(
                                                                    "transition-transform duration-200",
                                                                    isExpanded && "rotate-180",
                                                                    hasSelection ? "text-blue-400" : "text-zinc-600"
                                                                )} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isExpanded && (
                                                        <div className="border-t border-zinc-800 bg-zinc-900/20 animate-in slide-in-from-top-1 duration-150">
                                                            {isLoading ? (
                                                                <div className="p-4 flex items-center gap-2">
                                                                    <Loader2 size={12} className="animate-spin text-blue-400" />
                                                                    <span className="text-[10px] text-white/30">Loading values...</span>
                                                                </div>
                                                            ) : values?.values?.length > 0 ? (
                                                                <div className="divide-y divide-zinc-800/50 max-h-[280px] overflow-y-auto custom-scrollbar">
                                                                    {values.values.map((v, i) => {
                                                                        const isValueSelected = activeValue === v.value;
                                                                        return (
                                                                            <div
                                                                                key={i}
                                                                                onClick={() => selectValue(field, v.value)}
                                                                                className={cn(
                                                                                    "flex items-center justify-between gap-4 px-4 py-3 transition-all duration-200 cursor-pointer group hover:bg-white/[0.02]",
                                                                                    isValueSelected && "bg-blue-500/5"
                                                                                )}
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className={cn(
                                                                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                                                                                        isValueSelected ? "border-blue-500" : "border-zinc-700 group-hover:border-zinc-500"
                                                                                    )}>
                                                                                        {isValueSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                                                                    </div>
                                                                                    <span className={cn(
                                                                                        "text-sm",
                                                                                        isValueSelected ? "text-blue-400" : "text-white/70"
                                                                                    )}>{v.value}</span>
                                                                                </div>
                                                                                <span className={cn(
                                                                                    "text-[10px] font-mono tabular-nums shrink-0",
                                                                                    isValueSelected ? "text-blue-400" : "text-white/30"
                                                                                )}>{v.count}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <div className="p-4 text-[10px] text-white/20 text-center">No values found</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300 min-h-0">
                            <div className="z-20 bg-zinc-950/95 backdrop-blur-md flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.5)] shrink-0">
                                <div className="px-8 py-3 shrink-0">
                                    <div className="relative w-full">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                        <Input
                                            placeholder={`Search by ${searchFields.join(', ')}...`}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full h-9 pl-9 pr-10 bg-zinc-900/50 border-zinc-800 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-500/40 text-sm text-white placeholder:text-white/20"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                            <button
                                                onClick={() => setFilterOpen(o => !o)}
                                                className={cn(
                                                    "w-6 h-6 flex items-center justify-center rounded transition-all",
                                                    filterOpen || searchFields.length > 1
                                                        ? "text-blue-400 bg-blue-500/10"
                                                        : "text-white/30 hover:text-white/60"
                                                )}
                                            >
                                                <SlidersHorizontal size={13} />
                                            </button>
                                            {filterOpen && (
                                                <div className="absolute right-0 top-8 z-30 w-40 bg-zinc-900 border border-zinc-700/60 rounded-lg shadow-2xl overflow-hidden">
                                                    <div className="px-3 py-2 border-b border-zinc-800 text-[9px] font-medium uppercase tracking-widest text-white/30">
                                                        Search by
                                                    </div>
                                                    {['name', 'email', 'phone'].map(field => (
                                                        <button
                                                            key={field}
                                                            onClick={() => toggleSearchField(field)}
                                                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.04] transition-colors group"
                                                        >
                                                            <div className={cn(
                                                                "w-3.5 h-3.5 rounded border flex items-center justify-center transition-all shrink-0",
                                                                searchFields.includes(field)
                                                                    ? "bg-blue-500 border-blue-500 text-white"
                                                                    : "border-zinc-600 text-transparent group-hover:border-zinc-400"
                                                            )}>
                                                                <Check size={8} strokeWidth={3} />
                                                            </div>
                                                            <span className={cn(
                                                                "text-[11px] font-medium capitalize",
                                                                searchFields.includes(field) ? "text-white/90" : "text-white/40"
                                                            )}>
                                                                {field}
                                                            </span>
                                                        </button>
                                                    ))}
</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-8 py-3 border-y border-zinc-800/50 bg-black/20 text-[10px] font-medium uppercase tracking-wider text-white/40 items-center">
                                    <div 
                                        className="col-span-1 flex justify-center cursor-pointer group"
                                        onClick={toggleSelectAllDeals}
                                    >
                                        <div className={cn(
                                            "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                            deselectedDealIds.size === 0 && deals.length > 0
                                                ? "bg-blue-500 border-blue-500 text-white" 
                                                : "border-zinc-700 text-transparent group-hover:border-zinc-500"
                                        )}>
                                            <Check size={10} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <div className="col-span-3">Contact Name</div>
                                    <div className="col-span-3">Email</div>
                                    <div className="col-span-3">Phone</div>
                                    <div className="col-span-2">Stage</div>
                                </div>
</div>

                            <div className="flex-1 bg-zinc-900/10 overflow-y-auto custom-scrollbar min-h-0 relative">
                                {isLoadingDeals && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/40 backdrop-blur-[2px]">
                                        <RingLoader />
                                    </div>
                                )}
                                
                                {deals.length === 0 && !isLoadingDeals ? (
                                    <div className="p-8 flex items-center justify-center text-[10px] uppercase tracking-widest text-white/30 font-medium">
                                        No deals found
                                    </div>
                                ) : (
                                    deals.map(deal => {
                                        const isSelected = !deselectedDealIds.has(deal.id);
                                        const stageName = stages.find(s => s.id === deal.stage)?.name || 'Unknown';
                                        return (
                                            <div 
                                                key={deal.id}
                                                onClick={() => toggleDeal(deal.id)}
                                                className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-zinc-800/20 items-center hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                            >
                                                <div className="col-span-1 flex justify-center">
                                                    <div className={cn(
                                                        "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                                        isSelected ? "bg-blue-500 border-blue-500 text-white" : "border-zinc-700 text-transparent group-hover:border-zinc-500"
                                                    )}>
                                                        <Check size={10} strokeWidth={3} />
                                                    </div>
                                                </div>
                                                <div className="col-span-3 flex items-center gap-2 min-w-0">
                                                    <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-white/60 uppercase shrink-0">
                                                        {(deal.contact_details?.name || 'U')[0]}
                                                    </div>
                                                    <span className="text-[10px] font-medium text-white/80 truncate min-w-0">
                                                        {deal.contact_details?.name || 'Unknown'}
                                                    </span>
                                                </div>
                                                <div className="col-span-3 text-[10px] text-white/40 truncate">
                                                    {deal.contact_details?.email || '-'}
                                                </div>
                                                <div className="col-span-3 text-[10px] text-white/40 truncate">
                                                    {deal.contact_details?.phone || '-'}
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="px-2 py-0.5 rounded border border-zinc-700 bg-zinc-900/50 text-[10px] font-medium text-white/60">
                                                        {stageName}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                {hasMoreDeals && (
                                    <div className="px-8 py-4 flex items-center justify-center">
                                        <button
                                            onClick={() => fetchDeals(debouncedSearchQuery, false, dealPage + 1, true)}
                                            disabled={isLoadingMoreDeals}
                                            className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 text-white/50 hover:text-white hover:border-zinc-600 text-[9px] font-medium uppercase tracking-[0.15em] transition-all rounded-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isLoadingMoreDeals ? <Loader2 size={10} className="animate-spin" /> : null}
                                            Load More
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="p-8 space-y-4 animate-in slide-in-from-right-4 duration-300 overflow-y-auto custom-scrollbar">
                            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">Choose Action</p>

                            {/* Retargeting */}
                            <div
                                onClick={() => setTransformAction('retarget')}
                                className={cn(
                                    "p-4 rounded-md border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group",
                                    transformAction === 'retarget'
                                        ? "bg-blue-500/10 border-blue-500/50"
                                        : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                                )}
                            >
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity",
                                    transformAction === 'retarget' && "opacity-100 to-blue-500/10"
                                )} />
                                <div className="relative flex items-start gap-4">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                                        transformAction === 'retarget' ? "border-blue-500" : "border-zinc-700"
                                    )}>
                                        {transformAction === 'retarget' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-sm font-medium",
                                            transformAction === 'retarget' ? "text-blue-400" : "text-white/80"
                                        )}>Retargeting</p>
                                        <p className="text-[10px] text-white/40 mt-1 leading-relaxed">
                                            Move selected deals into a new retarget pipeline with High priority. Contact status changes to "Retarget". Creates activity logs for each moved deal.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Add to Pipeline */}
                            <div
                                onClick={() => setTransformAction('add')}
                                className={cn(
                                    "p-4 rounded-md border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group",
                                    transformAction === 'add'
                                        ? "bg-blue-500/10 border-blue-500/50"
                                        : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                                )}
                            >
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity",
                                    transformAction === 'add' && "opacity-100 to-blue-500/10"
                                )} />
                                <div className="relative flex items-start gap-4">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                                        transformAction === 'add' ? "border-blue-500" : "border-zinc-700"
                                    )}>
                                        {transformAction === 'add' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-sm font-medium",
                                            transformAction === 'add' ? "text-blue-400" : "text-white/80"
                                        )}>Add to Pipeline</p>
                                        <p className="text-[10px] text-white/40 mt-1 leading-relaxed">
                                            Add the contact into the pipeline without altering the contact's current pipeline deals. Creates new CRM entries preserving contact info.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Move to Pipeline */}
                            <div
                                onClick={() => setTransformAction('move')}
                                className={cn(
                                    "p-4 rounded-md border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group",
                                    transformAction === 'move'
                                        ? "bg-blue-500/10 border-blue-500/50"
                                        : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                                )}
                            >
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity",
                                    transformAction === 'move' && "opacity-100 to-blue-500/10"
                                )} />
                                <div className="relative flex items-start gap-4">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                                        transformAction === 'move' ? "border-blue-500" : "border-zinc-700"
                                    )}>
                                        {transformAction === 'move' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-sm font-medium",
                                            transformAction === 'move' ? "text-blue-400" : "text-white/80"
                                        )}>Move to Pipeline</p>
                                        <p className="text-[10px] text-white/40 mt-1 leading-relaxed">
                                            Move the deal to a new pipeline. The deal's CRM entry is updated — same CRM ID preserved. assigned_user is reset.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="p-8 space-y-4 animate-in slide-in-from-right-4 duration-300 overflow-y-auto custom-scrollbar">
                            {/* Pipeline Name & Target */}
                            {transformAction !== 'add' ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider">Available {transformAction === 'retarget' ? 'Retarget' : 'Sales'} Pipelines: {availablePipelines.filter(p => p.id !== pipeline.id).length}</label>
                                        <button
                                            type="button"
                                            onClick={() => { setShowCreateForm(true); setSelectedTargetPipeline(null); }}
                                            className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium uppercase tracking-wider transition-all cursor-pointer bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                                        >
                                            <Plus size={12} />
                                            New
                                        </button>
                                    </div>
                                    {showCreateForm ? (
                                        <div className="space-y-3 p-4 rounded-lg border border-blue-500/30 bg-blue-500/[0.03]">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] text-blue-400 uppercase tracking-wider font-medium">New {transformAction === 'retarget' ? 'Retarget' : 'Sales'} Pipeline</span>
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowCreateForm(false); setNewPipelineName(''); setNewPipelineDesc(''); setSelectedDepartments([]); setAssignmentType('manual'); setSelectedSingleUser(''); setShowDepartments(false); }}
                                                    className="text-white/30 hover:text-white cursor-pointer"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                <Input
                                                    value={newPipelineName}
                                                    onChange={e => setNewPipelineName(e.target.value)}
                                                    className="h-8 bg-zinc-900/50 border-zinc-800 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-500/40 text-xs text-white"
                                                    placeholder={transformAction === 'retarget' ? 'RETARGET PIPELINE' : 'SALES PIPELINE'}
                                                />
                                                <textarea
                                                    value={newPipelineDesc}
                                                    onChange={e => setNewPipelineDesc(e.target.value)}
                                                    className="w-full h-16 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2.5 text-xs text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none custom-scrollbar"
                                                    placeholder="Optional description..."
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <><div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-4">
                                            <div className="max-h-[176px] overflow-y-auto custom-scrollbar pr-2">
                                            {availablePipelines.filter(p => p.id !== pipeline.id).length === 0 ? (
                                                <div className="py-6 text-center text-[10px] text-white/20 uppercase tracking-wider">
                                                    No {transformAction === 'retarget' ? 'retarget' : 'sales'} pipelines found.
                                                    <br />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCreateForm(true)}
                                                        className="text-blue-400 hover:text-blue-300 mt-1 inline-block"
                                                    >
                                                        Create one
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-[9px] text-white/30 uppercase tracking-wider pb-1">{availablePipelines.filter(p => p.id !== pipeline.id).length} pipeline{availablePipelines.filter(p => p.id !== pipeline.id).length !== 1 ? 's' : ''}</div>
                                                    <div className="grid grid-cols-2 gap-2">                                                    {availablePipelines.filter(p => p.id !== pipeline.id).map(p => {
                                                        const isCustomFieldsEnabled = p.custom_fields_enabled === true;
                                                        const isDisabled = isCustomFieldsEnabled;
                                                        const pipelineItem = (
                                                            <div
                                                                key={p.id}
                                                                onClick={isDisabled ? undefined : () => { setSelectedTargetPipeline(p.id); setShowCreateForm(false); setNewPipelineName(p.name); setNewPipelineDesc(p.description || ''); setSelectedDepartments([]); setAssignmentType('manual'); setSelectedSingleUser(''); setShowDepartments(false); }}
                                                                className={cn(
                                                                    "flex items-center justify-between px-3 py-2.5 rounded-md border transition-all",
                                                                    isDisabled
                                                                        ? "opacity-70 cursor-not-allowed bg-zinc-900/40 border-zinc-700/40 select-none"
                                                                        : "cursor-pointer hover:border-zinc-700",
                                                                    !isDisabled && selectedTargetPipeline === p.id
                                                                        ? "bg-blue-500/10 border-blue-500/30"
                                                                        : !isDisabled && "bg-zinc-900/30 border-zinc-800"
                                                                )}
                                                            >
                                                                <span className={cn("text-xs font-medium truncate", isDisabled ? "text-white/60" : selectedTargetPipeline === p.id ? "text-blue-400" : "text-white/70")}>{p.name}</span>
                                                                <div className={cn(
                                                                    "w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ml-2",
                                                                    isDisabled ? "border-zinc-600/60" : selectedTargetPipeline === p.id ? "bg-blue-500 border-blue-500" : "border-zinc-700"
                                                                )}>
                                                                    {!isDisabled && selectedTargetPipeline === p.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                </div>
                                                            </div>
                                                        );
                                                        if (isDisabled) {
                                                            return (
                                                                <Tooltip key={p.id} content={<>Cannot select <span className="text-orange-400">custom field</span> enabled pipeline</>}>
                                                                    {pipelineItem}
                                                                </Tooltip>
                                                            );
                                                        }
                                                        return pipelineItem;
                                                    })}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                <div className="px-4 py-2.5 rounded-lg border border-blue-500/20 bg-blue-500/5" style={{ display: selectedTargetPipeline && (transformAction === 'retarget' || transformAction === 'move') ? undefined : 'none' }}>
                                    <span className="text-xs text-blue-400/80 leading-relaxed">
                                        Assignment rules can be modified in the pipeline's user assignment configuration.
                                    </span>
                                </div>
                                <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.03] overflow-hidden" style={{ display: selectedTargetPipeline && (transformAction === 'retarget' || transformAction === 'move') ? undefined : 'none' }}>
                                    <div className="px-4 py-2.5 border-b border-blue-500/10 bg-blue-500/5">
                                        <span className="text-[9px] text-blue-400 uppercase tracking-wider font-medium">Selected Pipeline Configuration</span>
                                    </div>
                                    <div className="px-4 py-2.5 flex items-center justify-between">
                                        <span className="text-[9px] text-white/40 uppercase tracking-wider">Group</span>
                                        <span className="text-[10px] text-blue-400 font-medium">{availablePipelines.find(p => p.id === selectedTargetPipeline)?.departments?.map(d => d.name).join(', ') || 'None'}</span>
                                    </div>
                                    <div className="px-4 py-2.5 border-t border-blue-500/10 flex items-center justify-between">
                                        <span className="text-[9px] text-white/40 uppercase tracking-wider">Assignment</span>
                                        <span className="text-[10px] text-white/70 capitalize">{availablePipelines.find(p => p.id === selectedTargetPipeline)?.assignment_type?.replace(/_/g, ' ') || 'Manual'}</span>
                                    </div>
                                </div></>
                            )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider">Available Sales Pipelines: {availablePipelines.filter(p => p.id !== pipeline.id).length}</label>
                                        <button
                                            type="button"
                                            onClick={() => { setShowCreateForm(true); setSelectedTargetPipeline(null); }}
                                            className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium uppercase tracking-wider transition-all cursor-pointer bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                                        >
                                            <Plus size={12} />
                                            New
                                        </button>
                                    </div>
                                    {showCreateForm ? (
                                        <div className="space-y-3 p-4 rounded-lg border border-blue-500/30 bg-blue-500/[0.03]">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] text-blue-400 uppercase tracking-wider font-medium">New Sales Pipeline</span>
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowCreateForm(false); setNewPipelineName(''); setNewPipelineDesc(''); setSelectedDepartments([]); setAssignmentType('manual'); setSelectedSingleUser(''); setShowDepartments(false); }}
                                                    className="text-white/30 hover:text-white cursor-pointer"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                <Input
                                                    value={newPipelineName}
                                                    onChange={e => setNewPipelineName(e.target.value)}
                                                    className="h-8 bg-zinc-900/50 border-zinc-800 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-500/40 text-xs text-white"
                                                    placeholder="SALES PIPELINE"
                                                />
                                                <textarea
                                                    value={newPipelineDesc}
                                                    onChange={e => setNewPipelineDesc(e.target.value)}
                                                    className="w-full h-16 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2.5 text-xs text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none custom-scrollbar"
                                                    placeholder="Optional description..."
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <><div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-4">
                                            <div className="max-h-[176px] overflow-y-auto custom-scrollbar pr-2">
                                            {availablePipelines.filter(p => p.id !== pipeline.id).length === 0 ? (
                                                <div className="py-6 text-center text-[10px] text-white/20 uppercase tracking-wider">
                                                    No sales pipelines found.
                                                    <br />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCreateForm(true)}
                                                        className="text-blue-400 hover:text-blue-300 mt-1 inline-block"
                                                    >
                                                        Create one
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-[9px] text-white/30 uppercase tracking-wider pb-1">{availablePipelines.filter(p => p.id !== pipeline.id).length} pipeline{availablePipelines.filter(p => p.id !== pipeline.id).length !== 1 ? 's' : ''}</div>
                                                    <div className="grid grid-cols-2 gap-2">                                                    {availablePipelines.filter(p => p.id !== pipeline.id).map(p => {
                                                        const isCustomFieldsEnabled = p.custom_fields_enabled === true;
                                                        const isDisabled = isCustomFieldsEnabled;
                                                        const pipelineItem = (
                                                            <div
                                                                key={p.id}
                                                                onClick={isDisabled ? undefined : () => { setSelectedTargetPipeline(p.id); setShowCreateForm(false); setNewPipelineName(p.name); setNewPipelineDesc(p.description || ''); setSelectedDepartments([]); setAssignmentType('manual'); setSelectedSingleUser(''); setShowDepartments(false); }}
                                                                className={cn(
                                                                    "flex items-center justify-between px-3 py-2.5 rounded-md border transition-all",
                                                                    isDisabled
                                                                        ? "opacity-70 cursor-not-allowed bg-zinc-900/40 border-zinc-700/40 select-none"
                                                                        : "cursor-pointer hover:border-zinc-700",
                                                                    !isDisabled && selectedTargetPipeline === p.id
                                                                        ? "bg-blue-500/10 border-blue-500/30"
                                                                        : !isDisabled && "bg-zinc-900/30 border-zinc-800"
                                                                )}
                                                            >
                                                                <span className={cn("text-xs font-medium truncate", isDisabled ? "text-white/60" : selectedTargetPipeline === p.id ? "text-blue-400" : "text-white/70")}>{p.name}</span>
                                                                <div className={cn(
                                                                    "w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ml-2",
                                                                    isDisabled ? "border-zinc-600/60" : selectedTargetPipeline === p.id ? "bg-blue-500 border-blue-500" : "border-zinc-700"
                                                                )}>
                                                                    {!isDisabled && selectedTargetPipeline === p.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                </div>
                                                            </div>
                                                        );
                                                        if (isDisabled) {
                                                            return (
                                                                <Tooltip key={p.id} content={<>Cannot select <span className="text-orange-400">custom field</span> enabled pipeline</>}>
                                                                    {pipelineItem}
                                                                </Tooltip>
                                                            );
                                                        }
                                                        return pipelineItem;
                                                    })}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                <div className="px-4 py-2.5 rounded-lg border border-blue-500/20 bg-blue-500/5" style={{ display: selectedTargetPipeline ? undefined : 'none' }}>
                                    <span className="text-xs text-blue-400/80 leading-relaxed">
                                        Assignment rules can be modified in the pipeline's user assignment configuration.
                                    </span>
                                </div>
                                <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.03] overflow-hidden" style={{ display: selectedTargetPipeline ? undefined : 'none' }}>
                                    <div className="px-4 py-2.5 border-b border-blue-500/10 bg-blue-500/5">
                                        <span className="text-[9px] text-blue-400 uppercase tracking-wider font-medium">Selected Pipeline Configuration</span>
                                    </div>
                                    <div className="px-4 py-2.5 flex items-center justify-between">
                                        <span className="text-[9px] text-white/40 uppercase tracking-wider">Group</span>
                                        <span className="text-[10px] text-blue-400 font-medium">{availablePipelines.find(p => p.id === selectedTargetPipeline)?.departments?.map(d => d.name).join(', ') || 'None'}</span>
                                    </div>
                                    <div className="px-4 py-2.5 border-t border-blue-500/10 flex items-center justify-between">
                                        <span className="text-[9px] text-white/40 uppercase tracking-wider">Assignment</span>
                                        <span className="text-[10px] text-white/70 capitalize">{availablePipelines.find(p => p.id === selectedTargetPipeline)?.assignment_type?.replace(/_/g, ' ') || 'Manual'}</span>
                                    </div>
                                </div></>
                            )}
                            </div>
                            )}

                            {/* Assignment — only when creating a new pipeline */}
                            <div className="space-y-3 pt-2" style={{ display: showCreateForm ? undefined : 'none' }}>
                                <div className="flex items-center gap-3">
                                    <label className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-medium">Assign Group</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowDepartments(prev => !prev)}
                                        className={cn(
                                            "relative w-8 h-4 rounded-full transition-colors duration-200 shrink-0",
                                            showDepartments ? "bg-blue-500" : "bg-zinc-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200",
                                            showDepartments ? "translate-x-[16px]" : "translate-x-0.5"
                                        )} />
                                    </button>
                                    {selectedDepartments.length > 0 && (
                                        <span className="text-[10px] text-blue-400 font-medium">{departments.find(d => d.id === selectedDepartments[0])?.name}</span>
                                    )}
                                </div>
                                {showDepartments && (
                                    <div className="border border-zinc-800 rounded-lg overflow-hidden">
                                        <div className="px-3 py-2 border-b border-zinc-800/50 bg-black/20">
                                            <Input
                                                placeholder="Search departments..."
                                                value={deptSearchQuery}
                                                onChange={(e) => setDeptSearchQuery(e.target.value)}
                                                className="w-full h-7 pl-2 bg-transparent border-0 focus-visible:ring-0 text-xs text-white placeholder:text-white/20"
                                            />
                                        </div>
                                        <div className="overflow-y-auto custom-scrollbar max-h-28">
                                            {filteredDepartments.length === 0 ? (
                                                <div className="py-4 text-center text-[10px] text-white/20 uppercase tracking-wider font-medium">No departments found</div>
                                            ) : (
                                                filteredDepartments.map(dept => {
                                                    const isSelected = selectedDepartments.includes(dept.id);
                                                    return (
                                                        <button key={dept.id} type="button" onClick={() => toggleDepartment(dept.id)}
                                                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/[0.02] transition-colors border-b border-zinc-800/20 last:border-b-0"
                                                        >
                                                            <span className={cn("text-xs font-medium", isSelected ? "text-blue-400" : "text-white/70")}>{dept.name}</span>
                                                            <div className={cn("w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0", isSelected ? "bg-blue-500 border-blue-500" : "border-zinc-700")}>
                                                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedDepartments.length > 0 && (
                                <div className="space-y-2 pt-1">
                                    <p className="text-[9px] text-blue-400/70 uppercase tracking-wider font-medium">Assignment Strategy</p>
                                    <div className="space-y-1.5">
                                        <button type="button" onClick={() => { setAssignmentType('single_user'); setSelectedSingleUser(''); }}
                                            className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left", assignmentType === 'single_user' ? "bg-blue-500/10 border-blue-500/30" : "bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/50")}
                                        >
                                            <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0", assignmentType === 'single_user' ? "border-blue-500" : "border-zinc-700")}>
                                                {assignmentType === 'single_user' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                            </div>
                                            <div>
                                                <p className={cn("text-xs font-medium", assignmentType === 'single_user' ? "text-blue-400" : "text-white/80")}>Single User</p>
                                                <p className="text-[9px] text-white/40 mt-0.5">Assign all leads to one user in this group</p>
                                            </div>
                                        </button>
                                        {assignmentType === 'single_user' && selectedGroupUsers.length > 0 && (
                                            <div className="pl-8 space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                                                {selectedGroupUsers.map(user => (
                                                    <button key={user.id} type="button" onClick={() => setSelectedSingleUser(user.id)}
                                                        className={cn("w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-all text-left", selectedSingleUser === user.id ? "bg-blue-500/10 border border-blue-500/20" : "hover:bg-white/[0.02] border border-transparent")}
                                                    >
                                                        <div className={cn("w-3 h-3 rounded-full border-2 flex items-center justify-center shrink-0", selectedSingleUser === user.id ? "border-blue-500" : "border-zinc-700")}>
                                                            {selectedSingleUser === user.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                                        </div>
                                                        <span className="text-xs text-white/70 truncate">{user.first_name} {user.last_name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <button type="button" onClick={() => setAssignmentType('round_robin')}
                                            className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left", assignmentType === 'round_robin' ? "bg-blue-500/10 border-blue-500/30" : "bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/50")}
                                        >
                                            <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0", assignmentType === 'round_robin' ? "border-blue-500" : "border-zinc-700")}>
                                                {assignmentType === 'round_robin' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                            </div>
                                            <div>
                                                <p className={cn("text-xs font-medium", assignmentType === 'round_robin' ? "text-blue-400" : "text-white/80")}>Round Robin</p>
                                                <p className="text-[9px] text-white/40 mt-0.5">Evenly distribute leads across all users in this group</p>
                                            </div>
                                        </button>
                                    </div>
                                 </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-between shrink-0">
                    {isProcessing ? (
                        <div className="w-full text-center">
                            <p className="text-[10px] text-white/40">Processing, please wait...</p>
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={() => {
                                    if (currentStep > 1) {
                                        setCurrentStep(prev => prev - 1);
                                        setError('');
                                    } else {
                                        onClose();
                                    }
                                }}
                                disabled={isSubmitting || isLoadingDeals}
                                className="px-6 h-9 bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em] rounded-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {currentStep > 1 ? (
                                    <><ArrowLeft size={12} /> <span className="leading-none mt-[1px]">Back</span></>
                                ) : <span className="leading-none mt-[1px]">Cancel</span>}
                            </button>

                            {currentStep < 4 ? (
                                <button 
                                    onClick={handleNext}
                                    disabled={isTransitioning}
                                    className="px-6 h-9 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 text-[10px] font-medium uppercase tracking-[0.2em] transition-all rounded-sm cursor-pointer shadow-[0_0_15px rgba(59,130,246,0.15)] flex items-center justify-center gap-2"
                                >
                                    {isTransitioning ? <Loader2 size={12} className="animate-spin" /> : <span className="leading-none mt-[1px]">Next Step</span>}
                                    {!isTransitioning && <ChevronRight size={12} />}
                                </button>
                            ) : (
                                <button 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || isProcessing}
                                    className="px-6 h-9 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 text-[10px] font-medium uppercase tracking-[0.2em] transition-all rounded-sm cursor-pointer shadow-[0_0_15px rgba(59,130,246,0.15)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting || isProcessing ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                                    <span className="leading-none mt-[1px]">{isProcessing ? "Processing..." : "Confirm"}</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LeadNurtureModal;