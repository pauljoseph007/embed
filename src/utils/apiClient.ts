// Centralized API client with retry logic, error handling, and TypeScript support
import React from 'react';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition?: (error: ApiError) => boolean;
}

export interface RequestConfig extends RequestInit {
  timeout?: number;
  retry?: RetryConfig;
  baseURL?: string;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetry: RetryConfig;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this.defaultTimeout = 10000; // 10 seconds
    this.defaultRetry = {
      maxRetries: 3,
      retryDelay: 1000,
      retryCondition: (error) => {
        // Retry on network errors or 5xx server errors
        return !error.status || error.status >= 500;
      }
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  private async executeRequest<T>(
    url: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retry = this.defaultRetry,
      baseURL = this.baseURL,
      ...fetchConfig
    } = config;

    const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;
    
    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...fetchConfig.headers,
    };

    let lastError: ApiError;

    for (let attempt = 0; attempt <= retry.maxRetries; attempt++) {
      try {
        console.log(`API Request (attempt ${attempt + 1}):`, {
          url: fullUrl,
          method: fetchConfig.method || 'GET',
          attempt: attempt + 1,
          maxRetries: retry.maxRetries + 1,
          body: fetchConfig.body ? JSON.parse(fetchConfig.body as string) : undefined
        });

        // Create fetch promise with timeout
        const fetchPromise = fetch(fullUrl, {
          ...fetchConfig,
          headers,
        });

        const timeoutPromise = this.createTimeoutPromise(timeout);
        const response = await Promise.race([fetchPromise, timeoutPromise]);

        // Handle HTTP errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const apiError: ApiError = {
            message: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
            status: response.status,
            details: errorData
          };

          console.error(`API Error Response:`, {
            url: fullUrl,
            status: response.status,
            statusText: response.statusText,
            errorData,
            attempt: attempt + 1
          });

          // Check if we should retry
          if (attempt < retry.maxRetries && retry.retryCondition?.(apiError)) {
            lastError = apiError;
            console.warn(`Request failed, retrying in ${retry.retryDelay}ms:`, apiError);
            await this.delay(retry.retryDelay * (attempt + 1)); // Exponential backoff
            continue;
          }

          throw apiError;
        }

        // Parse response
        const data = await response.json();
        
        console.log('API Response:', {
          url: fullUrl,
          status: response.status,
          success: true,
          attempt: attempt + 1
        });

        return data;

      } catch (error) {
        const apiError: ApiError = error instanceof Error 
          ? { message: error.message }
          : { message: 'Unknown error occurred' };

        lastError = apiError;

        // Check if we should retry
        if (attempt < retry.maxRetries && retry.retryCondition?.(apiError)) {
          console.warn(`Request failed, retrying in ${retry.retryDelay}ms:`, apiError);
          await this.delay(retry.retryDelay * (attempt + 1)); // Exponential backoff
          continue;
        }

        console.error('API Request failed:', {
          url: fullUrl,
          error: apiError,
          attempt: attempt + 1,
          maxRetries: retry.maxRetries + 1
        });

        throw apiError;
      }
    }

    throw lastError!;
  }

  // GET request
  async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, { ...config, method: 'GET' });
  }

  // POST request
  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, { ...config, method: 'DELETE' });
  }

  // PATCH request
  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Update base URL
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  // Get current base URL
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Create default instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };

// Utility function for handling API errors in components
export const handleApiError = (error: any): string => {
  if (error && typeof error === 'object') {
    if (error.message) return error.message;
    if (error.error) return error.error;
    if (error.details?.error) return error.details.error;
  }
  
  if (typeof error === 'string') return error;
  
  return 'An unexpected error occurred. Please try again.';
};

// Hook for API calls with loading and error states
export const useApiCall = <T = any>() => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<T | null>(null);

  const execute = React.useCallback(async (apiCall: () => Promise<ApiResponse<T>>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      setData(response.data || null);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = React.useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { loading, error, data, execute, reset };
};

export default apiClient;
