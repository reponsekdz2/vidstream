import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Video } from '../types';

interface PlayerContextType {
  currentVideo: Video | null;
  isMiniplayerVisible: boolean;
  playVideo: (video: Video, originalPath: string) => void;
  closePlayer: () => void;
  openPlayer: () => void;
}

export const PlayerContext = createContext<PlayerContextType>({
  currentVideo: null,
  isMiniplayerVisible: false,
  playVideo: () => {},
  closePlayer: () => {},
  openPlayer: () => {},
});

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [originalPath, setOriginalPath] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isMiniplayerVisible = currentVideo !== null && location.pathname !== originalPath;

  const playVideo = useCallback((video: Video, path: string) => {
    setCurrentVideo(video);
    setOriginalPath(path);
  }, []);

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
    <PlayerContext.Provider value={{ currentVideo, isMiniplayerVisible, playVideo, closePlayer, openPlayer }}>
      {children}
    </PlayerContext.Provider>
  );
};