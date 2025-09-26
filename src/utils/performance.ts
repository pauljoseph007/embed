// Performance monitoring and optimization utilities

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Monitor navigation timing
      try {
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              this.logNavigationMetrics(entry as PerformanceNavigationTiming);
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        console.warn('Navigation timing observer not supported:', error);
      }

      // Monitor resource loading
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              this.logResourceMetrics(entry as PerformanceResourceTiming);
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource timing observer not supported:', error);
      }
    }
  }

  private logNavigationMetrics(entry: PerformanceNavigationTiming) {
    const metrics = {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      domInteractive: entry.domInteractive - entry.navigationStart,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
    };

    console.log('📊 Navigation Performance:', metrics);
    
    // Log slow page loads
    if (metrics.loadComplete > 3000) {
      console.warn('⚠️ Slow page load detected:', metrics.loadComplete + 'ms');
    }
  }

  private logResourceMetrics(entry: PerformanceResourceTiming) {
    const duration = entry.responseEnd - entry.startTime;
    
    // Log slow resource loads
    if (duration > 2000) {
      console.warn('⚠️ Slow resource load:', {
        name: entry.name,
        duration: duration + 'ms',
        size: entry.transferSize || 'unknown'
      });
    }
  }

  private getFirstPaint(): number | null {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      return firstPaint ? firstPaint.startTime : null;
    }
    return null;
  }

  private getFirstContentfulPaint(): number | null {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcp ? fcp.startTime : null;
    }
    return null;
  }

  // Start timing a custom metric
  startTiming(name: string, metadata?: Record<string, any>): void {
    const startTime = performance.now();
    this.metrics.set(name, {
      name,
      startTime,
      metadata
    });
  }

  // End timing a custom metric
  endTiming(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`, metric.metadata);

    // Warn about slow operations
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  // Get all metrics
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics.clear();
  }

  // Get memory usage (if available)
  getMemoryUsage(): any {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  // Log memory usage
  logMemoryUsage(): void {
    const memory = this.getMemoryUsage();
    if (memory) {
      console.log('💾 Memory Usage:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });

      // Warn about high memory usage
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      if (usagePercent > 80) {
        console.warn(`⚠️ High memory usage: ${usagePercent.toFixed(1)}%`);
      }
    }
  }

  // Cleanup observers
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const startTiming = (name: string, metadata?: Record<string, any>) => {
    performanceMonitor.startTiming(name, metadata);
  };

  const endTiming = (name: string) => {
    return performanceMonitor.endTiming(name);
  };

  const logMemoryUsage = () => {
    performanceMonitor.logMemoryUsage();
  };

  return { startTiming, endTiming, logMemoryUsage };
};

// Decorator for timing function execution
export const timed = (name?: string) => {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const timerName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      performanceMonitor.startTiming(timerName);
      
      try {
        const result = originalMethod.apply(this, args);
        
        // Handle async functions
        if (result && typeof result.then === 'function') {
          return result.finally(() => {
            performanceMonitor.endTiming(timerName);
          });
        }
        
        performanceMonitor.endTiming(timerName);
        return result;
      } catch (error) {
        performanceMonitor.endTiming(timerName);
        throw error;
      }
    };

    return descriptor;
  };
};

// Utility to measure React component render time
export const measureRenderTime = (componentName: string) => {
  return {
    start: () => performanceMonitor.startTiming(`render:${componentName}`),
    end: () => performanceMonitor.endTiming(`render:${componentName}`)
  };
};

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📦 Bundle Analysis:');
    
    // Analyze loaded scripts
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    scripts.forEach(script => {
      const src = (script as HTMLScriptElement).src;
      if (src.includes('chunk') || src.includes('vendor')) {
        console.log(`- ${src.split('/').pop()}`);
      }
    });

    // Analyze loaded stylesheets
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    stylesheets.forEach(link => {
      const href = (link as HTMLLinkElement).href;
      console.log(`- ${href.split('/').pop()}`);
    });
  }
};

// Performance budget checker
export const checkPerformanceBudget = () => {
  const budget = {
    maxLoadTime: 3000, // 3 seconds
    maxMemoryUsage: 50, // 50MB
    maxResourceSize: 1024 * 1024, // 1MB
  };

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    const loadTime = navigation.loadEventEnd - navigation.navigationStart;
    if (loadTime > budget.maxLoadTime) {
      console.warn(`⚠️ Performance budget exceeded: Load time ${loadTime}ms > ${budget.maxLoadTime}ms`);
    }
  }

  const memory = performanceMonitor.getMemoryUsage();
  if (memory) {
    const usedMB = memory.usedJSHeapSize / 1024 / 1024;
    if (usedMB > budget.maxMemoryUsage) {
      console.warn(`⚠️ Performance budget exceeded: Memory usage ${usedMB.toFixed(2)}MB > ${budget.maxMemoryUsage}MB`);
    }
  }
};

export default performanceMonitor;
