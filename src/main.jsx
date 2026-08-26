import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app/App';

// Global fetch interceptor to support cross-origin backend URL redirection
const originalFetch = window.fetch;
const VITE_API_URL = import.meta.env.VITE_API_URL || '';

window.fetch = async (input, init) => {
  let url = typeof input === 'object' && input !== null && 'url' in input ? input.url : String(input);

  if (VITE_API_URL && (url.startsWith('/api') || url.startsWith('/admin'))) {
    url = `${VITE_API_URL}${url}`;
    
    // Ensure credentials: 'include' is set for all cross-origin API requests to handle sessions/cookies
    if (!init) init = {};
    init.credentials = 'include';
  }

  if (typeof input === 'object' && input !== null && !(input instanceof URL)) {
    const newRequest = new Request(url, input);
    return originalFetch(newRequest, init);
  }

  return originalFetch(url, init);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
