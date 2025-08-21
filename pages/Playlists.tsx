import React, { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import type { Playlist } from '../types';
import { fetchWithCache } from '../utils/api';
import { FolderIcon, PlayIcon } from '@heroicons/react/24/solid';

const Playlists: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchWithCache(`/api/v1/playlists?userId=${currentUser.id}`);
        setPlaylists(data);
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, [currentUser]);

  if (!currentUser && !loading) {
    return <Navigate to="/login" replace />;
  }

  const PlaylistSkeleton = () => (
    <div className="animate-pulse">
        <div className="aspect-video bg-dark-element rounded-lg"></div>
        <div className="mt-2 h-4 w-3/4 bg-dark-element rounded"></div>
        <div className="mt-1 h-3 w-1/2 bg-dark-element rounded"></div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-dark-text-primary">My Playlists</h1>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <PlaylistSkeleton key={i} />)}
        </div>
      ) : playlists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists.map(playlist => (
            <Link to={`/playlist/${playlist.id}`} key={playlist.id} className="group">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-dark-element">
                {playlist.thumbnailUrl ? (
                    <img src={playlist.thumbnailUrl} alt={playlist.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <FolderIcon className="w-16 h-16 text-dark-text-secondary" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayIcon className="w-12 h-12 text-white" />
                </div>
                 <div className="absolute bottom-0 right-0 bg-black/70 px-2 py-1 text-sm font-semibold rounded-tl-lg">
                    {playlist.videoIds.length} videos
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-lg font-semibold text-dark-text-primary group-hover:text-brand-red line-clamp-1">{playlist.name}</h3>
                <p className="text-sm text-dark-text-secondary line-clamp-1">{playlist.description}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-dark-text-secondary">You haven't created any playlists yet. Save a video to a new playlist to get started.</p>
      )}
    </div>
  );
};

export default Playlists;