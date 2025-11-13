import React from 'react';
import type { Marker } from '../types';
import { TrashIcon } from './Icons';

interface DefectListProps {
  markers: Marker[];
  onDeleteMarker: (id: number) => void;
  onSelectMarker: (id: number) => void;
  selectedMarkerId: number | null;
}

export const DefectList: React.FC<DefectListProps> = ({ markers, onDeleteMarker, onSelectMarker, selectedMarkerId }) => {
  if (markers.length === 0) {
    return (
      <div className="mt-8 text-center text-gray-400">
        Aucun défaut répertorié. Cliquez sur l'image pour ajouter un repère.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <h3 className="font-semibold text-gray-300">Liste des défauts</h3>
      <ul className="bg-gray-700 rounded-lg p-2 max-h-[calc(100vh-300px)] overflow-y-auto">
        {markers.map(marker => {
          const isSelected = marker.id === selectedMarkerId;
          return (
            <li
              key={marker.id}
              onClick={() => onSelectMarker(marker.id)}
              className={`flex items-start justify-between p-3 rounded cursor-pointer transition-colors ${
                isSelected 
                ? 'bg-red-900 bg-opacity-50 border-l-4 border-red-500' 
                : 'hover:bg-gray-600'
              }`}
            >
              <div className="flex items-start">
                <span className="flex items-center justify-center w-6 h-6 mr-4 text-sm font-bold text-white bg-red-600 rounded-full flex-shrink-0 mt-1">
                  {marker.id}
                </span>
                <div className="flex flex-col">
                  <p className="text-gray-100 font-medium">{marker.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Par <span className="font-semibold">{marker.author}</span>
                    {' le '}
                    {new Date(marker.timestamp).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent li onClick from firing
                  onDeleteMarker(marker.id);
                }}
                className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-500 transition-colors ml-2 flex-shrink-0"
                aria-label={`Supprimer le défaut ${marker.id}`}
              >
                <TrashIcon />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};