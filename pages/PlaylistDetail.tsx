import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import type { Playlist, Video } from '../types';
import { fetchWithCache } from '../utils/api';
import { PlayIcon } from '@heroicons/react/24/solid';

const PlaylistDetail: React.FC = () => {
  const { id: playlistId } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylistData = async () => {
      if (!playlistId) return;
      setLoading(true);
      try {
        const [playlistData, videosData] = await Promise.all([
          fetchWithCache(`/api/v1/playlists/${playlistId}`),
          fetchWithCache(`/api/v1/videos`)
        ]);

        const playlistVideos = videosData.filter((v: Video) => playlistData.videoIds.includes(v.id));
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
          <div className="space-y-4">
            {videos.map((video, index) => (
              <Link to={`/watch/${video.id}`} key={video.id} className="flex items-center gap-4 group p-2 rounded-lg hover:bg-dark-element">
                <span className="text-lg text-dark-text-secondary font-semibold">{index + 1}</span>
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
            ))}
          </div>
        ) : (
          <p className="text-dark-text-secondary">This playlist is empty.</p>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;