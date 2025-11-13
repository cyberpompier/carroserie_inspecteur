import React from 'react';
import { TrashIcon } from './Icons.js';

export const DefectList = ({ markers, onDeleteMarker, onSelectMarker, selectedMarkerId }) => {
  if (markers.length === 0) {
    return React.createElement('div', { className: "mt-8 text-center text-gray-400" },
      "Aucun défaut répertorié. Cliquez sur l'image pour ajouter un repère."
    );
  }

  return React.createElement('div', { className: "mt-4 space-y-2" },
    React.createElement('h3', { className: "font-semibold text-gray-300" }, "Liste des défauts"),
    React.createElement('ul', { className: "bg-gray-700 rounded-lg p-2 max-h-[calc(100vh-300px)] overflow-y-auto" },
      markers.map(marker => {
        const isSelected = marker.id === selectedMarkerId;
        return React.createElement('li', {
          key: marker.id,
          onClick: () => onSelectMarker(marker.id),
          className: `flex items-start justify-between p-3 rounded cursor-pointer transition-colors ${
            isSelected 
            ? 'bg-red-900 bg-opacity-50 border-l-4 border-red-500' 
            : 'hover:bg-gray-600'
          }`
        },
          React.createElement('div', { className: "flex items-start" },
            React.createElement('span', { className: "flex items-center justify-center w-6 h-6 mr-4 text-sm font-bold text-white bg-red-600 rounded-full flex-shrink-0 mt-1" },
              marker.id
            ),
            React.createElement('div', { className: "flex flex-col" },
              React.createElement('p', { className: "text-gray-100 font-medium" }, marker.comment),
              React.createElement('p', { className: "text-xs text-gray-400 mt-1" },
                "Par ", React.createElement('span', { className: "font-semibold" }, marker.author),
                ' le ',
                new Date(marker.timestamp).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              )
            )
          ),
          React.createElement('button', {
            // FIX: Explicitly type the event object in the onClick handler to resolve overload ambiguity for React.createElement.
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              onDeleteMarker(marker.id);
            },
            className: "p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-500 transition-colors ml-2 flex-shrink-0",
            'aria-label': `Supprimer le défaut ${marker.id}`
          },
            React.createElement(TrashIcon)
          )
        );
      })
    )
  );
};
