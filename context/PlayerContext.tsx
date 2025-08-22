import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Video } from '../types';

interface PlayerContextType {
  currentVideo: Video | null;
  isMiniplayerVisible: boolean;
  queue: Video[];
  playVideo: (video: Video, originalPath: string) => void;
  playNext: () => Video | null;
  addToQueue: (video: Video) => void;
  removeFromQueue: (videoId: string) => void;
  reorderQueue: (videos: Video[]) => void;
  closePlayer: () => void;
  openPlayer: () => void;
}

export const PlayerContext = createContext<PlayerContextType>({
  currentVideo: null,
  isMiniplayerVisible: false,
  queue: [],
  playVideo: () => {},
  playNext: () => null,
  addToQueue: () => {},
  removeFromQueue: () => {},
  reorderQueue: () => {},
  closePlayer: () => {},
  openPlayer: () => {},
});

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [originalPath, setOriginalPath] = useState<string | null>(null);
  const [queue, setQueue] = useState<Video[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const isMiniplayerVisible = currentVideo !== null && location.pathname !== originalPath;

  const playVideo = useCallback((video: Video, path: string) => {
    setCurrentVideo(video);
    setOriginalPath(path);
  }, []);
  
  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const nextVideo = queue[0];
      setQueue(prev => prev.slice(1));
      return nextVideo;
    }
    return null;
  }, [queue]);

  const addToQueue = (video: Video) => {
    setQueue(prev => [...prev, video]);
  };
  
  const removeFromQueue = (videoId: string) => {
    setQueue(prev => prev.filter(v => v.id !== videoId));
  };
  
  const reorderQueue = (videos: Video[]) => {
    setQueue(videos);
  };

  const closePlayer = () => {
    setCurrentVideo(null);
    setOriginalPath(null);
  };
  
  const openPlayer = () => {
    if(originalPath) {
        navigate(originalPath);
    }
  };

  return (
    <PlayerContext.Provider value={{ currentVideo, isMiniplayerVisible, queue, playVideo, playNext, addToQueue, removeFromQueue, reorderQueue, closePlayer, openPlayer }}>
      {children}
    </PlayerContext.Provider>
  );
};