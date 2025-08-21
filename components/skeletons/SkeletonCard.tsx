import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="flex-shrink-0 w-72 md:w-80 animate-pulse">
      <div className="relative rounded-lg overflow-hidden aspect-video bg-dark-element"></div>
      <div className="mt-3 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-dark-element flex-shrink-0"></div>
        <div className="flex-grow pt-1 space-y-2">
            <div className="h-4 bg-dark-element rounded w-full"></div>
            <div className="h-3 bg-dark-element rounded w-1/3"></div>
            <div className="h-3 bg-dark-element rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;