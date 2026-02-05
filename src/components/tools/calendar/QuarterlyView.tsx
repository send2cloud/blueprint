import { useMemo } from 'react';
import { format, startOfQuarter, endOfQuarter, eachMonthOfInterval, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { CalendarEvent } from './types';
import { cn } from '@/lib/utils';

interface QuarterlyViewProps {
  date: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onNavigate: (date: Date) => void;
}

export function QuarterlyView({ date, events, onSelectEvent, onNavigate }: QuarterlyViewProps) {
  const quarterStart = startOfQuarter(date);
  const quarterEnd = endOfQuarter(date);
  const months = eachMonthOfInterval({ start: quarterStart, end: quarterEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.start, day));
  };

  const quarterLabel = useMemo(() => {
    const q = Math.floor(date.getMonth() / 3) + 1;
    return `Q${q} ${format(date, 'yyyy')}`;
  }, [date]);

  return (
    <div className="h-full flex flex-col">
      <div className="text-center py-3 border-b border-border">
        <h2 className="text-lg font-semibold">{quarterLabel}</h2>
      </div>
      
      <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-auto">
        {months.map((month) => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
          
          // Get first day of week for padding
          const firstDayOfWeek = monthStart.getDay();
          const paddingDays = Array(firstDayOfWeek).fill(null);

          return (
            <div key={month.toISOString()} className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted px-3 py-2 text-center font-medium text-sm">
                {format(month, 'MMMM yyyy')}
              </div>
              
              {/* Day headers */}
              <div className="grid grid-cols-7 text-center text-[10px] text-muted-foreground border-b border-border">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="py-1">{d}</div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {paddingDays.map((_, i) => (
                  <div key={`pad-${i}`} className="aspect-square" />
                ))}
                {days.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const hasEvents = dayEvents.length > 0;
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center text-xs cursor-pointer hover:bg-accent transition-colors relative",
                        isToday(day) && "bg-primary/10 font-bold"
                      )}
                      onClick={() => onNavigate(day)}
                    >
                      <span className={cn(
                        isToday(day) && "text-primary"
                      )}>
                        {format(day, 'd')}
                      </span>
                      {hasEvents && (
                        <div className="absolute bottom-0.5 flex gap-0.5">
                          {dayEvents.slice(0, 3).map((event, i) => (
                            <div
                              key={i}
                              className="w-1 h-1 rounded-full"
                              style={{ backgroundColor: event.color || 'hsl(var(--primary))' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectEvent(event);
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
