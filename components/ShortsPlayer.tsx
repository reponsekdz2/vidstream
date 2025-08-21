import React, { useRef, useState, useEffect } from 'react';
import type { Short } from '../types';
import { HandThumbUpIcon, ChatBubbleOvalLeftEllipsisIcon, ShareIcon, EllipsisHorizontalIcon, PlayIcon } from '@heroicons/react/24/solid';

interface ShortsPlayerProps {
  short: Short;
  isActive: boolean;
}

const ShortsPlayer: React.FC<ShortsPlayerProps> = ({ short, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isActive) {
      setTimeout(() => {
        videoRef.current?.play().then(() => {
          setIsPlaying(true);
        }).catch(e => console.error("Video play failed", e));
      }, 150);
    } else {
      videoRef.current?.pause();
      if(videoRef.current) videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current?.play();
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={short.videoUrl}
        loop
        playsInline
        className="h-full w-full object-cover"
      />
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 pointer-events-none">
          <PlayIcon className="w-20 h-20 text-white opacity-80" />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
        <div className="flex items-center gap-3">
          <img src={short.user.avatarUrl} alt={short.user.name} className="w-10 h-10 rounded-full border-2 border-white" />
          <p className="font-semibold">@{short.user.name}</p>
          <button className="bg-white text-black text-sm font-semibold px-4 py-1.5 rounded-full pointer-events-auto hover:bg-gray-200">Subscribe</button>
        </div>
        <p className="mt-2 text-sm line-clamp-2">{short.title}</p>
      </div>

      <div className="absolute bottom-4 right-2 flex flex-col items-center gap-4 text-white">
        <div className="flex flex-col items-center">
            <button className="bg-black bg-opacity-50 p-3 rounded-full hover:bg-opacity-75"><HandThumbUpIcon className="w-6 h-6"/></button>
            <span className="text-sm font-semibold mt-1">{short.likes}</span>
        </div>
         <div className="flex flex-col items-center">
            <button className="bg-black bg-opacity-50 p-3 rounded-full hover:bg-opacity-75"><ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6"/></button>
            <span className="text-sm font-semibold mt-1">{short.comments}</span>
        </div>
        <button className="bg-black bg-opacity-50 p-3 rounded-full hover:bg-opacity-75"><ShareIcon className="w-6 h-6"/></button>
        <button className="bg-black bg-opacity-50 p-3 rounded-full hover:bg-opacity-75"><EllipsisHorizontalIcon className="w-6 h-6"/></button>
      </div>
    </div>
  );
};

export default ShortsPlayer;