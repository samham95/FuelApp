import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import worker from './mocks/worker.js'

const mode = import.meta.env.MODE;
if (mode === 'test') worker.start();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
