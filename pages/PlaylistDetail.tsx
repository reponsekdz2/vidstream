import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import type { Playlist, Video } from '../types';
import { fetchWithCache, clearCache } from '../utils/api';
import { PlayIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const PlaylistDetail: React.FC = () => {
  const { id: playlistId } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  const [draggedItem, setDraggedItem] = useState<Video | null>(null);

  useEffect(() => {
    const fetchPlaylistData = async () => {
      if (!playlistId) return;
      setLoading(true);
      try {
        const [playlistData, allVideosData] = await Promise.all([
          fetchWithCache(`/api/v1/playlists/${playlistId}`),
          fetchWithCache(`/api/v1/videos`)
        ]);

        const videoMap = new Map(allVideosData.map((v: Video) => [v.id, v]));
        const playlistVideos = playlistData.videoIds.map((id: string) => videoMap.get(id)).filter(Boolean);

        setPlaylist(playlistData);
        setVideos(playlistVideos);
      } catch (error) {
        console.error("Failed to fetch playlist data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylistData();
  }, [playlistId]);

  const isOwner = currentUser?.id === playlist?.userId;
  
  const handleDragStart = (video: Video) => {
    setDraggedItem(video);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow drop
  };

  const handleDrop = async (targetVideo: Video) => {
    if (!draggedItem || draggedItem.id === targetVideo.id) return;

    const originalVideos = [...videos];
    const draggedIndex = videos.findIndex(v => v.id === draggedItem.id);
    const targetIndex = videos.findIndex(v => v.id === targetVideo.id);

    const newVideos = [...videos];
    const [removed] = newVideos.splice(draggedIndex, 1);
    newVideos.splice(targetIndex, 0, removed);
    setVideos(newVideos); // Optimistic update
    setDraggedItem(null);

    const newVideoIds = newVideos.map(v => v.id);
    try {
        await fetch(`/api/v1/playlists/${playlistId}/reorder`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ videoIds: newVideoIds })
        });
        clearCache(`/api/v1/playlists/${playlistId}`);
    } catch (error) {
        console.error("Failed to reorder playlist", error);
        setVideos(originalVideos); // Revert on failure
    }
  };


  if (loading) {
    return <div>Loading playlist...</div>; // TODO: Skeleton loader
  }

  if (!playlist) {
    return <Navigate to="/playlists" replace />;
  }

  return (
    <div className="flex flex-col md:flex-row">
      {/* Playlist Info Panel */}
      <div className="w-full md:w-1/3 md:h-screen md:sticky top-16 bg-dark-surface p-6">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-dark-element mb-4">
            {playlist.thumbnailUrl ? (
                <img src={playlist.thumbnailUrl} alt={playlist.name} className="w-full h-full object-cover" />
            ) : null}
        </div>
        <h1 className="text-3xl font-bold">{playlist.name}</h1>
        <p className="text-dark-text-secondary mt-2">{playlist.description}</p>
        <p className="text-sm text-dark-text-secondary mt-4">{videos.length} videos</p>
        <button className="w-full mt-6 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2">
            <PlayIcon className="w-6 h-6"/>
            Play All
        </button>
      </div>

      {/* Video List */}
      <div className="w-full md:w-2/3 p-6">
        {videos.length > 0 ? (
          <div className="space-y-2">
            <AnimatePresence>
                {videos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    draggable={isOwner}
                    onDragStart={() => handleDragStart(video)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(video)}
                    className={`flex items-center gap-4 group p-2 rounded-lg hover:bg-dark-element ${isOwner ? 'cursor-grab' : ''} ${draggedItem?.id === video.id ? 'opacity-50' : ''}`}
                  >
                    <span className="text-lg text-dark-text-secondary font-semibold w-8 text-center">{index + 1}</span>
                    <Link to={`/watch/${video.id}`} className="flex-grow flex items-center gap-4">
                        <div className="relative w-48 h-28 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
                                {video.duration}
                            </span>
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-semibold text-dark-text-primary line-clamp-2 group-hover:text-brand-red">{video.title}</h3>
                          <p className="text-sm text-dark-text-secondary mt-1">{video.user.name}</p>
                           <p className="text-sm text-dark-text-secondary">{video.views}</p>
                        </div>
                    </Link>
                     {isOwner && (
                        <div className="p-2 text-dark-text-secondary">
                            <Bars3Icon className="w-6 h-6" />
                        </div>
                    )}
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-dark-text-secondary">This playlist is empty.</p>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;