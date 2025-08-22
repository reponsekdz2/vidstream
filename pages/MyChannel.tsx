import React, { useContext, useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowUpTrayIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import type { Video, User, Playlist, CommunityPost as CommunityPostType, MembershipTier, MerchItem } from '../types';
import { fetchWithCache, clearCache } from '../utils/api';
import VideoCard from '../components/VideoCard';
import SkeletonCard from '../components/skeletons/SkeletonCard';
import ReactPlayer from 'react-player/lazy';
import AboutTab from '../components/AboutTab';
import VideoCarousel from '../components/VideoCarousel';
import CommunityPost from '../components/CommunityPost';
import Avatar from '../components/Avatar';
import StoreTab from '../components/StoreTab';

const MyChannel: React.FC = () => {
  const { currentUser } = useContext(AuthContext);
  const [channelInfo, setChannelInfo] = useState<User | null>(currentUser);
  const [activeTab, setActiveTab] = useState('Home');
  const [videos, setVideos] = useState<Video[]>([]);
  const [popularVideos, setPopularVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPostType[]>([]);
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
  const [merch, setMerch] = useState<MerchItem[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchChannelData = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const [userData, userVideos, userPlaylists, popularVids, posts, tiers, merchData] = await Promise.all([
                fetchWithCache(`/api/v1/users/${currentUser.id}`),
                fetchWithCache(`/api/v1/users/${currentUser.id}/videos`),
                fetchWithCache(`/api/v1/playlists?userId=${currentUser.id}`),
                fetchWithCache(`/api/v1/videos/popular/${currentUser.id}`),
                fetchWithCache(`/api/v1/channels/${currentUser.id}/community`),
                fetchWithCache(`/api/v1/monetization/${currentUser.id}/memberships`),
                fetchWithCache(`/api/v1/store/${currentUser.id}`)
            ]);
            setChannelInfo(userData);
            setVideos(userVideos);
            setPlaylists(userPlaylists);
            setPopularVideos(popularVids);
            setCommunityPosts(posts);
            setMembershipTiers(tiers);
            setMerch(merchData);
            
            if(userData.featuredVideoId) {
                const fVideo = await fetchWithCache(`/api/v1/videos/${userData.featuredVideoId}`);
                setFeaturedVideo(fVideo);
            }

        } catch (error) {
            console.error("Failed to fetch channel data:", error);
        } finally {
            setLoading(false);
        }
    };
    
    fetchChannelData();
  }, [currentUser]);
  
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() || !currentUser) return;
    try {
      const response = await fetch(`/api/v1/channels/${currentUser.id}/community`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newPostText }),
      });
      const newPost = await response.json();
      setCommunityPosts([newPost, ...communityPosts]);
      setNewPostText('');
      clearCache(`/api/v1/channels/${currentUser.id}/community`);
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };


  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (!channelInfo) return <div>Loading...</div> // Or a skeleton

  const tabs = ['Home', 'Uploads', 'Community', 'Memberships', 'Store', 'About'];

  const renderContent = () => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        );
    }

    switch (activeTab) {
      case 'Home':
        return (
          <div className="space-y-12">
            {channelInfo.channelLayout?.map(shelf => {
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
             {(!channelInfo.channelLayout || channelInfo.channelLayout.length === 0) && <VideoCarousel title="Latest Uploads" videos={videos} />}
          </div>
        );
      case 'Uploads':
        return videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {videos.map(video => <VideoCard key={video.id} video={video}/>)}
            </div>
        ) : (
            <div className="text-center py-16 text-light-text-secondary dark:text-dark-text-secondary">You haven't uploaded any videos yet.</div>
        );
      case 'Community':
        return (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handlePostSubmit} className="bg-light-surface dark:bg-dark-surface p-4 rounded-lg mb-8">
              <textarea
                value={newPostText}
                onChange={e => setNewPostText(e.target.value)}
                placeholder="Share an update with your community..."
                className="w-full bg-light-element dark:bg-dark-element border-none rounded-md p-2 focus:ring-2 focus:ring-brand-red"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button type="submit" className="px-4 py-2 bg-brand-red text-white font-semibold rounded-full hover:bg-brand-red-dark disabled:opacity-50" disabled={!newPostText.trim()}>
                  Post
                </button>
              </div>
            </form>
            <div className="space-y-6">
              {communityPosts.map(post => <CommunityPost key={post.id} post={post} channelId={currentUser.id} />)}
            </div>
          </div>
        );
      case 'Memberships':
        return (
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold">Offer exclusive perks with Memberships</h2>
            <p className="mt-2 text-dark-text-secondary">Your fans can pay a monthly fee to get access to members-only content and features.</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {membershipTiers.map(tier => (
                <div key={tier.id} className="border border-dark-element rounded-lg p-6">
                  <h3 className="text-xl font-bold text-brand-red">{tier.name}</h3>
                  <p className="text-3xl font-bold my-4">${tier.price}/month</p>
                  <ul className="text-left space-y-2 text-dark-text-secondary">
                    {tier.perks.map((perk, i) => <li key={i} className="flex items-start gap-2"><span className="text-brand-red">✔</span> {perk}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            {membershipTiers.length === 0 && <p className="mt-6 text-dark-text-secondary">You haven't created any membership tiers yet.</p>}
             <Link to="/my-channel/customize" className="mt-8 inline-block bg-brand-red text-white font-semibold px-6 py-2 rounded-full">
                Manage Memberships
            </Link>
          </div>
        );
       case 'Store':
            return <StoreTab merch={merch} />;
      case 'About':
        return <AboutTab user={channelInfo} />;
      default:
        return null;
    }
  };

  return (
    <div className="text-light-text-primary dark:text-dark-text-primary">
      {/* Banner Image */}
      <div className="h-40 md:h-64 w-full bg-light-element dark:bg-dark-element overflow-hidden">
        {channelInfo.bannerUrl && (
          <img src={channelInfo.bannerUrl} alt={`${channelInfo.name}'s banner`} className="w-full h-full object-cover" />
        )}
      </div>
      
      {/* Channel Info Header */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start -mt-16 gap-4">
          <Avatar user={channelInfo} size="lg" />
           <div className="w-full mt-16 md:mt-0 pt-2">
              <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{channelInfo.name}</h1>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">@{channelInfo.name.toLowerCase().replace(/\s/g, '')} &bull; {channelInfo.subscribers.toLocaleString()} subscribers</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                  <Link to="/upload" className="font-semibold px-4 py-2 rounded-full bg-dark-surface hover:bg-dark-element flex items-center gap-2">
                      <ArrowUpTrayIcon className="w-5 h-5"/> Upload
                  </Link>
                  <Link to="/my-channel/customize" className="font-semibold px-4 py-2 rounded-full bg-dark-surface hover:bg-dark-element flex items-center gap-2">
                      <PencilSquareIcon className="w-5 h-5"/> Customize
                  </Link>
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
          <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
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

export default MyChannel;