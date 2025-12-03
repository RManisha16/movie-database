import { useState, useEffect, useCallback } from "react";
 
export default function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState(null);
 
  const fetchData = useCallback(async (signal) => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      if (err.name !== "AbortError") setError(err);
    } finally {
      setLoading(false);
    }
  }, [url]);
 
  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [url, fetchData]);
 
  return { data, loading, error, refetch: fetchData };
}