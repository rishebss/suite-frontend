import { useState, useEffect, useCallback, useRef } from 'react';
import { mediaApi } from '../api/mediaApi';

/**
 * Fetch all collections for the current user.
 * Returns pinned collections first, then alphabetical.
 */
export function useCollections() {
  const [collections, setCollections] = useState([]);
  const [canCreate, setCanCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await mediaApi.listCollections();
      const data = res.data.data || {};
      setCollections(data.collections || data || []);
      setCanCreate(data.can_create === true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load collections.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return { collections, canCreate, loading, error, refetch: fetchCollections };
}

/**
 * Hook for mutating a single collection (pin, rename, delete).
 */
export function useCollectionActions() {
  const [mutating, setMutating] = useState(false);

  const togglePin = useCallback(async (id, isPinned) => {
    setMutating(true);
    try {
      const res = await mediaApi.togglePin(id, isPinned);
      return { success: true, data: res.data.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update collection.';
      return { success: false, message: msg };
    } finally {
      setMutating(false);
    }
  }, []);

  const rename = useCallback(async (id, name) => {
    setMutating(true);
    try {
      const res = await mediaApi.updateCollection(id, { name });
      return { success: true, data: res.data.data };
    } catch (err) {
      // Extract specific field error first (e.g. duplicate name)
      const fieldError = err.response?.data?.errors?.name?.[0];
      const msg = fieldError
        || err.response?.data?.message
        || 'Failed to rename collection.';
      return { success: false, message: msg };
    } finally {
      setMutating(false);
    }
  }, []);

  const deleteCollection = useCallback(async (id) => {
    setMutating(true);
    try {
      await mediaApi.deleteCollection(id);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete collection.';
      return { success: false, message: msg };
    } finally {
      setMutating(false);
    }
  }, []);

  const createCollection = useCallback(async (data) => {
    setMutating(true);
    try {
      const res = await mediaApi.createCollection(data);
      return { success: true, data: res.data.data };
    } catch (err) {
      // Extract specific field error first (e.g. duplicate name)
      const fieldError = err.response?.data?.errors?.name?.[0];
      const msg = fieldError
        || err.response?.data?.message
        || 'Failed to create collection.';
      return { success: false, message: msg };
    } finally {
      setMutating(false);
    }
  }, []);

  return { togglePin, rename, deleteCollection, createCollection, mutating };
}

/**
 * Fetch assets, optionally filtered by collection_id.
 * @param {Object} filters - { collection_id?, file_type? }
 */
export function useAssets(filters = {}) {
  const [assets, setAssets] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.collection_id) params.collection_id = filters.collection_id;
      if (filters.file_type) params.file_type = filters.file_type;
      if (filters.search) params.search = filters.search;
      const res = await mediaApi.listAssets(params);
      const data = res.data.data || {};
      setAssets(data.results || []);
      setCount(data.count || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assets.');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, count, loading, error, refetch: fetchAssets };
}

/** Max allowed file size in bytes (10 MB) */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Upload queue state for a single file.
 * @typedef {{ id: string, file: File, progress: number, status: 'queued'|'uploading'|'done'|'failed', error?: string, asset?: object }} QueueItem
 */

/**
 * Hook for uploading files with queue management and progress tracking.
 * Provides a queue that processes files one at a time.
 */
export function useAssetUpload() {
  const [sizeErrors, setSizeErrors] = useState([]);
  const sizeErrorTimerRef = useRef(null);
  const [queue, setQueue] = useState([]);
  const [active, setActive] = useState(false);
  const processingRef = useRef(false);
  // Tick counter to force a re-render after each file completes
  const [tick, setTick] = useState(0);

  // Clean up size error timer on unmount
  useEffect(() => {
    return () => {
      if (sizeErrorTimerRef.current) clearTimeout(sizeErrorTimerRef.current);
    };
  }, []);

  /** Add one or more files to the upload queue (validates size) */
  const enqueue = useCallback((files, collectionId, sourceEntityId = null) => {
    const oversizedFiles = [];
    const validFiles = [];

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });

    if (oversizedFiles.length > 0) {
      // Show the user-friendly message via a state that other components can read
      setSizeErrors((prev) => [
        ...prev,
        ...oversizedFiles.map((name) => ({
          name,
          message: `"${name}" exceeds the 10 MB size limit.`,
        })),
      ]);

      // Auto-clear size errors after 6 seconds (reset timer on each new oversized batch)
      if (sizeErrorTimerRef.current) clearTimeout(sizeErrorTimerRef.current);
      sizeErrorTimerRef.current = setTimeout(() => setSizeErrors([]), 6000);
    }

    const newItems = validFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      collectionId,
      sourceEntityId,
      progress: 0,
      status: 'queued',
    }));
    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  /** Update a single queue item */
  const updateItem = useCallback((id, patch) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }, []);

  /** Remove completed items from the queue */
  const clearCompleted = useCallback(() => {
    setQueue((prev) => prev.filter((item) => item.status !== 'done'));
  }, []);

  /** Retry a failed item */
  const retry = useCallback((id) => {
    updateItem(id, { status: 'queued', progress: 0, error: undefined });
  }, [updateItem]);

  // Process the queue — one file at a time
  useEffect(() => {
    if (processingRef.current) return;

    const nextItem = queue.find((item) => item.status === 'queued');
    if (!nextItem) {
      setActive(false);
      return;
    }

    setActive(true);
    processingRef.current = true;

    const uploadOne = async () => {
      updateItem(nextItem.id, { status: 'uploading', progress: 0 });

      try {
        const formData = new FormData();
        formData.append('file', nextItem.file);
        formData.append('collection_id', nextItem.collectionId);
        if (nextItem.sourceEntityId) {
          formData.append('source_entity_id', nextItem.sourceEntityId);
        }

        const res = await mediaApi.uploadAsset(formData, (percent) => {
          updateItem(nextItem.id, { progress: percent });
        });

        updateItem(nextItem.id, {
          status: 'done',
          progress: 100,
          asset: res.data.data,
        });
      } catch (err) {
        const msg = err.response?.data?.message
          || err.response?.data?.errors?.file?.[0]
          || 'Upload failed.';
        updateItem(nextItem.id, { status: 'failed', error: msg });
      } finally {
        processingRef.current = false;
        setTick((t) => t + 1); // Force effect to re-run for next file
      }
    };

    uploadOne();
  }, [queue, tick, updateItem]);

  const totalItems = queue.length;
  const completedItems = queue.filter((i) => i.status === 'done').length;
  const failedItems = queue.filter((i) => i.status === 'failed');
  const uploadingItem = queue.find((i) => i.status === 'uploading');

  /** Overall upload progress percentage (bytes-based) */
  const overallProgress = totalItems > 0
    ? Math.round((completedItems / totalItems) * 100)
    : 0;

  return {
    queue,
    enqueue,
    retry,
    clearCompleted,
    active,
    uploadingItem,
    totalItems,
    completedItems,
    failedItems,
    overallProgress,
    sizeErrors,
  };
}
