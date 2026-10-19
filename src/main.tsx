import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";

const container = document.getElementById("root");

if (!container) {
  // Root element missing — fail loudly in dev but do not throw in production
  if (typeof console !== "undefined") console.error("Root element #root not found.");
} else {
  createRoot(container).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
