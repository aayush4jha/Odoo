import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Now exists
import App from './App';
import reportWebVitals from './reportWebVitals';  // Now exists

// Add Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';  // Now works after installation

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();