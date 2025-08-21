import React, { useState, useEffect, useContext } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import type { User, Video, Playlist, CommunityPost as CommunityPostType } from '../types';
import { fetchWithCache, clearCache } from '../utils/api';
import VideoCard from '../components/VideoCard';
import ReactPlayer from 'react-player/lazy';
import AboutTab from '../components/AboutTab';
import VideoCarousel from '../components/VideoCarousel';
import CommunityPost from '../components/CommunityPost';

const Channel: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser, login, updateUserSubscriptions } = useContext(AuthContext);
  const [channel, setChannel] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [popularVideos, setPopularVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPostType[]>([]);
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);
  const [activeTab, setActiveTab] = useState('Home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannelData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [channelData, videosData, playlistsData, popularVids, posts] = await Promise.all([
          fetchWithCache(`/api/v1/users/${userId}`),
          fetchWithCache(`/api/v1/users/${userId}/videos`),
          fetchWithCache(`/api/v1/playlists?userId=${userId}`),
          fetchWithCache(`/api/v1/videos/popular/${userId}`),
          fetchWithCache(`/api/v1/channels/${userId}/community`)
        ]);
        setChannel(channelData);
        setVideos(videosData);
        setPlaylists(playlistsData);
        setPopularVideos(popularVids);
        setCommunityPosts(posts);
        
        if (channelData.featuredVideoId) {
            const fVideo = await fetchWithCache(`/api/v1/videos/${channelData.featuredVideoId}`);
            setFeaturedVideo(fVideo);
        }
      } catch (error) {
        console.error("Failed to fetch channel data:", error);
        setChannel(null);
      } finally {
        setLoading(false);
      }
    };
    fetchChannelData();
  }, [userId]);

  if (currentUser?.id === userId) {
    return <Navigate to="/my-channel" replace />;
  }

  const isSubscribed = currentUser && channel ? currentUser.subscriptions.includes(channel.id) : false;

  const handleSubscribe = async () => {
     if (!currentUser) return login("admin@vidstream.com", "password123"); 
     if (!channel) return;

    try {
        await fetch(`/api/v1/users/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, channelId: channel.id }),
        });
        const newSubscriptions = isSubscribed
            ? currentUser.subscriptions.filter(id => id !== channel.id)
            : [...currentUser.subscriptions, channel.id];
        updateUserSubscriptions(newSubscriptions);
        setChannel(prev => prev ? { ...prev, subscribers: prev.subscribers + (isSubscribed ? -1 : 1) } : null);
        clearCache(`/api/v1/users/${currentUser.id}`);
        clearCache(`/api/v1/users/${channel.id}`);
    } catch (err) {
      console.error("Failed to subscribe:", err);
    }
  };


  if (loading) {
    return <div className="p-8">...Loading Channel...</div>; // TODO: Skeleton
  }

  if (!channel) {
    return <div className="p-8 text-center text-light-text-secondary dark:text-dark-text-secondary">Channel not found.</div>;
  }
  
  const tabs = ['Home', 'Uploads', 'Community', 'About'];
  
  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <div className="space-y-12">
            {channel.channelLayout?.map(shelf => {
              if (shelf.type === 'LATEST_UPLOADS') {
                return <VideoCarousel key={shelf.id} title="Latest Uploads" videos={videos.slice(0, 10)} />;
              }
              if (shelf.type === 'POPULAR_UPLOADS') {
                return <VideoCarousel key={shelf.id} title="Popular Uploads" videos={popularVideos} />;
              }
              if (shelf.type === 'PLAYLIST') {
                const playlist = playlists.find(p => p.id === shelf.playlistId);
                const playlistVideos = playlist ? videos.filter(v => playlist.videoIds.includes(v.id)) : [];
                if (!playlist) return null;
                return <VideoCarousel key={shelf.id} title={playlist.name} videos={playlistVideos} />;
              }
              return null;
            })}
             {(!channel.channelLayout || channel.channelLayout.length === 0) && <VideoCarousel title="Latest Uploads" videos={videos} />}
          </div>
        );
      case 'Uploads':
        return videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {videos.map(video => <VideoCard key={video.id} video={video}/>)}
            </div>
        ) : (
            <div className="text-center py-16 text-light-text-secondary dark:text-dark-text-secondary">{channel.name} hasn't uploaded any videos yet.</div>
        );
      case 'Community':
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            {communityPosts.map(post => <CommunityPost key={post.id} post={post} channelId={channel.id} />)}
          </div>
        );
      case 'About':
        return <AboutTab user={channel} />;
      default:
        return null;
    }
  };

  return (
    <div className="text-light-text-primary dark:text-dark-text-primary">
       <div className="h-40 md:h-64 w-full bg-light-element dark:bg-dark-element overflow-hidden">
        {channel.bannerUrl && (
          <img src={channel.bannerUrl} alt={`${channel.name}'s banner`} className="w-full h-full object-cover" />
        )}
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start -mt-16 gap-4">
          <img 
            src={channel.avatarUrl} 
            alt={channel.name}
            className="w-32 h-32 rounded-full border-4 border-light-bg dark:border-dark-bg bg-light-bg dark:bg-dark-bg flex-shrink-0"
          />
           <div className="w-full mt-16 md:mt-0 pt-2">
              <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{channel.name}</h1>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">@{channel.name.toLowerCase().replace(/\s/g, '')} &bull; {channel.subscribers.toLocaleString()} subscribers</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <button 
                        onClick={handleSubscribe}
                        className={`font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-colors ${
                            isSubscribed
                              ? 'bg-light-element dark:bg-dark-element text-light-text-secondary dark:text-dark-text-secondary'
                              : 'bg-brand-red text-white'
                        }`}>
                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                      </button>
                  </div>
              </div>
           </div>
        </div>
      </div>

       {featuredVideo && activeTab === 'Home' && (
        <div className="px-4 sm:px-6 lg:px-8 mt-8">
            <h2 className="text-xl font-bold mb-4">Featured Video</h2>
            <div className="aspect-video">
                <ReactPlayer url={featuredVideo.videoUrl} controls width="100%" height="100%" />
            </div>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mt-6 border-b border-light-element dark:border-dark-element">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-brand-red text-brand-red'
                    : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:border-gray-300 dark:hover:border-gray-500'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Channel;