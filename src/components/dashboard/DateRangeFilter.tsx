import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronDown, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface DateRangeFilterProps {
  onDateRangeChange: (dateRange: { from: Date; to: Date } | null) => void;
  className?: string;
}

const PRESET_RANGES = [
  { label: 'Last 7 days', value: 'last-7-days' },
  { label: 'Last 30 days', value: 'last-30-days' },
  { label: 'Last 3 months', value: 'last-3-months' },
  { label: 'Last 6 months', value: 'last-6-months' },
  { label: 'This month', value: 'this-month' },
  { label: 'Last month', value: 'last-month' },
  { label: 'Custom range', value: 'custom' },
  { label: 'All time', value: 'all-time' }
];

export const DateRangeFilter = ({ onDateRangeChange, className = '' }: DateRangeFilterProps) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('all-time');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const getDateRangeFromPreset = (preset: string): { from: Date; to: Date } | null => {
    const now = new Date();
    
    switch (preset) {
      case 'last-7-days':
        return { from: subDays(now, 7), to: now };
      case 'last-30-days':
        return { from: subDays(now, 30), to: now };
      case 'last-3-months':
        return { from: subMonths(now, 3), to: now };
      case 'last-6-months':
        return { from: subMonths(now, 6), to: now };
      case 'this-month':
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      case 'custom':
        if (customDateRange?.from && customDateRange?.to) {
          return { from: customDateRange.from, to: customDateRange.to };
        }
        return null;
      case 'all-time':
      default:
        return null;
    }
  };

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    
    if (preset === 'custom') {
      setShowCustomCalendar(true);
      return;
    }
    
    const dateRange = getDateRangeFromPreset(preset);
    setIsActive(preset !== 'all-time');
    onDateRangeChange(dateRange);
  };

  const handleCustomDateSelect = (range: DateRange | undefined) => {
    setCustomDateRange(range);
    
    if (range?.from && range?.to) {
      const dateRange = { from: range.from, to: range.to };
      setIsActive(true);
      onDateRangeChange(dateRange);
      setShowCustomCalendar(false);
    }
  };

  const clearFilter = () => {
    setSelectedPreset('all-time');
    setCustomDateRange(undefined);
    setIsActive(false);
    onDateRangeChange(null);
  };

  const getDisplayText = () => {
    if (selectedPreset === 'custom' && customDateRange?.from && customDateRange?.to) {
      return `${format(customDateRange.from, 'MMM dd')} - ${format(customDateRange.to, 'MMM dd, yyyy')}`;
    }
    
    const preset = PRESET_RANGES.find(p => p.value === selectedPreset);
    return preset?.label || 'All time';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 ${className}`}
    >
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Date Range:</span>
      </div>

      <Card className={`transition-all duration-200 ${isActive ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger className="w-[180px] h-8 border-none shadow-none">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <SelectValue placeholder="Select date range" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {PRESET_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedPreset === 'custom' && (
              <Popover open={showCustomCalendar} onOpenChange={setShowCustomCalendar}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Calendar className="h-3 w-3 mr-1" />
                    {customDateRange?.from && customDateRange?.to
                      ? `${format(customDateRange.from, 'MMM dd')} - ${format(customDateRange.to, 'MMM dd')}`
                      : 'Pick dates'
                    }
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={customDateRange?.from}
                    selected={customDateRange}
                    onSelect={handleCustomDateSelect}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}

            {isActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilter}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-md"
        >
          Filter active: {getDisplayText()}
        </motion.div>
      )}
    </motion.div>
  );
};
