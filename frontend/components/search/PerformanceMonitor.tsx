"use client";

import { useEffect, useRef } from "react";
import { ProductSearchResponse } from "@/lib/productSearch";

interface PerformanceMonitorProps {
  query: string;
  loading: boolean;
  results: ProductSearchResponse | null;
  error: string | null;
}

export function PerformanceMonitor({ query, loading, results, error }: PerformanceMonitorProps) {
  const searchStartTimeRef = useRef<number | null>(null);
  const lastQueryRef = useRef<string>("");

  useEffect(() => {
    const trimmedQuery = query.trim();
    
    // Track when a new search starts
    if (trimmedQuery && trimmedQuery !== lastQueryRef.current) {
      searchStartTimeRef.current = performance.now();
      lastQueryRef.current = trimmedQuery;
      console.log(`📊 [PERF_MONITOR] New search started: "${trimmedQuery}"`);
    }

    // Track when loading completes
    if (searchStartTimeRef.current && !loading && (results || error)) {
      const totalTime = performance.now() - searchStartTimeRef.current;
      console.log(`📊 [PERF_MONITOR] Search completed in ${totalTime.toFixed(2)}ms (${(totalTime/1000).toFixed(2)}s)`);
      
      if (results) {
        console.log(`📊 [PERF_MONITOR] Results: ${results.items.length} items, total: ${results.total}`);
      }
      
      if (error) {
        console.log(`📊 [PERF_MONITOR] Error: ${error}`);
      }
      
      searchStartTimeRef.current = null;
    }
  }, [query, loading, results, error]);

  // Log performance metrics every 5 seconds during loading
  useEffect(() => {
    if (!loading || !searchStartTimeRef.current) return;

    const interval = setInterval(() => {
      const elapsed = performance.now() - searchStartTimeRef.current!;
      console.log(`📊 [PERF_MONITOR] Still loading after ${elapsed.toFixed(2)}ms (${(elapsed/1000).toFixed(2)}s)`);
    }, 5000);

    return () => clearInterval(interval);
  }, [loading]);

  return null; // This component doesn't render anything
}
