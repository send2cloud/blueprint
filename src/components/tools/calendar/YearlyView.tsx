import { useMemo } from 'react';
import { format, startOfYear, endOfYear, eachMonthOfInterval, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSaturday, isSunday, startOfWeek } from 'date-fns';
import { CalendarEvent } from './types';
import { cn } from '@/lib/utils';

interface YearlyViewProps {
  date: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onNavigate: (date: Date) => void;
  weekStartsOn: 0 | 1;
}

export function YearlyView({ date, events, onSelectEvent, onNavigate, weekStartsOn }: YearlyViewProps) {
  const yearStart = startOfYear(date);
  const yearEnd = endOfYear(date);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const dayHeaders = weekStartsOn === 1 
    ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] 
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.start, day));
  };

  const getPaddingDays = (monthStart: Date) => {
    const dayOfWeek = monthStart.getDay();
    if (weekStartsOn === 1) {
      // Monday start: Sunday is 6, Monday is 0
      return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    }
    return dayOfWeek;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-center py-3 border-b border-border">
        <h2 className="text-lg font-semibold">{format(date, 'yyyy')}</h2>
      </div>
      
      <div className="flex-1 grid grid-cols-3 lg:grid-cols-4 gap-4 p-4 overflow-auto">
        {months.map((month) => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
          const paddingCount = getPaddingDays(monthStart);
          const paddingDays = Array(paddingCount).fill(null);

          return (
            <div key={month.toISOString()} className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted px-3 py-2 text-center font-medium text-sm">
                {format(month, 'MMMM')}
              </div>
              
              {/* Day headers */}
              <div className="grid grid-cols-7 text-center text-[10px] text-muted-foreground border-b border-border">
                {dayHeaders.map((d, i) => (
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
                  const isWeekend = isSaturday(day) || isSunday(day);
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center text-xs cursor-pointer hover:bg-accent transition-colors relative",
                        isToday(day) && "bg-primary text-primary-foreground font-bold",
                        isWeekend && !isToday(day) && "bg-muted/50"
                      )}
                      onClick={() => onNavigate(day)}
                    >
                      <span>
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
