
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ImageInspector } from './ImageInspector.js';
import { DefectList } from './DefectList.js';
import { Toolbar } from './Toolbar.js';
import { AddDefectModal } from './AddDefectModal.js';
import { supabase } from '../lib/supabase.js';

const FACES = [
    { key: 'front', label: 'Avant' },
    { key: 'back', label: 'Arrière' },
    { key: 'left', label: 'Côté Gauche' },
    { key: 'right', label: 'Côté Droit' },
];

export const InspectionView = ({ vehicle, userId, inspectorName, inspectionData, onUpdateInspection }) => {
  const [currentFace, setCurrentFace] = useState('front');
  const [isUploading, setIsUploading] = useState(false);
  const [pendingMarker, setPendingMarker] = useState(null);
  const [authorName, setAuthorName] = useState(inspectorName || '');
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  
  const allMarkers = Object.values(inspectionData.markers).flat();
  // @ts-ignore
  const nextId = useRef(Math.max(0, ...allMarkers.map(m => m.id)) + 1);
  const fileInputRef = useRef(null);
  const uploadTargetFace = useRef('front');
  
  useEffect(() => {
    setSelectedMarkerId(null);
  }, [currentFace]);

  const handleImageUpload = async (event) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    
    // CHANGEMENT: Utilisation d'un chemin commun "vehicles/ID_VEHICULE" 
    // pour que tous les utilisateurs voient la même image du véhicule.
    const filePath = `vehicles/${vehicle.id}/${uploadTargetFace.current}.${fileExt}`;

    setIsUploading(true);

    try {
      const { data, error: uploadError } = await supabase.storage
        .from('vehicle_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      if (data) {
        const newInspectionData = {
          ...inspectionData,
          images: {
            ...inspectionData.images,
            [uploadTargetFace.current]: data.path, // Le chemin stocké est relatif au bucket
          },
        };
        onUpdateInspection(vehicle.id, newInspectionData);
      }
      setSelectedMarkerId(null);

    } catch (error) {
      console.error("Erreur d'upload:", error);
      alert("Erreur lors du téléchargement de l'image: " + error.message);
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleAddMarkerClick = useCallback((x, y) => {
    setSelectedMarkerId(null);
    setPendingMarker({ x, y });
  }, []);

  const handleSaveDefect = (comment, author) => {
    if (!pendingMarker) return;

    setAuthorName(author);
    const newMarker = {
      id: nextId.current++,
      x: pendingMarker.x,
      y: pendingMarker.y,
      comment,
      author,
      timestamp: new Date().toISOString(),
    };
    
    const newInspectionData = {
        ...inspectionData,
        markers: {
            ...inspectionData.markers,
            [currentFace]: [...inspectionData.markers[currentFace], newMarker]
        }
    };
    onUpdateInspection(vehicle.id, newInspectionData);
    setPendingMarker(null);
  };

  const handleCloseModal = () => {
    setPendingMarker(null);
  };

  const handleDeleteMarker = useCallback((id) => {
    const newInspectionData = {
        ...inspectionData,
        markers: {
            ...inspectionData.markers,
            // @ts-ignore
            [currentFace]: inspectionData.markers[currentFace].filter(m => m.id !== id)
        }
    };
    onUpdateInspection(vehicle.id, newInspectionData);

    if (selectedMarkerId === id) {
      setSelectedMarkerId(null);
    }
  }, [currentFace, selectedMarkerId, inspectionData, onUpdateInspection, vehicle.id]);
  
  const triggerFileUpload = (face) => {
    uploadTargetFace.current = face;
    fileInputRef.current?.click();
  };
  
  const handleSelectMarker = useCallback((id) => {
    setSelectedMarkerId(prevId => (prevId === id ? null : id));
  }, []);

  const imagePath = inspectionData.images[currentFace];
  const markers = inspectionData.markers[currentFace];
  // @ts-ignore
  const selectedMarker = markers.find(m => m.id === selectedMarkerId) || null;

  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: "flex-1 flex flex-col lg:flex-row overflow-hidden" },
      React.createElement('main', { className: "flex-1 flex flex-col bg-gray-900 p-4" },
        React.createElement('div', { className: "flex-1 relative border-2 border-dashed border-gray-600 rounded-lg overflow-hidden bg-black" },
          React.createElement(ImageInspector, {
            imagePath: imagePath,
            markers: markers,
            onAddMarker: handleAddMarkerClick,
            selectedMarker: selectedMarker,
            onSelectMarker: handleSelectMarker
          }),
          !imagePath && !isUploading && (
            React.createElement('div', { className: "absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-90 p-4 text-center" },
              React.createElement('div', { className: "max-w-md" },
                  React.createElement('p', { className: "text-xl mb-6 text-gray-200" },
                    "Aucune photo pour la face ", 
                    React.createElement('span', { className: "font-bold text-red-400 uppercase" }, FACES.find(f => f.key === currentFace)?.label),
                    React.createElement('br'),
                    "du véhicule ", React.createElement('span', { className: "font-bold text-white" }, vehicle.name)
                  ),
                  React.createElement('button', {
                    onClick: () => triggerFileUpload(currentFace),
                    className: "px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 transition-transform transform hover:scale-105"
                  }, "Prendre / Charger une photo")
              )
            )
          ),
          isUploading && (
            React.createElement('div', { className: "absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 z-20" },
              React.createElement('div', { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4" }),
              React.createElement('p', { className: "text-lg text-white font-semibold" }, "Téléversement en cours...")
            )
          )
        )
      ),
      React.createElement('aside', { className: "w-full lg:w-96 bg-gray-800 p-4 flex flex-col lg:h-full lg:border-l border-gray-700 overflow-y-auto" },
        React.createElement('div', { className: "flex-1" },
          React.createElement('h2', { className: "text-lg font-bold mb-4 border-b border-gray-600 pb-2 text-white flex justify-between items-center" }, 
            "Contrôles & Défauts",
            React.createElement('span', { className: "text-xs font-normal text-gray-400 bg-gray-700 px-2 py-1 rounded" }, vehicle.name)
          ),
          
          // Face Selector
          React.createElement('div', { className: "grid grid-cols-2 gap-2 mb-6" },
            FACES.map(face => (
              React.createElement('button', {
                key: face.key,
                onClick: () => setCurrentFace(face.key),
                className: `text-sm font-semibold py-2 px-3 rounded-md transition-all duration-200 border ${
                  currentFace === face.key
                    ? 'bg-red-600 border-red-600 text-white shadow-md'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                }`
              }, face.label)
            ))
          ),

          React.createElement(Toolbar, { onUploadClick: () => triggerFileUpload(currentFace) }),
          
          React.createElement('div', { className: "mt-6 mb-4" },
            React.createElement('label', { htmlFor: "author-sidebar", className: "block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1" },
              "Inspecteur"
            ),
            React.createElement('input', {
              type: "text",
              id: "author-sidebar",
              value: authorName,
              onChange: (e) => setAuthorName(e.target.value),
              placeholder: "Votre nom...",
              className: "w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
            })
          ),
          
          React.createElement(DefectList, {
            markers: markers,
            onDeleteMarker: handleDeleteMarker,
            onSelectMarker: handleSelectMarker,
            selectedMarkerId: selectedMarkerId
          })
        )
      )
    ),
    React.createElement('input', {
      type: "file",
      ref: fileInputRef,
      onChange: handleImageUpload,
      accept: "image/*",
      className: "hidden",
      disabled: isUploading
    }),
    pendingMarker && React.createElement(AddDefectModal, {
      author: authorName,
      onAuthorChange: setAuthorName,
      onSave: handleSaveDefect,
      onClose: handleCloseModal
    })
  );
};
