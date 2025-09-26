// File-based storage service that communicates with the backend
import { apiClient, ApiResponse, handleApiError } from '@/utils/apiClient';

// Legacy interface for backward compatibility
export interface LegacyApiResponse<T = any> extends ApiResponse<T> {
  user?: T;
  users?: T;
  dashboard?: T;
  dashboards?: T;
  session?: T;
}

class StorageService {
  // Use the centralized API client with retry logic and better error handling
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<LegacyApiResponse<T>> {
    try {
      const method = options.method || 'GET';
      const body = options.body ? JSON.parse(options.body as string) : undefined;

      let response: ApiResponse<T>;

      switch (method.toLowerCase()) {
        case 'post':
          response = await apiClient.post<T>(endpoint, body);
          break;
        case 'put':
          response = await apiClient.put<T>(endpoint, body);
          break;
        case 'delete':
          response = await apiClient.delete<T>(endpoint);
          break;
        case 'patch':
          response = await apiClient.patch<T>(endpoint, body);
          break;
        default:
          response = await apiClient.get<T>(endpoint);
      }

      return response as LegacyApiResponse<T>;
    } catch (error) {
      console.error(`Storage service error for ${endpoint}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    return this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(sessionId?: string) {
    return this.makeRequest('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async checkSession(sessionId: string) {
    return this.makeRequest(`/api/auth/session/${sessionId}`);
  }

  // User management methods
  async createUser(user: any, type: string = 'adminUsers') {
    console.log('🔄 StorageService: Creating user:', user, 'type:', type);
    const result = await this.makeRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify({ user, type }),
    });
    console.log('✅ StorageService: User creation result:', result);
    return result;
  }

  async updateUser(userId: string, updates: any, type: string = 'adminUsers') {
    return this.makeRequest(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ updates, type }),
    });
  }

  async deleteUser(userId: string, type: string = 'adminUsers') {
    return this.makeRequest(`/api/users/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ type }),
    });
  }

  async getUsers() {
    return this.makeRequest('/api/users');
  }

  // Dashboard management methods
  async getDashboards() {
    return this.makeRequest('/api/dashboards');
  }

  async createDashboard(dashboard: any) {
    return this.makeRequest('/api/dashboards', {
      method: 'POST',
      body: JSON.stringify({ dashboard }),
    });
  }

  async updateDashboard(dashboardId: string, updates: any) {
    return this.makeRequest(`/api/dashboards/${dashboardId}`, {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }

  async deleteDashboard(dashboardId: string) {
    return this.makeRequest(`/api/dashboards/${dashboardId}`, {
      method: 'DELETE',
    });
  }

  // Session management
  saveSession(sessionData: any) {
    localStorage.setItem('sdx-session', JSON.stringify(sessionData));
  }

  getSession() {
    try {
      const session = localStorage.getItem('sdx-session');
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  }

  clearSession() {
    localStorage.removeItem('sdx-session');
  }

  // Fallback localStorage methods for backward compatibility
  getLocalData(key: string) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  setLocalData(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  removeLocalData(key: string) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
}

export const storageService = new StorageService();
export default storageService;
