import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { RestTimerProvider } from './components/RestTimer';
import { AlertProvider } from './components/Alerts';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AlertProvider>
        <RestTimerProvider>
          <App />
        </RestTimerProvider>
      </AlertProvider>
    </HashRouter>
  </StrictMode>,
);
