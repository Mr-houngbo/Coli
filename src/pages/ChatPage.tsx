import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useConversations } from '../contexts/ConversationContext';
import { useAuth } from '../contexts/AuthContext';

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { fetchMessages, messages, sendMessage } = useConversations();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) fetchMessages(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages[id || '']?.length]);

  const thread = useMemo(() => messages[id || ''] || [], [messages, id]);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !input.trim()) return;
    await sendMessage(id, input.trim());
    setInput('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-[75vh]">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="font-semibold text-gray-900">Conversation</div>
          <Link to="/conversations" className="text-sm text-violet-600 hover:underline">Mes conversations</Link>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {thread.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">Aucun message pour le moment. Commencez la conversation !</div>
          ) : (
            thread.map((m) => (
              <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[75%] ${m.sender_id === user?.id ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  <div>{m.content}</div>
                  <div className={`text-[11px] mt-1 ${m.sender_id === user?.id ? 'text-violet-100' : 'text-gray-500'}`}>{new Date(m.created_at).toLocaleString('fr-FR')}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <form onSubmit={onSend} className="p-3 border-t border-gray-200 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrire un message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
          />
          <button type="submit" className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700">Envoyer</button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
