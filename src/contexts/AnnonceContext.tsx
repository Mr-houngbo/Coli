import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Annonce } from '../types';
import { toast } from 'react-toastify';

interface AnnonceContextType {
  annonces: Annonce[];
  addAnnonce: (annonce: Omit<Annonce, 'id' | 'createdAt'>) => void;
  getUserAnnonces: (userId: string) => Annonce[];
  getAnnonceById: (id: string) => Annonce | undefined;
}

const AnnonceContext = createContext<AnnonceContextType | undefined>(undefined);

export const useAnnonces = () => {
  const context = useContext(AnnonceContext);
  if (!context) {
    throw new Error('useAnnonces must be used within an AnnonceProvider');
  }
  return context;
};

interface AnnonceProviderProps {
  children: ReactNode;
}

const mockAnnonces: Annonce[] = [
  {
    id: '1',
    userId: '2',
    type: 'GP',
    villeDepart: 'Paris',
    villeArrivee: 'Dakar',
    date: '2024-02-15',
    poids: 20,
    prix: 15,
    moyenTransport: 'avion',
    user: {
      id: '2',
      name: 'Marie Martin',
      email: 'marie@example.com',
      phone: '+33123456789',
      whatsapp: '+33123456789'
    },
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    userId: '3',
    type: 'EXPEDITEUR',
    villeDepart: 'Lyon',
    villeArrivee: 'Abidjan',
    date: '2024-02-20',
    poids: 5,
    description: 'Documents importants à envoyer',
    user: {
      id: '3',
      name: 'Jean Dupont',
      email: 'jean@example.com',
      phone: '+33987654321',
      whatsapp: '+33987654321'
    },
    createdAt: '2024-01-12'
  }
];

export const AnnonceProvider: React.FC<AnnonceProviderProps> = ({ children }) => {
  const [annonces, setAnnonces] = useState<Annonce[]>(mockAnnonces);

  const addAnnonce = (annonceData: Omit<Annonce, 'id' | 'createdAt'>) => {
    const newAnnonce: Annonce = {
      ...annonceData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setAnnonces(prev => [newAnnonce, ...prev]);
    toast.success('Annonce publiée avec succès !');
  };

  const getUserAnnonces = (userId: string) => {
    return annonces.filter(annonce => annonce.userId === userId);
  };

  const getAnnonceById = (id: string) => {
    return annonces.find(annonce => annonce.id === id);
  };

  return (
    <AnnonceContext.Provider
      value={{
        annonces,
        addAnnonce,
        getUserAnnonces,
        getAnnonceById,
      }}
    >
      {children}
    </AnnonceContext.Provider>
  );
};