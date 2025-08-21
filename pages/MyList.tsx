import React, { useContext, useState, useEffect } from 'react';
import { MyListContext } from '../context/MyListContext';
import VideoCard from '../components/VideoCard';
import SkeletonCard from '../components/skeletons/SkeletonCard';

const MyList: React.FC = () => {
  const { list } = useContext(MyListContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading to allow skeleton to show
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6 text-dark-text-primary">My List</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : list.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {list.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <p className="text-dark-text-secondary">Your list is empty. Add videos to see them here.</p>
      )}
    </div>
  );
};

export default MyList;