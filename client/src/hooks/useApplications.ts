import { useCallback, useEffect, useState } from 'react';
import { listApplications } from '../api/applications';
import type { Application } from '../types';

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setApplications(await listApplications());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { applications, setApplications, loading, error, refetch: load };
}