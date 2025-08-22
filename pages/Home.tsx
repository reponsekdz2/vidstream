import React, { useState, useEffect, useContext } from 'react';
import type { Video, HistoryItem } from '../types';
import VideoCarousel from '../components/VideoCarousel';
import SkeletonCarousel from '../components/skeletons/SkeletonCarousel';
import { fetchWithCache } from '../utils/api';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { SparklesIcon } from '@heroicons/react/24/solid';

const Home: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Record<string, Video[]>>({});
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const allVideos = await fetchWithCache('/api/v1/videos');
        
        if (!currentUser) {
          // Fallback for logged-out users: show generic genres
          const groupedByGenre = allVideos.reduce((acc: Record<string, Video[]>, video: Video) => {
            const genre = video.genre || 'Uncategorized';
            if (!acc[genre]) acc[genre] = [];
            acc[genre].push(video);
            return acc;
          }, {});
          setRecommendations(groupedByGenre);
          return;
        }

        // For logged-in users, generate personalized feed
        const history: HistoryItem[] = await fetchWithCache(`/api/v1/history?userId=${currentUser.id}`);
        if (history.length === 0) {
          // New user: Show trending or popular
          const trending = [...allVideos].sort((a,b) => b.viewCount - a.viewCount).slice(0,10);
          setRecommendations({ "Trending For You": trending });
          return;
        }
        
        // Find favorite genres from history
        const genreCounts: Record<string, number> = {};
        history.forEach(item => {
            if (item.video?.genre) {
                genreCounts[item.video.genre] = (genreCounts[item.video.genre] || 0) + 1;
            }
        });

        const sortedGenres = Object.keys(genreCounts).sort((a,b) => genreCounts[b] - genreCounts[a]);
        const topGenres = sortedGenres.slice(0, 3);

        const recommendedCarousels: Record<string, Video[]> = {};
        topGenres.forEach(genre => {
            recommendedCarousels[`Because you watch ${genre}`] = allVideos.filter((v: Video) => v.genre === genre);
        });

        setRecommendations(recommendedCarousels);

      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentUser]);

  if (loading) {
    return (
        <div className="py-8 space-y-12">
            <SkeletonCarousel />
            <SkeletonCarousel />
            <SkeletonCarousel />
        </div>
    );
  }

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="py-8 space-y-12"
    >
      <div className="pl-4 sm:pl-6 lg:pl-8 flex items-center gap-3">
        <SparklesIcon className="w-8 h-8 text-brand-red" />
        <h1 className="text-3xl font-bold">For You</h1>
      </div>

      {Object.entries(recommendations).map(([title, videos]) => (
        <VideoCarousel key={title} title={title} videos={videos} />
      ))}
    </motion.div>
  );
};

export default Home;