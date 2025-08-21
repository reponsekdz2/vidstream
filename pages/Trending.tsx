import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Video } from '../types';
import { fetchWithCache } from '../utils/api';
import { FireIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const Trending: React.FC = () => {
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const data = await fetchWithCache('/api/v1/analytics/trending');
        setTrendingVideos(data);
      } catch (error) {
        console.error("Failed to fetch trending videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const TrendingSkeleton = () => (
    <div className="flex items-start gap-4 animate-pulse">
        <div className="text-3xl font-bold text-dark-element">00</div>
        <div className="w-48 h-28 bg-dark-element rounded-lg flex-shrink-0"></div>
        <div className="flex-grow space-y-3 pt-1">
            <div className="h-5 bg-dark-element rounded w-3/4"></div>
            <div className="h-4 bg-dark-element rounded w-1/4"></div>
            <div className="h-4 bg-dark-element rounded w-1/2"></div>
        </div>
    </div>
  );
  
  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <FireIcon className="w-8 h-8 text-brand-red" />
        <h1 className="text-3xl font-bold text-dark-text-primary">Trending</h1>
      </div>
      
      {loading ? (
        <div className="space-y-6">
            {[...Array(5)].map((_, i) => <TrendingSkeleton key={i} />)}
        </div>
      ) : trendingVideos.length > 0 ? (
        <div className="space-y-6">
          {trendingVideos.map((video, index) => (
            <Link to={`/watch/${video.id}`} key={video.id} className="flex flex-col sm:flex-row items-start gap-4 group p-2 rounded-lg hover:bg-dark-element transition-colors">
              <span className="text-3xl font-bold text-dark-text-secondary w-12 text-center">{String(index + 1).padStart(2, '0')}</span>
              <div className="relative w-full sm:w-48 sm:flex-shrink-0">
                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-auto object-cover rounded-lg" />
                <span className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
                  {video.duration}
                </span>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-dark-text-primary line-clamp-2 group-hover:text-brand-red">{video.title}</h3>
                <div className="text-sm text-dark-text-secondary mt-1 flex items-center gap-2 flex-wrap">
                    <span>{video.user.name}</span> &bull; <span>{video.views}</span> &bull; <span>{video.uploadedAt}</span>
                </div>
                <p className="text-sm text-dark-text-secondary mt-2 line-clamp-2 hidden md:block">{video.description}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-dark-text-secondary text-center py-10">Could not load trending videos at this time.</p>
      )}
    </motion.div>
  );
};

export default Trending;