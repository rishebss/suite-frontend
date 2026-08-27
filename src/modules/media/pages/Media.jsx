import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Image as ImageIcon,
  Play,
  FileText,
  Music,
  Archive,
  Loader,
  AlertCircle,
  FolderOpen,
  Upload,
  Trash2,
  Pin,
  PinOff,
  Plus,
  MoreHorizontal,
  LayoutGrid,
  Download,
  X,
  Maximize2,
  RotateCcw,
  CheckSquare,
  Search,
  User,
  Users,
  ExternalLink,
  UserCheck,
} from 'lucide-react';
import Button from '@/components/Button';
import ConfirmModal from '@/components/ui/confirm-modal';
import UploadQueuePanel from '../components/UploadQueuePanel';
import UndoToast from '../components/UndoToast';
import CollectionGroupPanel from '../components/CollectionGroupPanel';
import CreateCollectionDialog from '../components/CreateCollectionDialog';
import UploadAssetDialog from '../components/UploadAssetDialog';
import CreatorGroupPanel from '../components/CreatorGroupPanel';
import { useAuth } from '@/context/AuthContext';
import { useCollections, useCollectionActions, useAssets, useAssetUpload } from '../hooks/useMedia';
import { mediaApi } from '../api/mediaApi';

const FILE_TYPE_ICONS = {
  image: ImageIcon,
  video: Play,
  document: FileText,
  audio: Music,
  other: Archive,
};

const FILE_TYPE_COLORS = {
  image: 'text-blue-400 bg-blue-500/10',
  video: 'text-purple-400 bg-purple-500/10',
  document: 'text-yellow-400 bg-yellow-500/10',
  audio: 'text-green-400 bg-green-500/10',
  other: 'text-white/30 bg-white/5',
};

const TABS = [
  { id: null, label: 'All', icon: LayoutGrid },
  { id: 'image', label: 'Images', icon: ImageIcon },
  { id: 'video', label: 'Videos', icon: Play },
  { id: 'document', label: 'Documents', icon: FileText },
];

const TAB_ACCEPT = {
  ALL: null,
  image: 'image/*',
  video: 'video/*',
  document: '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json,.xml,.html,.md',
};

const Media = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Superadmin' || user?.role === 'Admin' || user?.is_superuser;

  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCreatorPanel, setShowCreatorPanel] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [feedback, setFeedback] = useState(null);
  const feedbackTimer = useRef(null);
  const fileInputRef = useRef(null);
  const emptyFileInputRef = useRef(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const searchTimerRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchInput]);

  // Group permissions panel state
  const [groupPanelCollection, setGroupPanelCollection] = useState(null);

  // Tabs & preview state
  const [activeTab, setActiveTab] = useState(null);
  const [previewAsset, setPreviewAsset] = useState(null);

  // Confirmation modal state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null, // 'delete-collection' | 'delete-asset'
    title: '',
    message: '',
    data: null,
  });

  const showConfirm = (type, data, name) => {
    if (type === 'delete-collection') {
      setConfirmDialog({
        open: true,
        type,
        title: `Delete "${name}"?`,
        message: `This will soft-delete the collection "${name}" and all ${data.asset_count || 'its'} assets. You can undo this within 15 seconds.`,
        data,
      });
    } else if (type === 'delete-asset') {
      setConfirmDialog({
        open: true,
        type,
        title: 'Delete this asset?',
        message: `Are you sure you want to delete "${name}"? You can undo this within 15 seconds.`,
        data,
      });
    }
  };

  const handleConfirmClose = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false }));
    setTimeout(() => {
      setConfirmDialog({ open: false, type: null, title: '', message: '', data: null });
    }, 200);
  };

  const handleConfirmAction = async () => {
    const { type, data } = confirmDialog;
    if (type === 'delete-collection') {
      await handleDeleteCollection(data.id);
    } else if (type === 'delete-asset') {
      await handleDeleteAsset(data.id);
    }
    handleConfirmClose();
  };

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  const showFeedback = (message, isError = true) => {
    setFeedback({ message, isError });
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 3000);
  };

  const { collections, canCreate, loading: collectionsLoading, refetch: refetchCollections } = useCollections();
  const { togglePin, rename, deleteCollection, createCollection, mutating } = useCollectionActions();
  const { assets, count, loading: assetsLoading, error: assetsError, refetch: refetchAssets } = useAssets(
    selectedCollection
      ? { collection_id: selectedCollection, ...(searchQuery ? { search: searchQuery } : {}) }
      : {}
  );
  const {
    queue,
    enqueue,
    retry: retryUpload,
    clearCompleted,
    active: uploading,
    uploadingItem,
    totalItems,
    completedItems,
    overallProgress,
    sizeErrors,
  } = useAssetUpload();

  // Undo toast state
  const [undoToast, setUndoToast] = useState(null);
  const undoRef = useRef(null);

  const showUndoToast = (itemName, itemType, onUndo) => {
    const id = Date.now();
    undoRef.current = id;
    setUndoToast({ id, itemName, itemType, onUndo });
  };

  const dismissUndoToast = (id) => {
    if (undoRef.current === id) {
      setUndoToast(null);
      undoRef.current = null;
    }
  };

  // Batch select & deleted view state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showingDeleted, setShowingDeleted] = useState(false);
  const [deletedAssets, setDeletedAssets] = useState([]);
  const [deletedLoading, setDeletedLoading] = useState(false);

  const toggleSelected = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAssets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAssets.map((a) => a.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await mediaApi.batchDeleteAssets(Array.from(selectedIds));
      showFeedback(`${selectedIds.size} asset${selectedIds.size > 1 ? 's' : ''} deleted.`, false);
      setSelectedIds(new Set());
      refetchAssets();
      refetchCollections();
    } catch (err) {
      showFeedback('Failed to delete assets.');
    }
  };

  const toggleShowDeleted = useCallback(async (collectionId) => {
    if (showingDeleted && selectedCollection === collectionId) {
      setShowingDeleted(false);
      setDeletedAssets([]);
      return;
    }
    setShowingDeleted(true);
    setSelectedCollection(collectionId);
    setDeletedLoading(true);
    try {
      const res = await mediaApi.listAssets({ collection_id: collectionId, is_deleted: true });
      setDeletedAssets(res.data.data?.results || []);
    } catch {
      setDeletedAssets([]);
    } finally {
      setDeletedLoading(false);
    }
  }, [showingDeleted, selectedCollection]);

  // Filter assets by active tab
  const filteredAssets = activeTab
    ? assets.filter((a) => a.file_type === activeTab)
    : assets;

  const pinnedCollections = collections.filter((c) => c.is_pinned);
  const unpinnedCollections = collections.filter((c) => !c.is_pinned);
  const currentCollection = collections.find((c) => c.id === selectedCollection);
  const currentAccept = activeTab ? TAB_ACCEPT[activeTab] : TAB_ACCEPT.ALL;

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length || !selectedCollection) return;
    enqueue(files, selectedCollection);
    e.target.value = '';
  };

  const handleDialogUpload = (file, sourceEntityId) => {
    enqueue([file], selectedCollection, sourceEntityId);
  };

  const prevCompletedRef = useRef(completedItems);
  useEffect(() => {
    if (completedItems > prevCompletedRef.current) {
      refetchAssets();
      refetchCollections();
    }
    prevCompletedRef.current = completedItems;
  }, [completedItems, refetchAssets, refetchCollections]);

  const handleCreateCollection = async ({ name, description, entity_type }) => {
    const result = await createCollection({ name, description, entity_type });
    if (result.success) {
      setSelectedCollection(result.data.id);
      refetchCollections();
      showFeedback('Collection created.', false);
    } else {
      showFeedback(result.message || 'Failed to create collection.');
    }
  };

  const handleTogglePin = async (id, currentlyPinned) => {
    const result = await togglePin(id, !currentlyPinned);
    if (result.success) {
      refetchCollections();
    } else {
      showFeedback(result.message || 'Failed to update pin.');
    }
  };

  const handleDeleteCollection = async (id) => {
    const collection = collections.find((c) => c.id === id);
    const result = await deleteCollection(id);
    if (result.success) {
      if (selectedCollection === id) setSelectedCollection(null);
      refetchCollections();
      showUndoToast(
        collection?.name || 'Collection',
        'collection',
        async () => {
          try {
            await mediaApi.restoreCollection(id);
            refetchCollections();
            refetchAssets();
            showFeedback('Collection restored.', false);
          } catch {
            showFeedback('Failed to restore collection.');
          }
        }
      );
    } else {
      showFeedback(result.message || 'Failed to delete collection.');
    }
  };

  const handleRename = async (id) => {
    const name = editName.trim();
    if (!name) return;
    const result = await rename(id, name);
    if (result.success) {
      setEditingId(null);
      setEditName('');
      refetchCollections();
      showFeedback('Collection renamed.', false);
    } else {
      showFeedback(result.message || 'Failed to rename.');
    }
  };

  const handleDeleteAsset = async (assetId) => {
    try {
      await mediaApi.deleteAsset(assetId);
      const asset = assets.find((a) => a.id === assetId);
      refetchAssets();
      refetchCollections();
      if (previewAsset?.id === assetId) setPreviewAsset(null);
      showUndoToast(
        asset?.file_name || 'Asset',
        'asset',
        async () => {
          try {
            await mediaApi.restoreAsset(assetId);
            refetchAssets();
            refetchCollections();
            showFeedback('Asset restored.', false);
          } catch {
            showFeedback('Failed to restore asset.');
          }
        }
      );
    } catch (err) {
      showFeedback('Failed to delete asset.');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setPreviewAsset(null);
    };
    if (previewAsset) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [previewAsset]);

  return (
    <div className="flex flex-col h-full">

      {/* ===== Full-width Header ===== */}
      <header className="px-10 pt-8 pb-0 flex justify-between items-end border-b border-white/5 relative z-20 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {currentCollection ? currentCollection.name : 'Media'}
          </h1>
          <p className="text-sm mb-4 text-white/40 font-medium">
            {filteredAssets.length > 0
              ? `${filteredAssets.length} asset${filteredAssets.length !== 1 ? 's' : ''}${
                  activeTab ? ` (${count} total)` : ''
                }`
              : selectedCollection
                ? 'No assets in this collection.'
                : 'Select a collection to view its assets.'}
          </p>
        </div>

        <div className="flex items-center gap-3 pb-8">
          {selectedCollection && (
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={"Search by " + (currentCollection?.entity_type === 'contact' ? 'contact name' : currentCollection?.entity_type === 'staff' ? 'staff name' : 'file name') + "..."}
                className="w-56 bg-white/5 border border-white/10 rounded-full pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-white/30 hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}
          {selectedCollection && (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  const coll = collections.find((c) => c.id === selectedCollection);
                  if (coll && coll.entity_type && coll.entity_type !== 'generic') {
                    setShowUploadDialog(true);
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                disabled={uploading}
                className="w-auto px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                {uploading ? (
                  <Loader size={14} className="animate-spin mr-2" />
                ) : (
                  <Upload size={14} className="mr-2" />
                )}
                {uploading ? 'Uploading...' : 'Upload Assets'}
              </Button>
              <span className="text-[9px] text-white/20 font-medium">Max 10 MB per file</span>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={currentAccept}
                multiple
                onChange={handleFileUpload}
              />
              <UploadQueuePanel
                queue={queue}
                onRetry={retryUpload}
                onClearCompleted={clearCompleted}
                totalItems={totalItems}
                completedItems={completedItems}
                active={uploading}
              />
            </>
          )}
        </div>
      </header>

      {/* ===== Below header: sidebar + content ===== */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ===== Sidebar ===== */}
        <aside className="w-64 shrink-0 border-r border-white/5 flex flex-col bg-black/40">
          <div className="px-4 pt-6 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2 px-2">
              <FolderOpen size={14} className="text-white/30" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-white/30">Collections</h2>
            </div>
            <div className="mt-2.5 px-2 space-y-2">
              {canCreate ? (
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/15 text-xs text-white/50 hover:text-white hover:border-white/30 hover:bg-white/[0.06] transition-all"
                >
                  <Plus size={14} />
                  <span className="font-semibold">New Collection</span>
                </button>
              ) : (
                <p className="text-[9px] text-white/20 text-center px-2 py-1">
                  You don't have permission to create collections
                </p>
              )}
              {isAdmin && (
                <button
                  onClick={() => setShowCreatorPanel(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-xs text-white/40 hover:text-white hover:bg-white/5 transition-all"
                >
                  <UserCheck size={13} />
                  <span className="font-semibold">Manage Creators</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar py-2 px-2 space-y-1">
            {collectionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader size={16} className="text-white/20 animate-spin" />
              </div>
            ) : collections.length === 0 ? (
              <p className="text-[11px] text-white/20 text-center py-12 px-4">
                No collections yet.
                <br />
                Create one below.
              </p>
            ) : (
              <>
                {pinnedCollections.length > 0 && (
                  <div className="mb-3">
                    <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">
                      Pinned
                    </div>
                    {pinnedCollections.map((c) => (
                      <CollectionItem
                        key={c.id}
                        collection={c}
                        currentUserId={user?.id}
                        isAdmin={isAdmin}
                        isSelected={selectedCollection === c.id}
                        onSelect={setSelectedCollection}
                        onTogglePin={handleTogglePin}
                        onRename={handleRename}
                        onShowConfirm={showConfirm}
                        onShowDeleted={toggleShowDeleted}
                        showingDeleted={showingDeleted}
                        editingId={editingId}
                        setEditingId={setEditingId}
                        editName={editName}
                        setEditName={setEditName}
                        mutating={mutating}
                        onOpenGroupPanel={setGroupPanelCollection}
                      />
                    ))}
                  </div>
                )}
                <div>
                  {pinnedCollections.length > 0 && (
                    <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">
                      All Collections
                    </div>
                  )}
                  {unpinnedCollections.map((c) => (
                    <CollectionItem
                      key={c.id}
                      collection={c}
                      currentUserId={user?.id}
                      isAdmin={isAdmin}
                      isSelected={selectedCollection === c.id}
                      onSelect={setSelectedCollection}
                      onTogglePin={handleTogglePin}
                      onRename={handleRename}
                      onShowConfirm={showConfirm}
                      onShowDeleted={toggleShowDeleted}
                      showingDeleted={showingDeleted}
                      editingId={editingId}
                      setEditingId={setEditingId}
                      editName={editName}
                      setEditName={setEditName}
                      mutating={mutating}
                      onOpenGroupPanel={setGroupPanelCollection}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>

        {/* ===== Main Content ===== */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {selectedCollection && assets.length > 0 && (
          <div className="px-10 pt-4 pb-0 flex gap-1 border-b border-white/5">
            {TABS.map((tab) => {
              const TabIcon = tab.icon;
              const tabCount = tab.id
                ? assets.filter((a) => a.file_type === tab.id).length
                : assets.length;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                  }`}
                >
                  <TabIcon size={14} />
                  {tab.label}
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                    isActive ? 'bg-white/15 text-white/60' : 'bg-white/5 text-white/20'
                  }`}>
                    {tabCount}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {sizeErrors.length > 0 && (
          <div className="fixed top-6 right-6 z-[60] space-y-2">
            {sizeErrors.map((err, i) => (
              <div
                key={i}
                className="px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold bg-red-500/20 border border-red-500/30 text-red-300 transition-all duration-300"
              >
                {err.message}
              </div>
            ))}
          </div>
        )}

        {feedback && (
          <div
            className={`fixed top-6 right-6 z-[60] px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold transition-all duration-300 ${
              feedback.isError
                ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                : 'bg-green-500/20 border border-green-500/30 text-green-300'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {undoToast && (
          <UndoToast
            itemName={undoToast.itemName}
            itemType={undoToast.itemType}
            onUndo={undoToast.onUndo}
            onDismiss={() => dismissUndoToast(undoToast.id)}
          />
        )}

        <main className="flex-1 p-10 relative z-10 overflow-y-auto">
          {assetsLoading && (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4">
                <Loader size={32} className="text-white/20 animate-spin" />
                <p className="text-sm text-white/30 font-medium">Loading assets...</p>
              </div>
            </div>
          )}

          {assetsError && !assetsLoading && (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4 text-center max-w-md">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle size={24} className="text-red-400" />
                </div>
                <p className="text-sm text-red-400 font-medium">{assetsError}</p>
                <button
                  onClick={refetchAssets}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!assetsLoading && !assetsError && filteredAssets.length === 0 && (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4 text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <LayoutGrid size={28} className="text-white/20" />
                </div>
                <h3 className="text-lg font-bold text-white/60">
                  {selectedCollection
                    ? activeTab
                      ? `No ${activeTab}s yet`
                      : 'No assets yet'
                    : 'No collection selected'}
                </h3>
                <p className="text-sm text-white/30 max-w-xs">
                  {selectedCollection
                    ? activeTab
                      ? `This collection has no ${activeTab}s. Upload one to get started.`
                      : 'This collection is empty. Upload your first asset to get started.'
                    : 'Select a collection from the sidebar to view its assets.'}
                </p>
                {selectedCollection && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => {
                        const coll = collections.find((c) => c.id === selectedCollection);
                        if (coll && coll.entity_type && coll.entity_type !== 'generic') {
                          setShowUploadDialog(true);
                        } else {
                          emptyFileInputRef.current?.click();
                        }
                      }}
                      className="w-auto px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-black"
                    >
                      <Upload size={14} className="mr-2" />
                      Upload {activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + 's' : 'Assets'}
                    </Button>
                    <p className="text-[10px] text-white/20 font-medium">Max 10 MB per file</p>
                    <input
                      ref={emptyFileInputRef}
                      type="file"
                      className="hidden"
                      accept={currentAccept}
                      multiple
                      onChange={handleFileUpload}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {selectedIds.size > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-5 py-3 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl backdrop-blur-md">
              <CheckSquare size={16} className="text-blue-400" />
              <span className="text-sm font-bold text-white">{selectedIds.size} selected</span>
              <div className="w-px h-5 bg-white/10" />
              <button onClick={toggleSelectAll} className="text-xs font-semibold text-white/40 hover:text-white transition-colors">
                {selectedIds.size === filteredAssets.length ? 'Deselect all' : 'Select all'}
              </button>
              <div className="w-px h-5 bg-white/10" />
              <button onClick={handleBatchDelete} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-bold hover:bg-red-500/25 transition-all">
                <Trash2 size={12} />
                Delete {selectedIds.size > 1 ? 'all' : ''}
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
                <X size={14} />
              </button>
            </div>
          )}

          {showingDeleted && selectedCollection && !deletedLoading && deletedAssets.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 px-1">
                <RotateCcw size={14} className="text-yellow-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-400/60">
                  Deleted assets ({deletedAssets.length})
                </h3>
                <button onClick={() => { setShowingDeleted(false); setDeletedAssets([]); }} className="ml-auto text-[10px] text-white/30 hover:text-white transition-colors">
                  Hide
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {deletedAssets.map((asset) => {
                  const DelTypeIcon = FILE_TYPE_ICONS[asset.file_type] || Archive;
                  return (
                    <div key={asset.id} className="group bg-red-900/5 border border-red-900/20 rounded-2xl overflow-hidden transition-all duration-300 relative hover:border-red-900/30">
                      <div className={`aspect-video relative flex items-center justify-center ${FILE_TYPE_COLORS[asset.file_type] || FILE_TYPE_COLORS.other}`}>
                        {asset.file_url && asset.file_type === 'image' ? (
                          <img src={asset.file_url} alt={asset.file_name} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        ) : (
                          <DelTypeIcon size={36} className="text-white/20" />
                        )}
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 rounded-full bg-red-500/30 text-[8px] font-bold uppercase tracking-wider text-red-300 flex items-center gap-1">
                            <Trash2 size={8} />
                            Deleted
                          </span>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={async (e) => { e.stopPropagation(); try { await mediaApi.restoreAsset(asset.id); refetchAssets(); refetchCollections(); setDeletedAssets((prev) => prev.filter((a) => a.id !== asset.id)); showFeedback('Asset restored.', false); } catch { showFeedback('Failed to restore.'); } }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/25 text-green-400 text-[10px] font-bold hover:bg-green-500/40 transition-all"
                          >
                            <RotateCcw size={11} />
                            Restore
                          </button>
                        </div>
                      </div>
                      <div className="p-3 space-y-1">
                        <p className="text-sm font-bold text-white/50 truncate" title={asset.file_name}>{asset.file_name}</p>
                        <p className="text-[10px] text-white/20">{asset.file_size_display}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!assetsLoading && !assetsError && filteredAssets.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredAssets.map((asset) => {
                const TypeIcon = FILE_TYPE_ICONS[asset.file_type] || Archive;
                const isSelected = selectedIds.has(asset.id);
                return (
                  <div key={asset.id} className={`group bg-white/[0.02] border rounded-2xl overflow-hidden transition-all duration-300 relative ${isSelected ? 'border-blue-500/40 ring-1 ring-blue-500/20 bg-blue-500/5' : 'border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}`}>
                    <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); toggleSelected(asset.id); }} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-black/60 border-white/20 hover:border-white/50'}`}>
                        {isSelected && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </button>
                    </div>
                    <div className={`aspect-video relative flex items-center justify-center ${FILE_TYPE_COLORS[asset.file_type] || FILE_TYPE_COLORS.other} ${asset.file_type === 'image' || asset.file_type === 'video' ? 'cursor-pointer' : ''}`}
                      onClick={() => (asset.file_type === 'image' || asset.file_type === 'video') && setPreviewAsset(asset)}>
                      {asset.file_url && asset.file_type === 'image' ? (
                        <img src={asset.file_url} alt={asset.file_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : asset.file_url && asset.file_type === 'video' ? (
                        <video src={asset.file_url} className="w-full h-full object-cover" preload="metadata" muted />
                      ) : (
                        <TypeIcon size={36} className="text-white/20 group-hover:text-white/40 transition-colors" />
                      )}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {asset.download_url && (
                          <button onClick={(e) => { e.stopPropagation(); mediaApi.downloadAsset(asset.id, asset.file_name); }} className="p-1.5 rounded-md bg-black/60 hover:bg-blue-500/60 transition-colors" title="Download">
                            <Download size={12} className="text-white/80" />
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); showConfirm('delete-asset', asset, asset.file_name); }} className="p-1.5 rounded-md bg-black/60 hover:bg-red-500/60 transition-colors" title="Delete asset">
                          <Trash2 size={12} className="text-white/80" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-0.5 rounded-full bg-black/60 text-[8px] font-bold uppercase tracking-wider text-white/60">{asset.file_type}</span>
                      </div>
                    </div>
                  <div className="p-4 space-y-1.5">
                    <p className="text-sm font-bold text-white truncate" title={asset.file_name}>{asset.file_name}</p>
                    {/* Source badge — shows linked contact/staff name */}
                    {asset.source_display && (
                      <div className="flex items-center gap-1">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[9px] font-semibold text-blue-300/80 truncate max-w-full">
                          <ExternalLink size={9} className="shrink-0" />
                          <span className="truncate">{asset.source_display}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] text-white/20 font-medium uppercase tracking-widest">
                        {asset.dimensions_display || asset.file_type}
                      </p>
                      <p className="text-[10px] text-white/20 font-medium">
                        {asset.file_size_display}
                      </p>
                    </div>
                  </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      </div>

      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPreviewAsset(null)}>
          <button onClick={() => setPreviewAsset(null)} className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors z-10">
            <X size={20} className="text-white" />
          </button>
          {previewAsset.file_type === 'image' && (
            <img src={previewAsset.file_url} alt={previewAsset.file_name} className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()} />
          )}
          {previewAsset.file_type === 'video' && (
            <div className="max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
              <video src={previewAsset.file_url} className="w-full h-full max-h-[85vh] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200" controls autoPlay />
            </div>
          )}
        </div>
      )}

      {showCreateDialog && (
        <CreateCollectionDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSave={handleCreateCollection}
        />
      )}

      {showUploadDialog && selectedCollection && (
        <UploadAssetDialog
          isOpen={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          onUpload={handleDialogUpload}
          collection={currentCollection}
        />
      )}

      {showCreatorPanel && (
        <CreatorGroupPanel
          onClose={() => setShowCreatorPanel(false)}
          onSaved={() => refetchCollections()}
        />
      )}

      {groupPanelCollection && (
        <CollectionGroupPanel
          collection={groupPanelCollection}
          onClose={() => setGroupPanelCollection(null)}
          onSaved={() => { refetchCollections(); refetchAssets(); }}
        />
      )}

      <ConfirmModal
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.type === 'delete-collection' ? 'Delete Collection' : 'Delete Asset'}
        variant="danger"
        loading={mutating}
        onConfirm={handleConfirmAction}
        onCancel={handleConfirmClose}
      />
    </div>
  );
};


// ===== Collection Sidebar Item =====
const CollectionItem = ({
  collection,
  currentUserId,
  isAdmin,
  isSelected,
  onSelect,
  onTogglePin,
  onRename,
  onShowConfirm,
  onShowDeleted,
  showingDeleted,
  editingId,
  setEditingId,
  editName,
  setEditName,
  mutating,
  onOpenGroupPanel,
}) => {
  const isEditing = editingId === collection.id;

  if (isEditing) {
    return (
      <div className="px-2 py-1">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onRename(collection.id);
            if (e.key === 'Escape') setEditingId(null);
          }}
          autoFocus
          onBlur={() => setEditingId(null)}
        />
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(collection.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(collection.id); }}
      className={`w-full group flex items-center gap-2.5 px-3 py-2 rounded-lg text-left cursor-pointer transition-all duration-150 ${
        isSelected
          ? 'bg-white/10 text-white'
          : 'text-white/50 hover:text-white hover:bg-white/5'
      }`}
    >
      <FolderOpen size={14} className="shrink-0" />
      <span className="text-xs font-medium truncate flex-1">{collection.name}</span>
      <span className="text-[9px] text-white/20 font-medium">{collection.asset_count}</span>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {(isAdmin || collection.created_by === currentUserId) && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onOpenGroupPanel && onOpenGroupPanel(collection); }}
              className="p-1 rounded text-white/30 hover:text-blue-400 transition-colors"
              title="Manage group access"
            >
              <Users size={11} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin(collection.id, collection.is_pinned); }}
              disabled={mutating}
              className={`p-1 rounded transition-colors ${collection.is_pinned ? 'text-blue-400 hover:text-blue-300' : 'text-white/30 hover:text-white'}`}
              title={collection.is_pinned ? 'Unpin' : 'Pin to top'}
            >
              {collection.is_pinned ? <PinOff size={11} /> : <Pin size={11} />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setEditingId(collection.id); setEditName(collection.name); }}
              className="p-1 rounded text-white/30 hover:text-white transition-colors"
              title="Rename"
            >
              <MoreHorizontal size={11} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onShowConfirm('delete-collection', collection, collection.name); }}
              disabled={mutating || collection.is_pinned}
              className={`p-1 rounded transition-colors ${collection.is_pinned ? 'text-white/10 cursor-not-allowed' : 'text-white/30 hover:text-red-400'}`}
              title={collection.is_pinned ? 'Unpin before deleting' : 'Delete collection'}
            >
              <Trash2 size={11} />
            </button>
          </>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onShowDeleted(collection.id); }}
          className={`p-1 rounded transition-colors ${showingDeleted && isSelected ? 'text-yellow-400 hover:text-yellow-300' : 'text-white/30 hover:text-yellow-400'}`}
          title="Show deleted files"
        >
          <RotateCcw size={11} />
        </button>
      </div>
    </div>
  );
};

export default Media;
