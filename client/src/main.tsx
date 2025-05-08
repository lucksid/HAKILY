import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import "./index.css";

try {
  console.log("Starting to render the application...");
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Root element not found!");
  } else {
    console.log("Root element found, creating React root");
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log("Render completed");
  }
} catch (error) {
  console.error("Error rendering the application:", error);
  
  // Create a fallback UI to display the error
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="font-family: sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #e11d48;">Application Error</h1>
        <p>There was an error starting the application. Please check the console for details.</p>
        <pre style="background: #f1f5f9; padding: 15px; border-radius: 4px; overflow: auto;">${error?.toString() || "Unknown error"}</pre>
      </div>
    `;
  }
}
