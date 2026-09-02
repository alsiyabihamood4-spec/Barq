import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "./api";
import { useSession } from "../state/session";

/** Minimal data-fetching hook — no react-query dependency, just enough to
 * keep screens declarative. `deps` re-runs the fetch (e.g. a tab switch). */
export function useApi<T>(path: string | null, deps: unknown[] = []) {
  const token = useSession((s) => s.token);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!path) return;
    setLoading(true);
    apiFetch<T>(path, token)
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Request failed"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, token, ...deps]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading, reload };
}
