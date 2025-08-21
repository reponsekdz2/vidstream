import React from 'react';
import SkeletonCard from './SkeletonCard';

const SkeletonCarousel: React.FC = () => {
  return (
    <div className="pl-4 sm:pl-6 lg:pl-8">
      <div className="h-6 w-1/4 mb-4 bg-dark-element rounded animate-pulse"></div>
      <div className="flex overflow-hidden space-x-4 pb-4">
        {[...Array(5)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
};

export default SkeletonCarousel;