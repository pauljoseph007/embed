import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Type, Square, Image, Circle, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboardStore, ChartTile } from '@/store/dashboardStore';
import { toast } from '@/hooks/use-toast';

interface AddElementPanelProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardId: string;
  sheetId: string;
}

export const AddElementPanel = ({
  isOpen,
  onClose,
  dashboardId,
  sheetId
}: AddElementPanelProps) => {
  const { addTile } = useDashboardStore();
  
  // Form states for different element types
  const [textContent, setTextContent] = useState('');
  const [textTitle, setTextTitle] = useState('Text Element');
  const [textBoxContent, setTextBoxContent] = useState('Enter your text here...');
  const [textBoxTitle, setTextBoxTitle] = useState('Text Box');
  const [shapeType, setShapeType] = useState<'circle' | 'arrow'>('circle');
  const [shapeTitle, setShapeTitle] = useState('Shape Element');
  const [lineTitle, setLineTitle] = useState('Line Element');
  const [lineOrientation, setLineOrientation] = useState<'horizontal' | 'vertical' | 'diagonal'>('horizontal');
  const [imageUrl, setImageUrl] = useState('');
  const [imageTitle, setImageTitle] = useState('Image Element');

  const handleAddTextElement = () => {
    if (!textContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter some text content.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newTile: Omit<ChartTile, 'id'> = {
        title: textTitle,
        type: 'text',
        content: {
          text: textContent
        },
        layout: {
          x: 0,
          y: 0,
          w: 8,
          h: 4
        },
        uiConfig: {
          showTitle: true,
          backgroundColor: 'transparent',
          borderRadius: 8,
          theme: 'cobalt-blue',
          fontSize: 'medium',
          fontWeight: 'normal',
          textAlign: 'left',
          textColor: 'default',
          padding: 16,
          opacity: 100,
          shadow: 'none'
        }
      };

      console.log('Adding text element:', newTile);
      addTile(dashboardId, sheetId, newTile);

      toast({
        title: "Text Element Added",
        description: "Text element has been added to your dashboard."
      });

      // Reset form
      setTextContent('');
      setTextTitle('Text Element');
      onClose();
    } catch (error) {
      console.error('Error adding text element:', error);
      toast({
        title: "Error",
        description: "Failed to add text element. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddTextBoxElement = () => {
    if (!textBoxContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter some text content for the text box.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newTile: Omit<ChartTile, 'id'> = {
        title: textBoxTitle,
        type: 'textbox',
        content: {
          text: textBoxContent
        },
        layout: {
          x: 0,
          y: 0,
          w: 12,
          h: 6
        },
        uiConfig: {
          showTitle: true,
          backgroundColor: 'white',
          borderRadius: 8,
          theme: 'cobalt-blue',
          fontSize: 'medium',
          fontWeight: 'normal',
          textAlign: 'left',
          textColor: 'default',
          padding: 16,
          opacity: 100,
          shadow: 'sm',
          showBorder: true,
          borderColor: 'border'
        }
      };

      console.log('Adding text box element:', newTile);
      addTile(dashboardId, sheetId, newTile);

      toast({
        title: "Text Box Added",
        description: "Flexible text box has been added to your dashboard."
      });

      // Reset form
      setTextBoxContent('Enter your text here...');
      setTextBoxTitle('Text Box');
      onClose();
    } catch (error) {
      console.error('Error adding text box element:', error);
      toast({
        title: "Error",
        description: "Failed to add text box element. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddShapeElement = () => {
    try {
      const newTile: Omit<ChartTile, 'id'> = {
        title: shapeTitle,
        type: 'shape',
        content: {
          shapeType
        },
        layout: {
          x: 0,
          y: 0,
          w: 6,
          h: 6
        },
        uiConfig: {
          showTitle: true,
          backgroundColor: 'transparent',
          borderRadius: 8,
          theme: 'cobalt-blue',
          shapeColor: 'primary',
          strokeColor: 'primary',
          strokeWidth: 2,
          padding: 16,
          opacity: 100,
          shadow: 'none'
        }
      };

      console.log('Adding shape element:', newTile);
      addTile(dashboardId, sheetId, newTile);

      toast({
        title: "Shape Element Added",
        description: "Shape element has been added to your dashboard."
      });

      // Reset form
      setShapeTitle('Shape Element');
      setShapeType('circle');
      onClose();
    } catch (error) {
      console.error('Error adding shape element:', error);
      toast({
        title: "Error",
        description: "Failed to add shape element. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddLineElement = () => {
    try {
      const newTile: Omit<ChartTile, 'id'> = {
        title: lineTitle,
        type: 'line',
        content: {
          orientation: lineOrientation
        },
        layout: {
          x: 0,
          y: 0,
          w: lineOrientation === 'vertical' ? 2 : 12,
          h: lineOrientation === 'horizontal' ? 2 : 8
        },
        uiConfig: {
          showTitle: false,
          backgroundColor: 'transparent',
          borderRadius: 0,
          theme: 'cobalt-blue',
          strokeColor: 'primary',
          strokeWidth: 2,
          padding: 8,
          opacity: 100,
          shadow: 'none'
        }
      };

      console.log('Adding line element:', newTile);
      addTile(dashboardId, sheetId, newTile);

      toast({
        title: "Line Element Added",
        description: "Draggable line element has been added to your dashboard."
      });

      // Reset form
      setLineTitle('Line Element');
      setLineOrientation('horizontal');
      onClose();
    } catch (error) {
      console.error('Error adding line element:', error);
      toast({
        title: "Error",
        description: "Failed to add line element. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddImageElement = () => {
    if (!imageUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an image URL.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newTile: Omit<ChartTile, 'id'> = {
        title: imageTitle,
        type: 'image',
        content: {
          imageUrl
        },
        layout: {
          x: 0,
          y: 0,
          w: 8,
          h: 8
        },
        uiConfig: {
          showTitle: true,
          backgroundColor: 'transparent',
          borderRadius: 8,
          theme: 'cobalt-blue',
          padding: 16,
          opacity: 100,
          shadow: 'none'
        }
      };

      console.log('Adding image element:', newTile);
      addTile(dashboardId, sheetId, newTile);

      toast({
        title: "Image Element Added",
        description: "Image element has been added to your dashboard."
      });

      // Reset form
      setImageUrl('');
      setImageTitle('Image Element');
      onClose();
    } catch (error) {
      console.error('Error adding image element:', error);
      toast({
        title: "Error",
        description: "Failed to add image element. Please try again.",
        variant: "destructive"
      });
    }
  };



  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Add Element</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Element Types */}
        <Tabs defaultValue="textbox" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="textbox" className="text-xs">
              <Square className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="line" className="text-xs">
              <Minus className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="text" className="text-xs">
              <Type className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="shape" className="text-xs">
              <Circle className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="image" className="text-xs">
              <Image className="h-3 w-3" />
            </TabsTrigger>
          </TabsList>

          {/* Text Box Element */}
          <TabsContent value="textbox" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Square className="h-4 w-4" />
                  Flexible Text Box
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="textbox-title">Title</Label>
                  <Input
                    id="textbox-title"
                    value={textBoxTitle}
                    onChange={(e) => setTextBoxTitle(e.target.value)}
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <Label htmlFor="textbox-content">Content</Label>
                  <Textarea
                    id="textbox-content"
                    value={textBoxContent}
                    onChange={(e) => setTextBoxContent(e.target.value)}
                    placeholder="Enter your text content..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleAddTextBoxElement} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Text Box
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Line Element */}
          <TabsContent value="line" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Minus className="h-4 w-4" />
                  Draggable Line
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="line-title">Title (Optional)</Label>
                  <Input
                    id="line-title"
                    value={lineTitle}
                    onChange={(e) => setLineTitle(e.target.value)}
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <Label>Orientation</Label>
                  <Select value={lineOrientation} onValueChange={(value: any) => setLineOrientation(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="vertical">Vertical</SelectItem>
                      <SelectItem value="diagonal">Diagonal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddLineElement} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line Element
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Text Element */}
          <TabsContent value="text" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Text Element
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="text-title">Title</Label>
                  <Input
                    id="text-title"
                    value={textTitle}
                    onChange={(e) => setTextTitle(e.target.value)}
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <Label htmlFor="text-content">Content</Label>
                  <Textarea
                    id="text-content"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Enter your text content..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleAddTextElement} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Text Element
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shape Element */}
          <TabsContent value="shape" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Square className="h-4 w-4" />
                  Shape Element
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="shape-title">Title</Label>
                  <Input
                    id="shape-title"
                    value={shapeTitle}
                    onChange={(e) => setShapeTitle(e.target.value)}
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <Label>Shape Type</Label>
                  <Select value={shapeType} onValueChange={(value: any) => setShapeType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">Circle</SelectItem>
                      <SelectItem value="arrow">Arrow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddShapeElement} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shape Element
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Image Element */}
          <TabsContent value="image" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Image Element
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image-title">Title</Label>
                  <Input
                    id="image-title"
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <Label htmlFor="image-url">Image URL</Label>
                  <Input
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <Button onClick={handleAddImageElement} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image Element
                </Button>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>
      </div>
    </motion.div>
  );
};
