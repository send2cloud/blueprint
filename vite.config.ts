import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // BlockNote is built on ProseMirror/Tiptap. If Vite resolves multiple copies of
    // these packages, ProseMirror selection types can be registered twice and crash
    // with: "Duplicate use of selection JSON ID ...".
    dedupe: [
      "@tiptap/pm",
      "prosemirror-state",
      "prosemirror-view",
      "prosemirror-model",
      "prosemirror-transform",
      "prosemirror-commands",
      "prosemirror-history",
      "prosemirror-keymap",
      "prosemirror-inputrules",
      "prosemirror-schema-list",
      "prosemirror-gapcursor",
      "prosemirror-dropcursor",
    ],
  },
  build: {
    outDir: "dist",
  },
}));
