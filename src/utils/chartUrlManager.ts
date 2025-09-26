/**
 * Chart URL Manager - Handles dynamic chart updates and URL management
 * Solves the problem of chart IDs changing in Superset after updates
 */

export interface ChartUrlInfo {
  originalUrl: string;
  currentUrl: string;
  chartId: string;
  baseUrl: string;
  parameters: Record<string, string>;
  lastUpdated: Date;
  isValid: boolean;
}

export interface ChartRefreshResult {
  success: boolean;
  newUrl?: string;
  error?: string;
  chartInfo?: ChartUrlInfo;
}

class ChartUrlManager {
  private static instance: ChartUrlManager;
  private chartCache = new Map<string, ChartUrlInfo>();
  private refreshInterval = 5 * 60 * 1000; // 5 minutes
  private maxRetries = 3;

  static getInstance(): ChartUrlManager {
    if (!ChartUrlManager.instance) {
      ChartUrlManager.instance = new ChartUrlManager();
    }
    return ChartUrlManager.instance;
  }

  /**
   * Parse and normalize chart URL from various formats
   */
  parseChartUrl(input: string): ChartUrlInfo | null {
    try {
      let srcUrl = '';
      
      // Extract URL from iframe if provided
      if (input.includes('<iframe')) {
        const iframeMatch = input.match(/src=["']([^"']+)["']/i);
        if (iframeMatch) {
          srcUrl = iframeMatch[1];
        }
      } else {
        srcUrl = input.trim();
      }

      if (!srcUrl) return null;

      const url = new URL(srcUrl);
      const pathname = url.pathname;
      
      // Extract chart ID from various URL patterns
      let chartId = '';
      const chartPatterns = [
        /\/explore\/p\/([^/?]+)/,           // /explore/p/<id>
        /\/superset\/explore\/p\/([^/?]+)/, // /superset/explore/p/<id>
        /\/chart\/([^/?]+)/,                // /chart/<id>
        /\/embedded\/([^/?]+)/              // /embedded/<id>
      ];

      for (const pattern of chartPatterns) {
        const match = pathname.match(pattern);
        if (match) {
          chartId = match[1];
          break;
        }
      }

      if (!chartId) {
        console.warn('Could not extract chart ID from URL:', srcUrl);
        return null;
      }

      // Extract parameters
      const parameters: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        parameters[key] = value;
      });

      const baseUrl = `${url.protocol}//${url.host}`;

      const chartInfo: ChartUrlInfo = {
        originalUrl: srcUrl,
        currentUrl: srcUrl,
        chartId,
        baseUrl,
        parameters,
        lastUpdated: new Date(),
        isValid: true
      };

      // Cache the chart info
      this.chartCache.set(chartId, chartInfo);
      
      return chartInfo;
    } catch (error) {
      console.error('Error parsing chart URL:', error);
      return null;
    }
  }

  /**
   * Get current chart URL, checking for updates if needed
   */
  async getCurrentChartUrl(originalUrl: string, forceRefresh = false): Promise<string> {
    const chartInfo = this.parseChartUrl(originalUrl);
    if (!chartInfo) return originalUrl;

    const cached = this.chartCache.get(chartInfo.chartId);
    const shouldRefresh = forceRefresh || 
                         !cached || 
                         (Date.now() - cached.lastUpdated.getTime()) > this.refreshInterval;

    if (shouldRefresh) {
      const refreshResult = await this.refreshChartUrl(chartInfo.chartId);
      if (refreshResult.success && refreshResult.newUrl) {
        return refreshResult.newUrl;
      }
    }

    return cached?.currentUrl || originalUrl;
  }

  /**
   * Refresh chart URL by checking for updates
   */
  async refreshChartUrl(chartId: string): Promise<ChartRefreshResult> {
    try {
      const cached = this.chartCache.get(chartId);
      if (!cached) {
        return { success: false, error: 'Chart not found in cache' };
      }

      // Try to fetch the chart page to check if it's still valid
      const testUrl = `${cached.baseUrl}/superset/explore/p/${chartId}/`;
      
      try {
        const response = await fetch(testUrl, { 
          method: 'HEAD',
          mode: 'no-cors' // Avoid CORS issues
        });
        
        // If we can reach the URL, assume it's still valid
        cached.lastUpdated = new Date();
        cached.isValid = true;
        this.chartCache.set(chartId, cached);
        
        return { 
          success: true, 
          newUrl: cached.currentUrl,
          chartInfo: cached 
        };
      } catch (fetchError) {
        // If fetch fails, mark as potentially invalid but don't fail completely
        console.warn(`Could not verify chart ${chartId}, but continuing with cached URL`);
        cached.isValid = false;
        this.chartCache.set(chartId, cached);
        
        return { 
          success: true, 
          newUrl: cached.currentUrl,
          chartInfo: cached 
        };
      }
    } catch (error) {
      console.error('Error refreshing chart URL:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Update chart URL when a new version is detected
   */
  updateChartUrl(oldChartId: string, newUrl: string): boolean {
    try {
      const newChartInfo = this.parseChartUrl(newUrl);
      if (!newChartInfo) return false;

      const oldCached = this.chartCache.get(oldChartId);
      if (oldCached) {
        // Update the cached entry with new information
        oldCached.currentUrl = newUrl;
        oldCached.chartId = newChartInfo.chartId;
        oldCached.parameters = newChartInfo.parameters;
        oldCached.lastUpdated = new Date();
        oldCached.isValid = true;
        
        // Cache under both old and new IDs for transition period
        this.chartCache.set(oldChartId, oldCached);
        this.chartCache.set(newChartInfo.chartId, oldCached);
      }

      return true;
    } catch (error) {
      console.error('Error updating chart URL:', error);
      return false;
    }
  }

  /**
   * Get chart information from cache
   */
  getChartInfo(chartId: string): ChartUrlInfo | null {
    return this.chartCache.get(chartId) || null;
  }

  /**
   * Clear cache for a specific chart
   */
  clearChartCache(chartId: string): void {
    this.chartCache.delete(chartId);
  }

  /**
   * Clear all cached chart information
   */
  clearAllCache(): void {
    this.chartCache.clear();
  }

  /**
   * Get all cached charts
   */
  getAllCachedCharts(): ChartUrlInfo[] {
    return Array.from(this.chartCache.values());
  }

  /**
   * Validate and clean a chart URL for portal use
   */
  cleanChartUrl(input: string): string {
    const chartInfo = this.parseChartUrl(input);
    if (!chartInfo) return input;

    // Ensure standalone parameter is set for proper embedding
    const url = new URL(chartInfo.currentUrl);
    url.searchParams.set('standalone', '1');
    
    // Set appropriate height if not specified
    if (!url.searchParams.has('height')) {
      url.searchParams.set('height', '400');
    }

    return url.toString();
  }

  /**
   * Generate iframe HTML for a chart URL
   */
  generateIframeHtml(chartUrl: string, width = 600, height = 400): string {
    const cleanUrl = this.cleanChartUrl(chartUrl);
    return `<iframe width="${width}" height="${height}" seamless frameBorder="0" scrolling="no" src="${cleanUrl}"></iframe>`;
  }
}

// Export singleton instance
export const chartUrlManager = ChartUrlManager.getInstance();

// Utility functions for easy use
export const parseChartUrl = (input: string) => chartUrlManager.parseChartUrl(input);
export const getCurrentChartUrl = (originalUrl: string, forceRefresh = false) => 
  chartUrlManager.getCurrentChartUrl(originalUrl, forceRefresh);
export const cleanChartUrl = (input: string) => chartUrlManager.cleanChartUrl(input);
export const generateIframeHtml = (chartUrl: string, width?: number, height?: number) => 
  chartUrlManager.generateIframeHtml(chartUrl, width, height);
