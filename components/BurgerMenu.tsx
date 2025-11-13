import React from 'react';
import { XIcon } from './Icons.js';

export const BurgerMenu = ({ isOpen, onClose, onNavigate }) => {
  return React.createElement(React.Fragment, null,
    React.createElement('div', {
      className: `fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`,
      onClick: onClose
    }),
    React.createElement('aside', {
      className: `fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-xl z-30 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`
    },
      React.createElement('div', { className: "flex justify-between items-center p-4 border-b border-gray-700" },
        React.createElement('h2', { className: "text-lg font-bold text-white" }, "Menu"),
        React.createElement('button', { onClick: onClose, className: "p-1 text-gray-400 hover:text-white" },
          React.createElement(XIcon)
        )
      ),
      React.createElement('nav', null,
        React.createElement('ul', { className: "p-4 space-y-2" },
          React.createElement('li', null,
            React.createElement('button', {
              onClick: () => onNavigate('inspection'),
              className: "w-full text-left px-4 py-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            }, "Inspection")
          ),
          React.createElement('li', null,
            React.createElement('button', {
              onClick: () => onNavigate('profile'),
              className: "w-full text-left px-4 py-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            }, "Profil")
          ),
          React.createElement('li', null,
            React.createElement('button', {
              onClick: () => onNavigate('settings'),
              className: "w-full text-left px-4 py-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            }, "Paramètres")
          )
        )
      )
    )
  );
};