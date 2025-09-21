import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseSuperset, convertToSDK, addDateRangeToUrl } from '@/utils/supersetEmbedding';
import { useDashboardStore } from '@/store/dashboardStore';

interface SupersetChartProps {
  iframeUrl: string;
  title?: string;
  className?: string;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

export const SupersetChart = ({
  iframeUrl,
  title = 'Superset Chart',
  className = '',
  onError,
  onSuccess,
}: SupersetChartProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'fallback'
  >('loading');
  const [error, setError] = useState<string>('');
  const [embedInstance, setEmbedInstance] = useState<any>(null);

  // Get global date range from dashboard store
  const { globalDateRange } = useDashboardStore();

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | null = null;

    const initializeChart = async () => {
      console.log(
        !mountRef.current || !iframeUrl,
        !mountRef.current,
        !iframeUrl,
        mountRef.current,
        'aaaaaaaaaa'
      );
      if (!mountRef.current || !iframeUrl) {
        setStatus('error');
        setError('Missing mount point or iframe URL');
        return;
      }

      try {
        setStatus('loading');
        console.log('Initializing Superset chart with URL:', iframeUrl);

        // Parse the iframe URL and apply date range filtering
        const embedInfo = parseSuperset(iframeUrl);
        console.log('Parsed embed info:', embedInfo);

        if (!embedInfo.isValid) {
          throw new Error('Invalid Superset URL format');
        }

        // Apply global date range filter to the URL
        const filteredUrl = addDateRangeToUrl(embedInfo.srcUrl, globalDateRange);
        embedInfo.srcUrl = filteredUrl;

        console.log('Applied date range filter:', {
          originalUrl: iframeUrl,
          filteredUrl,
          dateRange: globalDateRange
        });

        // Try to convert to SDK
        const sdkResult = await convertToSDK(embedInfo);
        console.log('SDK conversion result:', sdkResult);

        if (sdkResult.success && sdkResult.sdkConfig) {
          //
          // Use Superset SDK
          console.log('Using Superset SDK for embedding...');

          const supersetSdk =
            (window as any).supersetSdk || (window as any).supersetEmbeddedSdk;
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
            // Create iframe element directly instead of using innerHTML
            const iframe = document.createElement('iframe');
            iframe.src = embedInfo.srcUrl;
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '8px';
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute(
              'sandbox',
              'allow-scripts allow-same-origin allow-forms'
            );
            console.log(mounted, 'mountedaaaaaa', mountRef);

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
  }, [iframeUrl, globalDateRange, onError, onSuccess]); // Re-initialize when date range changes

  return (
    <div
      className={`relative w-full h-full bg-card rounded-lg border ${className}`}
    >
      {title && status !== 'error' && (
        <div className='absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium z-10'>
          {title}
        </div>
      )}
      <div ref={mountRef} className='w-full h-full' />

      {status === 'loading' && (
        <div className='flex items-center justify-center absolute inset-0 bg-white/50'>
          <div className='text-center'>
            <Loader2 className='h-8 w-8 animate-spin mx-auto mb-2 text-primary' />
            <p className='text-sm text-muted-foreground'>Loading chart...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupersetChart;
