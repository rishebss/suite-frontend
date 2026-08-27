import { useState, useCallback, useEffect } from "react";
import {
  fetchTransfers,
  fetchTransfer,
  createTransfer as apiCreateTransfer,
  submitTransfer as apiSubmitTransfer,
  approveTransfer as apiApproveTransfer,
  rejectTransfer as apiRejectTransfer,
  dispatchTransfer as apiDispatchTransfer,
  receiveTransfer as apiReceiveTransfer,
  cancelTransfer as apiCancelTransfer,
  exportTransfers as apiExportTransfers,
} from "../services/transferService";

/**
 * useTransfers hook - Fetch paginated transfer list
 */
export const useTransfers = (filters = {}) => {
  const [transfers, setTransfers] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchTransfers(filters);
      setTransfers(response.data.results || response.data.data || []);
      setCount(response.data.count || 0);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Failed to fetch transfers",
      );
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { transfers, count, loading, error, refetch };
};

/**
 * useTransfer hook - Fetch single transfer detail
 */
export const useTransfer = (id) => {
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchTransfer(id);
      setTransfer(response.data.data || response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Failed to fetch transfer",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { transfer, loading, error, refetch };
};

/**
 * useTransferActions hook - All transfer workflow actions
 */
export const useTransferActions = () => {
  const [loading, setLoading] = useState(false);

  const createTransfer = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await apiCreateTransfer(data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to create transfer";
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const submitTransfer = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiSubmitTransfer(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to submit transfer";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const approveTransfer = useCallback(async (id, notes = "") => {
    setLoading(true);
    try {
      const response = await apiApproveTransfer(id, { notes });
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to approve transfer";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectTransfer = useCallback(async (id, notes = "") => {
    setLoading(true);
    try {
      const response = await apiRejectTransfer(id, { notes });
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to reject transfer";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const dispatchTransfer = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiDispatchTransfer(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to dispatch transfer";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const receiveTransfer = useCallback(async (id, items = null) => {
    setLoading(true);
    try {
      const payload = items ? { items } : {};
      const response = await apiReceiveTransfer(id, payload);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to receive transfer";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelTransfer = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiCancelTransfer(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to cancel transfer";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const exportTransfers = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await apiExportTransfers(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const disposition = response.headers["content-disposition"];
      let filename = "transfers.csv";
      if (disposition) {
        const match = disposition.match(/filename="?(.+)"?/);
        if (match) filename = match[1];
      }
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to export transfers";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    createTransfer,
    submitTransfer,
    approveTransfer,
    rejectTransfer,
    dispatchTransfer,
    receiveTransfer,
    cancelTransfer,
    exportTransfers,
  };
};
