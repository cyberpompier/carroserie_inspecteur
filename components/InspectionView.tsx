import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { Marker, Vehicle, InspectionData, VehicleFace } from '../types';
import { ImageInspector } from './ImageInspector';
import { DefectList } from './DefectList';
import { Toolbar } from './Toolbar';
import { AddDefectModal } from './AddDefectModal';
import { supabase } from '../lib/supabase';

interface InspectionViewProps {
  vehicle: Vehicle;
  userId: string;
  inspectorName: string;
  inspectionData: InspectionData;
  onUpdateInspection: (id: number, data: InspectionData) => void;
}

const FACES: { key: VehicleFace; label: string }[] = [
    { key: 'front', label: 'Avant' },
    { key: 'back', label: 'Arrière' },
    { key: 'left', label: 'Côté Gauche' },
    { key: 'right', label: 'Côté Droit' },
];

export const InspectionView: React.FC<InspectionViewProps> = ({ vehicle, userId, inspectorName, inspectionData, onUpdateInspection }) => {
  const [currentFace, setCurrentFace] = useState<VehicleFace>('front');
  const [isUploading, setIsUploading] = useState(false);

  const [pendingMarker, setPendingMarker] = useState<{x: number, y: number} | null>(null);
  const [authorName, setAuthorName] = useState<string>(inspectorName || '');
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  
  // FIX: The initial value for reduce was an empty array `[]`, which TypeScript
  // inferred as `never[]`, causing a type error. Explicitly casting the initial
  // value to `Marker[]` ensures correct type inference for the accumulator.
  const allMarkers: Marker[] = Object.values(inspectionData.markers).reduce((acc, val) => acc.concat(val), [] as Marker[]);
  const nextId = useRef(Math.max(0, ...allMarkers.map(m => m.id)) + 1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetFace = useRef<VehicleFace>('front');
  
  useEffect(() => {
    // Reset selection when changing face
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
      if (event.target) event.target.value = ''; // Reset file input
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
  
  const triggerFileUpload = (face: VehicleFace) => {
    uploadTargetFace.current = face;
    fileInputRef.current?.click();
  };
  
  const handleSelectMarker = useCallback((id: number) => {
    setSelectedMarkerId(prevId => (prevId === id ? null : id));
  }, []);

  const imagePath = inspectionData.images[currentFace];
  const markers = inspectionData.markers[currentFace];
  const selectedMarker = markers.find(m => m.id === selectedMarkerId) || null;

  return (
    <>
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <main className="flex-1 flex flex-col bg-gray-900 p-4">
          <div className="flex-1 relative border-2 border-dashed border-gray-600 rounded-lg overflow-hidden">
            <ImageInspector 
              imagePath={imagePath} 
              markers={markers} 
              onAddMarker={handleAddMarkerClick}
              selectedMarker={selectedMarker}
              onSelectMarker={handleSelectMarker}
            />
             {!imagePath && !isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-75">
                <p className="text-lg mb-4 text-center">
                    Chargez une photo pour la face <span className="font-bold uppercase">{FACES.find(f => f.key === currentFace)?.label}</span><br/>
                    du véhicule <span className="font-bold">{vehicle.name}</span>.
                </p>
                <button
                  onClick={() => triggerFileUpload(currentFace)}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
                >
                  Charger une Image
                </button>
              </div>
            )}
            {isUploading && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-75">
                    <p className="text-lg mb-4">Téléversement en cours...</p>
                 </div>
            )}
          </div>
        </main>

        <aside className="w-full lg:w-96 bg-gray-800 p-4 flex flex-col lg:h-full overflow-y-auto">
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-4 border-b border-gray-600 pb-2">Contrôles & Défauts</h2>
             <div className="flex space-x-1 mb-4 p-1 bg-gray-900 rounded-lg">
                {FACES.map(face => (
                  <button
                    key={face.key}
                    onClick={() => setCurrentFace(face.key)}
                    className={`flex-1 text-sm font-semibold py-2 rounded-md transition-colors focus:outline-none ${
                      currentFace === face.key
                        ? 'bg-red-600 text-white'
                        : 'bg-transparent text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {face.label}
                  </button>
                ))}
              </div>
            <Toolbar onUploadClick={() => triggerFileUpload(currentFace)} />
            <div className="mt-4">
              <label htmlFor="author-sidebar" className="block text-sm font-medium text-gray-300 mb-1">
                Nom de l'inspecteur
              </label>
              <input
                type="text"
                id="author-sidebar"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Ex: Jean Dupont"
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <DefectList 
                markers={markers} 
                onDeleteMarker={handleDeleteMarker}
                onSelectMarker={handleSelectMarker}
                selectedMarkerId={selectedMarkerId}
            />
          </div>
        </aside>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />

      {pendingMarker && (
        <AddDefectModal 
          author={authorName}
          onAuthorChange={setAuthorName}
          onSave={handleSaveDefect}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};