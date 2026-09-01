import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  
  if (typeof resource === 'string' && resource.includes('/api/')) {
    config = config || {};
    config.headers = config.headers || {};
    config.credentials = 'include';
    
    const token = localStorage.getItem('cims_token');
    if (token) {
      // If it's a Headers object
      if (config.headers instanceof Headers) {
        if (!config.headers.has('Authorization')) {
          config.headers.append('Authorization', `Bearer ${token}`);
        }
      } else {
        // Plain object
        if (!config.headers['Authorization']) {
          (config.headers as any)['Authorization'] = `Bearer ${token}`;
        }
      }
    }
  }
  
  return originalFetch(resource, config);
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
