import { useState, useEffect, useCallback } from 'react';
import { invoiceApi } from '../api/invoiceApi';

/**
 * Fetch and manage the list of invoices for the current user.
 * @param {Object} filters - optional { domain, status }
 */
export function useInvoiceList(filters = {}) {
  const [invoices, setInvoices] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await invoiceApi.list(filters);
      setInvoices(res.data.data || []);
      setCount(res.data.count || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, count, loading, error, refetch: fetchInvoices };
}

export function useInvoiceStatusCounts() {
  const [counts, setCounts] = useState({});
  const fetchCounts = useCallback(async () => {
    try {
      const res = await invoiceApi.statusCounts();
      setCounts(res.data.data || {});
    } catch {
      // silently ignore
    }
  }, []);
  useEffect(() => { fetchCounts(); }, [fetchCounts]);
  return { counts, refetchCounts: fetchCounts };
}

/**
 * Fetch a single invoice by ID.
 * @param {string} id
 */
export function useInvoiceDetail(id) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoice = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await invoiceApi.get(id);
      setInvoice(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invoice.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  return { invoice, loading, error, refetch: fetchInvoice };
}

/**
 * Admin hook — fetch all invoices across all users.
 * @param {Object} filters - optional { domain, status, created_by }
 */
export function useAdminInvoiceList(filters = {}) {
  const [invoices, setInvoices] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await invoiceApi.adminList(filters);
      setInvoices(res.data.data || []);
      setCount(res.data.count || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, count, loading, error, refetch: fetchInvoices };
}
