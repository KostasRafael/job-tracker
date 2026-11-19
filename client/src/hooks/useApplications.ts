import { useCallback, useEffect, useRef, useState } from 'react';
import { listApplications, type ListParams } from '../api/applications';
import type { Application } from '../types';

export function useApplications(params: ListParams = {}) {
  // Pull the values out: `params` is a new object on every render, so putting
  // it in a dependency array would reload forever. The strings only change
  // when the user actually changes the search, filter or sort.
  const { q, status, sort } = params;
  // one string that identifies "these filters"
  const key = `${q ?? ''}|${status ?? ''}|${sort ?? ''}`;

  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  // the filters of the last response that arrived (null: nothing yet)
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  // true while a manual refetch (after a save, a delete, "Try again") runs
  const [refreshing, setRefreshing] = useState(false);
  // Counts requests, so a slow old response can't overwrite a newer one
  // (typing "goo" then "google": the "goo" reply may arrive last).
  const latestRequest = useRef(0);

  // `loading` is worked out, not stored: we are loading whenever the data on
  // screen belongs to other filters than the current ones. So the effect below
  // doesn't have to call setLoading(true) the moment it runs, which is what
  // React's set-state-in-effect rule warns about (an extra render every time).
  const loading = loadedKey !== key || refreshing;

  // Every setState here sits inside a .then() callback, so it runs later, when
  // the response arrives. (Written with .then instead of async/await because
  // the lint rule can't tell that code after an `await` runs later.)
  const fetchApplications = useCallback(() => {
    const request = ++latestRequest.current;
    return listApplications({ q, status, sort })
      .then(
        (data) => ({ data, message: null }),
        (err: unknown) => ({
          data: null,
          message: err instanceof Error ? err.message : 'Something went wrong',
        })
      )
      .then(({ data, message }) => {
        if (request !== latestRequest.current) return; // a newer request took over
        if (data) setApplications(data);
        setError(message);
        setLoadedKey(key);
        setRefreshing(false);
      });
  }, [q, status, sort, key]);

  // runs on mount and whenever q, status or sort change
  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  // Called from event handlers (not from an effect), so setting state straight
  // away is fine here: show the loading state and hide an old error at once.
  const refetch = useCallback(() => {
    setRefreshing(true);
    setError(null);
    return fetchApplications();
  }, [fetchApplications]);

  return { applications, setApplications, loading, error, refetch };
}
