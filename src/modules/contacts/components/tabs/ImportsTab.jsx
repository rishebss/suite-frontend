import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileInput, Calendar, MoreVertical, Download, GitMerge, Trash2 } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import RingLoader from '@/components/ui/RingLoader';
import AddToCRMModal from '../AddToCRMModal';

const ImportsTab = ({ onViewBatch }) => {
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openMenu, setOpenMenu] = useState(null);
    const [batchToDelete, setBatchToDelete] = useState(null);
    const [deleteProgress, setDeleteProgress] = useState(null);
    const [batchForCRM, setBatchForCRM] = useState(null);

    useEffect(() => {
        axios.get('/api/contacts/batches/')
            .then(res => setBatches(res.data.results || res.data))
            .catch(() => setBatches([]))
            .finally(() => setIsLoading(false));
    }, []);

    const handleDeleteBatch = async () => {
        if (!batchToDelete) return;
        const CHUNK_SIZE = 1500;
        const batch = batchToDelete;
        const total = batch.contact_count;

        if (total === 0) {
            try {
                await axios.delete(`/api/contacts/batches/${batch.id}/`);
                setBatches(prev => prev.filter(b => b.id !== batch.id));
            } catch (err) {
                console.error('Delete failed:', err);
                alert(err.response?.data?.detail || err.response?.data?.error || 'Failed to delete import batch.');
            } finally {
                setBatchToDelete(null);
            }
            return;
        }

        setDeleteProgress({ phase: 'Deleting contacts...', current: 0, total });

        try {
            for (let i = 0; i < total; i += CHUNK_SIZE) {
                const res = await axios.post(`/api/contacts/batches/${batch.id}/delete-chunk/`, {
                    limit: CHUNK_SIZE,
                });
                const current = Math.min(i + CHUNK_SIZE, total);
                setDeleteProgress({ phase: 'Deleting contacts...', current, total });
                if (res.data.remaining === 0) break;
            }
            setBatches(prev => prev.filter(b => b.id !== batch.id));
            setBatchToDelete(null);
        } catch (err) {
            console.error('Delete failed:', err);
            alert(err.response?.data?.detail || err.response?.data?.error || 'Failed to delete import batch.');
        } finally {
            setDeleteProgress(null);
        }
    };

    const handleAddToCRM = async (pipelineId, stageId, onProgress) => {
        if (!batchForCRM) return;
        const CHUNK_SIZE = 1500;
        try {
            // Fetch all contact IDs for the batch
            onProgress({ phase: 'Fetching contacts...', current: 0, total: 0 });
            const res = await axios.get(`/api/contacts/?batch=${batchForCRM.id}&page_size=50000`);
            const contacts = res.data.results || res.data;
            const allIds = contacts.map(c => c.id);
            const total = allIds.length;
            const totalChunks = Math.ceil(total / CHUNK_SIZE);

            onProgress({ phase: 'Adding to CRM...', current: 0, total });

            for (let i = 0; i < totalChunks; i++) {
                const chunk = allIds.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
                await axios.post('/api/crm/pipeline/bulk-add-contacts/', {
                    pipeline_id: pipelineId,
                    contact_ids: chunk,
                });
                onProgress({
                    phase: 'Adding to CRM...',
                    current: Math.min((i + 1) * CHUNK_SIZE, total),
                    total,
                });
            }
            // Only reached if all chunks succeeded
        } catch (err) {
            console.error('Failed to add to CRM:', err);
            throw err;
        }
    };

    useEffect(() => {
        const handler = () => setOpenMenu(null);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    if (isLoading) return (
        <div className="flex-1 flex items-center justify-center">
            <RingLoader />
        </div>
    );

    if (batches.length === 0) return (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-zinc-800 flex items-center justify-center text-white/10 mb-4">
                <FileInput size={26} />
            </div>
            <p className="text-sm text-white/20">No imports yet</p>
            <p className="text-xs text-white/10 mt-1">Use the Import button to upload contacts</p>
        </div>
    );

    return (
        <>
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
            <div className="grid grid-cols-3 gap-4">
                {batches.map(batch => (
                    <div
                        key={batch.id}
                        onClick={() => onViewBatch(batch)}
                        className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:border-blue-500/30 hover:bg-zinc-900/60 transition-all cursor-pointer group relative"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-all">
                                <FileInput size={18} />
                            </div>
                            <div className="relative" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === batch.id ? null : batch.id); }}
                                    className="p-1.5 rounded-lg text-white/20 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <MoreVertical size={15} />
                                </button>
                                {openMenu === batch.id && (
                                    <div className="absolute right-0 top-full mt-1 w-44 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl z-[200] overflow-hidden py-1">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setBatchForCRM(batch); setOpenMenu(null); }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                                        >
                                            <GitMerge size={13} className="text-blue-400" />
                                            Add to CRM
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                                        >
                                            <Download size={13} className="text-green-400" />
                                            Export
                                        </button>
                                        <div className="my-1 border-t border-zinc-800" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setBatchToDelete(batch); setOpenMenu(null); }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                                            <Trash2 size={13} />
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate mb-3">
                            {batch.name}
                        </h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-white/30">
                                <Calendar size={11} />
                                <span className="text-xs">{new Date(batch.created_at).toLocaleDateString()}</span>
                            </div>
                            <span className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded-full">
                                {batch.contact_count} contacts
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <ConfirmDeleteDialog
            isOpen={!!batchToDelete}
            title="Delete Import"
            description={`This will permanently delete "${batchToDelete?.name}" and all ${batchToDelete?.contact_count} contacts within it.`}
            progress={deleteProgress}
            onConfirm={handleDeleteBatch}
            onCancel={() => setBatchToDelete(null)}
        />

        <AddToCRMModal
            isOpen={!!batchForCRM}
            onClose={() => setBatchForCRM(null)}
            onConfirm={handleAddToCRM}
            onSuccess={(pipelineId) => {
                localStorage.setItem('crm_selected_pipeline_id', pipelineId);
                navigate('/crm');
            }}
            contactCount={batchForCRM?.contact_count || 0}
        />
        </>
    );
};

export default ImportsTab;
