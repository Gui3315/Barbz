import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then(registration => {
      })
      .catch(err => {
        console.error('Erro ao registrar Service Worker:', err);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);