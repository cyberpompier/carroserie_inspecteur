import React from 'react';
import { UploadIcon } from './Icons.js';

export const Toolbar = ({ onUploadClick }) => {
  return React.createElement('div', { className: "space-y-4" },
    React.createElement('button', {
      onClick: onUploadClick,
      className: "w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
    },
      React.createElement(UploadIcon, { className: "mr-2" }),
      "Changer d'Image"
    )
  );
};