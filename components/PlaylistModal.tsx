import React, { useState, useEffect, useContext } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid';
import { AuthContext } from '../context/AuthContext';
import type { Playlist, Video } from '../types';
import { fetchWithCache, clearCache } from '../utils/api';

interface PlaylistModalProps {
  videoToAdd: Video;
  onClose: () => void;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({ videoToAdd, onClose }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPlaylistForm, setShowNewPlaylistForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const data = await fetchWithCache(`/api/v1/playlists?userId=${currentUser.id}`);
        setPlaylists(data);
      } catch (error) {
        console.error('Failed to fetch playlists', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, [currentUser]);

  const handleTogglePlaylist = async (playlistId: string) => {
    if (!currentUser) return;
    
    // Optimistic update
    const updatedPlaylists = playlists.map(p => {
        if (p.id === playlistId) {
            if (p.videoIds.includes(videoToAdd.id)) {
                return { ...p, videoIds: p.videoIds.filter(id => id !== videoToAdd.id) };
            } else {
                return { ...p, videoIds: [...p.videoIds, videoToAdd.id] };
            }
        }
        return p;
    });
    setPlaylists(updatedPlaylists);

    try {
        await fetch(`/api/v1/playlists/${playlistId}/videos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId: videoToAdd.id })
        });
        clearCache(`/api/v1/playlists?userId=${currentUser.id}`);
        clearCache(`/api/v1/playlists/${playlistId}`);
    } catch (error) {
        console.error("Failed to toggle video in playlist", error);
        // Revert would be more complex, refetching for now
        const data = await fetchWithCache(`/api/v1/playlists?userId=${currentUser.id}`, { cache: 'no-store' });
        setPlaylists(data);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newPlaylistName.trim()) return;

    try {
        const response = await fetch('/api/v1/playlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                name: newPlaylistName,
                description: '',
                initialVideoId: videoToAdd.id
            })
        });
        const newPlaylist = await response.json();
        setPlaylists(prev => [...prev, newPlaylist]);
        setNewPlaylistName('');
        setShowNewPlaylistForm(false);
        clearCache(`/api/v1/playlists?userId=${currentUser.id}`);
    } catch (error) {
        console.error("Failed to create playlist", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface rounded-lg w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-dark-element">
          <h2 className="text-xl font-semibold">Save to...</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-dark-element">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 max-h-64 overflow-y-auto">
          {loading ? <p>Loading...</p> : (
            <ul className="space-y-2">
              {playlists.map(playlist => (
                <li key={playlist.id}>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-dark-element">
                    <input
                      type="checkbox"
                      checked={playlist.videoIds.includes(videoToAdd.id)}
                      onChange={() => handleTogglePlaylist(playlist.id)}
                      className="w-5 h-5 bg-dark-element border-dark-element text-brand-red focus:ring-brand-red rounded"
                    />
                    <span className="text-dark-text-primary">{playlist.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="p-4 border-t border-dark-element">
            {!showNewPlaylistForm ? (
                <button onClick={() => setShowNewPlaylistForm(true)} className="flex items-center gap-3 w-full p-2 text-left rounded hover:bg-dark-element">
                    <PlusIcon className="w-6 h-6" />
                    <span>Create new playlist</span>
                </button>
            ) : (
                <form onSubmit={handleCreatePlaylist}>
                    <input
                        type="text"
                        value={newPlaylistName}
                        onChange={e => setNewPlaylistName(e.target.value)}
                        placeholder="Enter playlist name..."
                        className="block w-full px-3 py-2 bg-dark-element border border-dark-element rounded-md shadow-sm"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button type="button" onClick={() => setShowNewPlaylistForm(false)} className="px-4 py-1.5 text-sm rounded-full hover:bg-dark-element">Cancel</button>
                        <button type="submit" disabled={!newPlaylistName.trim()} className="px-4 py-1.5 text-sm rounded-full bg-brand-red hover:bg-brand-red-dark disabled:opacity-50">Create</button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;