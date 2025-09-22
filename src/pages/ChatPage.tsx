import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useConversations } from '../contexts/ConversationContext';
import { useAuth } from '../contexts/AuthContext';

// Types pour les fonctionnalités avancées
interface EmojiReaction {
  emoji: string;
  users: string[];
}

interface MessageWithReactions {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  updated_at?: string;
  reactions?: EmojiReaction[];
  reply_to?: string;
  is_edited?: boolean;
}

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { fetchMessages, messages, sendMessage } = useConversations();
  
  // Références
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // États pour les fonctionnalités avancées
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState<MessageWithReactions | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Emojis populaires
  const popularEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🔥'];

  useEffect(() => {
    if (id) fetchMessages(id);
  }, [id, fetchMessages]);

  // Fonction pour faire défiler vers le bas
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (!scrollRef.current) return;
    
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior
    });
    
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  // Gestion du scroll et du bouton "scroll to bottom"
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (!scrollContainer) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollToBottom(!isNearBottom);
    };

    const container = scrollContainer;
    container.addEventListener('scroll', handleScroll);
    
    // Nettoyage
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [messages, id]);

  // Filtrer les messages pour la recherche
  const filteredMessages = useMemo(() => {
    const thread = messages[id || ''] || [];
    if (!searchQuery) return thread;
    return thread.filter(m => 
      m.content && m.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, id, searchQuery]);

  // Auto-scroll pour les nouveaux messages
  useEffect(() => {
    if (!showScrollToBottom || !messagesEndRef.current) return;
    
    const shouldScroll = messagesEndRef.current.getBoundingClientRect().bottom <= window.innerHeight;
    
    if (shouldScroll) {
      scrollToBottom('auto');
    }
  }, [messages, id, showScrollToBottom, scrollToBottom]);

  // Gestion de la frappe
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    
    // Simulation d'indicateur de frappe
    if (!isTyping) {
      setIsTyping(true);
      
      // Envoyer un événement de frappe au serveur (si nécessaire)
      // socket.emit('typing', { conversationId: id, userId: user?.id });
    }
    
    // Réinitialiser le délai de frappe
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // socket.emit('stop_typing', { conversationId: id, userId: user?.id });
    }, 2000); // 2 secondes d'inactivité avant de considérer que l'utilisateur a arrêté de taper
  }, [isTyping, id, user?.id]);

  // Envoyer un message
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input || !input.trim()) && attachments.length === 0) return;
    if (!id) return;
    
    try {
      // Envoyer chaque pièce jointe
      for (const file of attachments) {
        // Convertir le fichier en base64 (pour un éventuel envoi au serveur)
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            // Ici, vous pourriez envoyer le fichier au serveur
            // Pour l'instant, on envoie juste le nom du fichier
            resolve();
          };
        });
        
        // Envoyer le message avec le nom du fichier
        await sendMessage(id, `[Fichier: ${file.name}]`);
      }
      
      // Envoyer le message texte
      if (input.trim()) {
        await sendMessage(id, input);
      }
      
      // Réinitialiser le formulaire
      setInput('');
      setReplyTo(null);
      setAttachments([]);
      setShowEmojiPicker(null);
      
      // Faire défiler vers le bas
      scrollToBottom('smooth');
      
      // Donner le focus au champ de saisie
      inputRef.current?.focus();
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      // Afficher un message d'erreur à l'utilisateur
      // setError('Impossible d\'envoyer le message. Veuillez réessayer.');
    }
  }, [input, attachments, id, sendMessage, scrollToBottom]);

  // Gestion de la sélection de fichiers
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Vérifier la taille totale des fichiers (max 10MB par défaut)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const files = Array.from(e.target.files);
    
    // Filtrer les fichiers trop volumineux
    const validFiles = files.filter(file => file.size <= MAX_SIZE);
    
    if (validFiles.length < files.length) {
      // Afficher une alerte pour les fichiers trop volumineux
      alert('Certains fichiers dépassent la taille maximale autorisée (10MB)');
    }
    
    // Mettre à jour l'état des pièces jointes
    setAttachments(prev => [...prev, ...validFiles]);
    
    // Réinitialiser l'input pour permettre la sélection du même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Suppression d'une pièce jointe
  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  }, []);

  // Gestion des raccourcis clavier
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    } else if (e.key === 'Escape' && replyTo) {
      setReplyTo(null);
    }
  }, [handleSendMessage, replyTo]);

  // Répondre à un message
  const handleReply = useCallback((message: MessageWithReactions) => {
    setReplyTo(message);
    inputRef.current?.focus();
  }, []);

  // Annuler la réponse
  const cancelReply = () => {
    setReplyTo(null);
  };

  // Formatage du temps relatif
  const formatTime = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now.getTime() - messageDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return messageDate.toLocaleDateString('fr-FR');
  };

  // Données factices du destinataire (à remplacer par les vraies données)
  const recipient = {
    name: "Jean Dupont",
    lastSeen: "En ligne",
    avatar: "JD",
    rating: 4.5,
    location: "Dakar, Sénégal"
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-xl overflow-hidden flex flex-col" style={{ height: '80vh' }}>
        {/* En-tête de la conversation */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/conversations" className="md:hidden mr-2" onClick={(e) => {
                e.preventDefault();
                window.history.back();
              }}>
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {recipient.avatar}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-semibold text-gray-900 text-lg">{recipient.name}</h1>
                  <div className="flex items-center text-yellow-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-gray-600 text-sm ml-1">{recipient.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{recipient.lastSeen} • {recipient.location}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors hidden md:block"
                title="Rechercher dans la conversation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button 
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Plus d'options"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
              <Link 
                to="/conversations" 
                className="hidden md:inline-flex items-center px-4 py-2 text-sm text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.back();
                }}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Retour</span>
              </Link>
            </div>
          </div>
          
          {/* Barre de recherche */}
          {showSearch && (
            <div className="mt-3 relative">
              <input
                type="text"
                placeholder="Rechercher dans cette conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}
        </div>

        {/* Zone de réponse */}
        {replyTo && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-1 h-8 bg-blue-500 rounded"></div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Répondre à :</p>
                <p className="text-sm text-blue-600 truncate max-w-md">{replyTo.content}</p>
              </div>
            </div>
            <button 
              onClick={cancelReply}
              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">Aucun message pour le moment</p>
                <p className="text-gray-400 text-sm mt-1">Commencez la conversation !</p>
              </div>
            </div>
          ) : (
            <>
              {filteredMessages.map((message, index) => {
                const isOwn = message.sender_id === user?.id;
                const showAvatar = index === 0 || filteredMessages[index - 1].sender_id !== message.sender_id;
                const isLast = index === filteredMessages.length - 1 || filteredMessages[index + 1].sender_id !== message.sender_id;
                
                return (
                  <div key={message.id} className={`flex group ${isOwn ? 'justify-end' : 'justify-start'} ${!isLast ? 'mb-1' : 'mb-4'}`}>
                    {/* Avatar pour les messages des autres */}
                    {!isOwn && (
                      <div className="flex-shrink-0 mr-3">
                        {showAvatar ? (
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">GP</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8"></div>
                        )}
                      </div>
                    )}

                    {/* Bulle de message */}
                    <div className={`relative max-w-[70%] ${isOwn ? 'ml-auto' : ''}`}>
                      <div
                        className={`px-4 py-2 rounded-2xl text-sm break-words ${
                          isOwn
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                            : 'bg-gray-100 text-gray-900 border border-gray-200'
                        } ${showAvatar ? (isOwn ? 'rounded-br-md' : 'rounded-bl-md') : ''}`}
                      >
                        {/* Contenu du message */}
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>

                      {/* Métadonnées et actions */}
                      <div className={`flex items-center mt-1 space-x-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.created_at)}
                        </span>
                        
                        {/* Actions du message (visibles au hover) */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                          <button 
                            onClick={() => handleReply(message)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                            title="Répondre"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                          </button>
                          
                          <button 
                            onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                            title="Réagir"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Sélecteur d'emoji */}
                      {showEmojiPicker === message.id && (
                        <div className="absolute z-10 mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                          <div className="flex space-x-1">
                            {popularEmojis.map(emoji => (
                              <button
                                key={emoji}
                                className="p-1 hover:bg-gray-100 rounded text-lg"
                                onClick={() => {
                                  // Logique d'ajout de réaction
                                  setShowEmojiPicker(null);
                                }}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
          
        {/* Affichage des pièces jointes avant envoi */}
        {attachments.length > 0 && (
          <div className="px-6 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="relative inline-flex items-center bg-white border border-gray-200 rounded-lg p-2">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 max-w-32 truncate">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="ml-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
                    aria-label="Supprimer la pièce jointe"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zone de saisie */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              title="Joindre un fichier"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                aria-label="Message à envoyer"
                placeholder="Tapez votre message..."
                className="w-full px-4 py-3 pr-12 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all resize-none"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                title="Emoji"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
            
            <button
              type="submit"
              disabled={!input.trim() && attachments.length === 0}
              className={`flex-shrink-0 p-3 rounded-full transition-all ${
                input.trim() || attachments.length > 0
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="Envoyer"
              aria-label="Envoyer le message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;