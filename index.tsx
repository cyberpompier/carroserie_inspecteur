import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ✅ Rendu principal de l’application
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ✅ Enregistrement du Service Worker uniquement sur les bons domaines
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const hostname = window.location.hostname;

    if (
      hostname === 'vocal-gecko-1d05c6.netlify.app' || // ton domaine Netlify
      hostname === 'localhost' // pour tests locaux
    ) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(reg => console.log('✅ Service Worker enregistré :', reg))
        .catch(err => console.error('❌ Erreur Service Worker :', err));
    } else {
      console.log('🧪 Service Worker désactivé sur cet environnement :', hostname);
    }
  });
}
