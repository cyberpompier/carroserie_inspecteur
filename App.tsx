import React, { useState, useCallback, useEffect } from 'react';
import type { Vehicle, InspectionData, Profile } from './types';
import { VehicleSelector } from './components/VehicleSelector';
import { InspectionView } from './components/InspectionView';
import { ChevronLeftIcon, LogoutIcon, MenuIcon, XIcon } from './components/Icons';
import { Auth as AuthUI } from './components/Auth';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { BurgerMenu } from './components/BurgerMenu';
import { ProfilePage } from './components/ProfilePage';
import { AddVehicleModal } from './components/AddVehicleModal';

type CurrentPage = 'inspection' | 'profile' | 'settings';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [inspections, setInspections] = useState<Record<number, InspectionData>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<CurrentPage>('inspection');
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    setAppError(null);
    const { data, error } = await supabase.from('vehicles').select('*');
    if (error) {
      console.error("Erreur lors de la récupération des véhicules:", error);
      setAppError(`Erreur lors de la récupération des véhicules: ${error.message}`);
    } else {
      setVehicles(data || []);
    }
  }, []);

  const fetchInspections = useCallback(async (vehicleIds: number[]) => {
    if (vehicleIds.length === 0) {
      setInspections({});
      return;
    }
    const { data, error } = await supabase
      .from('inspections')
      .select('vehicle_id, data')
      .in('vehicle_id', vehicleIds);

    if (error) {
      console.error("Erreur lors de la récupération des inspections:", error);
      if (error.code === '42P01') {
        setAppError("Erreur de configuration : La table 'inspections' est manquante dans la base de données. Les données d'inspection ne peuvent pas être chargées ou sauvegardées.");
      } else {
        setAppError(`Erreur lors de la récupération des inspections: ${error.message}`);
      }
    } else if (data) {
      const inspectionsData = data.reduce((acc, inspection) => {
        acc[inspection.vehicle_id] = inspection.data;
        return acc;
      }, {} as Record<number, InspectionData>);
      setInspections(inspectionsData);
    }
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        try {
          // Fetch profile
          const { data, error } = await supabase
            .from('profiles')
            .select(`*`)
            .eq('id', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            // Throw any error other than "no rows found"
            throw error;
          }

          if (data) {
            setUserProfile(data);
          } else {
            // Handles both null data and PGRST116 error (no profile found)
            const defaultProfile: Profile = {
              id: session.user.id,
              prenom: null,
              nom: null,
              phone: null,
              caserne: null,
              rank: null,
              avatarUrl: null,
              role: null,
            };
            setUserProfile(defaultProfile);
          }
          
          // Fetch vehicles after successfully setting profile
          await fetchVehicles();

        } catch (error: any) {
          console.error("Erreur critique lors de la récupération du profil:", error);
          setAppError(`Impossible de charger le profil utilisateur: ${error.message}. L'application est peut-être inutilisable.`);
          // IMPORTANT: Set a default profile even on error to unblock the UI.
          // The error message banner will inform the user of the problem.
          const defaultProfile: Profile = {
            id: session.user.id,
            prenom: null,
            nom: null,
            phone: null,
            caserne: null,
            rank: null,
            avatarUrl: null,
            role: null,
          };
          setUserProfile(defaultProfile);
        }
      } else {
        // User is logged out, clear all user-specific state
        setUserProfile(null);
        setVehicles([]);
        setInspections({});
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchVehicles]);


  useEffect(() => {
    if (userProfile?.caserne) {
      const caserneVehicles = vehicles.filter(v => v.caserne === userProfile.caserne);
      setFilteredVehicles(caserneVehicles);
      const vehicleIds = caserneVehicles.map(v => v.id);
      fetchInspections(vehicleIds);
    } else {
      setFilteredVehicles([]);
      setInspections({});
    }
  }, [userProfile, vehicles, fetchInspections]);


  const handleSelectVehicle = useCallback((id: number) => {
    setSelectedVehicleId(id);
    if (!inspections[id]) {
      setInspections(prev => ({
        ...prev,
        [id]: { 
          images: { front: null, back: null, left: null, right: null },
          markers: { front: [], back: [], left: [], right: [] }
        }
      }));
    }
  }, [inspections]);

  const handleGoBackToVehicles = () => {
    setSelectedVehicleId(null);
    setCurrentPage('inspection');
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdateInspection = async (id: number, data: InspectionData) => {
    // Optimistic UI update
    setInspections(prev => ({
      ...prev,
      [id]: data,
    }));

    if (!session) {
      const errorMessage = "Votre session a expiré. Impossible de sauvegarder.";
      console.error(errorMessage);
      setAppError(errorMessage);
      alert(errorMessage);
      return;
    }

    // Save to Supabase
    const { error } = await supabase
      .from('inspections')
      .upsert({
        vehicle_id: id,
        data: data,
        updated_by: session.user.id,
      }, { onConflict: 'vehicle_id' });

    if (error) {
      console.error("Erreur lors de la sauvegarde de l'inspection:", error);
      const userMessage = "La sauvegarde de l'inspection a échoué. Veuillez vérifier votre connexion et réessayer.";
      setAppError(userMessage);
      alert(userMessage);
      // Here you could add logic to revert the optimistic update if needed
    } else {
      setAppError(null); // Clear error on successful save
    }
  };
  
  const handleNavigate = (page: CurrentPage) => {
    setIsMenuOpen(false);
    setSelectedVehicleId(null);
    setCurrentPage(page);
    if (page === 'settings') {
      alert(`Navigation vers ${page} non implémentée.`);
    }
  };
  
  if (!session) {
    return <AuthUI />;
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }
  
  const selectedVehicle = filteredVehicles.find(v => v.id === selectedVehicleId);
  const inspectorName = userProfile ? `${userProfile.prenom || ''} ${userProfile.nom || ''}`.trim() : '';
  
  const renderPage = () => {
    switch (currentPage) {
        case 'profile':
            return <ProfilePage key={session.user.id} session={session} profile={userProfile} />;
        case 'settings':
            return <div className="p-8 text-center"><h1>Paramètres</h1><p>Cette page sera bientôt disponible.</p></div>;
        case 'inspection':
        default:
            return !selectedVehicle ? (
                <VehicleSelector 
                  vehicles={filteredVehicles} 
                  onSelectVehicle={handleSelectVehicle} 
                  userStation={userProfile?.caserne || null}
                  userRole={userProfile?.role || null}
                  onAddVehicleClick={() => setIsAddVehicleModalOpen(true)}
                />
            ) : (
                <InspectionView
                key={selectedVehicle.id}
                vehicle={selectedVehicle}
                userId={session.user.id}
                inspectorName={inspectorName}
                inspectionData={inspections[selectedVehicle.id] || { 
                    images: { front: null, back: null, left: null, right: null },
                    markers: { front: [], back: [], left: [], right: [] }
                }}
                onUpdateInspection={handleUpdateInspection}
                />
            );
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      {isAddVehicleModalOpen && (
        <AddVehicleModal 
          onClose={() => setIsAddVehicleModalOpen(false)}
          onVehicleAdded={() => {
            fetchVehicles();
          }}
        />
      )}
      <BurgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={handleNavigate} />
      
      <header className="bg-gray-800 shadow-md p-4 flex items-center justify-between z-10">
        <div className="flex items-center">
          <button onClick={() => setIsMenuOpen(true)} className="p-1 rounded-full hover:bg-gray-700 transition-colors" aria-label="Ouvrir le menu">
            <MenuIcon />
          </button>
          {selectedVehicle && (
            <button onClick={handleGoBackToVehicles} className="ml-2 p-1 rounded-full hover:bg-gray-700 transition-colors" aria-label="Retour à la liste des véhicules">
              <ChevronLeftIcon />
            </button>
          )}
        </div>
        
        <h1 className="text-xl font-bold text-red-500 text-center absolute left-1/2 -translate-x-1/2">
          {currentPage === 'profile' ? 'Mon Profil' : 
           selectedVehicle ? `Inspection: ${selectedVehicle.name}` : 'Carrosserie Inspecteur'}
        </h1>
        
        <button onClick={handleLogout} className="p-1 rounded-full hover:bg-gray-700 transition-colors" aria-label="Déconnexion">
            <LogoutIcon />
        </button>
      </header>

      {appError && (
        <div className="bg-red-800 border-b-2 border-red-600 text-white p-4" role="alert">
            <div className="flex items-center justify-center max-w-4xl mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="flex-grow text-left"><strong>Erreur:</strong> {appError}</p>
                <button onClick={() => setAppError(null)} className="ml-4 p-1 rounded-full hover:bg-red-700 transition-colors" aria-label="Fermer">
                    <XIcon width={20} height={20} />
                </button>
            </div>
        </div>
      )}
      
      {renderPage()}

    </div>
  );
};

export default App;
