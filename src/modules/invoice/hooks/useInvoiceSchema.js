import { useState, useEffect, useCallback } from 'react';
import { schemaApi } from '../api/invoiceApi';

/**
 * Fetch all active InvoiceSchemas (domain configs).
 * Used by InvoiceForm to populate the domain selector and render extra fields.
 */
export function useInvoiceSchemas() {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchemas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await schemaApi.list();
      setSchemas(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invoice schemas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchemas();
  }, [fetchSchemas]);

  return { schemas, loading, error, refetch: fetchSchemas };
}

/**
 * Fetch a single InvoiceSchema by domain key.
 * @param {string} domain  - e.g. 'travel_agency'
 */
export function useInvoiceSchema(domain) {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!domain) {
      setSchema(null);
      return;
    }
    setLoading(true);
    setError(null);
    schemaApi
      .get(domain)
      .then((res) => setSchema(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load schema.'))
      .finally(() => setLoading(false));
  }, [domain]);

  return { schema, loading, error };
}
