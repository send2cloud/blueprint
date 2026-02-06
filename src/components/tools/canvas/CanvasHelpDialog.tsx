import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Link2, Keyboard, MousePointer, ZoomIn } from 'lucide-react';

interface CanvasHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CanvasHelpDialog({ open, onOpenChange }: CanvasHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Whiteboard Tips</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              Embedding Artifacts
            </h4>
            <p className="text-muted-foreground">
              Click the <Link2 className="inline h-3 w-3" /> icon to embed other docs, boards, 
              diagrams, or whiteboards. Embedded artifacts are clickable and will open 
              in their native tool.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-primary" />
              Navigation
            </h4>
            <ul className="text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Click and drag to pan the canvas</li>
              <li>Scroll to zoom in/out</li>
              <li>Double-click to create a text box</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-primary" />
              Keyboard Shortcuts
            </h4>
            <ul className="text-muted-foreground space-y-1">
              <li className="flex justify-between">
                <span>Select tool</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">V</kbd>
              </li>
              <li className="flex justify-between">
                <span>Hand (pan)</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">H</kbd>
              </li>
              <li className="flex justify-between">
                <span>Draw</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">D</kbd>
              </li>
              <li className="flex justify-between">
                <span>Rectangle</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">R</kbd>
              </li>
              <li className="flex justify-between">
                <span>Text</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">T</kbd>
              </li>
              <li className="flex justify-between">
                <span>Undo</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘Z</kbd>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <ZoomIn className="h-4 w-4 text-primary" />
              Linking to Other Artifacts
            </h4>
            <p className="text-muted-foreground">
              Use <code className="bg-muted px-1 rounded">[[Artifact Name]]</code> syntax 
              in text boxes to create links. These appear in the backlinks panel.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
