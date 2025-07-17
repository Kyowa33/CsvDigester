import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
//import IntegrityChecker from './IntegrityChecker.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
 {/*   <IntegrityChecker/>*/}
    <App />
  </StrictMode>,
)

// Check if PWA is ready
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.ready.then(() => {
      console.log('Service Worker is enabled - The app can be used offline.');
    });
  });
}