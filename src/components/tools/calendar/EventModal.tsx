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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { TagInput } from '@/components/tags/TagInput';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarEvent, EVENT_COLORS } from './types';

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [allDay, setAllDay] = useState(true);
  const [color, setColor] = useState(EVENT_COLORS[0].color);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setStartDate(event.start);
      setEndDate(event.end);
      setStartTime(format(event.start, 'HH:mm'));
      setEndTime(format(event.end, 'HH:mm'));
      setAllDay(event.allDay ?? true);
      setColor(event.color || EVENT_COLORS[0].color);
      setTags(event.tags || []);
    } else {
      // Reset for new event
      setTitle('');
      setDescription('');
      const now = new Date();
      setStartDate(now);
      setEndDate(now);
      setStartTime(format(now, 'HH:mm'));
      const end = new Date(now.getTime() + 60 * 60 * 1000);
      setEndTime(format(end, 'HH:mm'));
      setAllDay(true);
      setColor(EVENT_COLORS[0].color);
      setTags([]);
    }
  }, [event, open]);

  const combineDateTime = (date: Date, timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return setMinutes(setHours(new Date(date), hours), minutes);
  };
  const handleSave = () => {
    if (!title.trim()) return;

    const finalStart = allDay ? startDate : combineDateTime(startDate, startTime);
    const finalEnd = allDay ? endDate : combineDateTime(endDate, endTime);

    onSave({
      id: event?.id || uuidv4(),
      title: title.trim(),
      description: description.trim() || undefined,
      start: finalStart,
      end: finalEnd,
      allDay,
      color,
      tags: tags.length > 0 ? tags : undefined,
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput
              tags={tags}
              onTagsChange={setTags}
              placeholder="Add tag..."
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>All day</Label>
            <Switch checked={allDay} onCheckedChange={setAllDay} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start overflow-hidden">
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">{format(startDate, 'MMM d, yyyy')}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(d) => d && setStartDate(d)}
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
                    <span className="truncate">{format(endDate, 'MMM d, yyyy')}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(d) => d && setEndDate(d)}
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {!allDay && (
              <>
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
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
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
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
                    color === c.color && 'ring-2 ring-offset-2 ring-primary scale-110'
                  )}
                  style={{ backgroundColor: c.color }}
                  onClick={() => setColor(c.color)}
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
            <Button onClick={handleSave} disabled={!title.trim()}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}