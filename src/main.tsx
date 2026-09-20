import React from 'react';
import ReactDOM from 'react-dom/client';
import { MainApp } from './App';
import { AppProvider } from './context/AppContext';
import { FocusTimerProvider } from './context/FocusTimerContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <FocusTimerProvider>
        <MainApp />
      </FocusTimerProvider>
    </AppProvider>
  </React.StrictMode>
);

// Register Offline Service Worker
if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('NEET Tracker 2027 Service Worker registered in scope:', registration.scope);
    }).catch((err) => {
      console.warn('Service Worker registration failed (normal in restricted preview):', err);
    });
  });
}

