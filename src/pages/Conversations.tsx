import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useConversations } from '../contexts/ConversationContext';
import { useAuth } from '../contexts/AuthContext';
import { Conversation } from '../types';

const Conversations: React.FC = () => {
  const { conversations, listMyConversations, markConversationAsRead } = useConversations();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'annonce'>('recent');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'active'>('all');

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await listMyConversations();
      } catch (error) {
        console.error('Erreur lors du chargement des conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fonction pour obtenir le nom de l'autre participant
  const getOtherParticipantName = (conversation: Conversation) => {
    if (!conversation.participants || !user) return 'Utilisateur inconnu';
    
    // Vérifier si les participants sont chargés correctement
    if (conversation.participants.length === 0) {
      console.warn('Aucun participant trouvé dans la conversation', conversation.id);
      return 'Utilisateur inconnu';
    }
    
    // Si l'utilisateur actuel n'est pas défini, retourner le premier participant
    if (!user.id) {
      const firstParticipant = conversation.participants[0];
      return firstParticipant?.profile?.full_name || 'Utilisateur';
    }
    
    // Trouver l'autre participant (pas l'utilisateur actuel)
    const otherParticipant = conversation.participants.find(p => p.user_id !== user.id);
    
    // Si on ne trouve pas d'autre participant (peut arriver si l'utilisateur courant n'est pas dans la liste)
    // On prend le premier participant qui n'est pas l'utilisateur actuel
    const participantToShow = otherParticipant || conversation.participants[0];
    
    if (participantToShow?.profile) {
      return participantToShow.profile.full_name || 'Utilisateur';
    }
    
    // Si on a un user1_id ou user2_id mais pas de profil, on peut essayer de les utiliser
    if (conversation.user1_id && conversation.user2_id) {
      const otherUserId = conversation.user1_id === user.id ? conversation.user2_id : conversation.user1_id;
      return `Utilisateur ${otherUserId.substring(0, 6)}...`;
    }
    
    console.warn('Impossible de déterminer le nom du participant pour la conversation', conversation.id);
    return 'Utilisateur';
  };

  // Fonction pour obtenir les initiales du nom
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Gérer le clic sur une conversation (marquer comme lue)
  const handleConversationClick = async (conversationId: string) => {
    try {
      await markConversationAsRead(conversationId);
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  // Filtrage et tri des conversations
  const filteredAndSortedConversations = useMemo(() => {
    if (!conversations) return [];
    
    let filtered = [...conversations];

    // Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(c => {
        const annonceId = c.annonce_id?.toString().toLowerCase() || '';
        const conversationId = c.id?.toString().toLowerCase() || '';
        const participantName = getOtherParticipantName(c).toLowerCase();
        const villeDepart = c.annonce?.ville_depart?.toLowerCase() || '';
        const villeArrivee = c.annonce?.ville_arrivee?.toLowerCase() || '';
        
        return annonceId.includes(query) || 
               conversationId.includes(query) ||
               participantName.includes(query) ||
               villeDepart.includes(query) ||
               villeArrivee.includes(query);
      });
    }

    // Filtrage par statut
    if (filterStatus === 'unread') {
      filtered = filtered.filter(c => (c.unread_count || 0) > 0);
    } else if (filterStatus === 'active') {
      filtered = filtered.filter(c => !!c.last_message_at);
    }

    // Tri
    return filtered.sort((a, b) => {
      try {
        const dateA = a.updated_at || a.created_at;
        const dateB = b.updated_at || b.created_at;
        
        switch (sortBy) {
          case 'recent':
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          case 'oldest':
            return new Date(dateA).getTime() - new Date(dateB).getTime();
          case 'annonce':
            return (a.annonce_id || '').toString().localeCompare((b.annonce_id || '').toString());
          default:
            return 0;
        }
      } catch (error) {
        console.error('Error sorting conversations:', error);
        return 0;
      }
    });
  }, [conversations, searchQuery, sortBy, filterStatus, user]);

  // Formatage de la date relative
  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now.getTime() - messageDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return messageDate.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement de vos conversations...</p>
          <p className="text-gray-400 text-sm mt-1">Veuillez patienter</p>
        </div>
      </div>
    );
  }
  
  // Si aucune conversation n'est disponible après le chargement
  if (!conversations || conversations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune conversation</h3>
          <p className="text-gray-600 mb-6">Vous n'avez pas encore de conversation. Commencez à discuter avec d'autres utilisateurs !</p>
          <button 
            onClick={() => window.location.href = '/annonces'}
            className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Voir les annonces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec titre et actions */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Conversations</h1>
              <p className="text-gray-600 mt-1">
                {conversations?.length || 0} conversation{(conversations?.length || 0) > 1 ? 's' : ''}
                {filteredAndSortedConversations.length !== (conversations?.length || 0) && 
                  ` (${filteredAndSortedConversations.length} affichée${filteredAndSortedConversations.length > 1 ? 's' : ''})`
                }
              </p>
            </div>
            
            {/* Bouton nouvelle conversation */}
            <button className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Nouvelle conversation</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher par nom, ID d'annonce ou ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filtres */}
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
              >
                <option value="recent">Plus récentes</option>
                <option value="oldest">Plus anciennes</option>
                <option value="annonce">Par annonce</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
              >
                <option value="all">Toutes</option>
                <option value="unread">Non lues</option>
                <option value="active">Actives</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des conversations */}
        {filteredAndSortedConversations.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation pour le moment'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'Essayez de modifier vos critères de recherche ou créez une nouvelle conversation.'
                  : 'Commencez à interagir avec des annonces pour voir vos conversations apparaître ici.'
                }
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-2 text-violet-600 border border-violet-600 rounded-lg hover:bg-violet-50 transition-colors"
                >
                  Effacer la recherche
                </button>
              ) : (
                <button className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                  Explorer les annonces
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedConversations.map((conversation: Conversation) => {
              const otherParticipantName = getOtherParticipantName(conversation);
              const initials = getInitials(otherParticipantName);
              
              return (
                <div
                  key={conversation.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      {/* Informations de la conversation */}
                      <div className="flex items-center space-x-4 flex-1">
                        {/* Avatar de l'utilisateur */}
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold">
                            {initials}
                          </div>
                          {/* Indicateur de messages non lus */}
                          {(conversation.unread_count || 0) > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                              {(conversation.unread_count || 0) > 9 ? '9+' : conversation.unread_count}
                            </div>
                          )}
                        </div>

                        {/* Détails */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {otherParticipantName}
                            </h3>
                            <span className="text-xs bg-violet-100 text-violet-600 px-2 py-1 rounded-full font-medium">
                              Annonce #{conversation.annonce_id}
                            </span>
                          </div>
                          
                          {/* Informations sur l'annonce si disponible */}
                          {conversation.annonce && (
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">
                                {conversation.annonce.ville_depart} → {conversation.annonce.ville_arrivee}
                              </span>
                              {conversation.annonce.date_voyage && (
                                <span className="ml-2">
                                  • {new Date(conversation.annonce.date_voyage).toLocaleDateString('fr-FR')}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Dernier message */}
                          <div className="text-sm text-gray-600 mb-2">
                            {conversation.last_message ? (
                              <span className="truncate block">{conversation.last_message}</span>
                            ) : (
                              <span className="italic">Aucun message</span>
                            )}
                          </div>

                          {/* Métadonnées */}
                          <div className="flex items-center text-xs text-gray-500 space-x-3">
                            <span>ID: {conversation.id.substring(0, 8)}...</span>
                            {(conversation.updated_at || conversation.created_at) && (
                              <span>• {formatRelativeTime(conversation.updated_at || conversation.created_at)}</span>
                            )}
                            {conversation.participant_count && (
                              <span>• {conversation.participant_count} participant{conversation.participant_count > 1 ? 's' : ''}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-3 ml-4">
                        {/* Statut de la conversation */}
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            (conversation.last_message_at || conversation.updated_at) ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          <span className="text-xs text-gray-500">
                            {(conversation.last_message_at || conversation.updated_at) ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {/* Bouton d'ouverture */}
                        <Link
                          to={`/conversations/${conversation.id}`}
                          onClick={() => handleConversationClick(conversation.id)}
                          className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition-colors group-hover:bg-violet-700 font-medium flex items-center space-x-2"
                        >
                          <span>Ouvrir</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>

                        {/* Menu options */}
                        <button 
                          aria-label="Options de la conversation"
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Gérer l'ouverture du menu des options
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Barre de progression pour les conversations actives */}
                  {conversation.last_message_at && (
                    <div className="h-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-b-lg"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination ou chargement de plus de conversations */}
        {filteredAndSortedConversations.length > 0 && (
          <div className="mt-8 text-center">
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Charger plus de conversations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;