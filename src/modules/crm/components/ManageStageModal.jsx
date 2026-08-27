import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Layers, Loader2, Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const COLOR_OPTIONS = [
    { value: 'blue',   bg: 'bg-blue-500',   ring: 'ring-blue-400' },
    { value: 'purple', bg: 'bg-purple-500', ring: 'ring-purple-400' },
    { value: 'amber',  bg: 'bg-amber-500',  ring: 'ring-amber-400' },
    { value: 'orange', bg: 'bg-orange-500', ring: 'ring-orange-400' },
    { value: 'green',  bg: 'bg-green-500',  ring: 'ring-green-400' },
    { value: 'red',    bg: 'bg-red-500',    ring: 'ring-red-400' },
    { value: 'pink',   bg: 'bg-pink-500',   ring: 'ring-pink-400' },
    { value: 'cyan',   bg: 'bg-cyan-500',   ring: 'ring-cyan-400' },
];

const SortableStageItem = ({ stage, onEdit, onDelete, isDeleting, colorDot }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stage.id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group px-8 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-default",
                isDragging && "bg-white/[0.05] border-t border-b border-zinc-700"
            )}
        >
            <div className="flex items-center gap-3">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/40 transition-colors">
                    <GripVertical size={16} />
                </div>
                <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", colorDot?.bg || 'bg-blue-500')} />
                <div className="space-y-0.5">
                    <h3 className="text-sm font-medium text-white uppercase tracking-wider">{stage.name}</h3>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Order {stage.order}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(stage)}
                    className="p-2 rounded-md hover:bg-blue-500/10 text-zinc-600 hover:text-blue-400 transition-colors cursor-pointer"
                    title="Edit"
                >
                    <Pencil size={18} />
                </button>
                <button
                    onClick={() => onDelete(stage.id)}
                    disabled={isDeleting === stage.id}
                    className="p-2 rounded-md hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete"
                >
                    {isDeleting === stage.id
                        ? <Loader2 size={18} className="animate-spin" />
                        : <Trash2 size={18} />
                    }
                </button>
            </div>
        </div>
    );
};

const ManageStageModal = ({ isOpen, onClose, pipeline, stages: initialStages, onStagesChanged }) => {
    const [stages, setStages] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingStage, setEditingStage] = useState(null);
    const [name, setName] = useState('');
    const [color, setColor] = useState('blue');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(null);
    const [error, setError] = useState('');
    const [activeId, setActiveId] = useState(null);
    const [isReordering, setIsReordering] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (isOpen && pipeline && initialStages) {
            setStages(initialStages);
            setShowForm(false);
            setError('');
        }
    }, [isOpen, pipeline, initialStages]);

    useEffect(() => {
        if (!showForm) {
            setName('');
            setColor('blue');
            setEditingStage(null);
            setError('');
        }
    }, [showForm]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setIsSubmitting(true);
        setError('');
        try {
            if (editingStage) {
                const res = await axios.patch(
                    `/api/crm/pipelines/${pipeline.id}/stages/${editingStage.id}/`,
                    { name: name.trim(), color }
                );
                setStages(prev => prev.map(s => s.id === editingStage.id ? res.data : s));
            } else {
                const res = await axios.post(
                    `/api/crm/pipelines/${pipeline.id}/stages/`,
                    { name: name.trim(), color, order: stages.length }
                );
                setStages(prev => [...prev, res.data]);
            }
            onStagesChanged?.();
            setShowForm(false);
        } catch (err) {
            console.error('Stage creation error:', err.response?.data || err.message);
            setError(`Failed to ${editingStage ? 'update' : 'create'} stage. ${err.response?.data?.detail || err.response?.data || 'Please try again.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        setIsDeleting(id);
        try {
            await axios.delete(`/api/crm/pipelines/${pipeline.id}/stages/${id}/`);
            setStages(prev => prev.filter(s => s.id !== id));
            onStagesChanged?.();
        } catch (err) {
            setError('Failed to delete stage.');
        } finally {
            setIsDeleting(null);
        }
    };

    const startEdit = (stage) => {
        setEditingStage(stage);
        setName(stage.name);
        setColor(stage.color);
        setShowForm(true);
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        console.log('Drag end:', { active, over });

        if (over && active.id !== over.id) {
            setStages((prevItems) => {
                const oldIndex = prevItems.findIndex((item) => item.id === active.id);
                const newIndex = prevItems.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(prevItems, oldIndex, newIndex);

                const updatedItems = newItems.map((stage, index) => ({
                    ...stage,
                    order: index
                }));

                const updatedStages = updatedItems.map((stage) => ({
                    id: stage.id,
                    order: stage.order
                }));

                console.log('Saving reorder:', updatedStages);

                setIsReordering(true);
                axios.post(`/api/crm/pipelines/${pipeline.id}/stages/reorder/`, updatedStages)
                    .then((response) => {
                        console.log('Reorder saved successfully:', response);
                        onStagesChanged?.();
                    })
                    .catch((err) => {
                        console.error('Reorder failed:', err.response?.data || err);
                        setError('Failed to reorder stages.');
                    })
                    .finally(() => {
                        setIsReordering(false);
                    });

                return updatedItems;
            });
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-medium text-white uppercase tracking-wider">Stage Manager</h2>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">{pipeline?.name}</p>
                        </div>
                    </div>
                    {isReordering && (
                        <div className="flex items-center gap-2 text-blue-400">
                            <Loader2 size={14} className="animate-spin" />
                            <span className="text-[10px] uppercase tracking-widest">Saving...</span>
                        </div>
                    )}
                </div>

                {/* Sub-Header: Add button */}
                {!showForm && (
                    <div className="px-8 py-4 border-b border-zinc-800 flex items-center justify-end bg-zinc-900/10 shrink-0">
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 rounded-md text-[10px] font-medium uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap"
                        >
                            <Plus size={14} />
                            Add 
                        </button>
                    </div>
                )}

                {/* Form sub-header: Cancel */}
                {showForm && (
                    <div className="px-8 py-4 border-b border-zinc-800 flex justify-end bg-zinc-900/10 shrink-0">
                        <button
                            onClick={() => setShowForm(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 text-white/60 hover:text-white rounded-md text-[10px] font-medium uppercase tracking-widest transition-all cursor-pointer"
                        >
                            <X size={14} />
                            Cancel
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                    {showForm ? (
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="space-y-2">
                                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
                                    {editingStage ? 'Edit Stage Name' : 'Stage Name'}
                                </label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Discovery"
                                    className="bg-white/5 border-zinc-800 h-12 text-sm text-white placeholder:text-white/10 focus:border-blue-500/40 focus:ring-0 focus-visible:ring-0 outline-none transition-all font-medium rounded-md"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    {COLOR_OPTIONS.map(c => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => setColor(c.value)}
                                            className={cn(
                                                "w-7 h-7 rounded-full transition-all",
                                                c.bg,
                                                color === c.value ? `ring-2 ring-offset-2 ring-offset-zinc-950 ${c.ring}` : 'opacity-50 hover:opacity-100'
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            {error && <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>}

                            <div className="pt-4 pb-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !name.trim()}
                                    className="w-full h-12 bg-blue-500/10 hover:bg-blue-500/20 disabled:bg-zinc-900/50 disabled:text-white/10 disabled:border-zinc-800/50 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 disabled:text-white/20 font-medium text-[10px] uppercase tracking-[0.3em] rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (
                                        <>
                                            <Layers size={14} />
                                            {editingStage ? 'Update Stage' : 'Save Stage'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="max-h-[320px] overflow-y-auto custom-scrollbar divide-y divide-zinc-800/50">
                            {stages.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">No stages configured</p>
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={stages.map(s => s.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {stages.map((stage) => {
                                            const colorDot = COLOR_OPTIONS.find(c => c.value === stage.color);
                                            return (
                                                <SortableStageItem
                                                    key={stage.id}
                                                    stage={stage}
                                                    onEdit={startEdit}
                                                    onDelete={handleDelete}
                                                    isDeleting={isDeleting}
                                                    colorDot={colorDot}
                                                />
                                            );
                                        })}
                                    </SortableContext>
                                    <DragOverlay>
                                        {activeId ? (
                                            <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-4 opacity-90">
                                                {(() => {
                                                    const stage = stages.find(s => s.id === activeId);
                                                    const colorDot = COLOR_OPTIONS.find(c => c.value === stage?.color);
                                                    return stage ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn("w-2.5 h-2.5 rounded-full", colorDot?.bg || 'bg-blue-500')} />
                                                            <span className="text-sm font-medium text-white uppercase tracking-wider">{stage.name}</span>
                                                        </div>
                                                    ) : null;
                                                })()}
                                            </div>
                                        ) : null}
                                    </DragOverlay>
                                </DndContext>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-between shrink-0">
                    <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest">
                        {stages.length} {stages.length === 1 ? 'Stage' : 'Stages'} Configured
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-[9px] font-medium text-white/40 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 uppercase tracking-widest transition-all rounded-md cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    , document.body);
};

export default ManageStageModal;
