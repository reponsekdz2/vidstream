import React, { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import ReactPlayer from 'react-player/lazy';
import { XMarkIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/solid';

const Miniplayer: React.FC = () => {
  const { currentVideo, isMiniplayerVisible, closePlayer, openPlayer } = useContext(PlayerContext);

  if (!isMiniplayerVisible || !currentVideo) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 h-auto z-50 bg-dark-surface rounded-lg shadow-2xl overflow-hidden animate-slide-in">
      <div className="aspect-video">
        <ReactPlayer
          url={currentVideo.videoUrl}
          playing
          controls={false}
          width="100%"
          height="100%"
        />
      </div>
      <div className="absolute inset-0 bg-black/20 flex flex-col justify-between p-2">
        <div className="flex justify-end">
            <button onClick={closePlayer} className="text-white bg-black/50 p-1 rounded-full hover:bg-black/80">
                <XMarkIcon className="w-5 h-5"/>
            </button>
        </div>
         <div className="flex items-center justify-between text-white">
            <div className="flex-1 min-w-0" onClick={openPlayer}>
              <p className="font-semibold text-sm truncate cursor-pointer">{currentVideo.title}</p>
              <p className="text-xs text-dark-text-secondary truncate cursor-pointer">{currentVideo.user.name}</p>
            </div>
            <button onClick={openPlayer} className="p-2 ml-2">
                <ArrowsPointingOutIcon className="w-5 h-5"/>
            </button>
        </div>
      </div>
      <style>{`
        .animate-slide-in {
            animation: slideIn 0.3s ease-out forwards;
        }
        @keyframes slideIn {
            from { transform: translateY(100%) scale(0.9); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Miniplayer;