import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { PremiumContext } from './PremiumContext';
import { fetchWithCache } from '../utils/api';
import type { Ad } from '../types';

interface AdContextType {
  isAdVisible: boolean;
  isAdPlaying: boolean;
  ad: Ad | null;
  showAd: () => void;
  hideAd: () => void;
  endAd: () => void;
}

export const AdContext = createContext<AdContextType>({
  isAdVisible: false,
  isAdPlaying: false,
  ad: null,
  showAd: () => {},
  hideAd: () => {},
  endAd: () => {},
});

interface AdProviderProps {
  children: ReactNode;
}

export const AdProvider: React.FC<AdProviderProps> = ({ children }) => {
  const [isAdVisible, setIsAdVisible] = useState(false);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [ad, setAd] = useState<Ad | null>(null);
  const { isPremium } = useContext(PremiumContext);

  const fetchAd = useCallback(async () => {
    try {
      // In a real app, this would be a more complex ad selection logic
      const ads: Ad[] = await fetchWithCache('/api/v1/ads');
      if (ads.length > 0) {
        setAd(ads[0]);
      }
    } catch (error) {
      console.error("Failed to fetch ad:", error);
    }
  }, []);

  const showAd = useCallback(() => {
    if (!isPremium) {
      fetchAd();
      setIsAdVisible(true);
      setIsAdPlaying(true);
    }
  }, [isPremium, fetchAd]);

  const hideAd = useCallback(() => {
    setIsAdVisible(false);
    setTimeout(() => setIsAdPlaying(false), 500); // Give time for transition
  }, []);

  const endAd = useCallback(() => {
    hideAd();
  }, [hideAd]);

  return (
    <AdContext.Provider value={{ isAdVisible, isAdPlaying, ad, showAd, hideAd, endAd }}>
      {children}
    </AdContext.Provider>
  );
};