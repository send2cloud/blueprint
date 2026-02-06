import { StateNode, TLEventHandlers } from 'tldraw';

/**
 * Tool for placing artifact embeds on the canvas.
 * This is a simple "click to place" tool.
 */
export class ArtifactEmbedTool extends StateNode {
  static override id = 'artifact-embed';
  static override initial = 'idle';

  override onPointerDown: TLEventHandlers['onPointerDown'] = () => {
    const { currentPagePoint } = this.editor.inputs;

    this.editor.createShape({
      type: 'artifact-embed',
      x: currentPagePoint.x - 120, // Center the shape
      y: currentPagePoint.y - 40,
      props: {
        w: 240,
        h: 80,
        artifactId: '',
        artifactName: 'Select an artifact',
      },
    });

    // Switch back to select tool after placing
    this.editor.setCurrentTool('select');
  };
}
