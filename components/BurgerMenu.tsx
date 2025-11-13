import React from 'react';
import { XIcon } from './Icons';

type Page = 'inspection' | 'profile' | 'settings';

interface BurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-xl z-30 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">Menu</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <XIcon />
          </button>
        </div>
        <nav>
          <ul className="p-4 space-y-2">
            <li>
              <button
                onClick={() => onNavigate('inspection')}
                className="w-full text-left px-4 py-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                Inspection
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('profile')}
                className="w-full text-left px-4 py-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                Profil
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('settings')}
                className="w-full text-left px-4 py-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                Paramètres
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};