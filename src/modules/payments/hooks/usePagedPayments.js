import { useCallback, useEffect, useState } from "react";
import { fetchPayments } from "../services/paymentsService";

/**
 * Records per page in the detail drawers.
 *
 * 20 matches the payments table's page size: it fills roughly three screens of
 * the drawer's 340px scroll area, and page 1 stays a single light request
 * (2 SQL queries) even though the API is reached over a slow link. Larger
 * pages only speed up the first paint, which is already under half a second.
 */
export const RECORDS_PAGE_SIZE = 20;

const asList = (d) => (Array.isArray(d) ? d : d?.results || []);

/**
 * Paginated payment records for a drawer: page 1 up front, then "load more".
 * Page 1 asks for `with_total=1` so `totalAmount` is the exact sum over the
 * whole filtered set, not just the loaded rows.
 *
 * `query` must be memoised by the caller (useMemo) — it is an effect dep.
 */
export default function usePagedPayments({ open, query }) {
  const [state, setState] = useState({
    rows: [],
    count: 0,
    totalAmount: null,
    hasMore: false,
    nextPage: 2,
    loading: true,
    loadingMore: false,
  });

  useEffect(() => {
    if (!open || !query) return;
    let cancelled = false;
    fetchPayments({
      ...query,
      page: 1,
      page_size: RECORDS_PAGE_SIZE,
      with_total: 1,
    })
      .then((res) => {
        if (cancelled) return;
        const d = res.data || {};
        const rows = asList(d);
        setState({
          rows,
          count: d.count ?? rows.length,
          totalAmount: d.total_amount ?? null,
          hasMore: !!d.next,
          nextPage: 2,
          loading: false,
          loadingMore: false,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({
          rows: [],
          count: 0,
          totalAmount: null,
          hasMore: false,
          nextPage: 2,
          loading: false,
          loadingMore: false,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [open, query]);

  const loadMore = useCallback(() => {
    setState((s) => ({ ...s, loadingMore: true }));
    fetchPayments({ ...query, page: state.nextPage, page_size: RECORDS_PAGE_SIZE })
      .then((res) => {
        const d = res.data || {};
        const rows = asList(d);
        setState((s) => ({
          ...s,
          rows: [...s.rows, ...rows],
          count: d.count ?? s.count,
          hasMore: !!d.next,
          nextPage: s.nextPage + 1,
          loadingMore: false,
        }));
      })
      .catch(() => setState((s) => ({ ...s, hasMore: false, loadingMore: false })));
  }, [query, state.nextPage]);

  const total =
    state.totalAmount != null
      ? Number(state.totalAmount)
      : state.rows.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  return {
    rows: state.rows,
    count: state.count,
    total,
    totalExact: state.totalAmount != null,
    hasMore: state.hasMore,
    loading: state.loading,
    loadingMore: state.loadingMore,
    loadMore,
  };
}
