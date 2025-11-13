import React, { useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { XIcon } from './Icons.js';

export const AddVehicleModal = ({ onClose, onVehicleAdded }) => {
  const [name, setName] = useState('');
  const [caserne, setCaserne] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
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

  return React.createElement('div', {
    className: "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50",
    onClick: onClose
  },
    React.createElement('div', {
      className: "bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4",
      onClick: (e) => e.stopPropagation()
    },
      React.createElement('div', { className: "flex justify-between items-center mb-4" },
        React.createElement('h2', { className: "text-xl font-bold text-white" }, "Ajouter un véhicule"),
        React.createElement('button', { onClick: onClose, className: "text-gray-400 hover:text-white" },
          React.createElement(XIcon)
        )
      ),
      // FIX: Add 'as any' to props to bypass TS error on intrinsic element attributes.
      React.createElement('form', { onSubmit: handleSave, className: "space-y-4" } as any,
        React.createElement('div', null,
          React.createElement('label', { htmlFor: "vehicle-name", className: "block text-sm font-medium text-gray-300 mb-1" },
            "Nom du véhicule"
          ),
          React.createElement('input', {
            type: "text",
            id: "vehicle-name",
            value: name,
            onChange: (e) => setName(e.target.value),
            placeholder: "Ex: FPT 02",
            className: "w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500",
            required: true
          })
        ),
        React.createElement('div', null,
          React.createElement('label', { htmlFor: "vehicle-caserne", className: "block text-sm font-medium text-gray-300 mb-1" },
            "Caserne"
          ),
          React.createElement('input', {
            type: "text",
            id: "vehicle-caserne",
            value: caserne,
            onChange: (e) => setCaserne(e.target.value),
            placeholder: "Ex: Caserne Nord",
            className: "w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500",
            required: true
          })
        ),
        error && React.createElement('p', { className: "text-sm text-red-400" }, error),
        React.createElement('div', { className: "mt-6 flex justify-end space-x-3" },
          React.createElement('button', {
            type: "button",
            onClick: onClose,
            className: "px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
          }, "Annuler"),
          // FIX: Add 'as any' to props to bypass TS error on intrinsic element attributes.
          React.createElement('button', {
            type: "submit",
            disabled: loading,
            className: "px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          } as any, loading ? 'Enregistrement...' : 'Enregistrer')
        )
      )
    )
  );
};