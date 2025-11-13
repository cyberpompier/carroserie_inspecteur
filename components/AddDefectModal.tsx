import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './Icons';

interface AddDefectModalProps {
  author: string;
  onAuthorChange: (name: string) => void;
  onSave: (comment: string, author: string) => void;
  onClose: () => void;
}

export const AddDefectModal: React.FC<AddDefectModalProps> = ({ author, onAuthorChange, onSave, onClose }) => {
  const [comment, setComment] = useState('');
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Ajouter un défaut</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XIcon />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-300 mb-1">
              Votre Nom
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => onAuthorChange(e.target.value)}
              placeholder="Ex: Jean Dupont"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-1">
              Commentaire
            </label>
            <textarea
              id="comment"
              ref={commentInputRef}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Décrivez le défaut (ex: rayure, bosse...)"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
            ></textarea>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};