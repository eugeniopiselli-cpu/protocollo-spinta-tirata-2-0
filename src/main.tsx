import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App, { ErrorBoundary } from './App.tsx';
import './index.css';

console.log("App mounting...");

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error("Root element not found");
  
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  console.log("App render called");
} catch (e) {
  console.error("App mount failed:", e);
  const display = document.getElementById('error-display');
  if (display) {
    display.style.display = 'block';
    display.innerHTML = 'MOUNT ERROR: ' + e;
  }
}
