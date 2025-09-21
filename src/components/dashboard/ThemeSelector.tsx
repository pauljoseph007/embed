import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { themes } from '@/components/theme/ThemeProvider';
import { useTheme } from '@/components/theme/ThemeProvider';

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export const ThemeSelector = ({ currentTheme, onThemeChange }: ThemeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setTheme } = useTheme();

  const currentThemeData = themes.find(t => t.id === currentTheme) || themes[0];

  const handleThemeChange = (themeId: string) => {
    onThemeChange(themeId);
    setTheme(themeId as any);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">{currentThemeData.name}</span>
        <div className="flex gap-1">
          {currentThemeData.colors.slice(0, 3).map((color, index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-full border border-border"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Theme Selector */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 z-50"
            >
              <Card className="w-80 shadow-2xl">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-3">Select Theme</h3>
                  <div className="space-y-2">
                    {themes.map((theme) => (
                      <motion.div
                        key={theme.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          currentTheme === theme.id
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => handleThemeChange(theme.id)}
                      >
                        <div className="flex gap-1">
                          {theme.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-4 h-4 rounded-full border border-border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-medium text-sm">{theme.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {theme.description}
                          </div>
                        </div>
                        
                        {currentTheme === theme.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};