import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ImageInspector } from './ImageInspector.js';
import { DefectList } from './DefectList.js';
import { Toolbar } from './Toolbar.js';
import { AddDefectModal } from './AddDefectModal.js';
import { supabase } from '../lib/supabase.js';
// Fix: Import types for props
import type { Vehicle, InspectionData, Marker } from '../types.js';

const FACES = [
    { key: 'front', label: 'Avant' },
    { key: 'back', label: 'Arrière' },
    { key: 'left', label: 'Côté Gauche' },
    { key: 'right', label: 'Côté Droit' },
];

// Fix: Define interface for component props
interface InspectionViewProps {
  vehicle: Vehicle;
  userId: string;
  inspectorName: string;
  inspectionData: InspectionData;
  onUpdateInspection: (id: number, data: InspectionData) => void;
}

export const InspectionView = ({ vehicle, userId, inspectorName, inspectionData, onUpdateInspection }: InspectionViewProps) => {
  const [currentFace, setCurrentFace] = useState<keyof InspectionData['markers']>('front');
  const [isUploading, setIsUploading] = useState(false);
  const [pendingMarker, setPendingMarker] = useState(null);
  const [authorName, setAuthorName] = useState(inspectorName || '');
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  
  // Fix: Use .flat() to correctly create and type the allMarkers array. This resolves errors on lines 22 and 23.
  const allMarkers = Object.values(inspectionData.markers).flat();
  const nextId = useRef(Math.max(0, ...allMarkers.map(m => m.id)) + 1);
  const fileInputRef = useRef(null);
  const uploadTargetFace = useRef('front');
  
  useEffect(() => {
    setSelectedMarkerId(null);
  }, [currentFace]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${vehicle.id}/${uploadTargetFace.current}.${fileExt}`;

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
            [uploadTargetFace.current]: data.path,
          },
        };
        onUpdateInspection(vehicle.id, newInspectionData);
      }
      setSelectedMarkerId(null);

    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleAddMarkerClick = useCallback((x: number, y: number) => {
    setSelectedMarkerId(null);
    setPendingMarker({ x, y });
  }, []);

  const handleSaveDefect = (comment: string, author: string) => {
    if (!pendingMarker) return;

    setAuthorName(author);
    const newMarker: Marker = {
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

  const handleDeleteMarker = useCallback((id: number) => {
    const newInspectionData = {
        ...inspectionData,
        markers: {
            ...inspectionData.markers,
            [currentFace]: inspectionData.markers[currentFace].filter(m => m.id !== id)
        }
    };
    onUpdateInspection(vehicle.id, newInspectionData);

    if (selectedMarkerId === id) {
      setSelectedMarkerId(null);
    }
  }, [currentFace, selectedMarkerId, inspectionData, onUpdateInspection, vehicle.id]);
  
  const triggerFileUpload = (face: string) => {
    uploadTargetFace.current = face;
    fileInputRef.current?.click();
  };
  
  const handleSelectMarker = useCallback((id: number) => {
    setSelectedMarkerId(prevId => (prevId === id ? null : id));
  }, []);

  const imagePath = inspectionData.images[currentFace];
  const markers = inspectionData.markers[currentFace];
  const selectedMarker = markers.find(m => m.id === selectedMarkerId) || null;

  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: "flex-1 flex flex-col lg:flex-row overflow-hidden" },
      React.createElement('main', { className: "flex-1 flex flex-col bg-gray-900 p-4" },
        React.createElement('div', { className: "flex-1 relative border-2 border-dashed border-gray-600 rounded-lg overflow-hidden" },
          React.createElement(ImageInspector, {
            imagePath: imagePath,
            markers: markers,
            onAddMarker: handleAddMarkerClick,
            selectedMarker: selectedMarker,
            onSelectMarker: handleSelectMarker
          }),
          !imagePath && !isUploading && (
            React.createElement('div', { className: "absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-75" },
              React.createElement('p', { className: "text-lg mb-4 text-center" },
                "Chargez une photo pour la face ", React.createElement('span', { className: "font-bold uppercase" }, FACES.find(f => f.key === currentFace)?.label),
                React.createElement('br'),
                "du véhicule ", React.createElement('span', { className: "font-bold" }, vehicle.name), "."
              ),
              React.createElement('button', {
                onClick: () => triggerFileUpload(currentFace),
                className: "px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
              }, "Charger une Image")
            )
          ),
          isUploading && (
            React.createElement('div', { className: "absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-75" },
              React.createElement('p', { className: "text-lg mb-4" }, "Téléversement en cours...")
            )
          )
        )
      ),
      React.createElement('aside', { className: "w-full lg:w-96 bg-gray-800 p-4 flex flex-col lg:h-full overflow-y-auto" },
        React.createElement('div', { className: "flex-1" },
          React.createElement('h2', { className: "text-lg font-semibold mb-4 border-b border-gray-600 pb-2" }, "Contrôles & Défauts"),
          React.createElement('div', { className: "flex space-x-1 mb-4 p-1 bg-gray-900 rounded-lg" },
            FACES.map(face => (
              React.createElement('button', {
                key: face.key,
                onClick: () => setCurrentFace(face.key as keyof InspectionData['markers']),
                className: `flex-1 text-sm font-semibold py-2 rounded-md transition-colors focus:outline-none ${
                  currentFace === face.key
                    ? 'bg-red-600 text-white'
                    : 'bg-transparent text-gray-300 hover:bg-gray-700'
                }`
              }, face.label)
            ))
          ),
          React.createElement(Toolbar, { onUploadClick: () => triggerFileUpload(currentFace) }),
          React.createElement('div', { className: "mt-4" },
            React.createElement('label', { htmlFor: "author-sidebar", className: "block text-sm font-medium text-gray-300 mb-1" },
              "Nom de l'inspecteur"
            ),
            React.createElement('input', {
              type: "text",
              id: "author-sidebar",
              value: authorName,
              onChange: (e) => setAuthorName(e.target.value),
              placeholder: "Ex: Jean Dupont",
              className: "w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
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