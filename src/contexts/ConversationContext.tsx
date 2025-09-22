import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Conversation, Message } from '../types';
import { useAuth } from './AuthContext';

interface ConversationContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // key: conversation_id
  loading: boolean;
  getOrCreateConversation: (annonceId: string, otherUserId: string) => Promise<Conversation | null>;
  listMyConversations: () => Promise<Conversation[]>;
  fetchMessages: (conversationId: string) => Promise<Message[]>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
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
        .in('user1_id', [user.id, otherUserId])
        .in('user2_id', [user.id, otherUserId])
        .maybeSingle();

      if (!findErr && found) {
        ensureRealtime(found.id);
        return found as Conversation;
      }

      // Create new
      const { data: created, error: createErr } = await supabase
        .from('conversations')
        .insert([{ annonce_id: annonceId, user1_id: otherUserId, user2_id: user.id }])
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
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setConversations((data || []) as Conversation[]);
      return (data || []) as Conversation[];
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

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user?.id || !content.trim()) return;
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{ conversation_id: conversationId, sender_id: user.id, content: content.trim() }]);
      if (error) throw error;
    } catch (e) {
      console.error('sendMessage error:', e);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(channelsRef.current).forEach((ch) => supabase.removeChannel(ch));
      channelsRef.current = {};
    };
  }, []);

  return (
    <ConversationContext.Provider value={{ conversations, messages, loading, getOrCreateConversation, listMyConversations, fetchMessages, sendMessage }}>
      {children}
    </ConversationContext.Provider>
  );
}
