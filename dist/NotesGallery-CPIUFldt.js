import { j as e, T as o, A as s, a } from "./App-D3xD3Exg.js";
const t = a.notes;
function n() {
  return /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ e.jsx(o, { title: t.title, icon: t.icon }),
    /* @__PURE__ */ e.jsx("div", { className: "flex-1 overflow-auto", children: /* @__PURE__ */ e.jsx(
      s,
      {
        type: "notes",
        newPath: "/notes/new",
        emptyTitle: `No ${t.typeLabel}s yet`,
        emptyDescription: "Create your first doc to capture ideas, write documentation, or draft content.",
        newButtonLabel: `New ${t.title}`
      }
    ) })
  ] });
}
export {
  n as default
};
