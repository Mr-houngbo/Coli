import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useConversations } from '../contexts/ConversationContext';
import { Conversation } from '../types';

const Conversations: React.FC = () => {
  const { conversations, listMyConversations } = useConversations();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await listMyConversations();
      setLoading(false);
    };
    run();
  }, [listMyConversations]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes Conversations</h1>
        {conversations.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-600">
            Aucune conversation pour le moment.
          </div>
        ) : (
          <ul className="space-y-3">
            {conversations.map((c: Conversation) => (
              <li key={c.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Annonce</div>
                  <div className="font-medium text-gray-900">{c.annonce_id}</div>
                </div>
                <Link
                  to={`/conversations/${c.id}`}
                  className="px-3 py-2 rounded-lg bg-violet-600 text-white text-sm hover:bg-violet-700"
                >
                  Ouvrir
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Conversations;
