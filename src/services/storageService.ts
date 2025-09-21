// File-based storage service that communicates with the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  user?: T;
  users?: T;
  dashboard?: T;
  dashboards?: T;
  session?: T;
  error?: string;
  message?: string;
}

class StorageService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Storage service error for ${endpoint}:`, error);
      throw error;
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
