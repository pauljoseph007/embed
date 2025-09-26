// Centralized TypeScript type definitions for the SDX Partners Intelligence Portal

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export type UserRole = 'admin' | 'user' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  dashboardAccess?: string[]; // Dashboard IDs this user has access to
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

// ============================================================================
// DASHBOARD & CHART TYPES
// ============================================================================

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ChartPosition {
  x: number;
  y: number;
  w: number;
  h: number;
  i: string;
}

export interface Chart {
  id: string;
  title: string;
  iframeUrl: string;
  position: ChartPosition;
  embedType: 'chart' | 'dashboard';
  embedId: string;
  usesSDK: boolean;
  sdkConfig?: any;
  fallbackIframe?: string;
  sdkError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sheet {
  id: string;
  name: string;
  charts: Chart[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  sheets: Sheet[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  thumbnail?: string;
}

export interface DashboardState {
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  currentSheet: Sheet | null;
  globalDateRange: DateRange | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// SUPERSET INTEGRATION TYPES
// ============================================================================

export interface SupersetParseResult {
  embedType: 'chart' | 'dashboard';
  embedId: string;
  srcUrl: string;
  isValid: boolean;
  sdkConfig?: SupersetSDKConfig;
  fallbackIframe?: string;
  usesSDK?: boolean;
  sdkError?: string;
  dashboardUrl?: string;
}

export interface SupersetSDKConfig {
  id: string;
  supersetDomain: string;
  mountPoint: string;
  fetchGuestToken: () => Promise<string>;
  dashboardUiConfig?: {
    hideTitle?: boolean;
    hideTab?: boolean;
    hideChartControls?: boolean;
    filters?: {
      expanded?: boolean;
      visible?: boolean;
    };
  };
  chartUiConfig?: {
    hideTitle?: boolean;
    hideChartControls?: boolean;
  };
}

export interface GuestTokenResponse {
  token: string;
  expiresAt: Date;
}

export interface SupersetEmbedResult {
  success: boolean;
  sdkConfig?: SupersetSDKConfig;
  fallbackIframe?: string;
  error?: string;
}

// ============================================================================
// API & SERVICE TYPES
// ============================================================================

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

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface SupersetChartProps {
  iframeUrl: string;
  title?: string;
  className?: string;
  onError?: (error: string) => void;
  onSuccess?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface LoadingStateProps {
  isLoading: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

// ============================================================================
// FORM & VALIDATION TYPES
// ============================================================================

export interface FormField<T = any> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'date';
  value: T;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormValidation {
  [fieldName: string]: ValidationRule;
}

// ============================================================================
// THEME & UI TYPES
// ============================================================================

export type Theme = 'light' | 'dark' | 'cobalt-blue' | 'gradient' | 'muted';

export interface ThemeConfig {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface ChartEvent {
  type: 'load' | 'error' | 'refresh' | 'resize';
  chartId: string;
  timestamp: Date;
  data?: any;
  error?: string;
}

export interface DashboardEvent {
  type: 'create' | 'update' | 'delete' | 'share';
  dashboardId: string;
  userId: string;
  timestamp: Date;
  changes?: Partial<Dashboard>;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface AppConfig {
  apiUrl: string;
  supersetUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    enableAutoRefresh: boolean;
    enableGlobalDateFilter: boolean;
    enableUserManagement: boolean;
    enableAnalytics: boolean;
  };
  limits: {
    maxChartsPerDashboard: number;
    maxDashboardsPerUser: number;
    chartRefreshInterval: number;
  };
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export * from './index';
