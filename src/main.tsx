import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeStorageAdapter } from './lib/storage';

initializeStorageAdapter();

createRoot(document.getElementById("root")!).render(<App />);
