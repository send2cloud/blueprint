import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, setHours, setMinutes } from 'date-fns';
import { Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Calendar } from '../../ui/calendar';
import { TagInput } from '../../tags/TagInput';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui/popover';
import { cn } from '../../../lib/utils';
import { CalendarEvent, EVENT_COLORS } from './types';

interface EventFormState {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  allDay: boolean;
  color: string;
  tags: string[];
}

function getDefaultState(event: CalendarEvent | null): EventFormState {
  if (event) {
    return {
      title: event.title,
      description: event.description || '',
      startDate: event.start,
      endDate: event.end,
      startTime: format(event.start, 'HH:mm'),
      endTime: format(event.end, 'HH:mm'),
      allDay: event.allDay ?? true,
      color: event.color || EVENT_COLORS[0].color,
      tags: event.tags || [],
    };
  }
  const now = new Date();
  return {
    title: '',
    description: '',
    startDate: now,
    endDate: now,
    startTime: format(now, 'HH:mm'),
    endTime: format(new Date(now.getTime() + 60 * 60 * 1000), 'HH:mm'),
    allDay: true,
    color: EVENT_COLORS[0].color,
    tags: [],
  };
}

interface EventModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  isNew?: boolean;
}

export function EventModal({
  event,
  open,
  onOpenChange,
  onSave,
  onDelete,
  isNew = false,
}: EventModalProps) {
  const [state, setState] = useState<EventFormState>(() => getDefaultState(event));
  const [prevEvent, setPrevEvent] = useState(event);
  const [prevOpen, setPrevOpen] = useState(open);

  if (event !== prevEvent || open !== prevOpen) {
    setPrevEvent(event);
    setPrevOpen(open);
    setState(getDefaultState(event));
  }

  const updateState = (updates: Partial<EventFormState>) => setState((s) => ({ ...s, ...updates }));

  const combineDateTime = (date: Date, timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return setMinutes(setHours(new Date(date), hours), minutes);
  };
  const handleSave = () => {
    if (!state.title.trim()) return;

    const finalStart = state.allDay ? state.startDate : combineDateTime(state.startDate, state.startTime);
    const finalEnd = state.allDay ? state.endDate : combineDateTime(state.endDate, state.endTime);

    onSave({
      id: event?.id || uuidv4(),
      title: state.title.trim(),
      description: state.description.trim() || undefined,
      start: finalStart,
      end: finalEnd,
      allDay: state.allDay,
      color: state.color,
      tags: state.tags.length > 0 ? state.tags : undefined,
      sourceType: event?.sourceType || 'manual',
      sourceId: event?.sourceId,
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (event) {
      onDelete(event.id);
      onOpenChange(false);
    }
  };

  const isLinked = event?.sourceType && event.sourceType !== 'manual';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? 'New Event' : 'Edit Event'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLinked && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              This event is linked to a {event?.sourceType === 'task' ? 'task' : 'document'}
            </div>
          )}

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={state.title}
              onChange={(e) => updateState({ title: e.target.value })}
              placeholder="Event title"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={state.description}
              onChange={(e) => updateState({ description: e.target.value })}
              placeholder="Add description..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput
              tags={state.tags}
              onTagsChange={(tags) => updateState({ tags })}
              placeholder="Add tag..."
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>All day</Label>
            <Switch checked={state.allDay} onCheckedChange={(allDay) => updateState({ allDay })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start overflow-hidden">
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">{format(state.startDate, 'MMM d, yyyy')}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={state.startDate}
                    onSelect={(d) => d && updateState({ startDate: d })}
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start overflow-hidden">
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">{format(state.endDate, 'MMM d, yyyy')}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={state.endDate}
                    onSelect={(d) => d && updateState({ endDate: d })}
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {!state.allDay && (
              <>
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="time"
                      value={state.startTime}
                      onChange={(e) => updateState({ startTime: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>End Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="time"
                      value={state.endTime}
                      onChange={(e) => updateState({ endTime: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.id}
                  className={cn(
                    'h-6 w-6 rounded-full transition-transform',
                    state.color === c.color && 'ring-2 ring-offset-2 ring-primary scale-110'
                  )}
                  style={{ backgroundColor: c.color }}
                  onClick={() => updateState({ color: c.color })}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {!isNew && !isLinked && (
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!state.title.trim()}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}