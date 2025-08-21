import React, { useState, useEffect, useContext, useRef } from 'react';
import type { LiveChatMessage } from '../types';
import { fetchWithCache } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import Avatar from './Avatar';

interface LiveChatProps {
  videoId: string;
}

const LiveChat: React.FC<LiveChatProps> = ({ videoId }) => {
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { currentUser } = useContext(AuthContext);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const initialMessages = await fetchWithCache(`/api/v1/live/${videoId}/chat`);
        setMessages(initialMessages);
      } catch (error) {
        console.error("Failed to fetch live chat:", error);
      }
    };
    fetchChat();
  }, [videoId]);
  
  // Simulate new messages appearing
  useEffect(() => {
     const interval = setInterval(() => {
        setMessages(prev => [...prev, {
            id: `msg-${Date.now()}`,
            user: { name: 'RandomViewer', avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}` },
            message: 'This is an awesome live stream! 🎉'
        }]);
     }, 5000);
     return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;
    const message: LiveChatMessage = {
        id: `msg-${Date.now()}`,
        user: { name: currentUser.name, avatarUrl: currentUser.avatarUrl || '' },
        message: newMessage,
    };
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };


  return (
    <div className="bg-dark-surface rounded-xl h-[600px] flex flex-col">
        <h2 className="text-lg font-semibold p-4 border-b border-dark-element">Live Chat</h2>
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 text-sm">
                    <img src={msg.user.avatarUrl} alt={msg.user.name} className="w-6 h-6 rounded-full"/>
                    <div>
                        <span className="font-semibold text-dark-text-secondary mr-2">{msg.user.name}</span>
                        <span className="text-dark-text-primary">{msg.message}</span>
                    </div>
                </div>
            ))}
            <div ref={chatEndRef} />
        </div>
        {currentUser && (
            <div className="p-4 border-t border-dark-element">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Avatar user={currentUser} size="sm" />
                    <input 
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Say something..."
                        className="flex-grow bg-dark-element rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-red"
                    />
                    <button type="submit" className="p-2 rounded-full bg-brand-red hover:bg-brand-red-dark disabled:opacity-50" disabled={!newMessage.trim()}>
                        <PaperAirplaneIcon className="w-5 h-5 text-white" />
                    </button>
                </form>
            </div>
        )}
    </div>
  );
};

export default LiveChat;