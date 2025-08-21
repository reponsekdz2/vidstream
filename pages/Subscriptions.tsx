import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import type { Subscription, User } from '../types';
import { AuthContext } from '../context/AuthContext';
import VideoCarousel from '../components/VideoCarousel';
import SkeletonCarousel from '../components/skeletons/SkeletonCarousel';
import { fetchWithCache } from '../utils/api';

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchWithCache(`/api/v1/users/${currentUser.id}/subscriptions`);
        setSubscriptions(data);
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, [currentUser]);
  
  if (!currentUser && !loading) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="py-8 space-y-12">
      <div className="pl-4 sm:pl-6 lg:pl-8">
        <h1 className="text-2xl font-bold text-dark-text-primary">Subscriptions</h1>
        <p className="text-dark-text-secondary mt-1">Latest videos from your favorite channels.</p>
      </div>
      {loading ? (
        <>
            <SkeletonCarousel />
            <SkeletonCarousel />
        </>
      ) : subscriptions.length > 0 ? (
        subscriptions.map((sub) => (
          <VideoCarousel key={sub.channel.id} title={`Latest from ${sub.channel.name}`} videos={sub.videos} />
        ))
      ) : (
        <p className="pl-4 sm:pl-6 lg:pl-8 text-dark-text-secondary">You are not subscribed to any channels yet.</p>
      )}
    </div>
  );
};

export default Subscriptions;