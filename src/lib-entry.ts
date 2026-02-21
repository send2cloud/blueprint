/**
 * Solo mode entry point for Blueprint.
 *
 * "Solo" = Blueprint embedded inside another project as a library bundle.
 * The host imports this module:
 *   import BlueprintApp from './blueprint/dist-lib/blueprint.es.js';
 *   import './blueprint/dist-lib/style.css';
 *
 * The host wraps it in their own router:
 *   <Route path="/blueprint/*" element={<BlueprintApp basename="/blueprint" />} />
 *
 * Storage is initialized lazily on first render (inside App), so the host
 * controls when Blueprint boots.
 */

export { default } from "./App";

// Re-export types that host projects might need
export type { Artifact, ToolType, BlueprintSettings, CalendarEventRecord } from "./lib/storage/types";
