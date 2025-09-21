import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Palette, Type, Layout, Settings2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useDashboardStore, ChartTile } from '@/store/dashboardStore';
import { toast } from '@/hooks/use-toast';

interface CustomizationPanelProps {
  tileId: string;
  dashboardId: string;
  sheetId: string;
  onClose: () => void;
}

export const CustomizationPanel = ({
  tileId,
  dashboardId,
  sheetId,
  onClose
}: CustomizationPanelProps) => {
  const { dashboards, updateTile } = useDashboardStore();
  
  const dashboard = dashboards.find(d => d.id === dashboardId);
  const sheet = dashboard?.sheets.find(s => s.id === sheetId);
  const tile = sheet?.tiles.find(t => t.id === tileId);

  const [title, setTitle] = useState(tile?.title || '');
  const [showLegend, setShowLegend] = useState(tile?.uiConfig.showLegend ?? true);
  const [showTitle, setShowTitle] = useState(tile?.uiConfig.showTitle ?? true);
  const [backgroundColor, setBackgroundColor] = useState(tile?.uiConfig.backgroundColor || 'transparent');
  const [borderRadius, setBorderRadius] = useState(tile?.uiConfig.borderRadius || 12);
  const [theme, setTheme] = useState(tile?.uiConfig.theme || 'cobalt-blue');

  // Extended customization options
  const [titleSize, setTitleSize] = useState(tile?.uiConfig.titleSize || 'medium');
  const [titleColor, setTitleColor] = useState(tile?.uiConfig.titleColor || 'default');
  const [showBorder, setShowBorder] = useState(tile?.uiConfig.showBorder ?? false);
  const [borderColor, setBorderColor] = useState(tile?.uiConfig.borderColor || 'default');
  const [padding, setPadding] = useState(tile?.uiConfig.padding || 16);
  const [opacity, setOpacity] = useState(tile?.uiConfig.opacity || 100);
  const [shadow, setShadow] = useState(tile?.uiConfig.shadow || 'none');

  // New element-specific options
  const [fontSize, setFontSize] = useState(tile?.uiConfig.fontSize || 'medium');
  const [fontWeight, setFontWeight] = useState(tile?.uiConfig.fontWeight || 'normal');
  const [textAlign, setTextAlign] = useState(tile?.uiConfig.textAlign || 'left');
  const [textColor, setTextColor] = useState(tile?.uiConfig.textColor || 'default');
  const [shapeColor, setShapeColor] = useState(tile?.uiConfig.shapeColor || 'primary');
  const [strokeColor, setStrokeColor] = useState(tile?.uiConfig.strokeColor || 'primary');
  const [strokeWidth, setStrokeWidth] = useState(tile?.uiConfig.strokeWidth || 2);

  useEffect(() => {
    if (tile) {
      setTitle(tile.title);
      setShowLegend(tile.uiConfig.showLegend);
      setShowTitle(tile.uiConfig.showTitle);
      setBackgroundColor(tile.uiConfig.backgroundColor);
      setBorderRadius(tile.uiConfig.borderRadius);
      setTheme(tile.uiConfig.theme);
      setTitleSize(tile.uiConfig.titleSize || 'medium');
      setTitleColor(tile.uiConfig.titleColor || 'default');
      setShowBorder(tile.uiConfig.showBorder ?? false);
      setBorderColor(tile.uiConfig.borderColor || 'default');
      setPadding(tile.uiConfig.padding || 16);
      setOpacity(tile.uiConfig.opacity || 100);
      setShadow(tile.uiConfig.shadow || 'none');
      setFontSize(tile.uiConfig.fontSize || 'medium');
      setFontWeight(tile.uiConfig.fontWeight || 'normal');
      setTextAlign(tile.uiConfig.textAlign || 'left');
      setTextColor(tile.uiConfig.textColor || 'default');
      setShapeColor(tile.uiConfig.shapeColor || 'primary');
      setStrokeColor(tile.uiConfig.strokeColor || 'primary');
      setStrokeWidth(tile.uiConfig.strokeWidth || 2);
    }
  }, [tile]);

  const handleSave = () => {
    if (!tile) {
      toast({
        title: "Error",
        description: "No chart selected for customization.",
        variant: "destructive"
      });
      return;
    }

    try {
      const updates: Partial<ChartTile> = {
        title,
        uiConfig: {
          ...tile.uiConfig,
          showLegend,
          showTitle,
          backgroundColor,
          borderRadius,
          theme,
          titleSize,
          titleColor,
          showBorder,
          borderColor,
          padding,
          opacity,
          shadow,
          fontSize,
          fontWeight,
          textAlign,
          textColor,
          shapeColor,
          strokeColor,
          strokeWidth
        }
      };

      updateTile(dashboardId, sheetId, tileId, updates);

      toast({
        title: "Chart Updated",
        description: "Chart customization has been saved."
      });
    } catch (error) {
      console.error('Error updating chart:', error);
      toast({
        title: "Error",
        description: "Failed to update chart. Please try again.",
        variant: "destructive"
      });
    }
  };

  const backgroundOptions = [
    { value: 'transparent', label: 'Transparent' },
    { value: 'card', label: 'Card Background' },
    { value: 'primary', label: 'Primary Color' },
    { value: 'secondary', label: 'Secondary Color' },
    { value: 'accent', label: 'Accent Color' },
    { value: 'muted', label: 'Muted Background' }
  ];

  const themeOptions = [
    { value: 'cobalt-blue', label: 'Cobalt Blue' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'gradient', label: 'Gradient' },
    { value: 'muted', label: 'Muted' }
  ];

  const titleSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'xl', label: 'Extra Large' }
  ];

  const colorOptions = [
    { value: 'default', label: 'Default' },
    { value: 'primary', label: 'Primary' },
    { value: 'secondary', label: 'Secondary' },
    { value: 'accent', label: 'Accent' },
    { value: 'muted', label: 'Muted' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
    { value: 'destructive', label: 'Destructive' }
  ];

  const shadowOptions = [
    { value: 'none', label: 'None' },
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' }
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'xl', label: 'Extra Large' }
  ];

  const fontWeightOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'medium', label: 'Medium' },
    { value: 'semibold', label: 'Semi Bold' },
    { value: 'bold', label: 'Bold' }
  ];

  const textAlignOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }
  ];

  if (!tile) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Customize Chart</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabbed Customization Interface */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className={`grid w-full ${tile.type === 'text' || tile.type === 'shape' ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="general" className="text-xs">
              <Settings2 className="h-3 w-3 mr-1" />
              General
            </TabsTrigger>
            <TabsTrigger value="style" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              Style
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-xs">
              <Layout className="h-3 w-3 mr-1" />
              Layout
            </TabsTrigger>
            {(tile.type === 'text' || tile.type === 'shape') && (
              <TabsTrigger value="content" className="text-xs">
                <Type className="h-3 w-3 mr-1" />
                Content
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            {/* Chart Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Chart Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="chart-title">Title</Label>
                  <Input
                    id="chart-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter chart title"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Type: {tile.embedType}</p>
                  <p>ID: {tile.embedId}</p>
                </div>
              </CardContent>
            </Card>

            {/* Display Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Display Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Title</span>
                  <Switch
                    checked={showTitle}
                    onCheckedChange={setShowTitle}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Legend</span>
                  <Switch
                    checked={showLegend}
                    onCheckedChange={setShowLegend}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Border</span>
                  <Switch
                    checked={showBorder}
                    onCheckedChange={setShowBorder}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="style" className="space-y-4 mt-4">
            {/* Typography */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Typography
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title Size</Label>
                  <Select value={titleSize} onValueChange={setTitleSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {titleSizeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Title Color</Label>
                  <Select value={titleColor} onValueChange={setTitleColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Colors & Background */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Colors & Background
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Background</Label>
                  <Select value={backgroundColor} onValueChange={setBackgroundColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {backgroundOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {showBorder && (
                  <div>
                    <Label>Border Color</Label>
                    <Select value={borderColor} onValueChange={setBorderColor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Opacity: {opacity}%</Label>
                  <Slider
                    value={[opacity]}
                    onValueChange={(value) => setOpacity(value[0])}
                    max={100}
                    min={10}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Effects */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Effects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Shadow</Label>
                  <Select value={shadow} onValueChange={setShadow}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {shadowOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Border Radius: {borderRadius}px</Label>
                  <Slider
                    value={[borderRadius]}
                    onValueChange={(value) => setBorderRadius(value[0])}
                    max={24}
                    min={0}
                    step={2}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4 mt-4">
            {/* Spacing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Spacing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Padding: {padding}px</Label>
                  <Slider
                    value={[padding]}
                    onValueChange={(value) => setPadding(value[0])}
                    max={32}
                    min={0}
                    step={4}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Position & Size */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Position & Size</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Position</Label>
                    <div className="bg-muted rounded p-2">
                      <div>X: {tile.layout.x}</div>
                      <div>Y: {tile.layout.y}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Size</Label>
                    <div className="bg-muted rounded p-2">
                      <div>Width: {tile.layout.w}</div>
                      <div>Height: {tile.layout.h}</div>
                    </div>
                  </div>
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">
                  Drag and resize the chart on the canvas to adjust position and size.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab for Text and Shape Elements */}
          {(tile.type === 'text' || tile.type === 'shape') && (
            <TabsContent value="content" className="space-y-4 mt-4">
              {tile.type === 'text' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Text Formatting
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Font Size</Label>
                      <Select value={fontSize} onValueChange={setFontSize}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontSizeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Font Weight</Label>
                      <Select value={fontWeight} onValueChange={setFontWeight}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontWeightOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Text Alignment</Label>
                      <Select value={textAlign} onValueChange={setTextAlign}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {textAlignOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Text Color</Label>
                      <Select value={textColor} onValueChange={setTextColor}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {tile.type === 'shape' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Shape Styling
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Fill Color</Label>
                      <Select value={shapeColor} onValueChange={setShapeColor}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Stroke Color</Label>
                      <Select value={strokeColor} onValueChange={setStrokeColor}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Stroke Width: {strokeWidth}px</Label>
                      <Slider
                        value={[strokeWidth]}
                        onValueChange={(value) => setStrokeWidth(value[0])}
                        max={10}
                        min={0}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full">
          Apply Changes
        </Button>
      </div>
    </motion.div>
  );
};