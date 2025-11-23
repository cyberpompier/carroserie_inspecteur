import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';

// Rendu principal de l’application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(App)
  )
);

// L'enregistrement du Service Worker est maintenant géré dans index.html
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Vérification de l'état du document pour éviter l'erreur "invalid state"
    if ((document.visibilityState as string) === 'prerender') return;

    // Utiliser une URL absolue pour éviter les problèmes d'origine croisée dans des environnements de prévisualisation
    const swUrl = `${window.location.origin}/service-worker.js`;
    
    navigator.serviceWorker.register(swUrl)
      .then(reg => console.log('✅ Service Worker enregistré :', reg.scope))
      .catch(err => {
        // Ignorer les erreurs spécifiques aux environnements restreints (iframe/preview)
        if (err.message && err.message.includes('invalid state')) {
          console.warn('⚠️ Service Worker ignoré (environnement restreint).');
        } else {
          console.error('❌ Erreur Service Worker :', err);
        }
      });
  });
}