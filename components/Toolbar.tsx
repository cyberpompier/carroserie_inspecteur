
import React from 'react';
import { UploadIcon } from './Icons';

interface ToolbarProps {
  onUploadClick: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onUploadClick }) => {
  return (
    <div className="space-y-4">
      <button
        onClick={onUploadClick}
        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
      >
        <UploadIcon className="mr-2" />
        Changer d'Image
      </button>
      {/* Zoom and other controls can be added here */}
    </div>
  );
};