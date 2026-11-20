import { useCallback, useEffect, useRef, useState } from 'react';
import { getStats } from '../api/stats';
import type { Stats } from '../types';

// Same shape and same tricks as useApplications, without the filters.
export function useStats() {
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  // false until the first response (or error) arrives
  const [loaded, setLoaded] = useState(false);
  // true while a manual refetch ("Try again") runs
  const [refreshing, setRefreshing] = useState(false);
  // a slow old response must not overwrite a newer one
  const latestRequest = useRef(0);

  // worked out, not stored, so the effect doesn't need to call setLoading(true)
  const loading = !loaded || refreshing;

  // every setState runs inside .then(), i.e. later, when the response arrives
  const fetchStats = useCallback(() => {
    const request = ++latestRequest.current;
    return getStats()
      .then(
        (stats) => ({ stats, message: null }),
        (err: unknown) => ({
          stats: null,
          message: err instanceof Error ? err.message : 'Something went wrong',
        })
      )
      .then(({ stats, message }) => {
        if (request !== latestRequest.current) return; // a newer request took over
        if (stats) setData(stats);
        setError(message);
        setLoaded(true);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  // called from event handlers, so setting state straight away is fine
  const refetch = useCallback(() => {
    setRefreshing(true);
    setError(null);
    return fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch };
}
