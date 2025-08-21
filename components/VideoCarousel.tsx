import React from 'react';
import type { Video } from '../types';
import VideoCard from './VideoCard';

interface VideoCarouselProps {
  title: string;
  videos: Video[];
}

const VideoCarousel: React.FC<VideoCarouselProps> = ({ title, videos }) => {
  return (
    <div className="pl-4 sm:pl-6 lg:pl-8">
      <h2 className="text-xl font-bold mb-4 text-dark-text-primary">{title}</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
        {videos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
        <div className="flex-shrink-0 w-4 sm:w-6 lg:w-8"></div>
      </div>
    </div>
  );
};

export default VideoCarousel;