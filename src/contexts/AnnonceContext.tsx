import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Annonce } from '../types';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient';

interface AnnonceContextType {
  annonces: Annonce[];
  addAnnonce: (annonce: Omit<Annonce, 'id' | 'created_at' | 'user_id'>, userId: string) => Promise<Annonce>;
  getUserAnnonces: (userId: string) => Promise<Annonce[]>;
  getAllAnnonces: () => Promise<Annonce[]>;
  getAnnonceById: (id: string) => Promise<Annonce | undefined>;
  loading: boolean;
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

// Suppression des données mockées car nous utilisons maintenant la base de données

export const AnnonceProvider: React.FC<AnnonceProviderProps> = ({ children }) => {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const addAnnonce = async (annonceData: Omit<Annonce, 'id' | 'created_at' | 'user_id' | 'user'>, userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('annonces')
        .insert([
          {
            ...annonceData,
            user_id: userId,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setAnnonces(prev => [data as Annonce, ...prev]);
      toast.success('Annonce publiée avec succès !');
      return data as Annonce;
    } catch (error) {
      console.error('Erreur lors de la création de l\'annonce:', error);
      toast.error('Erreur lors de la publication de l\'annonce');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserAnnonces = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('annonces')
        .select('*, user:profiles(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data as Annonce[];
    } catch (error) {
      console.error('Erreur lors de la récupération des annonces:', error);
      return [];
    }
  };

  const getAllAnnonces = async () => {
    try {
      const { data, error } = await supabase
        .from('annonces')
        .select('*, user:profiles(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mettre à jour le state local avec les annonces chargées
      setAnnonces(data as Annonce[]);
      
      return data as Annonce[];
    } catch (error) {
      console.error('Erreur lors de la récupération des annonces:', error);
      return [];
    }
  };

  const getAnnonceById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('annonces')
        .select('*, user:profiles(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return data as Annonce;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'annonce:', error);
      return undefined;
    }
  };

  const contextValue = {
    annonces,
    addAnnonce,
    getUserAnnonces,
    getAnnonceById,
    getAllAnnonces,
    loading,
  };

  return (
    <AnnonceContext.Provider value={contextValue}>
      {children}
    </AnnonceContext.Provider>
  );
};