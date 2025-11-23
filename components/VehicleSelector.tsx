
import React, { useState, useMemo } from 'react';
import { PlusIcon } from './Icons.js';

export const VehicleSelector = ({ vehicles, onSelectVehicle, userStation, userRole, onAddVehicleClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return vehicles;
    return vehicles.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehicles, searchTerm]);

  return React.createElement('div', { className: "flex-1 flex flex-col items-center p-4 animate-fade-in" },
    React.createElement('div', { className: "w-full max-w-2xl text-center" },
      React.createElement('div', { className: "flex justify-center items-center mb-6 relative w-full" },
        React.createElement('h2', { className: "text-3xl font-bold text-white" }, "Sélectionnez un véhicule"),
        userRole === 'Administrateur' && React.createElement('button', {
          onClick: onAddVehicleClick,
          className: "absolute right-0 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg",
          title: "Ajouter un véhicule"
        },
          React.createElement(PlusIcon)
        )
      ),

      // Barre de recherche
      vehicles.length > 0 && React.createElement('div', { className: "mb-6 relative" },
        React.createElement('input', {
            type: "text",
            placeholder: "Rechercher un véhicule (ex: FPT 02)...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 pl-10"
        }),
        React.createElement('svg', { 
            className: "w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2",
            fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg"
        },
            React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })
        )
      ),

      filteredVehicles.length > 0 ? (
        React.createElement(React.Fragment, null,
          !searchTerm && React.createElement('p', { className: "text-lg text-gray-400 mb-8" },
            "Véhicules de la ", React.createElement('span', { className: "font-semibold text-red-400" }, userStation), ". ",
            "Choisissez-en un pour commencer l'inspection."
          ),
          React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            filteredVehicles.map(vehicle => (
              React.createElement('button', {
                key: vehicle.id,
                onClick: () => onSelectVehicle(vehicle.id),
                className: "bg-gray-800 p-6 rounded-lg text-left hover:bg-red-900 hover:bg-opacity-50 border border-gray-700 hover:border-red-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 group"
              },
                React.createElement('h3', { className: "text-xl font-semibold text-white group-hover:text-red-100" }, vehicle.name),
                React.createElement('p', { className: "text-gray-400 text-sm mt-1" }, vehicle.caserne)
              )
            ))
          )
        )
      ) : (
        React.createElement('div', { className: "bg-gray-800 p-8 rounded-lg border border-gray-700 mt-8" },
          React.createElement('h3', { className: "text-xl font-semibold text-white" }, 
            searchTerm ? "Aucun véhicule trouvé pour cette recherche" : "Aucun véhicule trouvé"
          ),
          userStation ? (
            React.createElement('p', { className: "text-gray-400 mt-2" },
              searchTerm 
                ? "Essayez une autre orthographe." 
                : React.createElement(React.Fragment, null,
                    "Il n'y a aucun véhicule assigné à votre caserne (", React.createElement('span', { className: "font-semibold text-red-400" }, userStation), ")."
                  ),
              userRole === 'Administrateur' && !searchTerm && ' Vous pouvez en ajouter un en utilisant le bouton ci-dessus.'
            )
          ) : (
            React.createElement('p', { className: "text-gray-400 mt-2" },
              "Veuillez compléter votre profil et renseigner votre caserne pour voir la liste des véhicules."
            )
          )
        )
      )
    )
  );
};
