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
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('✅ Service Worker enregistré :', reg.scope))
      .catch(err => console.error('❌ Erreur Service Worker :', err));
  });
}