import React, { useState, useEffect } from 'react';
import type { Video } from '../types';
import VideoCard from '../components/VideoCard';
import SkeletonCard from '../components/skeletons/SkeletonCard';
import { fetchWithCache } from '../utils/api';
import { motion } from 'framer-motion';
import { SignalIcon } from '@heroicons/react/24/solid';

const Live: React.FC = () => {
  const [liveStreams, setLiveStreams] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveStreams = async () => {
      setLoading(true);
      try {
        const data = await fetchWithCache('/api/v1/live');
        setLiveStreams(data);
      } catch (error) {
        console.error("Failed to fetch live streams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveStreams();
  }, []);

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-6 lg:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <SignalIcon className="w-8 h-8 text-brand-red" />
        <h1 className="text-3xl font-bold text-dark-text-primary">Live Now</h1>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : liveStreams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {liveStreams.map((video) => (
             <div key={video.id} className="relative">
                <VideoCard video={video} />
                <div className="absolute top-2 left-2 bg-brand-red text-white text-xs font-bold px-2 py-1 rounded-md tracking-wider">
                    LIVE
                </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-dark-text-secondary text-center py-10">No one is currently live. Check back later!</p>
      )}
    </motion.div>
  );
};

export default Live;