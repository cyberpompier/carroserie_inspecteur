
import React, { useState, useCallback, useEffect } from 'react';
import { VehicleSelector } from './components/VehicleSelector.js';
import { InspectionView } from './components/InspectionView.js';
import { ChevronLeftIcon, LogoutIcon, MenuIcon, XIcon } from './components/Icons.js';
import { Auth } from './components/Auth.js';
import { supabase } from './lib/supabase.js';
import { BurgerMenu } from './components/BurgerMenu.js';
import { ProfilePage } from './components/ProfilePage.js';
import { AddVehicleModal } from './components/AddVehicleModal.js';
import { InspectionData, UserProfile, Vehicle } from './types.js';

const App = () => {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [inspections, setInspections] = useState<Record<string, InspectionData>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('inspection');
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);
  const [isLoadingInspection, setIsLoadingInspection] = useState(false);

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

  // Cette fonction charge l'inspection pour un véhicule spécifique uniquement
  const fetchInspectionForVehicle = useCallback(async (vehicleId: string) => {
    // Si on a déjà les données en mémoire, on ne recharge pas (sauf si on voulait forcer un refresh)
    if (inspections[vehicleId]) return;

    setIsLoadingInspection(true);
    const { data, error } = await supabase
      .from('inspections')
      .select('data')
      .eq('vehicle_id', vehicleId)
      .maybeSingle(); // maybeSingle évite une erreur si pas de ligne

    setIsLoadingInspection(false);

    if (error) {
        // Ignorer l'erreur 42P01 (table inexistante) pour éviter de bloquer l'UI si la DB est vide
        if (error.code !== '42P01') {
            console.error("Erreur lors de la récupération de l'inspection:", error);
            setAppError(`Erreur lors du chargement de l'inspection: ${error.message}`);
        }
    }

    // Initialisation par défaut si pas de données ou erreur
    const inspectionData: InspectionData = data?.data || {
        images: { front: null, back: null, left: null, right: null },
        markers: { front: [], back: [], left: [], right: [] }
    };

    setInspections(prev => ({
        ...prev,
        [vehicleId]: inspectionData
    }));

  }, [inspections]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select(`*`)
            .eq('id', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') throw error;

          if (data) {
            setUserProfile(data as UserProfile);
          } else {
            const defaultProfile: UserProfile = {
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
          
          await fetchVehicles();

        } catch (error) {
          console.error("Erreur critique:", error);
          setAppError(`Impossible de charger le profil: ${error.message}`);
          // Fallback profile
          setUserProfile({
             id: session.user.id, prenom: null, nom: null, phone: null, caserne: null, rank: null, avatarUrl: null, role: null
          });
        }
      } else {
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
    } else {
      setFilteredVehicles([]);
    }
  }, [userProfile, vehicles]);


  const handleSelectVehicle = useCallback(async (id: string) => {
    setSelectedVehicleId(id);
    await fetchInspectionForVehicle(id);
  }, [fetchInspectionForVehicle]);

  const handleGoBackToVehicles = () => {
    setSelectedVehicleId(null);
    setCurrentPage('inspection');
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdateInspection = async (id: string, data: InspectionData) => {
    // Mise à jour optimiste de l'état local
    setInspections(prev => ({
      ...prev,
      [id]: data,
    }));

    if (!session) {
      setAppError("Session expirée.");
      return;
    }

    const { error } = await supabase
      .from('inspections')
      .upsert({
        vehicle_id: id,
        data: data,
        updated_by: session.user.id,
      }, { onConflict: 'vehicle_id' });

    if (error) {
      console.error("Erreur sauvegarde:", error);
      setAppError("Échec de la sauvegarde. Vérifiez votre connexion.");
    } else {
      setAppError(null);
    }
  };
  
  const handleNavigate = (page) => {
    setIsMenuOpen(false);
    setSelectedVehicleId(null);
    setCurrentPage(page);
    if (page === 'settings') {
      alert(`Navigation vers ${page} non implémentée.`);
    }
  };
  
  if (!session) {
    return React.createElement(Auth);
  }

  if (!userProfile) {
    return React.createElement('div', { className: "flex items-center justify-center h-screen bg-gray-900 text-white" },
      React.createElement('div', { className: "text-xl animate-pulse" }, "Chargement du profil...")
    );
  }
  
  const selectedVehicle = filteredVehicles.find(v => v.id === selectedVehicleId);
  const inspectorName = userProfile ? `${userProfile.prenom || ''} ${userProfile.nom || ''}`.trim() : '';
  
  const renderPage = () => {
    switch (currentPage) {
        case 'profile':
            return React.createElement(ProfilePage, { key: session.user.id, session: session, profile: userProfile });
        case 'settings':
            return React.createElement('div', { className: "p-8 text-center" }, 
                React.createElement('h1', null, "Paramètres"), 
                React.createElement('p', null, "Cette page sera bientôt disponible.")
            );
        case 'inspection':
        default:
            if (!selectedVehicle) {
                return React.createElement(VehicleSelector, {
                  vehicles: filteredVehicles,
                  onSelectVehicle: handleSelectVehicle,
                  userStation: userProfile?.caserne || null,
                  userRole: userProfile?.role || null,
                  onAddVehicleClick: () => setIsAddVehicleModalOpen(true)
                });
            } else {
                if (isLoadingInspection && !inspections[selectedVehicle.id]) {
                     return React.createElement('div', { className: "flex items-center justify-center h-full" },
                        React.createElement('div', { className: "text-red-500 text-xl font-bold animate-pulse" }, "Chargement de l'inspection...")
                     );
                }
                
                return React.createElement(InspectionView, {
                  key: selectedVehicle.id,
                  vehicle: selectedVehicle,
                  userId: session.user.id,
                  inspectorName: inspectorName,
                  inspectionData: inspections[selectedVehicle.id] || { 
                      images: { front: null, back: null, left: null, right: null },
                      markers: { front: [], back: [], left: [], right: [] }
                  },
                  onUpdateInspection: handleUpdateInspection
                });
            }
    }
  }

  return React.createElement('div', { className: "flex flex-col h-screen bg-gray-900 text-gray-100 font-sans" },
    isAddVehicleModalOpen && React.createElement(AddVehicleModal, {
      onClose: () => setIsAddVehicleModalOpen(false),
      onVehicleAdded: () => {
        fetchVehicles();
      }
    }),
    React.createElement(BurgerMenu, { isOpen: isMenuOpen, onClose: () => setIsMenuOpen(false), onNavigate: handleNavigate }),
    React.createElement('header', { className: "bg-gray-800 shadow-md p-4 flex items-center justify-between z-10" },
      React.createElement('div', { className: "flex items-center" },
        React.createElement('button', { onClick: () => setIsMenuOpen(true), className: "p-1 rounded-full hover:bg-gray-700 transition-colors", 'aria-label': "Ouvrir le menu" },
          React.createElement(MenuIcon)
        ),
        selectedVehicle && React.createElement('button', { onClick: handleGoBackToVehicles, className: "ml-2 p-1 rounded-full hover:bg-gray-700 transition-colors", 'aria-label': "Retour à la liste des véhicules" },
          React.createElement(ChevronLeftIcon)
        )
      ),
      React.createElement('h1', { className: "text-xl font-bold text-red-500 text-center absolute left-1/2 -translate-x-1/2 truncate max-w-[50%]" },
        currentPage === 'profile' ? 'Mon Profil' : 
         selectedVehicle ? `Inspection: ${selectedVehicle.name}` : 'Carrosserie Inspecteur'
      ),
      React.createElement('button', { onClick: handleLogout, className: "p-1 rounded-full hover:bg-gray-700 transition-colors", 'aria-label': "Déconnexion" },
        React.createElement(LogoutIcon)
      )
    ),
    appError && React.createElement('div', { className: "bg-red-800 border-b-2 border-red-600 text-white p-4", role: "alert" },
      React.createElement('div', { className: "flex items-center justify-center max-w-4xl mx-auto" },
        React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 mr-3 flex-shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
          React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" })
        ),
        React.createElement('p', { className: "flex-grow text-left" }, 
            React.createElement('strong', null, 'Erreur: '), 
            appError
        ),
        React.createElement('button', { onClick: () => setAppError(null), className: "ml-4 p-1 rounded-full hover:bg-red-700 transition-colors", 'aria-label': "Fermer" },
          React.createElement(XIcon, { width: 20, height: 20 })
        )
      )
    ),
    renderPage()
  );
};

export default App;
