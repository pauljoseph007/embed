import React from 'react';
import { Loader2, RefreshCw, BarChart3, Database, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

// Base loading spinner component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin text-primary',
        sizeClasses[size],
        className
      )} 
    />
  );
};

// Full page loading component
interface PageLoadingProps {
  message?: string;
  className?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({ 
  message = 'Loading...', 
  className 
}) => (
  <div className={cn(
    'min-h-screen flex items-center justify-center bg-background',
    className
  )}>
    <div className="text-center space-y-4">
      <LoadingSpinner size="xl" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Card loading skeleton
interface CardLoadingProps {
  className?: string;
  showTitle?: boolean;
  showContent?: boolean;
}

export const CardLoading: React.FC<CardLoadingProps> = ({ 
  className,
  showTitle = true,
  showContent = true
}) => (
  <div className={cn('bg-card rounded-lg border p-6 animate-pulse', className)}>
    {showTitle && (
      <div className="h-6 bg-muted rounded mb-4 w-1/3"></div>
    )}
    {showContent && (
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    )}
  </div>
);

// Chart loading component
interface ChartLoadingProps {
  title?: string;
  className?: string;
}

export const ChartLoading: React.FC<ChartLoadingProps> = ({ 
  title = 'Loading chart...', 
  className 
}) => (
  <div className={cn(
    'bg-card rounded-lg border p-6 flex items-center justify-center min-h-[400px]',
    className
  )}>
    <div className="text-center space-y-4">
      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
      <div className="space-y-2">
        <LoadingSpinner size="md" />
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  </div>
);

// Inline loading component for buttons and small areas
interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({ 
  message, 
  size = 'sm',
  className 
}) => (
  <div className={cn('flex items-center gap-2', className)}>
    <LoadingSpinner size={size} />
    {message && (
      <span className="text-sm text-muted-foreground">{message}</span>
    )}
  </div>
);

// Table loading skeleton
interface TableLoadingProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableLoading: React.FC<TableLoadingProps> = ({ 
  rows = 5, 
  columns = 4,
  className 
}) => (
  <div className={cn('bg-card rounded-lg border overflow-hidden', className)}>
    {/* Header */}
    <div className="border-b p-4 animate-pulse">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded w-3/4"></div>
        ))}
      </div>
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="border-b last:border-b-0 p-4 animate-pulse">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className="h-4 bg-muted rounded"
              style={{ width: `${Math.random() * 40 + 60}%` }}
            ></div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Dashboard loading component
export const DashboardLoading: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    {/* Header */}
    <div className="animate-pulse">
      <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
    </div>
    
    {/* Grid of cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardLoading key={i} />
      ))}
    </div>
  </div>
);

// Settings loading component
export const SettingsLoading: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    <div className="flex items-center gap-3 animate-pulse">
      <Settings className="h-6 w-6 text-muted-foreground" />
      <div className="h-6 bg-muted rounded w-32"></div>
    </div>
    
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
          <div className="h-5 bg-muted rounded w-1/4 mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Data loading component with icon
interface DataLoadingProps {
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const DataLoading: React.FC<DataLoadingProps> = ({ 
  message = 'Loading data...', 
  icon,
  className 
}) => (
  <div className={cn(
    'flex flex-col items-center justify-center p-8 text-center',
    className
  )}>
    <div className="mb-4">
      {icon || <Database className="h-12 w-12 text-muted-foreground" />}
    </div>
    <LoadingSpinner size="md" className="mb-2" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

// Refreshing indicator
interface RefreshingProps {
  message?: string;
  className?: string;
}

export const Refreshing: React.FC<RefreshingProps> = ({ 
  message = 'Refreshing...', 
  className 
}) => (
  <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
    <RefreshCw className="h-4 w-4 animate-spin" />
    <span>{message}</span>
  </div>
);

// Loading overlay for existing content
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  message = 'Loading...', 
  children,
  className 
}) => (
  <div className={cn('relative', className)}>
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center space-y-2">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    )}
  </div>
);

export default {
  LoadingSpinner,
  PageLoading,
  CardLoading,
  ChartLoading,
  InlineLoading,
  TableLoading,
  DashboardLoading,
  SettingsLoading,
  DataLoading,
  Refreshing,
  LoadingOverlay
};
