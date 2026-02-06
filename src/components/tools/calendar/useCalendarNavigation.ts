import { useState, useCallback } from 'react';
import { addMonths, subMonths, addYears, subYears } from 'date-fns';
import type { ViewType } from './CalendarToolbar';

export function useCalendarNavigation(initialView: ViewType = 'month') {
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigate = useCallback((direction: 'prev' | 'next' | 'today' | Date) => {
    if (direction === 'today') {
      setCurrentDate(new Date());
    } else if (direction instanceof Date) {
      setCurrentDate(direction);
      if (currentView === 'year') {
        setCurrentView('day');
      }
    } else {
      const delta = direction === 'prev' ? -1 : 1;
      if (currentView === 'year') {
        setCurrentDate(prev => delta > 0 ? addYears(prev, 1) : subYears(prev, 1));
      } else {
        setCurrentDate(prev => {
          if (currentView === 'day') return new Date(prev.setDate(prev.getDate() + delta));
          if (currentView === 'week') return new Date(prev.setDate(prev.getDate() + delta * 7));
          if (currentView === 'month') return delta > 0 ? addMonths(prev, 1) : subMonths(prev, 1);
          return prev;
        });
      }
    }
  }, [currentView]);

  return {
    currentView,
    setCurrentView,
    currentDate,
    setCurrentDate,
    navigate,
  };
}
