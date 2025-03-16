import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Import PDF worker config first to ensure it's applied globally
import "./lib/pdf-worker-config";

createRoot(document.getElementById("root")!).render(<App />);
