import React, { useState, useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheckIcon, TrashIcon } from '@heroicons/react/24/solid';
import { fetchWithCache, clearCache } from '../utils/api';
import type { User } from '../types';

const Moderation: React.FC = () => {
  const { currentUser, updateCurrentUser } = useContext(AuthContext);
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [newWord, setNewWord] = useState('');
  const [newUser, setNewUser] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        if (!currentUser) { setLoading(false); return; }
        try {
            const userData = await fetchWithCache(`/api/v1/users/${currentUser.id}`);
            setBannedWords(userData.bannedWords || []);
            // This would be a real user search in a full app
            const allUsers = await fetchWithCache('/api/v1/users'); 
            const blocked = allUsers.filter((u: User) => userData.blockedUsers?.includes(u.id));
            setBlockedUsers(blocked);
        } catch (error) {
            console.error("Failed to fetch moderation settings:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [currentUser]);

  const handleUpdate = async (type: 'bannedWords' | 'blockedUsers', data: any) => {
    if (!currentUser) return;
    try {
        const response = await fetch(`/api/v1/channels/${currentUser.id}/moderation`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [type]: data }),
        });
        const updatedUser = await response.json();
        updateCurrentUser(updatedUser);
        clearCache(`/api/v1/users/${currentUser.id}`);
    } catch(err) {
        console.error(`Failed to update ${type}`, err);
    }
  };

  const addBannedWord = () => {
    if (!newWord.trim()) return;
    const updated = [...bannedWords, newWord.trim()];
    setBannedWords(updated);
    handleUpdate('bannedWords', updated);
    setNewWord('');
  };
  
  const removeBannedWord = (word: string) => {
    const updated = bannedWords.filter(w => w !== word);
    setBannedWords(updated);
    handleUpdate('bannedWords', updated);
  };
  
  // Note: Blocking users would involve a search/lookup in a real app
  // This is a simplified version
  const blockUser = () => {
    // This is a placeholder for a real user search and block
    console.log("Blocking user:", newUser);
    setNewUser('');
  };

  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheckIcon className="w-8 h-8 text-brand-red" />
        <h1 className="text-3xl font-bold">Community Moderation</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Banned Words */}
        <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Banned Words</h2>
          <p className="text-sm mb-4 text-light-text-secondary dark:text-dark-text-secondary">Comments containing these words will be automatically hidden.</p>
          <div className="flex gap-2 mb-4">
            <input 
              type="text"
              value={newWord}
              onChange={e => setNewWord(e.target.value)}
              placeholder="Add a word..."
              className="flex-grow bg-light-element dark:bg-dark-element rounded-md px-3 py-2"
            />
            <button onClick={addBannedWord} className="px-4 py-2 bg-brand-red text-white font-semibold rounded-md">Add</button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {bannedWords.map(word => (
              <div key={word} className="flex justify-between items-center p-2 bg-light-element dark:bg-dark-element rounded">
                <span>{word}</span>
                <button onClick={() => removeBannedWord(word)} className="p-1 text-red-500"><TrashIcon className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Blocked Users */}
        <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg">
           <h2 className="text-xl font-bold mb-4">Blocked Users</h2>
           <p className="text-sm mb-4 text-light-text-secondary dark:text-dark-text-secondary">These users will not be able to comment on your videos.</p>
           {/* In a real app, this would be a user search input */}
           <div className="flex gap-2 mb-4">
             <input type="text" value={newUser} onChange={e => setNewUser(e.target.value)} placeholder="Enter username to block..." className="flex-grow bg-light-element dark:bg-dark-element rounded-md px-3 py-2" />
             <button onClick={blockUser} className="px-4 py-2 bg-brand-red text-white font-semibold rounded-md">Block</button>
           </div>
           <div className="space-y-2 max-h-60 overflow-y-auto">
              {blockedUsers.map(user => (
                  <div key={user.id} className="flex justify-between items-center p-2 bg-light-element dark:bg-dark-element rounded">
                      <span>{user.name}</span>
                      <button className="p-1 text-red-500"><TrashIcon className="w-4 h-4" /></button>
                  </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Moderation;