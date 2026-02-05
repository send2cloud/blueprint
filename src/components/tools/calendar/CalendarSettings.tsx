import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface CalendarConfig {
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  dayStartHour: number;
  dayEndHour: number;
}

interface CalendarSettingsProps {
  config: CalendarConfig;
  onConfigChange: (config: CalendarConfig) => void;
}

export function CalendarSettings({ config, onConfigChange }: CalendarSettingsProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Calendar Settings</SheetTitle>
          <SheetDescription>
            Configure how the calendar displays
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label>Week starts on</Label>
            <Select
              value={config.weekStartsOn.toString()}
              onValueChange={(v) => onConfigChange({ ...config, weekStartsOn: parseInt(v) as 0 | 1 })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sunday</SelectItem>
                <SelectItem value="1">Monday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Day starts at</Label>
            <Select
              value={config.dayStartHour.toString()}
              onValueChange={(v) => onConfigChange({ ...config, dayStartHour: parseInt(v) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hours.slice(0, 12).map((h) => (
                  <SelectItem key={h} value={h.toString()}>
                    {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : '12 PM'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Day ends at</Label>
            <Select
              value={config.dayEndHour.toString()}
              onValueChange={(v) => onConfigChange({ ...config, dayEndHour: parseInt(v) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hours.slice(12, 24).map((h) => (
                  <SelectItem key={h} value={h.toString()}>
                    {h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
