import { useState, useEffect } from "react";
import type { LakehouseApi } from "../types/lakehouse";
import { BACKEND_URL } from "../services/api";

export function useLakehouses() {
  const [lakehouses, setLakehouses] = useState<LakehouseApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchLakehouses(signal?: AbortSignal) {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(BACKEND_URL, { signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as LakehouseApi[];
      setLakehouses(data);
      localStorage.setItem("lakehouses_cache", JSON.stringify({ ts: Date.now(), data }));
    } catch (e: any) {
      const cachedRaw = localStorage.getItem("lakehouses_cache");
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (Array.isArray(cached?.data)) {
          setLakehouses(cached.data);
          setError("Backend indisponible — cache utilisé.");
        } else setError(e?.message);
      } else setError(e?.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const ctrl = new AbortController();
    fetchLakehouses(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  return { lakehouses, loading, error, fetchLakehouses };
}
