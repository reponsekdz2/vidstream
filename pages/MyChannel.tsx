import React, { useContext, useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowUpTrayIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import type { Video } from '../types';
import { fetchWithCache } from '../utils/api';
import VideoCard from '../components/VideoCard';
import SkeletonCard from '../components/skeletons/SkeletonCard';

const MyChannel: React.FC = () => {
  const { currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Uploads');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserVideos = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const userVideos = await fetchWithCache(`/api/v1/users/${currentUser.id}/videos`);
            setVideos(userVideos);
        } catch (error) {
            console.error("Failed to fetch user videos:", error);
        } finally {
            setLoading(false);
        }
    };
    if (activeTab === 'Uploads') {
        fetchUserVideos();
    } else {
        setVideos([]);
        setLoading(false);
    }
  }, [currentUser, activeTab]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const tabs = ['Uploads', 'Shorts', 'Live'];

  const renderContent = () => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        );
    }

    switch (activeTab) {
      case 'Uploads':
        return videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {videos.map(video => <VideoCard key={video.id} video={video}/>)}
            </div>
        ) : (
            <div className="text-center py-16 text-dark-text-secondary">You haven't uploaded any videos yet.</div>
        );
      case 'Shorts':
        return <div className="text-center py-16 text-dark-text-secondary">You haven't created any shorts yet.</div>;
      case 'Live':
        return <div className="text-center py-16 text-dark-text-secondary">You have no past or upcoming live streams.</div>;
      default:
        return null;
    }
  };

  return (
    <div className="text-dark-text-primary">
      <div className="bg-dark-element h-48 w-full"></div>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end -mt-16 gap-4">
          <img 
            src={currentUser.avatarUrl} 
            alt={currentUser.name}
            className="w-32 h-32 rounded-full border-4 border-dark-bg bg-dark-bg"
          />
          <div className="ml-2 mb-2">
            <h1 className="text-3xl font-bold">{currentUser.name}</h1>
            <p className="text-sm text-dark-text-secondary mt-1">@{currentUser.name.toLowerCase().replace(/\s/g, '')} &bull; {currentUser.subscribers.toLocaleString()} subscribers</p>
          </div>
          <div className="ml-auto mb-2 flex gap-2">
            <button className="bg-dark-surface hover:bg-dark-element text-dark-text-primary font-semibold px-4 py-2 rounded-full flex items-center gap-2 transition-colors">
              <PencilSquareIcon className="w-5 h-5"/>
              Customize
            </button>
            <Link to="/upload" className="bg-brand-red hover:bg-brand-red-dark text-white font-semibold px-4 py-2 rounded-full flex items-center gap-2 transition-colors">
              <ArrowUpTrayIcon className="w-5 h-5"/>
              Upload Video
            </Link>
          </div>
        </div>
        <div className="mt-6 border-b border-dark-element">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-brand-red text-brand-red'
                    : 'border-transparent text-dark-text-secondary hover:text-dark-text-primary hover:border-gray-500'
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