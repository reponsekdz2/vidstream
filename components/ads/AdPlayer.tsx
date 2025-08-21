import React, { useContext, useEffect, useState, useRef } from 'react';
import ReactPlayer from 'react-player/lazy';
import { AdContext } from '../../context/AdContext';
import { fetchWithCache } from '../../utils/api';
import type { Ad } from '../../types';

const AdPlayer: React.FC = () => {
  const { isAdVisible, ad, hideAd, endAd } = useContext(AdContext);
  const [canSkip, setCanSkip] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  
  useEffect(() => {
    if (isAdVisible) {
      const timer = setTimeout(() => {
        setCanSkip(true);
      }, 5000); // Ad is skippable after 5 seconds
      return () => clearTimeout(timer);
    } else {
      setCanSkip(false);
    }
  }, [isAdVisible]);
  
  if (!isAdVisible || !ad) return null;

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
      <ReactPlayer
        ref={playerRef}
        url={ad.videoUrl}
        playing
        width="100%"
        height="100%"
        onEnded={endAd}
      />
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
         <div className="bg-black/70 text-white text-sm p-2 rounded">
            Your video will play after the ad
         </div>
         <button 
            onClick={hideAd}
            disabled={!canSkip}
            className="bg-black/70 text-white text-sm p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {canSkip ? 'Skip Ad' : 'Skip Ad in 5s'}
        </button>
      </div>
    </div>
  );
};

export default AdPlayer;
