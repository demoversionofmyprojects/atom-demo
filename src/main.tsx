import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initInkOrigins, initMotion } from './lib/motion';
import { initTelegram } from './lib/telegram';
import { AppProvider } from './store/AppContext';
import './styles.css';
import './motion.css';

initTelegram();
initMotion();
initInkOrigins();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
