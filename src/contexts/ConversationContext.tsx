import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Conversation, Message } from '../types';
import { useAuth } from './AuthContext';

interface ConversationContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // key: conversation_id
  loading: boolean;
  error: string | null;
  // Méthodes Flow-Coli pour 3 participants
  createColiSpaceConversation: (coliSpaceId: string, expediteurId: string, gpId: string, receveurId: string) => Promise<Conversation | null>;
  // Méthodes classiques (maintenues pour compatibilité)
  getOrCreateConversation: (annonceId: string, otherUserId: string) => Promise<Conversation | null>;
  listMyConversations: () => Promise<Conversation[]>;
  fetchMessages: (conversationId: string) => Promise<Message[]>;
  sendMessage: (conversationId: string, content: string, messageType?: Message['message_type']) => Promise<void>;
  sendSystemMessage: (conversationId: string, content: string) => Promise<void>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  markMessageAsRead: (messageId: string, userId: string) => Promise<void>;
  // Nouvelles méthodes pour les pièces jointes
  sendMessageWithAttachment: (conversationId: string, content: string, attachmentUrl: string, attachmentType: string) => Promise<void>;
}

const ConversationContext = createContext<ConversationContextType | null>(null);

export const useConversations = (): ConversationContextType => {
  const ctx = useContext(ConversationContext);
  if (!ctx) throw new Error('useConversations must be used within ConversationProvider');
  return ctx;
};

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelsRef = useRef<Record<string, ReturnType<typeof supabase.channel>>>({});

  const ensureRealtime = (conversationId: string) => {
    if (channelsRef.current[conversationId]) return;
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const msg = payload.new as unknown as Message;
          setMessages((prev) => ({
            ...prev,
            [conversationId]: [...(prev[conversationId] || []), msg].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
          }));
        }
      })
      .subscribe();
    channelsRef.current[conversationId] = channel;
  };

  const getOrCreateConversation = async (annonceId: string, otherUserId: string) => {
    if (!user?.id) return null;
    setLoading(true);
    try {
      // Try find existing
      const { data: found, error: findErr } = await supabase
        .from('conversations')
        .select('*')
        .eq('annonce_id', annonceId)
        .or(`and(expediteur_id.eq.${user.id},gp_id.eq.${otherUserId}),and(expediteur_id.eq.${otherUserId},gp_id.eq.${user.id})`)
        .maybeSingle();

      if (!findErr && found) {
        ensureRealtime(found.id);
        return found as Conversation;
      }

      // Create new - déterminer qui est l'expéditeur et qui est le GP
      const { data: created, error: createErr } = await supabase
        .from('conversations')
        .insert([{ 
          annonce_id: annonceId, 
          expediteur_id: otherUserId, 
          gp_id: user.id,
          conversation_type: 'public'
        }])
        .select('*')
        .single();
      if (createErr) throw createErr;

      setConversations((prev) => [created as Conversation, ...prev]);
      ensureRealtime(created.id);
      return created as Conversation;
    } catch (e) {
      console.error('Conversation getOrCreate error:', e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const listMyConversations = async () => {
    if (!user?.id) return [] as Conversation[];
    setLoading(true);
    try {
      // Récupérer les conversations avec les profils des participants
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          expediteur:profiles!conversations_expediteur_id_fkey(
            id,
            full_name,
            phone,
            whatsapp_number,
            role
          ),
          gp:profiles!conversations_gp_id_fkey(
            id,
            full_name,
            phone,
            whatsapp_number,
            role
          ),
          receveur:profiles!conversations_receveur_id_fkey(
            id,
            full_name,
            phone,
            whatsapp_number,
            role
          ),
          annonce:annonces(
            id,
            ville_depart,
            ville_arrivee,
            date_annonce,
            user_id,
            description,
            poids,
            prix_kg
          )
        `)
        .or(`expediteur_id.eq.${user.id},gp_id.eq.${user.id},receveur_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transformer les données pour correspondre au type Conversation
      const formattedData = (data || []).map(conv => {
        // Créer la liste des participants à partir des relations
        const participants = [];
        if (conv.expediteur) participants.push(conv.expediteur);
        if (conv.gp) participants.push(conv.gp);
        if (conv.receveur) participants.push(conv.receveur);
        
        return {
          ...conv,
          participants,
          annonce: conv.annonce || undefined,
          participant_count: participants.length
        };
      }) as Conversation[];
      
      setConversations(formattedData);
      return formattedData;
    } catch (e) {
      console.error('listMyConversations error:', e);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages((prev) => ({ ...prev, [conversationId]: (data || []) as Message[] }));
      ensureRealtime(conversationId);
      return (data || []) as Message[];
    } catch (e) {
      console.error('fetchMessages error:', e);
      return [];
    } finally {
      setLoading(false);
    }
  };


  const markConversationAsRead = async (conversationId: string) => {
    if (!user?.id) return;
    
    try {
      // Mettre à jour le compteur de messages non lus côté serveur
      const { error } = await supabase
        .from('conversation_participants')
        .update({ unread_count: 0 })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Mettre à jour l'état local
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === conversationId 
            ? { 
                ...conv, 
                unread_count: 0,
                last_read_at: new Date().toISOString() 
              } 
            : conv
        )
      );
    } catch (error) {
      console.error('Erreur lors du marquage de la conversation comme lue:', error);
      throw error;
    }
  };

  // Nouvelle méthode Flow-Coli : créer une conversation pour un espace Coli (3 participants)
  const createColiSpaceConversation = async (
    coliSpaceId: string,
    expediteurId: string,
    gpId: string,
    receveurId: string
  ): Promise<Conversation | null> => {
    try {
      setLoading(true);
      setError(null);

      // Créer la conversation privée pour l'espace Coli
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          coli_space_id: coliSpaceId,
          expediteur_id: expediteurId,
          gp_id: gpId,
          receveur_id: receveurId,
          conversation_type: 'private_space'
        })
        .select(`
          *,
          expediteur:profiles!expediteur_id(*),
          gp:profiles!gp_id(*),
          receveur:profiles!receveur_id(*)
        `)
        .single();

      if (convError) throw convError;

      // Ajouter à la liste locale
      const newConversation = conversation as Conversation;
      setConversations(prev => [newConversation, ...prev]);

      // Activer le temps réel
      ensureRealtime(newConversation.id);

      // Envoyer un message système de bienvenue
      await sendSystemMessage(
        newConversation.id,
        '🎉 Espace Coli créé ! Vous pouvez maintenant communiquer en toute sécurité. L\'expéditeur, le GP et le receveur sont tous connectés.'
      );

      return newConversation;

    } catch (error: any) {
      console.error('Erreur lors de la création de la conversation Coli:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Envoyer un message système
  const sendSystemMessage = async (conversationId: string, content: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: 'system', // ID système spécial
          content,
          message_type: 'system',
          is_system_message: true,
          read_by: [] // Personne ne l'a encore lu
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message système:', error);
    }
  };

  // Marquer un message spécifique comme lu
  const markMessageAsRead = async (messageId: string, userId: string): Promise<void> => {
    try {
      // Récupérer le message actuel
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('read_by')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;

      const currentReadBy = (message as any)?.read_by || [];
      
      // Ajouter l'utilisateur s'il n'est pas déjà dans la liste
      if (!currentReadBy.includes(userId)) {
        const updatedReadBy = [...currentReadBy, userId];

        const { error } = await supabase
          .from('messages')
          .update({ read_by: updatedReadBy })
          .eq('id', messageId);

        if (error) throw error;

        // Mettre à jour l'état local
        setMessages(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(convId => {
            updated[convId] = updated[convId].map(msg =>
              msg.id === messageId
                ? { ...msg, read_by: updatedReadBy }
                : msg
            );
          });
          return updated;
        });
      }
    } catch (error: any) {
      console.error('Erreur lors du marquage du message comme lu:', error);
      setError(error.message);
    }
  };

  // Envoyer un message avec pièce jointe
  const sendMessageWithAttachment = async (
    conversationId: string,
    content: string,
    attachmentUrl: string,
    attachmentType: string
  ): Promise<void> => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim() || 'Pièce jointe',
          message_type: attachmentType.startsWith('image/') ? 'image' : 'document',
          attachment_url: attachmentUrl,
          attachment_type: attachmentType,
          is_system_message: false,
          read_by: [user.id] // L'expéditeur a "lu" son propre message
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message avec pièce jointe:', error);
      setError(error.message);
    }
  };

  // Mise à jour de la méthode sendMessage pour supporter les nouveaux types
  const sendMessage = async (
    conversationId: string, 
    content: string, 
    messageType: Message['message_type'] = 'text'
  ): Promise<void> => {
    if (!user?.id || !content.trim()) return;
    
    try {
      setError(null);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: messageType,
          is_system_message: false,
          read_by: [user.id] // L'expéditeur a "lu" son propre message
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(channelsRef.current).forEach((ch) => supabase.removeChannel(ch));
      channelsRef.current = {};
    };
  }, []);

  return (
    <ConversationContext.Provider value={{
      conversations,
      messages,
      loading,
      error,
      createColiSpaceConversation,
      getOrCreateConversation,
      listMyConversations,
      fetchMessages,
      sendMessage,
      sendSystemMessage,
      markConversationAsRead,
      markMessageAsRead,
      sendMessageWithAttachment,
    }}>
      {children}
    </ConversationContext.Provider>
  );
};
