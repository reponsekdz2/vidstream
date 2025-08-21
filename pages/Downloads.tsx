import React, { useContext } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { DownloadsContext } from '../context/DownloadsContext';
import VideoCard from '../components/VideoCard';

const Downloads: React.FC = () => {
  const { downloads } = useContext(DownloadsContext);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <ArrowDownTrayIcon className="w-8 h-8 text-brand-red" />
        <h1 className="text-3xl font-bold">Your Downloads</h1>
      </div>
      
      {downloads.length > 0 ? (
        <>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                These videos are available for offline viewing.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {downloads.map((video) => (
                <VideoCard key={video.id} video={video} />
            ))}
            </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center mt-16">
            <h2 className="text-2xl font-bold">No downloaded videos</h2>
            <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary max-w-md">
                Click the "Download" button on any video to save it for offline viewing here.
            </p>
        </div>
      )}
    </div>
  );
};

export default Downloads;