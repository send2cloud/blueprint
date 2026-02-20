import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { LayoutGrid, Plus, GripVertical, Calendar, Keyboard } from 'lucide-react';

interface BoardHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BoardHelpDialog({ open, onOpenChange }: BoardHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tasks Tips</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Creating Cards
            </h4>
            <p className="text-muted-foreground">
              Click the <Plus className="inline h-3 w-3" /> button at the bottom of any column to add a new card. Type a title and press Enter.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-primary" />
              Drag & Drop
            </h4>
            <p className="text-muted-foreground">
              Drag cards between columns to change their status. Drag columns by their header to reorder them.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-primary" />
              Card Details
            </h4>
            <p className="text-muted-foreground">
              Click on any card to open its detail view. Add descriptions, labels, due dates, checklists, and comments.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Due Dates
            </h4>
            <p className="text-muted-foreground">
              Cards with due dates automatically appear in the Calendar tool, keeping all your deadlines in one place.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-primary" />
              Quick Actions
            </h4>
            <ul className="text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Click column header to rename it</li>
              <li>Use labels to categorize cards</li>
              <li>Add checklists for sub-tasks</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
