import React from 'react';
import { PlusIcon } from './Icons.js';

export const VehicleSelector = ({ vehicles, onSelectVehicle, userStation, userRole, onAddVehicleClick }) => {
  return React.createElement('div', { className: "flex-1 flex flex-col items-center p-4 animate-fade-in" },
    React.createElement('div', { className: "w-full max-w-2xl text-center" },
      React.createElement('div', { className: "flex justify-center items-center mb-2 relative w-full" },
        React.createElement('h2', { className: "text-3xl font-bold text-white" }, "Sélectionnez un véhicule"),
        userRole === 'Administrateur' && React.createElement('button', {
          onClick: onAddVehicleClick,
          className: "absolute right-0 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors",
          title: "Ajouter un véhicule"
        },
          React.createElement(PlusIcon)
        )
      ),
      vehicles.length > 0 ? (
        React.createElement(React.Fragment, null,
          React.createElement('p', { className: "text-lg text-gray-400 mb-8" },
            "Véhicules de la ", React.createElement('span', { className: "font-semibold text-red-400" }, userStation), ". ",
            "Choisissez-en un pour commencer l'inspection."
          ),
          React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            vehicles.map(vehicle => (
              React.createElement('button', {
                key: vehicle.id,
                onClick: () => onSelectVehicle(vehicle.id),
                className: "bg-gray-800 p-6 rounded-lg text-left hover:bg-red-900 hover:bg-opacity-50 border border-gray-700 hover:border-red-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              },
                React.createElement('h3', { className: "text-xl font-semibold text-white" }, vehicle.name),
                React.createElement('p', { className: "text-gray-400" }, vehicle.caserne)
              )
            ))
          )
        )
      ) : (
        React.createElement('div', { className: "bg-gray-800 p-8 rounded-lg border border-gray-700 mt-8" },
          React.createElement('h3', { className: "text-xl font-semibold text-white" }, "Aucun véhicule trouvé"),
          userStation ? (
            React.createElement('p', { className: "text-gray-400 mt-2" },
              "Il n'y a aucun véhicule assigné à votre caserne (", React.createElement('span', { className: "font-semibold text-red-400" }, userStation), ").",
              userRole === 'Administrateur' && ' Vous pouvez en ajouter un en utilisant le bouton ci-dessus.'
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
