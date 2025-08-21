import React, { useState, useEffect, useContext } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import type { User, Video } from '../types';
import { fetchWithCache, clearCache } from '../utils/api';
import VideoCard from '../components/VideoCard';
import SkeletonCard from '../components/skeletons/SkeletonCard';

const Channel: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser, login, updateUserSubscriptions } = useContext(AuthContext);
  const [channel, setChannel] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannelData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [channelData, videosData] = await Promise.all([
          fetchWithCache(`/api/v1/users/${userId}`),
          fetchWithCache(`/api/v1/users/${userId}/videos`)
        ]);
        setChannel(channelData);
        setVideos(videosData);
      } catch (error) {
        console.error("Failed to fetch channel data:", error);
        setChannel(null);
      } finally {
        setLoading(false);
      }
    };
    fetchChannelData();
  }, [userId]);

  const isSubscribed = currentUser && channel ? currentUser.subscriptions.includes(channel.id) : false;

  const handleSubscribe = async () => {
     if (!currentUser) return login("admin@vidstream.com", "password123"); // Demo login
     if (!channel) return;

    const originalSubscriptions = [...currentUser.subscriptions];
    const newSubscriptions = isSubscribed
        ? originalSubscriptions.filter(id => id !== channel.id)
        : [...originalSubscriptions, channel.id];
    
    updateUserSubscriptions(newSubscriptions);
    setChannel(prev => prev ? { ...prev, subscribers: prev.subscribers + (isSubscribed ? -1 : 1) } : null);

    try {
        await fetch(`/api/v1/users/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, channelId: channel.id }),
        });
        clearCache(`/api/v1/users/${currentUser.id}`);
        clearCache(`/api/v1/users/${channel.id}`);
    } catch {
        updateUserSubscriptions(originalSubscriptions);
    }
  };


  if (loading) {
    return <div className="p-8"><SkeletonCard /></div>; // Add a proper channel skeleton later
  }

  if (!channel) {
    return <div className="p-8 text-center text-dark-text-secondary">Channel not found.</div>;
  }
  
  if (currentUser?.id === userId) {
    return <Navigate to="/my-channel" replace />;
  }

  return (
    <div className="text-dark-text-primary">
      <div className="bg-dark-element h-48 w-full"></div>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end -mt-16 gap-4">
          <img 
            src={channel.avatarUrl} 
            alt={channel.name}
            className="w-32 h-32 rounded-full border-4 border-dark-bg bg-dark-bg"
          />
          <div className="ml-2 mb-2">
            <h1 className="text-3xl font-bold">{channel.name}</h1>
            <p className="text-sm text-dark-text-secondary mt-1">@{channel.name.toLowerCase().replace(/\s/g, '')} &bull; {channel.subscribers.toLocaleString()} subscribers</p>
          </div>
          <div className="ml-auto mb-2">
            <button 
                onClick={handleSubscribe}
                className={`${
                    isSubscribed
                      ? 'bg-dark-element text-dark-text-secondary'
                      : 'bg-brand-red text-white'
                } font-semibold px-4 py-2 rounded-full hover:bg-opacity-90 transition-colors`}>
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
          </div>
        </div>
        <div className="mt-6 border-b border-dark-element">
            <h2 className="py-4 px-1 border-b-2 border-brand-red text-brand-red font-medium text-sm inline-block">Uploads</h2>
        </div>
        <div className="mt-6">
            {videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                    {videos.map(video => <VideoCard key={video.id} video={video}/>)}
                </div>
            ) : (
                <div className="text-center py-16 text-dark-text-secondary">{channel.name} hasn't uploaded any videos yet.</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Channel;