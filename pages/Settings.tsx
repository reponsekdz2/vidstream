import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Avatar from '../components/Avatar';

const Settings: React.FC = () => {
  const { currentUser, updateCurrentUser } = useContext(AuthContext);
  const [name, setName] = useState(currentUser?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`/api/v1/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatarUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile.');
      }
      
      const updatedUser = await response.json();
      updateCurrentUser(updatedUser);
      setMessage('Profile updated successfully!');

    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const tempUser = { ...currentUser, name, avatarUrl };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-dark-text-primary">Account Settings</h1>
      
      <div className="bg-dark-surface p-8 rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
                <Avatar user={tempUser} size="lg"/>
                <p className="text-sm text-dark-text-secondary">Preview</p>
            </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-dark-text-secondary">
              Display Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-dark-element border border-dark-element rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="avatarUrl" className="block text-sm font-medium text-dark-text-secondary">
              Avatar Image URL
            </label>
            <input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/image.png"
              className="mt-1 block w-full px-3 py-2 bg-dark-element border border-dark-element rounded-md"
            />
          </div>
          
           <div>
            <label htmlFor="email" className="block text-sm font-medium text-dark-text-secondary">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={currentUser.email}
              disabled
              className="mt-1 block w-full px-3 py-2 bg-dark-element border border-dark-element rounded-md text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-red hover:bg-brand-red-dark disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {message && <p className={`text-center text-sm ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default Settings;