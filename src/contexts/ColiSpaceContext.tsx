import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ColiSpace, ColiSpaceContextType, PackageTracking, Transaction } from '../types';
import { useAuth } from './AuthContext';

const ColiSpaceContext = createContext<ColiSpaceContextType | null>(null);

export const ColiSpaceProvider = ({ children }: { children: ReactNode }) => {
  const [coliSpaces, setColiSpaces] = useState<ColiSpace[]>([]);
  const [currentColiSpace, setCurrentColiSpace] = useState<ColiSpace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Créer un nouvel espace Coli privé
  const createColiSpace = async (
    annonceId: string, 
    expediteurId: string, 
    gpId: string, 
    receveurId: string
  ): Promise<ColiSpace | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[ColiSpace] Creating new coli space for annonce:', annonceId);

      const { data, error } = await supabase
        .from('coli_spaces')
        .insert({
          annonce_id: annonceId,
          expediteur_id: expediteurId,
          gp_id: gpId,
          receveur_id: receveurId,
          status: 'active',
          chat_enabled: true,
          shared_documents: []
        })
        .select(`
          *,
          annonce:annonces(*),
          expediteur:profiles!expediteur_id(*),
          gp:profiles!gp_id(*),
          receveur:profiles!receveur_id(*)
        `)
        .single();

      if (error) throw error;

      const newColiSpace = data as ColiSpace;
      
      // Ajouter à la liste locale
      setColiSpaces(prev => [newColiSpace, ...prev]);
      setCurrentColiSpace(newColiSpace);

      // Créer la première étape du tracking
      await createInitialTracking(newColiSpace);

      console.log('[ColiSpace] Coli space created successfully:', newColiSpace.id);
      return newColiSpace;

    } catch (error: any) {
      console.error('[ColiSpace] Error creating coli space:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer le tracking initial (étape 1: created)
  const createInitialTracking = async (coliSpace: ColiSpace) => {
    try {
      const { error } = await supabase
        .from('package_tracking')
        .insert({
          annonce_id: coliSpace.annonce_id,
          coli_space_id: coliSpace.id,
          expediteur_id: coliSpace.expediteur_id,
          gp_id: coliSpace.gp_id,
          receveur_id: coliSpace.receveur_id,
          step: 1,
          step_name: 'created',
          step_description: 'Annonce créée et espace Coli sécurisé',
          completed_at: new Date().toISOString(),
          expediteur_validated: true,
          gp_validated: true,
          receveur_validated: false
        });

      if (error) throw error;
      console.log('[ColiSpace] Initial tracking created');
    } catch (error) {
      console.error('[ColiSpace] Error creating initial tracking:', error);
    }
  };

  // Récupérer un espace Coli spécifique
  const getColiSpace = async (id: string): Promise<ColiSpace | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('coli_spaces')
        .select(`
          *,
          annonce:annonces(*),
          expediteur:profiles!expediteur_id(*),
          gp:profiles!gp_id(*),
          receveur:profiles!receveur_id(*),
          tracking:package_tracking(*),
          transaction:transactions(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const coliSpace = data as ColiSpace;
      setCurrentColiSpace(coliSpace);
      
      return coliSpace;

    } catch (error: any) {
      console.error('[ColiSpace] Error fetching coli space:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le statut d'un espace Coli
  const updateColiSpaceStatus = async (id: string, status: ColiSpace['status']): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('coli_spaces')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Mettre à jour localement
      setColiSpaces(prev => 
        prev.map(space => 
          space.id === id ? { ...space, status } : space
        )
      );

      if (currentColiSpace?.id === id) {
        setCurrentColiSpace(prev => prev ? { ...prev, status } : null);
      }

      console.log('[ColiSpace] Status updated successfully:', id, status);
      return true;

    } catch (error: any) {
      console.error('[ColiSpace] Error updating status:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer tous les espaces Coli d'un utilisateur
  const getUserColiSpaces = async (userId: string): Promise<ColiSpace[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('coli_spaces')
        .select(`
          *,
          annonce:annonces(*),
          expediteur:profiles!expediteur_id(*),
          gp:profiles!gp_id(*),
          receveur:profiles!receveur_id(*)
        `)
        .or(`expediteur_id.eq.${userId},gp_id.eq.${userId},receveur_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const spaces = data as ColiSpace[];
      setColiSpaces(spaces);
      
      return spaces;

    } catch (error: any) {
      console.error('[ColiSpace] Error fetching user coli spaces:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un document partagé
  const addSharedDocument = async (coliSpaceId: string, documentUrl: string): Promise<boolean> => {
    try {
      const coliSpace = coliSpaces.find(space => space.id === coliSpaceId);
      if (!coliSpace) return false;

      const updatedDocuments = [...(coliSpace.shared_documents || []), documentUrl];

      const { error } = await supabase
        .from('coli_spaces')
        .update({ shared_documents: updatedDocuments })
        .eq('id', coliSpaceId);

      if (error) throw error;

      // Mettre à jour localement
      setColiSpaces(prev => 
        prev.map(space => 
          space.id === coliSpaceId 
            ? { ...space, shared_documents: updatedDocuments }
            : space
        )
      );

      return true;
    } catch (error: any) {
      console.error('[ColiSpace] Error adding shared document:', error);
      setError(error.message);
      return false;
    }
  };

  // Activer/désactiver le chat
  const toggleChat = async (coliSpaceId: string, enabled: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('coli_spaces')
        .update({ chat_enabled: enabled })
        .eq('id', coliSpaceId);

      if (error) throw error;

      // Mettre à jour localement
      setColiSpaces(prev => 
        prev.map(space => 
          space.id === coliSpaceId 
            ? { ...space, chat_enabled: enabled }
            : space
        )
      );

      return true;
    } catch (error: any) {
      console.error('[ColiSpace] Error toggling chat:', error);
      setError(error.message);
      return false;
    }
  };

  // Charger les espaces Coli de l'utilisateur au démarrage
  useEffect(() => {
    if (user?.id) {
      getUserColiSpaces(user.id);
    }
  }, [user?.id]);

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('coli_spaces_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coli_spaces',
          filter: `or(expediteur_id.eq.${user.id},gp_id.eq.${user.id},receveur_id.eq.${user.id})`
        },
        (payload) => {
          console.log('[ColiSpace] Real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Recharger les espaces pour avoir les relations
            getUserColiSpaces(user.id);
          } else if (payload.eventType === 'UPDATE') {
            const updatedSpace = payload.new as ColiSpace;
            setColiSpaces(prev => 
              prev.map(space => 
                space.id === updatedSpace.id 
                  ? { ...space, ...updatedSpace }
                  : space
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setColiSpaces(prev => 
              prev.filter(space => space.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const value = {
    coliSpaces,
    currentColiSpace,
    loading,
    error,
    createColiSpace,
    getColiSpace,
    updateColiSpaceStatus,
    getUserColiSpaces,
    addSharedDocument,
    toggleChat,
  };

  return (
    <ColiSpaceContext.Provider value={value}>
      {children}
    </ColiSpaceContext.Provider>
  );
};

export const useColiSpace = (): ColiSpaceContextType => {
  const context = useContext(ColiSpaceContext);
  if (!context) {
    throw new Error('useColiSpace doit être utilisé à l\'intérieur d\'un ColiSpaceProvider');
  }
  return context;
};
