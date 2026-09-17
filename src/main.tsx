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
