import React from 'react';
import { createRoot } from 'react-dom/client';
import { UserProvider } from './contexts/UserContext';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);