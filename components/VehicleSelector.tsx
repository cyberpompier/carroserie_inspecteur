import React from 'react';
import type { Vehicle } from '../types';
import { PlusIcon } from './Icons';

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  onSelectVehicle: (id: number) => void;
  userStation: string | null;
  userRole: string | null;
  onAddVehicleClick: () => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({ vehicles, onSelectVehicle, userStation, userRole, onAddVehicleClick }) => {
  return (
    <div className="flex-1 flex flex-col items-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl text-center">
        <div className="flex justify-center items-center mb-2 relative w-full">
            <h2 className="text-3xl font-bold text-white">Sélectionnez un véhicule</h2>
            {userRole === 'Administrateur' && (
                <button
                    onClick={onAddVehicleClick}
                    className="absolute right-0 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    title="Ajouter un véhicule"
                >
                    <PlusIcon />
                </button>
            )}
        </div>
        {vehicles.length > 0 ? (
          <>
            <p className="text-lg text-gray-400 mb-8">
              Véhicules de la <span className="font-semibold text-red-400">{userStation}</span>.
              Choisissez-en un pour commencer l'inspection.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map(vehicle => (
                <button
                  key={vehicle.id}
                  onClick={() => onSelectVehicle(vehicle.id)}
                  className="bg-gray-800 p-6 rounded-lg text-left hover:bg-red-900 hover:bg-opacity-50 border border-gray-700 hover:border-red-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <h3 className="text-xl font-semibold text-white">{vehicle.name}</h3>
                  <p className="text-gray-400">{vehicle.caserne}</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 mt-8">
            <h3 className="text-xl font-semibold text-white">Aucun véhicule trouvé</h3>
            {userStation ? (
                 <p className="text-gray-400 mt-2">
                    Il n'y a aucun véhicule assigné à votre caserne (<span className="font-semibold text-red-400">{userStation}</span>).
                    {userRole === 'Administrateur' && ' Vous pouvez en ajouter un en utilisant le bouton ci-dessus.'}
                 </p>
            ) : (
                <p className="text-gray-400 mt-2">
                    Veuillez compléter votre profil et renseigner votre caserne pour voir la liste des véhicules.
                </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};