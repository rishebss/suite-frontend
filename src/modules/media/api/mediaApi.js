/**
 * Media API layer — all HTTP calls go through axios.
 * Proxy is configured in vite.config.js to forward /api to the Django backend.
 */
import axios from 'axios';

const COLLECTIONS_BASE = '/api/media/collections';
const ASSETS_BASE = '/api/media/assets';

export const mediaApi = {
  // -----------------------------------------------------------------------
  // Collections
  // -----------------------------------------------------------------------

  /** List all collections for the current user */
  listCollections: (params = {}) => axios.get(`${COLLECTIONS_BASE}/`, { params }),

  /** Get a single collection by ID */
  getCollection: (id) => axios.get(`${COLLECTIONS_BASE}/${id}/`),

  /** Create a new collection */
  createCollection: (data) => axios.post(`${COLLECTIONS_BASE}/`, data),

  /** Update a collection (full or partial) */
  updateCollection: (id, data, partial = true) =>
    partial
      ? axios.patch(`${COLLECTIONS_BASE}/${id}/`, data)
      : axios.put(`${COLLECTIONS_BASE}/${id}/`, data),

  /** Toggle pin/unpin a collection */
  togglePin: (id, isPinned) =>
    axios.patch(`${COLLECTIONS_BASE}/${id}/`, { is_pinned: isPinned }),

  /** Delete a collection (soft delete — returns { id, restore_url }) */
  deleteCollection: (id) => axios.delete(`${COLLECTIONS_BASE}/${id}/`),

  /** Restore a soft-deleted collection */
  restoreCollection: (id) => axios.post(`${COLLECTIONS_BASE}/${id}/restore/`),

  // -----------------------------------------------------------------------
  // Collection Group Permissions
  // -----------------------------------------------------------------------

  /** List group permissions for a collection */
  listCollectionGroups: (id) =>
    axios.get(`${COLLECTIONS_BASE}/${id}/groups/`),

  /** Batch-set group permissions for a collection (replaces all) */
  setCollectionGroups: (id, groupIds) =>
    axios.post(`${COLLECTIONS_BASE}/${id}/groups/`, { group_ids: groupIds }),

  /** Remove a single group from a collection */
  removeCollectionGroup: (id, groupId) =>
    axios.delete(`${COLLECTIONS_BASE}/${id}/groups/${groupId}/`),

  // -----------------------------------------------------------------------
  // Assets
  // -----------------------------------------------------------------------

  /** List assets, optionally filtered by collection_id and/or file_type */
  listAssets: (params = {}) => axios.get(`${ASSETS_BASE}/`, { params }),

  /**
   * Upload a file to a collection with progress tracking.
   * @param {FormData} formData - multipart form with file + collection_id
   * @param {Function} onProgress - callback(percentComplete: number)
   */
  uploadAsset: (formData, onProgress) =>
    axios.post(`${ASSETS_BASE}/upload/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }),

  /** Get a single asset by ID */
  getAsset: (id) => axios.get(`${ASSETS_BASE}/${id}/`),

  /** Delete an asset (soft delete — returns { id, restore_url }) */
  deleteAsset: (id) => axios.delete(`${ASSETS_BASE}/${id}/`),

  /** Restore a soft-deleted asset */
  restoreAsset: (id) => axios.post(`${ASSETS_BASE}/${id}/restore/`),

  /** Batch soft-delete multiple assets */
  batchDeleteAssets: (ids) => axios.post(`${ASSETS_BASE}/batch-delete/`, { ids }),

  // -----------------------------------------------------------------------
  // Creator Groups — which departments can create collections (admin-only)
  // -----------------------------------------------------------------------

  /** List all creator groups */
  listCreatorGroups: () => axios.get('/api/media/creator-groups/'),

  /** Add a department to creator groups */
  addCreatorGroup: (departmentId) =>
    axios.post('/api/media/creator-groups/', { department_id: departmentId }),

  /** Remove a department from creator groups */
  removeCreatorGroup: (id) => axios.delete(`/api/media/creator-groups/${id}/`),

  // -----------------------------------------------------------------------
  // Entity Search (for collections with entity_type = contact/staff)
  // -----------------------------------------------------------------------

  /** Search contacts by name, email, phone, or contact_id */
  searchContacts: (query) =>
    axios.get('/api/media/search-entities/', { params: { entity_type: 'contact', q: query } }),

  /** Search employees by name, employee_id, or email */
  searchEmployees: (query) =>
    axios.get('/api/media/search-entities/', { params: { entity_type: 'staff', q: query } }),

  /**
   * Download an asset by fetching it as a blob via fetch() with the JWT
   * token in the query string. Then triggers a browser download via a
   * temporary <a> element so the user stays on the same page.
   */
  downloadAsset: async (id, fileName) => {
    const token = localStorage.getItem('access_token');
    const url = `${ASSETS_BASE}/${id}/download/` + (token ? '?token=' + encodeURIComponent(token) : '');
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error('Download failed:', res.status, res.statusText);
        return;
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Delay revoke so Chrome has time to start the download
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
    } catch (err) {
      console.error('Download failed:', err);
    }
  },
};
