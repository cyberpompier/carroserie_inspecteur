import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ✅ Rendu principal de ton application React
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ✅ Enregistrement du Service Worker (pour Netlify)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Option : n’activer que sur ton domaine de prod
    if (window.location.hostname === 'ai.studio' || window.location.hostname.endsWith('netlify.app')) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(reg => console.log('✅ Service Worker enregistré :', reg))
        .catch(err => console.error('❌ Erreur Service Worker :', err));
    } else {
      console.log('🧪 Service Worker désactivé sur cet environnement :', window.location.hostname);
    }
  });
}
