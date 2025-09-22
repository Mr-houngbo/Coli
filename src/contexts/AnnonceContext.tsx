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
            user_id: userId
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setAnnonces(prev => [data as Annonce, ...prev]);
      toast.success('Annonce publiée avec succès !');
      return data as Annonce;
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'annonce:', error?.message || error);
      toast.error('Erreur lors de la publication de l\'annonce');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserAnnonces = async (userId: string) => {
    try {
      const { data: annoncesData, error: annoncesError } = await supabase
        .from('annonces')
        .select('*')
        .eq('user_id', userId);

      if (annoncesError) throw annoncesError;

      const items = (annoncesData || []) as any[];
      if (!items.length) return [] as Annonce[];

      // Charger les profils en un seul appel
      const userIds = Array.from(new Set(items.map(a => a.user_id).filter(Boolean)));
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const profileById = new Map((profilesData || []).map((p: any) => [p.id, p]));
      const merged = items.map(a => ({ ...a, user: profileById.get(a.user_id) }));
      // Tri côté client si possible
      merged.sort((a: any, b: any) => {
        const da = new Date(a.created_at || a.date_annonce || 0).getTime();
        const db = new Date(b.created_at || b.date_annonce || 0).getTime();
        return db - da;
      });
      return merged as unknown as Annonce[];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des annonces:', error?.message || error);
      return [];
    }
  };

  const getAllAnnonces = async () => {
    try {
      const { data: annoncesData, error: annoncesError } = await supabase
        .from('annonces')
        .select('*');

      if (annoncesError) throw annoncesError;

      const items = (annoncesData || []) as any[];
      if (!items.length) {
        setAnnonces([]);
        return [] as Annonce[];
      }

      const userIds = Array.from(new Set(items.map(a => a.user_id).filter(Boolean)));
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const profileById = new Map((profilesData || []).map((p: any) => [p.id, p]));
      const merged = items.map(a => ({ ...a, user: profileById.get(a.user_id) }));

      setAnnonces(merged as unknown as Annonce[]);
      return merged as unknown as Annonce[];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des annonces:', error?.message || error);
      return [];
    }
  };

  const getAnnonceById = async (id: string) => {
    try {
      const { data: annonceData, error: annonceError } = await supabase
        .from('annonces')
        .select('*')
        .eq('id', id)
        .single();

      if (annonceError) throw annonceError;
      if (!annonceData) return undefined;

      const userId = (annonceData as any).user_id;
      let userProfile: any = null;
      if (userId) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (!profileError) userProfile = profileData;
      }

      return ({ ...annonceData, user: userProfile } as unknown) as Annonce;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de l\'annonce:', error?.message || error);
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