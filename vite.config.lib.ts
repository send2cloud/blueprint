import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Solo build config — produces dist-lib/blueprint.es.js + style.css
// "Solo" = Blueprint embedded inside another project as a library bundle.
// Run: npm run build:lib (or bun run build:lib)
// This does NOT affect the Multi-Project build used by Lovable's publish pipeline.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
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
    outDir: "dist-lib",
    lib: {
      entry: path.resolve(__dirname, "src/lib-entry.ts"),
      formats: ["es"],
      fileName: "blueprint",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react-router-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-router-dom": "ReactRouterDOM",
        },
      },
    },
    cssCodeSplit: false,
  },
});
