import { useState, useEffect, useCallback } from 'react';
import type { CalendarConfig } from './CalendarSettings';

const SETTINGS_KEY = 'blueprint:calendar:settings';

const DEFAULT_CONFIG: CalendarConfig = {
  weekStartsOn: 1, // Monday
  dayStartHour: 6,
  dayEndHour: 21,
};

export function useCalendarConfig() {
  const [config, setConfig] = useState<CalendarConfig>(DEFAULT_CONFIG);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setConfig(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load calendar settings:', e);
    }
  }, []);

  const updateConfig = useCallback((newConfig: CalendarConfig) => {
    setConfig(newConfig);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newConfig));
  }, []);

  return { config, updateConfig };
}
