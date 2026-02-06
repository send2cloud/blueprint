import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GitBranch, MousePointer, Keyboard, Plus } from 'lucide-react';

interface DiagramHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiagramHelpDialog({ open, onOpenChange }: DiagramHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Flow Tips</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Creating Nodes
            </h4>
            <p className="text-muted-foreground">
              Double-click on empty space to create a new node. Drag from a node's handle to connect it to another node.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-primary" />
              Connections
            </h4>
            <p className="text-muted-foreground">
              Drag from the small circles (handles) on nodes to create edges. Click on an edge to select and delete it.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-primary" />
              Navigation
            </h4>
            <ul className="text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Click and drag on empty space to pan</li>
              <li>Scroll to zoom in/out</li>
              <li>Click a node to select it</li>
              <li>Drag nodes to reposition them</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-primary" />
              Keyboard Shortcuts
            </h4>
            <ul className="text-muted-foreground space-y-1">
              <li className="flex justify-between">
                <span>Delete selected</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Delete</kbd>
              </li>
              <li className="flex justify-between">
                <span>Undo</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘Z</kbd>
              </li>
              <li className="flex justify-between">
                <span>Redo</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘⇧Z</kbd>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
