import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import './index.css'

// Global error handlers for development and production debugging
window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.error("Global Error Caught: ", msg, url, lineNo, columnNo, error);
  return false;
};

window.addEventListener('unhandledrejection', function(event) {
  console.error("Unhandled Promise Rejection: ", event.reason);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
