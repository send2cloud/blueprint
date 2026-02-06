import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { CalendarSettings, CalendarConfig } from './CalendarSettings';

export type ViewType = 'day' | 'week' | 'month' | 'year' | 'agenda';

const VIEW_LABELS: Record<ViewType, string> = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
  year: 'Year',
  agenda: 'Agenda',
};

interface CalendarToolbarProps {
  currentDate: Date;
  currentView: ViewType;
  config: CalendarConfig;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onViewChange: (view: ViewType) => void;
  onConfigChange: (config: CalendarConfig) => void;
  onAddEvent: () => void;
}

export function CalendarToolbar({
  currentDate,
  currentView,
  config,
  onNavigate,
  onViewChange,
  onConfigChange,
  onAddEvent,
}: CalendarToolbarProps) {
  const getViewLabel = () => {
    if (currentView === 'year') return format(currentDate, 'yyyy');
    return format(currentDate, 'MMMM yyyy');
  };

  return (
    <div className="flex justify-between items-center p-4 pb-2">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onNavigate('today')}>
          Today
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onNavigate('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onNavigate('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="font-medium ml-2">
          {getViewLabel()}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex border rounded-md overflow-hidden">
          {(['day', 'week', 'month', 'year', 'agenda'] as ViewType[]).map((view) => (
            <Button
              key={view}
              variant={currentView === view ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none border-0"
              onClick={() => onViewChange(view)}
            >
              {VIEW_LABELS[view]}
            </Button>
          ))}
        </div>
        <CalendarSettings config={config} onConfigChange={onConfigChange} />
        <Button onClick={onAddEvent} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>
    </div>
  );
}
