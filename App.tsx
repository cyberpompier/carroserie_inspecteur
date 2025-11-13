import React, { useState, useCallback, useEffect } from 'react';
import { VehicleSelector } from './components/VehicleSelector.js';
import { InspectionView } from './components/InspectionView.js';
import { ChevronLeftIcon, LogoutIcon, MenuIcon, XIcon } from './components/Icons.js';
import { Auth } from './components/Auth.js';
import { supabase } from './lib/supabase.js';
import { BurgerMenu } from './components/BurgerMenu.js';
import { ProfilePage } from './components/ProfilePage.js';
import { AddVehicleModal } from './components/AddVehicleModal.js';

const App = () => {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [inspections, setInspections] = useState({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('inspection');
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [appError, setAppError] = useState(null);

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

  const fetchInspections = useCallback(async (vehicleIds) => {
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
      }, {});
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
            const defaultProfile = {
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
          console.error("Erreur critique lors de la récupération du profil:", error);
          setAppError(`Impossible de charger le profil utilisateur: ${error.message}. L'application est peut-être inutilisable.`);
          const defaultProfile = {
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


  const handleSelectVehicle = useCallback((id) => {
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

  const handleUpdateInspection = async (id, data) => {
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
      React.createElement('div', { className: "text-xl" }, "Chargement...")
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
            return !selectedVehicle ? (
                React.createElement(VehicleSelector, {
                  vehicles: filteredVehicles,
                  onSelectVehicle: handleSelectVehicle,
                  userStation: userProfile?.caserne || null,
                  userRole: userProfile?.role || null,
                  onAddVehicleClick: () => setIsAddVehicleModalOpen(true)
                })
            ) : (
                React.createElement(InspectionView, {
                  key: selectedVehicle.id,
                  vehicle: selectedVehicle,
                  userId: session.user.id,
                  inspectorName: inspectorName,
                  inspectionData: inspections[selectedVehicle.id] || { 
                      images: { front: null, back: null, left: null, right: null },
                      markers: { front: [], back: [], left: [], right: [] }
                  },
                  onUpdateInspection: handleUpdateInspection
                })
            );
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
      React.createElement('h1', { className: "text-xl font-bold text-red-500 text-center absolute left-1/2 -translate-x-1/2" },
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
