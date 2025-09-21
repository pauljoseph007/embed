import { motion } from 'framer-motion';
import { Settings, Trash2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChartTile as ChartTileType } from '@/store/dashboardStore';
import { createDemoChart } from '@/utils/supersetEmbedding';
import SupersetChart from '@/components/charts/SupersetChart';

// Helper functions for styling
const getBackgroundClass = (backgroundColor?: string) => {
  switch (backgroundColor) {
    case 'transparent':
      return 'bg-transparent';
    case 'card':
      return 'bg-card border border-border';
    case 'primary':
      return 'bg-primary text-primary-foreground';
    case 'secondary':
      return 'bg-secondary text-secondary-foreground';
    case 'accent':
      return 'bg-accent text-accent-foreground';
    case 'muted':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-card border border-border';
  }
};

const getBorderClass = (borderColor?: string) => {
  switch (borderColor) {
    case 'primary':
      return 'border-2 border-primary';
    case 'secondary':
      return 'border-2 border-secondary';
    case 'accent':
      return 'border-2 border-accent';
    case 'muted':
      return 'border-2 border-muted';
    case 'success':
      return 'border-2 border-success';
    case 'warning':
      return 'border-2 border-warning';
    case 'destructive':
      return 'border-2 border-destructive';
    default:
      return 'border-2 border-border';
  }
};

const getShadowClass = (shadow?: string) => {
  switch (shadow) {
    case 'sm':
      return 'shadow-sm';
    case 'md':
      return 'shadow-md';
    case 'lg':
      return 'shadow-lg';
    case 'xl':
      return 'shadow-xl';
    case 'none':
    default:
      return '';
  }
};

const getTitleSizeClass = (titleSize?: string) => {
  switch (titleSize) {
    case 'small':
      return 'text-sm';
    case 'medium':
      return 'text-lg';
    case 'large':
      return 'text-xl';
    case 'xl':
      return 'text-2xl';
    default:
      return 'text-lg';
  }
};

const getTitleColorClass = (titleColor?: string) => {
  switch (titleColor) {
    case 'primary':
      return 'text-primary';
    case 'secondary':
      return 'text-secondary';
    case 'accent':
      return 'text-accent';
    case 'muted':
      return 'text-muted-foreground';
    case 'success':
      return 'text-success';
    case 'warning':
      return 'text-warning';
    case 'destructive':
      return 'text-destructive';
    default:
      return 'text-foreground';
  }
};

const getTextColorClass = (color?: string) => {
  switch (color) {
    case 'primary': return 'text-primary';
    case 'secondary': return 'text-secondary';
    case 'accent': return 'text-accent';
    case 'muted': return 'text-muted-foreground';
    case 'success': return 'text-green-600';
    case 'warning': return 'text-yellow-600';
    case 'destructive': return 'text-red-600';
    default: return 'text-foreground';
  }
};

const getShapeColorClass = (color?: string) => {
  switch (color) {
    case 'primary': return 'fill-primary stroke-primary';
    case 'secondary': return 'fill-secondary stroke-secondary';
    case 'accent': return 'fill-accent stroke-accent';
    case 'muted': return 'fill-muted stroke-muted';
    case 'success': return 'fill-green-500 stroke-green-500';
    case 'warning': return 'fill-yellow-500 stroke-yellow-500';
    case 'destructive': return 'fill-red-500 stroke-red-500';
    default: return 'fill-primary stroke-primary';
  }
};



interface ChartTileProps {
  tile: ChartTileType;
  isPreviewMode: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  theme: string;
}

export const ChartTile = ({
  tile,
  isPreviewMode,
  isSelected,
  onSelect,
  onDelete,
  theme
}: ChartTileProps) => {
  const handleClick = (e: React.MouseEvent) => {
    if (!isPreviewMode) {
      e.stopPropagation();
      onSelect();
    }
  };

  const renderShape = (shapeType: string, colorClass: string, strokeColorClass: string, strokeWidth: number) => {
    const commonProps = {
      className: `w-full h-full max-w-32 max-h-32 ${colorClass}`,
      strokeWidth
    };

    switch (shapeType) {
      case 'circle':
        return (
          <svg viewBox="0 0 100 100" {...commonProps}>
            <circle cx="50" cy="50" r="40" />
          </svg>
        );
      case 'arrow':
        return (
          <svg viewBox="0 0 100 100" {...commonProps}>
            <polygon points="10,40 10,60 70,60 70,80 90,50 70,20 70,40" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 100 100" {...commonProps}>
            <circle cx="50" cy="50" r="40" />
          </svg>
        );
    }
  };

  const renderContent = () => {
    console.log(tile, 'check');

    // Handle different tile types
    switch (tile.type) {
      case 'text':
        return renderTextElement();
      case 'textbox':
        return renderTextBoxElement();
      case 'line':
        return renderLineElement();
      case 'shape':
        return renderShapeElement();
      case 'image':
        return renderImageElement();
      case 'kpi':
        return renderKpiElement();
      case 'chart':
      case 'dashboard':
      default:
        return renderChartElement();
    }
  };

  const renderTextElement = () => {
    const fontSize = tile.uiConfig.fontSize || 'medium';
    const fontWeight = tile.uiConfig.fontWeight || 'normal';
    const textAlign = tile.uiConfig.textAlign || 'left';
    const textColor = tile.uiConfig.textColor || 'default';

    const fontSizeClass = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
      xl: 'text-xl'
    }[fontSize];

    const fontWeightClass = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold'
    }[fontWeight];

    const textAlignClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    }[textAlign];

    const textColorClass = getTextColorClass(textColor);

    return (
      <div className="w-full h-full flex flex-col">
        {tile.uiConfig.showTitle && (
          <h3 className={`font-semibold mb-2 ${getTitleSizeClass(tile.uiConfig.titleSize)} ${getTitleColorClass(tile.uiConfig.titleColor)}`}>
            {tile.title}
          </h3>
        )}
        <div className={`flex-1 ${fontSizeClass} ${fontWeightClass} ${textAlignClass} ${textColorClass}`}>
          <p className="whitespace-pre-wrap">{tile.content?.text || 'No content'}</p>
        </div>
      </div>
    );
  };

  const renderTextBoxElement = () => {
    const textContent = tile.content?.text || 'Enter your text here...';
    const fontSize = tile.uiConfig.fontSize || 'medium';
    const fontWeight = tile.uiConfig.fontWeight || 'normal';
    const textAlign = tile.uiConfig.textAlign || 'left';
    const textColor = tile.uiConfig.textColor || 'default';

    const fontSizeClass = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
      xl: 'text-xl'
    }[fontSize];

    const fontWeightClass = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold'
    }[fontWeight];

    const textAlignClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    }[textAlign];

    const textColorClass = getTextColorClass(textColor);

    return (
      <div className="w-full h-full flex flex-col border border-border rounded-lg bg-background/50 backdrop-blur-sm">
        {tile.uiConfig.showTitle && (
          <div className="px-3 py-2 border-b border-border bg-muted/30">
            <h3 className={`font-semibold ${getTitleSizeClass(tile.uiConfig.titleSize)} ${getTitleColorClass(tile.uiConfig.titleColor)}`}>
              {tile.title}
            </h3>
          </div>
        )}
        <div className="flex-1 p-3 overflow-auto">
          <div className={`${fontSizeClass} ${fontWeightClass} ${textAlignClass} ${textColorClass} whitespace-pre-wrap leading-relaxed`}>
            {textContent}
          </div>
        </div>
      </div>
    );
  };

  const renderLineElement = () => {
    const orientation = tile.content?.orientation || 'horizontal';
    const strokeColor = tile.uiConfig.strokeColor || 'primary';
    const strokeWidth = tile.uiConfig.strokeWidth || 2;

    const getStrokeColorClass = (color: string) => {
      switch (color) {
        case 'primary': return 'stroke-primary';
        case 'secondary': return 'stroke-secondary';
        case 'accent': return 'stroke-accent';
        case 'muted': return 'stroke-muted-foreground';
        case 'destructive': return 'stroke-destructive';
        default: return 'stroke-primary';
      }
    };

    const renderLine = () => {
      const strokeClass = getStrokeColorClass(strokeColor);

      switch (orientation) {
        case 'vertical':
          return (
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line
                x1="50" y1="0" x2="50" y2="100"
                className={strokeClass}
                strokeWidth={strokeWidth}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          );
        case 'diagonal':
          return (
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line
                x1="0" y1="0" x2="100" y2="100"
                className={strokeClass}
                strokeWidth={strokeWidth}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          );
        case 'horizontal':
        default:
          return (
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line
                x1="0" y1="50" x2="100" y2="50"
                className={strokeClass}
                strokeWidth={strokeWidth}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          );
      }
    };

    return (
      <div className="w-full h-full flex items-center justify-center">
        {renderLine()}
      </div>
    );
  };

  const renderShapeElement = () => {
    const shapeType = tile.content?.shapeType || 'rectangle';
    const shapeColor = tile.uiConfig.shapeColor || 'primary';
    const strokeColor = tile.uiConfig.strokeColor || 'primary';
    const strokeWidth = tile.uiConfig.strokeWidth || 2;

    const colorClass = getShapeColorClass(shapeColor);
    const strokeColorClass = getShapeColorClass(strokeColor);

    return (
      <div className="w-full h-full flex flex-col">
        {tile.uiConfig.showTitle && (
          <h3 className={`font-semibold mb-2 ${getTitleSizeClass(tile.uiConfig.titleSize)} ${getTitleColorClass(tile.uiConfig.titleColor)}`}>
            {tile.title}
          </h3>
        )}
        <div className="flex-1 flex items-center justify-center">
          {renderShape(shapeType, colorClass, strokeColorClass, strokeWidth)}
        </div>
      </div>
    );
  };

  const renderImageElement = () => {
    return (
      <div className="w-full h-full flex flex-col">
        {tile.uiConfig.showTitle && (
          <h3 className={`font-semibold mb-2 ${getTitleSizeClass(tile.uiConfig.titleSize)} ${getTitleColorClass(tile.uiConfig.titleColor)}`}>
            {tile.title}
          </h3>
        )}
        <div className="flex-1 flex items-center justify-center">
          {tile.content?.imageUrl ? (
            <img
              src={tile.content.imageUrl}
              alt={tile.title}
              className="max-w-full max-h-full object-contain rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className="text-center text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-primary rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <p className="text-sm font-medium">Image</p>
            <p className="text-xs mt-1">Image failed to load</p>
          </div>
        </div>
      </div>
    );
  };

  const renderKpiElement = () => {
    const kpiValue = tile.content?.kpiValue || 0;
    const kpiLabel = tile.content?.kpiLabel || 'KPI';
    const kpiTarget = tile.content?.kpiTarget;
    const kpiFormat = tile.content?.kpiFormat || 'number';

    const formatValue = (value: number) => {
      switch (kpiFormat) {
        case 'percentage':
          return `${value}%`;
        case 'currency':
          return `$${value.toLocaleString()}`;
        default:
          return value.toLocaleString();
      }
    };

    const isAboveTarget = kpiTarget ? kpiValue >= kpiTarget : true;
    const targetPercentage = kpiTarget ? Math.round((kpiValue / kpiTarget) * 100) : 100;

    return (
      <div className="w-full h-full flex flex-col justify-center items-center text-center">
        <div className={`text-3xl font-bold mb-2 ${isAboveTarget ? 'text-green-600' : 'text-orange-600'}`}>
          {formatValue(kpiValue)}
        </div>
        <div className="text-sm font-medium text-muted-foreground mb-1">
          {kpiLabel}
        </div>
        {kpiTarget && (
          <div className="text-xs text-muted-foreground">
            Target: {formatValue(kpiTarget)} ({targetPercentage}%)
          </div>
        )}
      </div>
    );
  };

  const renderChartElement = () => {
    if (tile.demoMode) {
      // Render demo chart with centered title
      const chartTypes = ['line', 'bar', 'pie', 'area'] as const;
      const chartType = chartTypes[Math.floor(Math.random() * chartTypes.length)];

      return (
        <div className="w-full h-full flex flex-col">
          {tile.uiConfig.showTitle && (
            <h3 className={`font-semibold mb-2 text-center ${getTitleSizeClass(tile.uiConfig.titleSize)} ${getTitleColorClass(tile.uiConfig.titleColor)}`}>
              {tile.title}
            </h3>
          )}
          <div
            className="flex-1 w-full"
            dangerouslySetInnerHTML={{
              __html: createDemoChart(tile.title, chartType)
            }}
          />
        </div>
      );
    }
    // For real Superset charts, use the SupersetChart component
    if (tile.srcUrl) {
      return (
        <div className="w-full h-full flex flex-col">
          {tile.uiConfig.showTitle && (
            <h3 className={`font-semibold mb-2 text-center ${getTitleSizeClass(tile.uiConfig.titleSize)} ${getTitleColorClass(tile.uiConfig.titleColor)}`}>
              {tile.title}
            </h3>
          )}
          <div className="flex-1">
            <SupersetChart
              iframeUrl={tile.srcUrl}
              title={undefined} // Don't show title in SupersetChart since we're handling it above
              className="w-full h-full"
              onError={(error) => {
                console.error('Chart error:', error);
              }}
              onSuccess={() => {
                console.log('Chart loaded successfully:', tile.title);
              }}
            />
          </div>
        </div>
      );
    }

    // Fallback for charts without iframe URL
    return (
      <div className="w-full h-full flex flex-col bg-card rounded-lg p-4">
        {tile.uiConfig.showTitle && (
          <h3 className={`font-semibold mb-4 ${getTitleSizeClass(tile.uiConfig.titleSize)} ${getTitleColorClass(tile.uiConfig.titleColor)}`}>
            {tile.title}
          </h3>
        )}
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
          <div className="text-center text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-primary rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <p className="text-sm font-medium">Superset Chart</p>
            <p className="text-xs mt-1">Add iframe URL to display chart</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative w-full h-full group ${
        isSelected && !isPreviewMode 
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
          : ''
      }`}
      onClick={handleClick}
    >
      {/* Chart Content */}
      <div
        className={`w-full h-full transition-all duration-200 ${
          getBackgroundClass(tile.uiConfig.backgroundColor)
        } ${
          tile.uiConfig.showBorder ? getBorderClass(tile.uiConfig.borderColor) : ''
        } ${
          getShadowClass(tile.uiConfig.shadow)
        }`}
        style={{
          borderRadius: `${tile.uiConfig.borderRadius}px`,
          padding: `${tile.uiConfig.padding || 16}px`,
          opacity: `${(tile.uiConfig.opacity || 100) / 100}`
        }}
      >
        {renderContent()}
      </div>

      {/* Controls */}
      {!isPreviewMode && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <Settings className="h-3 w-3" />
          </Button>
          
          <Button
            size="sm"
            variant="destructive"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Resize Handle (shown when selected) */}
      {isSelected && !isPreviewMode && (
        <div className="absolute bottom-1 right-1 w-3 h-3">
          <div className="w-full h-full bg-primary rounded-tl-lg opacity-50" />
        </div>
      )}
    </motion.div>
  );
};