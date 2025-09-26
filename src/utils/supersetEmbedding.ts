// Superset embedding utilities
export interface SupersetConfig {
  baseUrl: string;
  guestToken?: string;
  dashboardId?: string;
  chartId?: string;
}

export interface GuestTokenRequest {
  user: {
    username: string;
    first_name: string;
    last_name: string;
  };
  resources: Array<{
    type: 'dashboard' | 'chart';
    id: string;
  }>;
  rls: Array<{
    clause: string;
  }>;
}

export interface GuestTokenResponse {
  token: string;
  expires_at: string;
}

export interface ParsedEmbed {
  embedType: 'chart' | 'dashboard';
  embedId: string;
  srcUrl: string;
  isValid: boolean;
}

export function parseSuperset(input: string): ParsedEmbed {
  // Clean the input
  const cleanInput = input.trim();

  if (!cleanInput) {
    return {
      embedType: 'chart',
      embedId: '',
      srcUrl: '',
      isValid: false
    };
  }

  // Try to extract from iframe first
  let srcUrl = '';

  // Enhanced iframe parsing - support multiple formats
  const iframePatterns = [
    /src=["']([^"']+)["']/i,
    /src=([^\s>]+)/i,
    /<iframe[^>]*src=["']([^"']+)["'][^>]*>/i
  ];

  for (const pattern of iframePatterns) {
    const match = cleanInput.match(pattern);
    if (match) {
      srcUrl = match[1];
      break;
    }
  }

  // If no iframe found, check if it's a direct URL
  if (!srcUrl) {
    if (cleanInput.startsWith('http')) {
      srcUrl = cleanInput;
    } else if (cleanInput.startsWith('//')) {
      srcUrl = 'https:' + cleanInput;
    } else if (cleanInput.startsWith('/')) {
      // Relative URL - need base domain
      return {
        embedType: 'chart',
        embedId: '',
        srcUrl: '',
        isValid: false
      };
    } else {
      return {
        embedType: 'chart',
        embedId: '',
        srcUrl: '',
        isValid: false
      };
    }
  }
  
  // Parse the URL to determine type and ID
  try {
    const url = new URL(srcUrl);
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    // Enhanced chart patterns
    const chartPatterns = [
      /\/explore\/p\/([^/?]+)/,           // /explore/p/<id>
      /\/superset\/explore\/p\/([^/?]+)/, // /superset/explore/p/<id>
      /\/explore\/([^/?]+)/,              // /explore/<id>
      /\/chart\/([^/?]+)/,                // /chart/<id>
      /\/embedded\/([^/?]+)/              // /embedded/<id>
    ];

    for (const pattern of chartPatterns) {
      const match = pathname.match(pattern);
      if (match) {
        return {
          embedType: 'chart',
          embedId: match[1],
          srcUrl: srcUrl,
          isValid: true
        };
      }
    }

    // Enhanced dashboard patterns
    const dashboardPatterns = [
      /\/dashboard\/([^/?]+)/,              // /dashboard/<id>
      /\/superset\/dashboard\/([^/?]+)/,    // /superset/dashboard/<id>
      /\/dashboards\/([^/?]+)/,             // /dashboards/<id>
      /\/d\/([^/?]+)/                       // /d/<id>
    ];

    for (const pattern of dashboardPatterns) {
      const match = pathname.match(pattern);
      if (match) {
        return {
          embedType: 'dashboard',
          embedId: match[1],
          srcUrl: srcUrl,
          isValid: true
        };
      }
    }

    // Check URL parameters for IDs
    const chartId = searchParams.get('chart_id') || searchParams.get('chartId') || searchParams.get('id');
    if (chartId) {
      return {
        embedType: 'chart',
        embedId: chartId,
        srcUrl: srcUrl,
        isValid: true
      };
    }

    const dashboardId = searchParams.get('dashboard_id') || searchParams.get('dashboardId');
    if (dashboardId) {
      return {
        embedType: 'dashboard',
        embedId: dashboardId,
        srcUrl: srcUrl,
        isValid: true
      };
    }

    // Fallback - try to extract any alphanumeric ID from the path
    const genericMatch = pathname.match(/\/([a-zA-Z0-9_-]+)\/?$/);
    if (genericMatch && genericMatch[1].length > 2) {
      return {
        embedType: 'chart',
        embedId: genericMatch[1],
        srcUrl: srcUrl,
        isValid: true
      };
    }
  } catch (e) {
    console.error('Error parsing Superset URL:', e);
  }
  
  return {
    embedType: 'chart',
    embedId: '',
    srcUrl: '',
    isValid: false
  };
}

export async function convertToSDK(embedInfo: ParsedEmbed): Promise<{
  success: boolean;
  sdkConfig?: any;
  fallbackIframe?: string;
  error?: string;
}> {
  if (!embedInfo.isValid) {
    console.error('Invalid embed information provided:', embedInfo);
    return {
      success: false,
      error: 'Invalid embed information provided',
      fallbackIframe: createFallbackIframe(embedInfo.srcUrl)
    };
  }

  try {
    // Check if Superset SDK is available (try both possible names)
    const supersetSdk = (window as any).supersetSdk || (window as any).supersetEmbeddedSdk;
    if (typeof window !== 'undefined' && supersetSdk) {
      console.log('Superset SDK detected, attempting to get guest token...');

      // For charts, skip guest token and use iframe fallback since Superset guest tokens only work with dashboards
      if (embedInfo.embedType === 'chart') {
        console.log('Chart embedding detected, using iframe fallback instead of SDK due to guest token limitations');
        return {
          success: false,
          error: 'Chart embedding uses iframe fallback (guest tokens only support dashboards)',
          fallbackIframe: createFallbackIframe(embedInfo.srcUrl)
        };
      }

      const guestToken = await getGuestToken(embedInfo.embedId, embedInfo.embedType);

      if (guestToken) {
        console.log('Guest token obtained, creating SDK configuration...');

        const supersetDomain = extractDomain(embedInfo.srcUrl);
        console.log('Superset domain:', supersetDomain);

        const sdkConfig = {
          id: embedInfo.embedId,
          supersetDomain: supersetDomain,
          mountPoint: null, // Will be set when mounting
          fetchGuestToken: () => {
            console.log('SDK requesting guest token...');
            return Promise.resolve(guestToken);
          },
          dashboardUiConfig: {
            hideTitle: false,
            hideTab: false,
            hideChartControls: false,
            hideFilters: false,
          },
          chartUiConfig: {
            hideTitle: false,
            hideChartControls: false,
          }
        };

        console.log('SDK configuration created successfully:', {
          id: sdkConfig.id,
          domain: sdkConfig.supersetDomain,
          hasToken: !!guestToken
        });

        return { success: true, sdkConfig };
      } else {
        console.warn('Guest token not available, falling back to iframe');
        return {
          success: false,
          error: 'Guest token not available - check backend connection',
          fallbackIframe: createFallbackIframe(embedInfo.srcUrl)
        };
      }
    } else {
      console.warn('Superset SDK not available on window object, falling back to iframe');
      console.log('Available on window:', Object.keys(window).filter(k => k.toLowerCase().includes('superset')));
      console.log('Checking for SDK variants:', {
        supersetSdk: !!(window as any).supersetSdk,
        supersetEmbeddedSdk: !!(window as any).supersetEmbeddedSdk
      });
      return {
        success: false,
        error: 'Superset SDK not loaded - check script tag in index.html',
        fallbackIframe: createFallbackIframe(embedInfo.srcUrl)
      };
    }
  } catch (error) {
    console.error('SDK conversion failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallbackIframe: createFallbackIframe(embedInfo.srcUrl)
    };
  }
}

function createFallbackIframe(srcUrl: string): string {
  if (!srcUrl) {
    return '<div class="flex items-center justify-center h-full text-muted-foreground">Invalid chart URL</div>';
  }

  return `<iframe
    src="${srcUrl}"
    width="100%"
    height="100%"
    frameborder="0"
    style="border: none; border-radius: 8px;"
    allowfullscreen
    sandbox="allow-scripts allow-same-origin allow-forms">
  </iframe>`;
}









// Enhanced filtering approach with multiple fallback methods for better compatibility
export function addDateRangeToUrlAlternative(url: string, dateRange: { from: Date; to: Date } | null, method: 'simple' = 'simple'): string {
  if (!dateRange || !url) return url;

  try {
    const urlObj = new URL(url);

    // Basic date validation
    if (!dateRange.from || !dateRange.to || isNaN(dateRange.from.getTime()) || isNaN(dateRange.to.getTime())) {
      console.error('❌ Invalid date range provided');
      return url;
    }

    const fromDateObj = dateRange.from;
    const toDateObj = dateRange.to;

    const fromDate = fromDateObj.toISOString().split('T')[0];
    const toDate = toDateObj.toISOString().split('T')[0];
    const standardDateFormat = `${fromDate} : ${toDate}`;

    // Clear existing parameters
    urlObj.searchParams.delete('extra_filters');
    urlObj.searchParams.delete('form_data');
    urlObj.searchParams.delete('time_range');
    urlObj.searchParams.delete('time_range_start');
    urlObj.searchParams.delete('time_range_end');

    console.log(`🔄 ALTERNATIVE FILTERING METHOD: ${method.toUpperCase()}`, {
      dateRange: standardDateFormat,
      method: method
    });

    switch (method) {
      case 'simple': {
        // Enhanced simple approach with multiple filter strategies
        const existingFormData = urlObj.searchParams.get('form_data');
        let formData: Record<string, unknown> = {};

        if (existingFormData) {
          try {
            formData = JSON.parse(decodeURIComponent(existingFormData));
            console.log('📋 Existing form_data parsed:', formData);
          } catch (e) {
            console.warn('Could not parse existing form_data, starting fresh:', e);
          }
        }

        // Initialize adhoc_filters if not present
        formData.adhoc_filters = formData.adhoc_filters || [];

        // Remove any existing RECORDDATE filters to avoid conflicts
        const originalFilterCount = formData.adhoc_filters.length;
        formData.adhoc_filters = formData.adhoc_filters.filter((f: Record<string, unknown>) =>
          f.subject !== 'RECORDDATE' &&
          f.subject !== 'recorddate' &&
          f.subject !== 'RecordDate'
        );

        console.log(`🧹 Cleaned ${originalFilterCount - formData.adhoc_filters.length} existing date filters`);

        // Strategy 1: Standard RECORDDATE filters with >= and <= operators
        const dateFilters = [
          {
            clause: 'WHERE',
            subject: 'RECORDDATE',
            operator: '>=',
            comparator: fromDate,
            expressionType: 'SIMPLE'
          },
          {
            clause: 'WHERE',
            subject: 'RECORDDATE',
            operator: '<=',
            comparator: toDate,
            expressionType: 'SIMPLE'
          }
        ];

        formData.adhoc_filters.push(...dateFilters);

        // Strategy 2: Add time range parameters as backup
        formData.time_range = standardDateFormat;
        formData.time_range_start = fromDate;
        formData.time_range_end = toDate;

        // Strategy 3: Force cache refresh and ensure fresh data
        formData.force = true;
        formData.cache_timeout = 0;
        formData.refresh = Date.now();

        // Strategy 4: Add extra filters as additional backup
        const extraFilters = JSON.stringify([
          {
            col: 'RECORDDATE',
            op: '>=',
            val: fromDate
          },
          {
            col: 'RECORDDATE',
            op: '<=',
            val: toDate
          }
        ]);

        // Apply all parameters
        urlObj.searchParams.set('form_data', encodeURIComponent(JSON.stringify(formData)));
        urlObj.searchParams.set('extra_filters', encodeURIComponent(extraFilters));
        urlObj.searchParams.set('time_range', standardDateFormat);
        urlObj.searchParams.set('time_range_start', fromDate);
        urlObj.searchParams.set('time_range_end', toDate);
        urlObj.searchParams.set('force', `enhanced_${fromDate}_${toDate}_${Date.now()}`);
        urlObj.searchParams.set('cache_timeout', '0');
        urlObj.searchParams.set('standalone', '1');
        urlObj.searchParams.set('refresh', Date.now().toString());

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ ENHANCED SIMPLE method applied with multiple strategies:', {
            primaryFilters: formData.adhoc_filters.filter((f: Record<string, unknown>) => f.subject === 'RECORDDATE'),
            timeRange: standardDateFormat,
            extraFilters: extraFilters,
            dateRange: { fromDate, toDate },
            totalFilters: formData.adhoc_filters.length
          });
        }
        break;
      }
    }

    urlObj.searchParams.set('standalone', '1');
    urlObj.searchParams.set('debug_method', method);

    const result = urlObj.toString();

    // Log the successful filter application
    console.log('✅ Simple filter applied successfully:', {
      method,
      originalUrl: url,
      filteredUrl: result,
      dateRange: { from: fromDateObj.toLocaleDateString(), to: toDateObj.toLocaleDateString() }
    });

    return result;
  } catch (error) {
    console.error(`Error in ${method} filtering:`, error);
    return url;
  }
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch {
    // Fallback to environment variable or default
    const supersetUrl = import.meta.env.NEXT_PUBLIC_SUPERSET_URL || 'https://bi.sdxpartners.com';
    console.log('Using fallback Superset URL:', supersetUrl);
    return supersetUrl;
  }
}

// Guest token management - Updated to use backend API
class GuestTokenManager {
  private static instance: GuestTokenManager;
  private tokens: Map<string, { token: string; expiresAt: Date }> = new Map();
  private apiBaseUrl: string = '';

  static getInstance(): GuestTokenManager {
    if (!GuestTokenManager.instance) {
      GuestTokenManager.instance = new GuestTokenManager();
    }
    return GuestTokenManager.instance;
  }

  setApiBaseUrl(url: string) {
    this.apiBaseUrl = url;
  }

  async getGuestToken(resourceType: 'dashboard' | 'chart', resourceId: string): Promise<string | null> {
    // Superset guest tokens only work with dashboards, not individual charts
    // For charts, we'll skip guest token and use iframe fallback
    if (resourceType === 'chart') {
      console.warn('Chart guest token requested, but Superset only supports dashboard guest tokens. Skipping token request.');
      return null;
    }

    const key = `${resourceType}-${resourceId}`;
    const cached = this.tokens.get(key);

    // Check if we have a valid cached token (with 5 minute buffer)
    if (cached && cached.expiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
      console.log('Using cached guest token for:', key);
      return cached.token;
    }

    // Request new token from our backend
    try {
      console.log('Requesting new guest token for:', { resourceType, resourceId });
      const token = await this.requestGuestTokenFromBackend(resourceType, resourceId);
      if (token) {
        this.tokens.set(key, token);
        console.log('Guest token obtained successfully:', {
          resourceType,
          resourceId,
          expiresAt: token.expiresAt
        });
        return token.token;
      }
    } catch (error) {
      console.error('Failed to get guest token:', error);
    }

    return null;
  }

  private async requestGuestTokenFromBackend(resourceType: 'dashboard' | 'chart', resourceId: string): Promise<{ token: string; expiresAt: Date } | null> {
    const apiUrl = this.apiBaseUrl || 'http://localhost:3001';

    try {
      const response = await fetch(`${apiUrl}/api/get-guest-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embedType: resourceType,
          embedId: resourceId,
          dashboardId: resourceType === 'dashboard' ? resourceId : undefined,
          chartId: resourceType === 'chart' ? resourceId : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Backend API error: ${response.status} ${response.statusText}. ${errorData.error || ''}`);
      }

      const data = await response.json();

      return {
        token: data.token,
        expiresAt: new Date(data.expires_at)
      };
    } catch (error) {
      console.error('Error requesting guest token from backend:', error);
      throw error;
    }
  }

  clearTokens() {
    this.tokens.clear();
    console.log('All guest tokens cleared');
  }

  // Test backend connection
  async testConnection(): Promise<boolean> {
    const apiUrl = this.apiBaseUrl || 'http://localhost:3001';

    try {
      const response = await fetch(`${apiUrl}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }

  // For development/demo purposes
  setMockToken(resourceType: 'dashboard' | 'chart', resourceId: string, token: string) {
    const key = `${resourceType}-${resourceId}`;
    this.tokens.set(key, {
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    console.log('Mock token set for:', key);
  }
}

export const guestTokenManager = GuestTokenManager.getInstance();

// Initialize the guest token manager with the correct API base URL
if (typeof window !== 'undefined') {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  guestTokenManager.setApiBaseUrl(apiBaseUrl);
  console.log('Guest token manager initialized with API base URL:', apiBaseUrl);
}

async function getGuestToken(embedId: string, embedType: string): Promise<string | null> {
  // Use the enhanced token manager
  return await guestTokenManager.getGuestToken(embedType as 'dashboard' | 'chart', embedId);
}

export function createDemoChart(title: string, type: 'line' | 'bar' | 'pie' | 'area' = 'line'): string {
  const colors = {
    line: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
    bar: ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'],
    pie: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    area: ['#3b82f6', '#10b981']
  };
  
  const data = generateDemoData(type);
  
  return `
    <div class="w-full h-full flex flex-col bg-card rounded-lg p-4">
      <h3 class="text-lg font-semibold mb-4 text-foreground">${title}</h3>
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center text-muted-foreground">
          <div class="w-16 h-16 mx-auto mb-3 bg-gradient-primary rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <p class="text-sm font-medium">Demo ${type.charAt(0).toUpperCase() + type.slice(1)} Chart</p>
          <p class="text-xs mt-1">Connected via Superset SDK</p>
        </div>
      </div>
    </div>
  `;
}

function generateDemoData(type: string) {
  // This would generate appropriate demo data based on chart type
  switch (type) {
    case 'line':
      return Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        value: Math.floor(Math.random() * 1000) + 500
      }));
    case 'bar':
      return Array.from({ length: 6 }, (_, i) => ({
        category: `Cat ${i + 1}`,
        value: Math.floor(Math.random() * 100) + 20
      }));
    case 'pie':
      return Array.from({ length: 5 }, (_, i) => ({
        segment: `Segment ${i + 1}`,
        value: Math.floor(Math.random() * 50) + 10
      }));
    case 'area':
      return Array.from({ length: 10 }, (_, i) => ({
        period: i + 1,
        value1: Math.floor(Math.random() * 200) + 100,
        value2: Math.floor(Math.random() * 150) + 50
      }));
    default:
      return [];
  }
}