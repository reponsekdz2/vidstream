import React from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';

const Downloads: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <ArrowDownTrayIcon className="w-24 h-24 text-dark-element mb-4" />
      <h1 className="text-3xl font-bold text-dark-text-primary">Downloads</h1>
      <p className="mt-2 text-dark-text-secondary max-w-md">
        This feature is coming soon! You'll be able to download your favorite videos to watch offline, anytime, anywhere.
      </p>
    </div>
  );
};

export default Downloads;