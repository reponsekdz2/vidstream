import React, { useState, useEffect } from 'react';
import type { Video } from '../types';
import VideoCarousel from '../components/VideoCarousel';
import SkeletonCarousel from '../components/skeletons/SkeletonCarousel';
import { fetchWithCache } from '../utils/api';

const Home: React.FC = () => {
  const [videosByGenre, setVideosByGenre] = useState<Record<string, Video[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await fetchWithCache('/api/videos');
        
        const groupedByGenre = data.reduce((acc: Record<string, Video[]>, video: Video) => {
          const genre = video.genre || 'Uncategorized';
          if (!acc[genre]) {
            acc[genre] = [];
          }
          acc[genre].push(video);
          return acc;
        }, {});

        setVideosByGenre(groupedByGenre);
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

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
    <div className="py-8 space-y-12">
      {Object.entries(videosByGenre).map(([genre, videos]) => (
        <VideoCarousel key={genre} title={genre} videos={videos} />
      ))}
    </div>
  );
};

export default Home;