import { useEffect, useRef, useState, useCallback } from 'react';
import { AlertCircle, Loader2, RefreshCw, Filter, FilterX } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { parseSuperset, convertToSDK, addDateRangeToUrlAlternative } from '@/utils/supersetEmbedding';
import { chartUrlManager, getCurrentChartUrl } from '@/utils/chartUrlManager';
import { useDashboardStore } from '@/store/dashboardStore';
import { ChartLoading, LoadingOverlay } from '@/components/common/LoadingStates';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface SupersetChartProps {
  iframeUrl: string;
  title?: string;
  className?: string;
  onError?: (error: string) => void;
  onSuccess?: () => void;
  autoRefresh?: boolean; // New prop to enable automatic URL refresh
  refreshInterval?: number; // Refresh interval in minutes
  chartId?: string; // Unique identifier for the chart (for filter toggle persistence)
}

export const SupersetChart = ({
  iframeUrl,
  title = 'Superset Chart',
  className = '',
  onError,
  onSuccess,
  autoRefresh = true,
  refreshInterval = 5,
  chartId,
}: SupersetChartProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'fallback'
  >('loading');
  const [error, setError] = useState<string>('');
  const [embedInstance, setEmbedInstance] = useState<unknown>(null);
  const [currentUrl, setCurrentUrl] = useState<string>(iframeUrl);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  // Always use simple filtering method as it's the only one that works correctly
  const [lastDateRange, setLastDateRange] = useState<{ from: Date; to: Date } | null>(null);

  // Filter toggle state - persisted per chart
  const getFilterToggleKey = useCallback(() => `chart-filter-enabled-${chartId || iframeUrl}`, [chartId, iframeUrl]);
  const [isFilterEnabled, setIsFilterEnabled] = useState<boolean>(() => {
    try {
      const key = `chart-filter-enabled-${chartId || iframeUrl}`;
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : true; // Default to enabled
    } catch {
      return true;
    }
  });

  // Get sheet-specific date range from dashboard store
  const { getSheetDateRange, currentSheetId } = useDashboardStore();
  const sheetDateRange = currentSheetId ? getSheetDateRange(currentSheetId) : null;

  // Toggle filter function with persistence
  const toggleFilter = useCallback(() => {
    const newState = !isFilterEnabled;
    setIsFilterEnabled(newState);
    try {
      localStorage.setItem(getFilterToggleKey(), JSON.stringify(newState));
    } catch (error) {
      console.warn('Failed to persist filter toggle state:', error);
    }
  }, [isFilterEnabled, getFilterToggleKey]);

  // Cleanup function to prevent memory leaks
  const cleanup = useCallback(() => {
    isMountedRef.current = false;

    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    if (embedInstance && typeof embedInstance.unmount === 'function') {
      try {
        embedInstance.unmount();
      } catch (err) {
        console.warn('Error unmounting embed instance:', err);
      }
    }
  }, [embedInstance]);

  // Function to refresh chart URL with improved error handling
  const refreshChartUrl = useCallback(async (force = false) => {
    if (isRefreshing || !isMountedRef.current) return;

    setIsRefreshing(true);
    try {
      const updatedUrl = await getCurrentChartUrl(iframeUrl, force);
      if (updatedUrl !== currentUrl && isMountedRef.current) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Chart URL updated:', { old: currentUrl, new: updatedUrl });
        }
        setCurrentUrl(updatedUrl);
      }
    } catch (error) {
      console.warn('Failed to refresh chart URL:', error);
      if (isMountedRef.current) {
        setError('Failed to refresh chart. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [isRefreshing, iframeUrl, currentUrl]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshChartUrl(false);
    }, refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshChartUrl]);

  // Initialize current URL on mount
  useEffect(() => {
    refreshChartUrl(false);
  }, [refreshChartUrl]);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | null = null;

    const initializeChart = async () => {
      // Debug logging removed for production
      if (!mountRef.current || !iframeUrl) {
        setStatus('error');
        setError('Missing mount point or iframe URL');
        return;
      }

      try {
        setStatus('loading');
        setError(''); // Clear previous errors

        // Check if date range has changed to force cache invalidation
        const dateRangeChanged = !lastDateRange ||
          !sheetDateRange ||
          lastDateRange.from.getTime() !== sheetDateRange.from.getTime() ||
          lastDateRange.to.getTime() !== sheetDateRange.to.getTime();

        if (dateRangeChanged && sheetDateRange) {
          setLastDateRange(sheetDateRange);
          if (process.env.NODE_ENV === 'development') {
            console.log('📅 Sheet date range changed, forcing chart refresh:', {
              previous: lastDateRange,
              current: sheetDateRange,
              sheetId: currentSheetId
            });
          }
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('Initializing Superset chart with URL:', currentUrl);
        }

        // Parse the iframe URL and apply date range filtering
        const embedInfo = parseSuperset(currentUrl);
        if (process.env.NODE_ENV === 'development') {
          console.log('Parsed embed info:', embedInfo);
        }

        if (!embedInfo.isValid) {
          throw new Error(`Invalid Superset URL format: ${currentUrl}`);
        }

        // Apply sheet-specific date range filter only if enabled for this chart
        let filteredUrl: string;

        if (isFilterEnabled && sheetDateRange) {
          try {
            filteredUrl = addDateRangeToUrlAlternative(embedInfo.srcUrl, sheetDateRange, 'simple');
            embedInfo.srcUrl = filteredUrl;
            if (process.env.NODE_ENV === 'development') {
              console.log('✅ Sheet date filter applied to chart:', {
                title,
                isFilterEnabled,
                sheetId: currentSheetId
              });
            }
          } catch (filterError) {
            console.error('❌ Error applying sheet date filter:', filterError);
            // Continue with unfiltered URL if filtering fails
            filteredUrl = embedInfo.srcUrl;
          }
        } else {
          filteredUrl = embedInfo.srcUrl;
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 Chart using unfiltered data:', {
              title,
              isFilterEnabled,
              hasSheetDateRange: !!sheetDateRange,
              sheetId: currentSheetId
            });
          }
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('🎯 RECORDDATE Filter Applied (Sheet-Specific):', {
            title,
            sheetId: currentSheetId,
            originalUrl: iframeUrl,
            baseUrl: embedInfo.srcUrl,
            filteredUrl,
            dateRange: sheetDateRange ? (() => {
              try {
                const fromDate = sheetDateRange.from instanceof Date ? sheetDateRange.from : new Date(sheetDateRange.from);
                const toDate = sheetDateRange.to instanceof Date ? sheetDateRange.to : new Date(sheetDateRange.to);
                return {
                  from: fromDate.toISOString().split('T')[0],
                  to: toDate.toISOString().split('T')[0],
                  duration: Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + ' days'
                };
              } catch (error) {
                console.error('Error processing date range:', error);
                return { error: 'Invalid date range' };
              }
            })() : null,
            hasFilters: !!sheetDateRange,
            filterStatus: sheetDateRange ? 'RECORDDATE filters active for this sheet' : 'No date filtering for this sheet'
          });
        }

        // Try to convert to SDK
        const sdkResult = await convertToSDK(embedInfo);
        if (process.env.NODE_ENV === 'development') {
          console.log('SDK conversion result:', sdkResult);
        }

        if (sdkResult.success && sdkResult.sdkConfig) {
          //
          // Use Superset SDK
          console.log('Using Superset SDK for embedding...');

          const supersetSdk =
            (window as Record<string, unknown>).supersetSdk || (window as Record<string, unknown>).supersetEmbeddedSdk;
          if (!supersetSdk) {
            throw new Error('Superset SDK not available on window');
          }

          // Set the mount point
          sdkResult.sdkConfig.mountPoint = mountRef.current;

          // Initialize the embed - try different SDK methods
          let embed;
          if (embedInfo.embedType === 'dashboard') {
            embed = supersetSdk.embedDashboard || supersetSdk.dashboard;
          } else {
            embed = supersetSdk.embedChart || supersetSdk.chart;
          }

          if (!embed) {
            console.log('Available SDK methods:', Object.keys(supersetSdk));
            throw new Error(
              `Superset SDK ${embedInfo.embedType} embed function not found`
            );
          }

          console.log(
            'Calling Superset SDK embed with config:',
            sdkResult.sdkConfig
          );
          const instance = embed(sdkResult.sdkConfig);

          if (mountRef.current) {
            const iframe = mountRef.current.querySelector('iframe');
            if (iframe) {
              iframe.style.marginTop = '20px';
              iframe.style.width = '100%';
              iframe.style.height = '100%';
              iframe.style.border = 'none';
            }
          }

          if (mounted) {
            setEmbedInstance(instance);
            setStatus('success');
            onSuccess?.();

            // Set up cleanup
            cleanup = () => {
              if (instance && typeof instance.unmount === 'function') {
                instance.unmount();
              }
            };
          }
        } else {
          // Fallback to iframe
          console.log('Falling back to iframe embedding...');
          console.log(
            'Fallback iframe HTML:',
            sdkResult.fallbackIframe,
            mountRef
          );

          if (sdkResult.fallbackIframe) {
            // Create iframe element directly with enhanced filtering support
            const iframe = document.createElement('iframe');

            // Add cache busting and force refresh parameters to ensure filters are applied
            const urlObj = new URL(embedInfo.srcUrl);
            urlObj.searchParams.set('_t', Date.now().toString()); // Cache busting
            urlObj.searchParams.set('standalone', '1'); // Ensure standalone mode

            iframe.src = urlObj.toString();
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '8px';
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute(
              'sandbox',
              'allow-scripts allow-same-origin allow-forms allow-popups'
            );

            // Add load event listener for debugging
            iframe.onload = () => {
              if (mounted) {
                console.log('✅ Iframe loaded successfully with sheet-specific RECORDDATE filters:', {
                  title,
                  sheetId: currentSheetId,
                  src: iframe.src,
                  hasDateRange: !!sheetDateRange,
                  filteringMethod: 'simple',
                  dateRange: sheetDateRange ? {
                    from: sheetDateRange.from.toLocaleDateString(),
                    to: sheetDateRange.to.toLocaleDateString()
                  } : null
                });
                setStatus('fallback');
                onSuccess?.();
              }
            };

            iframe.onerror = (event) => {
              if (mounted) {
                const errorMsg = `Iframe failed to load: ${iframe.src}`;
                console.error('❌ Iframe error:', {
                  title,
                  src: iframe.src,
                  event,
                  filteringMethod: 'simple'
                });
                setError(errorMsg);
                setStatus('error');
                onError?.(errorMsg);
              }
            };

            console.log('🚀 Creating iframe with sheet-specific RECORDDATE filters:', {
              title,
              sheetId: currentSheetId,
              finalUrl: iframe.src,
              mounted,
              hasDateRange: !!sheetDateRange
            });

            // Clear the container and add the iframe
            if (mountRef.current) {
              mountRef.current.innerHTML = '';
              mountRef.current.appendChild(iframe);
            }
            if (mounted) {
              setStatus('fallback');
              onSuccess?.();
            }
          } else {
            throw new Error(
              sdkResult.error || 'Failed to create fallback iframe'
            );
          }
        }
      } catch (err) {
        console.error('Chart initialization failed:', err);

        if (mounted) {
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error occurred';
          setError(errorMessage);
          setStatus('error');
          onError?.(errorMessage);
        }
      }
    };

    initializeChart();

    return () => {
      mounted = false;
      if (cleanup) {
        cleanup();
      }
    };
  }, [currentUrl, sheetDateRange, isFilterEnabled, onError, onSuccess, currentSheetId]); // Re-initialize when URL, sheet date range, or filter toggle changes

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <div
      className={`relative w-full h-full bg-card rounded-lg border ${className}`}
    >
      {title && status !== 'error' && (
        <div className='absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium z-10 flex items-center gap-2'>
          {title}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refreshChartUrl(true)}
            disabled={isRefreshing}
            className="h-5 w-5 p-0 hover:bg-primary/10"
            title="Refresh chart"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFilter}
            className={`h-5 w-5 p-0 hover:bg-primary/10 ${isFilterEnabled ? 'text-blue-600' : 'text-gray-400'}`}
            title={isFilterEnabled ? 'Disable global date filter for this chart' : 'Enable global date filter for this chart'}
          >
            {isFilterEnabled ? <Filter className="h-3 w-3" /> : <FilterX className="h-3 w-3" />}
          </Button>
        </div>
      )}


      <div ref={mountRef} className='w-full h-full' />

      <LoadingOverlay isLoading={status === 'loading'} message="Loading chart...">
        <div />
      </LoadingOverlay>

      {isRefreshing && (
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs z-10">
          <div className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Refreshing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupersetChart;
