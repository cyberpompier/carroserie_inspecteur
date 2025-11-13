import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './Icons.js';

export const AddDefectModal = ({ author, onAuthorChange, onSave, onClose }) => {
  const [comment, setComment] = useState('');
  const commentInputRef = useRef(null);

  useEffect(() => {
    commentInputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (comment.trim() && author.trim()) {
      onSave(comment.trim(), author.trim());
    } else {
      alert("Veuillez saisir votre nom et un commentaire.");
    }
  };

  // Fix: Explicitly type the event object 'e' to avoid type inference errors.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return React.createElement('div', {
    className: "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50",
    onClick: onClose,
    onKeyDown: handleKeyDown
  },
    React.createElement('div', {
      className: "bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4",
      // Fix: Explicitly type the event object 'e' to avoid type inference errors.
      onClick: (e: React.MouseEvent) => e.stopPropagation()
    },
      React.createElement('div', { className: "flex justify-between items-center mb-4" },
        React.createElement('h2', { className: "text-xl font-bold text-white" }, "Ajouter un défaut"),
        React.createElement('button', { onClick: onClose, className: "text-gray-400 hover:text-white" },
          React.createElement(XIcon)
        )
      ),
      React.createElement('div', { className: "space-y-4" },
        React.createElement('div', null,
          React.createElement('label', { htmlFor: "author", className: "block text-sm font-medium text-gray-300 mb-1" },
            "Votre Nom"
          ),
          React.createElement('input', {
            type: "text",
            id: "author",
            value: author,
            // Fix: Explicitly type the event object 'e' to avoid type inference errors.
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => onAuthorChange(e.target.value),
            placeholder: "Ex: Jean Dupont",
            className: "w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
          })
        ),
        React.createElement('div', null,
          React.createElement('label', { htmlFor: "comment", className: "block text-sm font-medium text-gray-300 mb-1" },
            "Commentaire"
          ),
          React.createElement('textarea', {
            id: "comment",
            ref: commentInputRef,
            value: comment,
            // Fix: Explicitly type the event object 'e' to avoid type inference errors.
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value),
            rows: 4,
            placeholder: "Décrivez le défaut (ex: rayure, bosse...)",
            className: "w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
          })
        )
      ),
      React.createElement('div', { className: "mt-6 flex justify-end space-x-3" },
        React.createElement('button', {
          onClick: onClose,
          className: "px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
        },
          "Annuler"
        ),
        React.createElement('button', {
          onClick: handleSave,
          className: "px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        },
          "Enregistrer"
        )
      )
    )
  );
};