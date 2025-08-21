import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { Video } from '../types';

interface MyListContextType {
  list: Video[];
  addToList: (video: Video) => void;
  removeFromList: (videoId: string) => void;
}

export const MyListContext = createContext<MyListContextType>({
  list: [],
  addToList: () => {},
  removeFromList: () => {},
});

interface MyListProviderProps {
    children: ReactNode;
}

export const MyListProvider: React.FC<MyListProviderProps> = ({ children }) => {
  const [list, setList] = useState<Video[]>(() => {
    try {
      const localData = localStorage.getItem('my-video-list');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse local storage list", error);
      return [];
    }
  });

  useEffect(() => {
    try {
        localStorage.setItem('my-video-list', JSON.stringify(list));
    } catch (error) {
        console.error("Could not save list to local storage", error);
    }
  }, [list]);

  const addToList = (video: Video) => {
    setList((prevList) => {
      if (prevList.find((item) => item.id === video.id)) {
        return prevList;
      }
      return [...prevList, video];
    });
  };

  const removeFromList = (videoId: string) => {
    setList((prevList) => prevList.filter((item) => item.id !== videoId));
  };

  return (
    <MyListContext.Provider value={{ list, addToList, removeFromList }}>
      {children}
    </MyListContext.Provider>
  );
};
