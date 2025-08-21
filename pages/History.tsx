import React, { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import type { HistoryItem } from '../types';
import { fetchWithCache } from '../utils/api';
import { ClockIcon } from '@heroicons/react/24/solid';

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchWithCache(`/api/v1/history?userId=${currentUser.id}`);
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [currentUser]);

  if (!currentUser && !loading) {
    return <Navigate to="/login" replace />;
  }

  const HistorySkeleton = () => (
    <div className="flex items-center gap-4 animate-pulse">
        <div className="w-48 h-28 bg-dark-element rounded-lg flex-shrink-0"></div>
        <div className="flex-grow space-y-3">
            <div className="h-5 bg-dark-element rounded w-3/4"></div>
            <div className="h-4 bg-dark-element rounded w-1/4"></div>
            <div className="h-4 bg-dark-element rounded w-1/2"></div>
        </div>
    </div>
  );
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ClockIcon className="w-8 h-8 text-brand-red" />
        <h1 className="text-3xl font-bold text-dark-text-primary">Watch History</h1>
      </div>
      
      {loading ? (
        <div className="space-y-6">
            {[...Array(5)].map((_, i) => <HistorySkeleton key={i} />)}
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-6">
          {history.map(item => (
            <Link to={`/watch/${item.video.id}`} key={item.id} className="flex flex-col sm:flex-row items-start gap-4 group p-2 rounded-lg hover:bg-dark-element transition-colors">
              <div className="relative w-full sm:w-48 sm:flex-shrink-0">
                <img src={item.video.thumbnailUrl} alt={item.video.title} className="w-full h-auto object-cover rounded-lg" />
                <span className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
                  {item.video.duration}
                </span>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-dark-text-primary line-clamp-2 group-hover:text-brand-red">{item.video.title}</h3>
                <div className="text-sm text-dark-text-secondary mt-1">
                    <span>{item.video.user.name}</span> &bull; <span>{item.video.views}</span>
                </div>
                <p className="text-sm text-dark-text-secondary mt-2 line-clamp-2">{item.video.description}</p>
                <p className="text-xs text-gray-400 mt-2">Watched on {new Date(item.watchedAt).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-dark-text-secondary text-center py-10">Your watch history is empty. Videos you watch will appear here.</p>
      )}
    </div>
  );
};

export default History;