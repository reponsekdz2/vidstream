import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { Video } from '../types';

interface DownloadsContextType {
  downloads: Video[];
  addToDownloads: (video: Video) => void;
  removeFromDownloads: (videoId: string) => void;
}

export const DownloadsContext = createContext<DownloadsContextType>({
  downloads: [],
  addToDownloads: () => {},
  removeFromDownloads: () => {},
});

interface DownloadsProviderProps {
    children: ReactNode;
}

export const DownloadsProvider: React.FC<DownloadsProviderProps> = ({ children }) => {
  const [downloads, setDownloads] = useState<Video[]>(() => {
    try {
      const localData = localStorage.getItem('my-video-downloads');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse local storage downloads", error);
      return [];
    }
  });

  useEffect(() => {
    try {
        localStorage.setItem('my-video-downloads', JSON.stringify(downloads));
    } catch (error) {
        console.error("Could not save downloads to local storage", error);
    }
  }, [downloads]);

  const addToDownloads = (video: Video) => {
    setDownloads((prevList) => {
      if (prevList.find((item) => item.id === video.id)) {
        return prevList;
      }
      return [...prevList, video];
    });
  };

  const removeFromDownloads = (videoId: string) => {
    setDownloads((prevList) => prevList.filter((item) => item.id !== videoId));
  };

  return (
    <DownloadsContext.Provider value={{ downloads, addToDownloads, removeFromDownloads }}>
      {children}
    </DownloadsContext.Provider>
  );
};
