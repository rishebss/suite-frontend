import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Upload, Search, Rocket, Plus, UserPlus, ChevronDown, Filter, X, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import Button from '@/components/Button';
import ImportModal from '../components/ImportModal';
import AddContactModal from '../components/AddContactModal';
import ContactsTable from '../components/tabs/ContactsTable';
import ImportsTab from '../components/tabs/ImportsTab';
import RingLoader from '@/components/ui/RingLoader';
import AddToCRMModal from '../components/AddToCRMModal';
import { useAuth } from '@/context/AuthContext';

const TABS = { CONTACTS: 'contacts', IMPORTS: 'imports' };

const Contacts = () => {
    const { user } = useAuth();
    const isAdmin = ["Superadmin", "Admin"].includes(user?.role) || user?.is_superuser;

    // Guard: reset to contacts tab if user is not an admin
    useEffect(() => {
        if (!isAdmin) {
            setActiveTab(TABS.CONTACTS);
        }
    }, [isAdmin]);

    const [activeTab, setActiveTab] = useState(TABS.CONTACTS);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
    const [isAddToCRMModalOpen, setIsAddToCRMModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedIds, setSelectedIds] = useState([]);
    const [isAddingToCRM, setIsAddingToCRM] = useState(false);
    const [importBatches, setImportBatches] = useState([]);
    const [selectedFilterBatch, setSelectedFilterBatch] = useState(null);
    const [filterSearchQuery, setFilterSearchQuery] = useState('');
    const [isFilterSearching, setIsFilterSearching] = useState(false);
    const filterDebounceRef = useRef(null);
    const filterInputRef = useRef(null);
    const totalBatchesRef = useRef(0);
    const [filterOpen, setFilterOpen] = useState(false);

    const fetchBatches = (search = '') => {
        const url = search ? `/api/contacts/batches/?search=${encodeURIComponent(search)}` : '/api/contacts/batches/';
        return axios.get(url).then(res => {
            const data = res.data.results || res.data || [];
            setImportBatches(data);
            return data;
        }).catch(() => setImportBatches([]));
    };

    useEffect(() => {
        if (activeTab === TABS.CONTACTS) {
            fetchBatches().then(data => {
                totalBatchesRef.current = (data || []).length;
            });
        }
    }, [activeTab]);

    const handleFilterSearchChange = (e) => {
        const val = e.target.value;
        setFilterSearchQuery(val);
        if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current);
        filterDebounceRef.current = setTimeout(() => {
            setIsFilterSearching(true);
            fetchBatches(val).finally(() => setIsFilterSearching(false));
        }, 300);
    };

    const clearFilterSearch = () => {
        setFilterSearchQuery('');
        setIsFilterSearching(true);
        fetchBatches('').finally(() => setIsFilterSearching(false));
    };

    const showFilterSearch = totalBatchesRef.current > 10;

    const clearBatchFilter = () => {
        setSelectedFilterBatch(null);
        setSelectedIds([]);
        setRefreshKey(k => k + 1);
    };

    const selectBatchFilter = (batch) => {
        setSelectedFilterBatch(batch);
        setSelectedIds([]);
        setRefreshKey(k => k + 1);
    };

    const handleImportSuccess = () => {
        setIsImportModalOpen(false);
        setActiveTab(TABS.IMPORTS);
        setRefreshKey(k => k + 1);
    };

    const handleAddToCRM = async (pipelineId, stageId) => {
        if (selectedIds.length === 0 || !stageId) return;
        setIsAddingToCRM(true);
        try {
            const promises = selectedIds.map(id => 
                axios.post('/api/crm/pipeline/', { 
                    contact: id,
                    stage: stageId,
                    pipeline: pipelineId
                })
            );
            await Promise.all(promises);
            setSelectedIds([]);
        } catch (err) {
            console.error('Failed to add to CRM:', err);
            alert('Failed to add some contacts to CRM.');
        } finally {
            setIsAddingToCRM(false);
        }
    };

    return (
        <div className="flex flex-col bg-black h-full">
            <header className="px-10 py-8 flex justify-between items-center border-b border-white/5 relative z-20 bg-black/50 backdrop-blur-xl shrink-0">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-semibold text-white">Contacts</h1>
                    <p className="text-sm text-white/40">Your customer repository</p>
                </div>
            </header>

            <main className="flex-1 px-10 pt-5 pb-10 relative z-10 overflow-hidden flex flex-col gap-4 min-h-0">
                <div className="flex items-center justify-between shrink-0 pb-4">
                    <div className="relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md">
                        <div 
                            className={cn(
                                "absolute inset-y-0 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out z-0",
                                activeTab === TABS.CONTACTS 
                                    ? "left-0 w-1/2 rounded-l rounded-r-none bg-blue-500/20" 
                                    : "left-1/2 w-1/2 rounded-r rounded-l-none bg-blue-500/20"
                            )}
                        />
                        {[TABS.CONTACTS, TABS.IMPORTS].map(tab => {
                            const isImportsTab = tab === TABS.IMPORTS;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        if (isImportsTab && !isAdmin) return;
                                        setActiveTab(tab); 
                                        setSelectedBatch(null); 
                                        setSearchQuery(''); 
                                        setSelectedIds([]);
                                    }}
                                    title={isImportsTab && !isAdmin ? "Only admins can access imports" : undefined}
                                    className={cn(
                                        "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
                                        activeTab === tab ? "text-blue-400" : "text-white/50",
                                        isImportsTab && !isAdmin && "opacity-40 cursor-not-allowed",
                                        isImportsTab && isAdmin && !(activeTab === tab) && "hover:text-white/80",
                                        !isImportsTab && !(activeTab === tab) && "hover:text-white/80"
                                    )}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "relative overflow-hidden transition-all duration-300 ease-in-out",
                            activeTab === TABS.CONTACTS ? "w-52 opacity-100" : "w-0 opacity-0 pointer-events-none"
                        )}>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={13} />
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 h-8 w-52 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-all"
                            />
                        </div>
                        <div className={cn(
                            "overflow-hidden transition-all duration-300 ease-in-out",
                            selectedIds.length > 0 ? "max-w-[220px] mr-0" : "max-w-0 mr-0"
                        )}>
                            <div style={{
                                opacity: selectedIds.length > 0 ? 1 : 0,
                                transition: 'opacity 200ms ease-in-out',
                                transitionDelay: selectedIds.length > 0 ? '250ms' : '0ms',
                            }}>
                                <button
                                    onClick={() => setIsAddToCRMModalOpen(true)}
                                    disabled={isAddingToCRM}
                                    className="px-4 h-8 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 text-[10px] font-medium uppercase tracking-[0.2em] transition-all rounded-sm cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isAddingToCRM ? <RingLoader size="1.2em" /> : <Rocket size={12} />}
                                    Add to CRM ({selectedIds.length})
                                </button>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="!h-8 px-3 flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white/60 hover:bg-white/10 transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed" disabled={!isAdmin} title={!isAdmin ? "Only admins can import contacts" : undefined}>
                                <Plus size={12} className="opacity-60" />
                                Add
                                <ChevronDown size={10} className="opacity-40" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-40 mt-1 bg-zinc-900 rounded-lg" align="end">
                                <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => setIsAddContactModalOpen(true)}>
                                    <UserPlus size={13} className="mr-2 opacity-50" />
                                    Create
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => setIsImportModalOpen(true)}>
                                    <Upload size={13} className="mr-2 opacity-50" />
                                    Import
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu open={filterOpen} onOpenChange={(open) => { setFilterOpen(open); if (!open) { setFilterSearchQuery(''); setIsFilterSearching(false); fetchBatches(''); } }}>
                                    <DropdownMenuTrigger className={cn("h-8 w-8 flex items-center justify-center border rounded-lg transition-all cursor-pointer outline-none", selectedFilterBatch ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10")}>
                                        <Filter size={14} />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} className="w-56 mt-1 bg-zinc-900 rounded-lg border border-zinc-800 p-1.5" align="end">
                                        <div className="px-2 py-1.5 text-[9px] font-medium text-white/30 uppercase tracking-widest">Filter by Import</div>
                                        {selectedFilterBatch && (
                                            <>
                                                <DropdownMenuItem onClick={clearBatchFilter} className="cursor-pointer text-xs text-blue-400 hover:bg-blue-500/10 rounded flex items-center gap-2">
                                                    <X size={12} />
                                                    Clear filter
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-zinc-800 my-1" />
                                            </>
                                        )}
                                        {showFilterSearch && (
                                            <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 p-1.5">
                                                <div className="relative flex items-center" onPointerDown={(e) => e.stopPropagation()}>
                                                    <Search size={12} className="absolute left-2.5 text-white/30 pointer-events-none" />
                                                    <input
                                                        ref={filterInputRef}
                                                        type="text"
                                                        value={filterSearchQuery}
                                                        onChange={handleFilterSearchChange}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                        placeholder="Search imports..."
                                                        className="w-full h-8 bg-white/5 border border-white/10 rounded pl-7 pr-7 text-[10px] text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
                                                    />
                                                    {isFilterSearching ? (
                                                        <Loader2 size={12} className="absolute right-2 text-blue-400 animate-spin pointer-events-none" />
                                                    ) : filterSearchQuery ? (
                                                        <button onClick={clearFilterSearch} className="absolute right-2 text-white/30 hover:text-white cursor-pointer">
                                                            <X size={12} />
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </div>
                                        )}
                                        <div className="max-h-[288px] overflow-y-auto custom-scrollbar">
                                            {importBatches.length === 0 ? (
                                                <div className="px-2 py-3 text-[10px] text-white/20 text-center">No imports found</div>
                                            ) : (
                                                importBatches.map(batch => (
                                                    <DropdownMenuItem
                                                        key={batch.id}
                                                        onClick={() => { selectBatchFilter(batch); setFilterOpen(false); }}
                                                        className={cn("cursor-pointer text-xs py-2 rounded flex items-center justify-between", selectedFilterBatch?.id === batch.id ? "bg-blue-500/10 text-blue-400" : "text-white/70 hover:bg-white/5")}
                                                    >
                                                        <span className="truncate">{batch.name}</span>
                                                        <span className="text-[9px] text-white/30 shrink-0 ml-2">{batch.contact_count}</span>
                                                    </DropdownMenuItem>
                                                ))
                                            )}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                {activeTab === TABS.CONTACTS && (
                    <ContactsTable 
                        key={refreshKey} 
                        batchId={selectedFilterBatch?.id}
                        searchQuery={searchQuery} 
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                    />
                )}
                {activeTab === TABS.IMPORTS && !selectedBatch && (
                    <ImportsTab key={refreshKey} onViewBatch={(batch) => setSelectedBatch(batch)} />
                )}
                {activeTab === TABS.IMPORTS && selectedBatch && (
                    <ContactsTable
                        batchId={selectedBatch.id}
                        batchName={selectedBatch.name}
                        onBack={() => setSelectedBatch(null)}
                        searchQuery={searchQuery}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                    />
                )}
            </main>

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={handleImportSuccess}
            />

            <AddContactModal
                isOpen={isAddContactModalOpen}
                onClose={() => setIsAddContactModalOpen(false)}
                onSuccess={() => { setIsAddContactModalOpen(false); setRefreshKey(k => k + 1); }}
            />

            <AddToCRMModal
                isOpen={isAddToCRMModalOpen}
                onClose={() => setIsAddToCRMModalOpen(false)}
                contactCount={selectedIds.length}
                onConfirm={handleAddToCRM}
            />
        </div>
    );
};

export default Contacts;
