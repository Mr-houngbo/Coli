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
  takeAnnonce: (annonceId: string, currentUserId: string) => Promise<{ conversationId: string } | null>;
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

  const takeAnnonce = async (annonceId: string, currentUserId: string): Promise<{ conversationId: string } | null> => {
    try {
      // Récupérer l'annonce pour obtenir son propriétaire
      const { data: aData, error: aErr } = await supabase
        .from('annonces')
        .select('*')
        .eq('id', annonceId)
        .single();
      if (aErr || !aData) throw aErr || new Error('Annonce introuvable');

      // Mettre à jour le statut à 'prise'
      const { error: updErr } = await supabase
        .from('annonces')
        .update({ status: 'prise' })
        .eq('id', annonceId);
      if (updErr) throw updErr;

      // Créer une conversation entre le propriétaire de l'annonce et l'utilisateur courant
      const ownerId = (aData as any).user_id;
      const user1 = ownerId;
      const user2 = currentUserId;
      const { data: conv, error: convErr } = await supabase
        .from('conversations')
        .insert([{ annonce_id: annonceId, user1_id: user1, user2_id: user2 }])
        .select('id')
        .single();
      if (convErr) throw convErr;

      // Mettre à jour le cache local des annonces
      setAnnonces(prev => prev.map(a => a.id === annonceId ? ({ ...a, status: 'prise' } as any) : a));

      return { conversationId: conv!.id as string };
    } catch (e) {
      console.error('Erreur lors de la prise de l\'annonce:', e);
      return null;
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
    takeAnnonce,
    loading,
  };

  return (
    <AnnonceContext.Provider value={contextValue}>
      {children}
    </AnnonceContext.Provider>
  );
};