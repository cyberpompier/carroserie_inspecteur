import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { XIcon } from './Icons';

interface AddVehicleModalProps {
  onClose: () => void;
  onVehicleAdded: () => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ onClose, onVehicleAdded }) => {
  const [name, setName] = useState('');
  const [caserne, setCaserne] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !caserne.trim()) {
      setError("Le nom et la caserne sont obligatoires.");
      return;
    }
    setLoading(true);
    setError('');

    const { error: insertError } = await supabase
      .from('vehicles')
      .insert({ name: name.trim(), caserne: caserne.trim() });

    setLoading(false);

    if (insertError) {
      if (insertError.code === '23505') { // unique_violation
        setError('Un véhicule avec ce nom existe déjà dans cette caserne.');
      } else {
        setError(insertError.message);
      }
    } else {
      onVehicleAdded();
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Ajouter un véhicule</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="vehicle-name" className="block text-sm font-medium text-gray-300 mb-1">
              Nom du véhicule
            </label>
            <input
              type="text"
              id="vehicle-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: FPT 02"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
          <div>
            <label htmlFor="vehicle-caserne" className="block text-sm font-medium text-gray-300 mb-1">
              Caserne
            </label>
            <input
              type="text"
              id="vehicle-caserne"
              value={caserne}
              onChange={(e) => setCaserne(e.target.value)}
              placeholder="Ex: Caserne Nord"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};