import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import type { CreatorAnalytics } from '../types';
import { fetchWithCache } from '../utils/api';
import StatCard from '../components/charts/StatCard';
import AnalyticsChart from '../components/charts/AnalyticsChart';
import VideoPerformanceTable from '../components/charts/VideoPerformanceTable';
import { ChartBarIcon, EyeIcon, UserGroupIcon, ClockIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const CreatorDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchWithCache(`/api/v1/analytics/creator/${currentUser.id}`);
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch creator analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [currentUser]);

  if (!currentUser && !loading) {
    return <Navigate to="/login" replace />;
  }

  const DashboardSkeleton = () => (
    <div className="animate-pulse space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map(i => <div key={i} className="h-28 bg-dark-surface rounded-lg"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-dark-surface rounded-lg"></div>
        <div className="h-80 bg-dark-surface rounded-lg"></div>
      </div>
      <div className="h-96 bg-dark-surface rounded-lg"></div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 lg:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <ChartBarIcon className="w-8 h-8 text-brand-red" />
        <h1 className="text-3xl font-bold text-dark-text-primary">Creator Dashboard</h1>
      </div>

      {loading ? <DashboardSkeleton /> : !analytics ? (
        <p className="text-dark-text-secondary">Could not load analytics data.</p>
      ) : (
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={EyeIcon} title="Total Views" value={analytics.totalViews.toLocaleString()} />
            <StatCard icon={UserGroupIcon} title="Subscribers" value={analytics.totalSubscribers.toLocaleString()} />
            <StatCard icon={PlayCircleIcon} title="Total Videos" value={analytics.totalVideos.toLocaleString()} />
            <StatCard icon={ClockIcon} title="Watch Time (hours)" value={analytics.watchTimeHours.toLocaleString()} />
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsChart title="Views (Last 30 Days)" data={analytics.viewsOverTime} dataKey="views" />
            <AnalyticsChart title="Subscribers (Last 30 Days)" data={analytics.subscribersOverTime} dataKey="subscribers" />
          </div>

          {/* Video Performance Table */}
          <VideoPerformanceTable videos={analytics.videoPerformance} />
        </div>
      )}
    </motion.div>
  );
};

export default CreatorDashboard;