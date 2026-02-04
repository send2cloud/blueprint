import 'tldraw/tldraw.css';
import { Tldraw } from 'tldraw';

export function DrawingCanvas() {
  return (
    <div className="w-full h-full">
      <Tldraw />
    </div>
  );
}
