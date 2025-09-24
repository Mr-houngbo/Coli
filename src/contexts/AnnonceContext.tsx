import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Annonce } from '../types';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient';

interface AnnonceContextType {
  annonces: Annonce[];
  addAnnonce: (annonce: Omit<Annonce, 'id' | 'created_at' | 'updated_at' | 'user_id'>, userId: string) => Promise<Annonce>;
  getUserAnnonces: (userId: string) => Promise<Annonce[]>;
  getAllAnnonces: () => Promise<Annonce[]>;
  getAnnonceById: (id: string) => Promise<Annonce | undefined>;
  takeAnnonce: (annonceId: string, currentUserId: string) => Promise<{ conversationId: string } | null>;
  updateAnnonce: (id: string, updates: Partial<Annonce>) => Promise<boolean>;
  secureAnnonce: (annonceId: string, gpId: string, receveurData: { id?: string; name: string; phone: string; address?: string }) => Promise<{ coliSpaceId: string } | null>;
  addPackagePhotos: (annonceId: string, photos: string[]) => Promise<boolean>;
  updateAnnonceStatus: (annonceId: string, status: Annonce['status']) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const AnnonceContext = createContext<AnnonceContextType | undefined>(undefined);

export const useAnnonce = () => {
  const context = useContext(AnnonceContext);
  if (!context) {
    throw new Error('useAnnonce must be used within an AnnonceProvider');
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
  const [error, setError] = useState<string | null>(null);

  const addAnnonce = async (annonceData: Omit<Annonce, 'id' | 'created_at' | 'updated_at' | 'user_id'>, userId: string) => {
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

      // Mettre à jour le statut à 'secured' (Flow-Coli)
      const { error: updErr } = await supabase
        .from('annonces')
        .update({ status: 'secured' })
        .eq('id', annonceId);
      if (updErr) throw updErr;

      // Créer une conversation entre le propriétaire de l'annonce et l'utilisateur courant
      const ownerId = (aData as any).user_id;
      const expediteurId = ownerId;
      const gpId = currentUserId;
      
      const { data: conv, error: convErr } = await supabase
        .from('conversations')
        .insert([{ 
          annonce_id: annonceId, 
          expediteur_id: expediteurId, 
          gp_id: gpId,
          conversation_type: 'public'
        }])
        .select('id')
        .single();
      if (convErr) throw convErr;

      // Mettre à jour le cache local des annonces
      setAnnonces(prev => prev.map(a => a.id === annonceId ? ({ ...a, status: 'secured' } as any) : a));

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

  // Nouvelle méthode Flow-Coli : sécuriser une annonce
  const secureAnnonce = async (
    annonceId: string, 
    gpId: string, 
    receveurData: { id?: string; name: string; phone: string; address?: string }
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer l'annonce
      const { data: annonceData, error: annonceError } = await supabase
        .from('annonces')
        .select('*')
        .eq('id', annonceId)
        .single();

      if (annonceError || !annonceData) {
        throw new Error('Annonce introuvable');
      }

      // Mettre à jour l'annonce avec les informations du receveur et le statut "secured"
      const { error: updateError } = await supabase
        .from('annonces')
        .update({
          status: 'secured',
          receiver_id: receveurData.id,
          receiver_name: receveurData.name,
          receiver_phone: receveurData.phone,
          receiver_address: receveurData.address
        })
        .eq('id', annonceId);

      if (updateError) throw updateError;

      // Créer l'espace Coli privé (utilisation simulée car useColiSpace n'est pas disponible ici)
      const { data: coliSpaceData, error: coliSpaceError } = await supabase
        .from('coli_spaces')
        .insert({
          annonce_id: annonceId,
          expediteur_id: (annonceData as any).user_id,
          gp_id: gpId,
          receveur_id: receveurData.id || 'temp_receiver_id',
          status: 'active',
          chat_enabled: true,
          shared_documents: []
        })
        .select('id')
        .single();

      if (coliSpaceError) throw coliSpaceError;

      // Mettre à jour le cache local
      setAnnonces(prev => 
        prev.map(a => 
          a.id === annonceId 
            ? { 
                ...a, 
                status: 'secured',
                receiver_name: receveurData.name,
                receiver_phone: receveurData.phone,
                receiver_address: receveurData.address
              } as Annonce
            : a
        )
      );

      toast.success('Annonce sécurisée avec succès !');
      return { coliSpaceId: coliSpaceData.id };

    } catch (error: any) {
      console.error('Erreur lors de la sécurisation:', error);
      setError(error.message);
      toast.error('Erreur lors de la sécurisation de l\'annonce');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une annonce
  const updateAnnonce = async (id: string, updates: Partial<Annonce>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('annonces')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Mettre à jour le cache local
      setAnnonces(prev => 
        prev.map(a => a.id === id ? { ...a, ...updates } : a)
      );

      return true;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Ajouter des photos à un colis
  const addPackagePhotos = async (annonceId: string, photos: string[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les photos existantes
      const { data: currentData, error: fetchError } = await supabase
        .from('annonces')
        .select('package_photos')
        .eq('id', annonceId)
        .single();

      if (fetchError) throw fetchError;

      const existingPhotos = (currentData as any)?.package_photos || [];
      const updatedPhotos = [...existingPhotos, ...photos];

      const { error } = await supabase
        .from('annonces')
        .update({ package_photos: updatedPhotos })
        .eq('id', annonceId);

      if (error) throw error;

      // Mettre à jour le cache local
      setAnnonces(prev => 
        prev.map(a => 
          a.id === annonceId 
            ? { ...a, package_photos: updatedPhotos }
            : a
        )
      );

      return true;
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout des photos:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le statut d'une annonce
  const updateAnnonceStatus = async (annonceId: string, status: Annonce['status']): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('annonces')
        .update({ status })
        .eq('id', annonceId);

      if (error) throw error;

      // Mettre à jour le cache local
      setAnnonces(prev => 
        prev.map(a => a.id === annonceId ? { ...a, status } : a)
      );

      return true;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    annonces,
    addAnnonce,
    getUserAnnonces,
    getAnnonceById,
    getAllAnnonces,
    takeAnnonce,
    updateAnnonce,
    secureAnnonce,
    addPackagePhotos,
    updateAnnonceStatus,
    loading,
    error,
  };

  return (
    <AnnonceContext.Provider value={contextValue}>
      {children}
    </AnnonceContext.Provider>
  );
};