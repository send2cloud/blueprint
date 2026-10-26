/**
 * Library entry point for Blueprint.
 *
 *   import BlueprintApp from './blueprint/dist-lib/blueprint.es.js';
 *   import './blueprint/dist-lib/style.css';
 *   <Route path="/blueprint/*" element={
 *     <BlueprintApp basename="/blueprint" adapter={myAdapter} liveConnectors={[...]} />
 *   } />
 *
 * Without `adapter`, Blueprint uses the backend chosen in its Settings page
 * (Browser, Cloudflare, Supabase, InstantDB, Custom REST).
 */

export { default } from "./App";

export type {
  Artifact, ToolType, BlueprintSettings, CalendarEventRecord, Project, StorageAdapter,
} from "./lib/storage/types";
export type { RecordStore, RecordKind } from "./lib/storage/recordStore";
export type { LiveConnector, HostUser } from "./contexts/HostContext";
export { RecordStoreAdapter } from "./lib/storage/recordStore";
export { RestStore } from "./lib/storage/restStore";
export { LocalStorageAdapter } from "./lib/storage/localStorage";
