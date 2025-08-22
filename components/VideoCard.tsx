import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Video } from '../types';
import { PlusIcon, CheckIcon, EllipsisVerticalIcon, ListBulletIcon } from '@heroicons/react/24/solid';
import { MyListContext } from '../context/MyListContext';
import { PlayerContext } from '../context/PlayerContext';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { list, addToList, removeFromList } = useContext(MyListContext);
  const { addToQueue } = useContext(PlayerContext);
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isInList = list.some(item => item.id === video.id);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleToggleList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInList) {
      removeFromList(video.id);
    } else {
      addToList(video);
    }
  };
  
  const handleAddToQueue = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToQueue(video);
    setIsMenuOpen(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setTimeout(() => {
        videoRef.current?.play().catch(error => console.log("Autoplay prevented"));
    }, 200); // Small delay before play
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!isMenuOpen) {
      if(videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
      }
    }
  };

  return (
    <div className="flex-shrink-0 w-72 md:w-80 group" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="relative rounded-lg overflow-hidden aspect-video bg-dark-element">
        <Link to={`/watch/${video.id}`}>
          <div className="absolute inset-0">
             <img
              src={video.thumbnailUrl}
              alt={video.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
            />
            <video
              ref={videoRef}
              src={video.videoPreviewUrl}
              muted
              loop
              playsInline
              className={`w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-30 transition-opacity"></div>
        </Link>
        <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
          {video.duration}
        </span>
        <button
          onClick={handleToggleList}
          className="absolute top-2 right-2 bg-black bg-opacity-60 p-2 rounded-full text-white hover:bg-opacity-80 transition-opacity opacity-0 group-hover:opacity-100"
          aria-label={isInList ? "Remove from My List" : "Add to My List"}
        >
          {isInList ? <CheckIcon className="w-5 h-5"/> : <PlusIcon className="w-5 h-5"/> }
        </button>
      </div>
      <div className="mt-3 flex gap-3">
        <Link to={`/channel/${video.user.id}`} className="flex-shrink-0">
            <img src={video.user.avatarUrl} alt={video.user.name} className="w-9 h-9 rounded-full"/>
        </Link>
        <div className="flex-grow">
            <Link to={`/watch/${video.id}`}>
                <h3 className="text-base font-semibold text-dark-text-primary leading-snug line-clamp-2 group-hover:text-brand-red">
                    {video.title}
                </h3>
            </Link>
            <div className="text-sm text-dark-text-secondary mt-1">
                <Link to={`/channel/${video.user.id}`} className="hover:text-dark-text-primary transition-colors truncate">
                    {video.user.name}
                </Link>
                <p>
                    {video.views} &bull; {video.uploadedAt}
                </p>
            </div>
        </div>
        <div ref={menuRef} className="relative">
            <button onClick={() => setIsMenuOpen(p => !p)} className="opacity-0 group-hover:opacity-100 p-1">
                <EllipsisVerticalIcon className="w-5 h-5"/>
            </button>
            {isMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-dark-surface rounded-md shadow-lg py-1 z-20 border border-dark-element">
                    <button onClick={handleAddToQueue} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-dark-element">
                        <ListBulletIcon className="w-5 h-5"/>
                        Add to queue
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;