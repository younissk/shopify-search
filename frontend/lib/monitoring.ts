interface PerformanceMetric {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: number;
}

interface CacheMetric {
  hits: number;
  misses: number;
  total: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private cacheStats: CacheMetric = {
    hits: 0,
    misses: 0,
    total: 0
  };

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  recordMetric(name: string, value: number, tags: Record<string, string> = {}) {
    this.metrics.push({
      name,
      value,
      tags,
      timestamp: Date.now()
    });

    // Log the metric
    console.log(`📊 [MONITOR] ${name}: ${value}ms`, tags);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  recordCacheHit() {
    this.cacheStats.hits++;
    this.cacheStats.total++;
  }

  recordCacheMiss() {
    this.cacheStats.misses++;
    this.cacheStats.total++;
  }

  getCacheHitRate(): number {
    if (this.cacheStats.total === 0) return 0;
    return this.cacheStats.hits / this.cacheStats.total;
  }

  getMetricsSummary(name: string, timeWindow: number = 5 * 60 * 1000): {
    avg: number;
    p95: number;
    p99: number;
    count: number;
  } {
    const now = Date.now();
    const relevantMetrics = this.metrics
      .filter(m => m.name === name && now - m.timestamp <= timeWindow)
      .map(m => m.value)
      .sort((a, b) => a - b);

    if (relevantMetrics.length === 0) {
      return { avg: 0, p95: 0, p99: 0, count: 0 };
    }

    const sum = relevantMetrics.reduce((a, b) => a + b, 0);
    const avg = sum / relevantMetrics.length;
    const p95 = relevantMetrics[Math.floor(relevantMetrics.length * 0.95)];
    const p99 = relevantMetrics[Math.floor(relevantMetrics.length * 0.99)];

    return {
      avg,
      p95,
      p99,
      count: relevantMetrics.length
    };
  }

  logPerformanceSummary() {
    const searchMetrics = this.getMetricsSummary('search_duration');
    const renderMetrics = this.getMetricsSummary('render_duration');
    const cacheHitRate = this.getCacheHitRate();

    console.log('📊 [MONITOR] Performance Summary:');
    console.log(`Search Performance (last 5min):
  - Average: ${searchMetrics.avg.toFixed(2)}ms
  - P95: ${searchMetrics.p95.toFixed(2)}ms
  - P99: ${searchMetrics.p99.toFixed(2)}ms
  - Count: ${searchMetrics.count}`);
    
    console.log(`Render Performance (last 5min):
  - Average: ${renderMetrics.avg.toFixed(2)}ms
  - P95: ${renderMetrics.p95.toFixed(2)}ms
  - P99: ${renderMetrics.p99.toFixed(2)}ms
  - Count: ${renderMetrics.count}`);
    
    console.log(`Cache Performance:
  - Hit Rate: ${(cacheHitRate * 100).toFixed(2)}%
  - Hits: ${this.cacheStats.hits}
  - Misses: ${this.cacheStats.misses}
  - Total: ${this.cacheStats.total}`);
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
