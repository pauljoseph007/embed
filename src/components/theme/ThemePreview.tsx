import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ThemePreviewProps {
  theme: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ThemePreview = ({ theme, isSelected = false, onClick }: ThemePreviewProps) => {
  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'dark':
        return 'bg-slate-900 text-white';
      case 'gradient':
        return 'bg-gradient-to-br from-purple-500 via-blue-500 to-green-500 text-white';
      case 'muted':
        return 'bg-slate-100 text-slate-800';
      case 'light':
        return 'bg-white text-slate-900 border border-slate-200';
      default: // cobalt-blue
        return 'bg-blue-600 text-white';
    }
  };

  const getAccentColor = (theme: string) => {
    switch (theme) {
      case 'dark':
        return 'bg-blue-500';
      case 'gradient':
        return 'bg-white/20';
      case 'muted':
        return 'bg-slate-400';
      case 'light':
        return 'bg-blue-500';
      default: // cobalt-blue
        return 'bg-blue-400';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative cursor-pointer rounded-lg overflow-hidden ${
        isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
      onClick={onClick}
    >
      <div className={`p-4 h-32 ${getThemeClasses(theme)}`}>
        {/* Mini Dashboard Preview */}
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded ${getAccentColor(theme)} flex items-center justify-center`}>
                <BarChart3 className="w-3 h-3" />
              </div>
              <div className="text-xs font-medium">Dashboard</div>
            </div>
            <div className="text-xs opacity-70">Live</div>
          </div>
          
          {/* Mini Charts */}
          <div className="grid grid-cols-2 gap-2">
            <div className={`h-8 rounded ${getAccentColor(theme)} opacity-80 flex items-center justify-center`}>
              <PieChart className="w-3 h-3" />
            </div>
            <div className={`h-8 rounded ${getAccentColor(theme)} opacity-60 flex items-center justify-center`}>
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
          
          {/* Mini KPI */}
          <div className="flex justify-between text-xs">
            <span className="opacity-70">Revenue</span>
            <span className="font-medium">$2.4M</span>
          </div>
        </div>
      </div>
      
      {/* Theme Name */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 text-center">
        {theme.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </div>
    </motion.div>
  );
};
