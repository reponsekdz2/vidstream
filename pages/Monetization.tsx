import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CurrencyDollarIcon, UserGroupIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { fetchWithCache } from '../utils/api';
import type { MonetizationData } from '../types';

const Monetization: React.FC = () => {
  const { currentUser } = useContext(AuthContext);
  const [data, setData] = useState<MonetizationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const result = await fetchWithCache(`/api/v1/creator/${currentUser.id}/monetization`);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch monetization data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  if (!currentUser) return <Navigate to="/login" replace />;
  if (loading) return <div className="p-8">Loading monetization data...</div>;
  if (!data) return <div className="p-8">Could not load data.</div>;

  const subProgress = Math.min((data.subscribers.current / data.subscribers.required) * 100, 100);
  const watchHoursProgress = Math.min((data.watchHours.current / data.watchHours.required) * 100, 100);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <CurrencyDollarIcon className="w-8 h-8 text-brand-red" />
        <h1 className="text-3xl font-bold">Monetization</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg">
            <h2 className="text-2xl font-bold">Grow with VidStream</h2>
            <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
              Join the VidStream Partner Program to earn money, get creator support, and more.
            </p>
          </div>
          
          <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">How to Join</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center text-center p-4 bg-light-element dark:bg-dark-element rounded-lg">
                <UserGroupIcon className="w-12 h-12 text-brand-red mb-2" />
                <p className="text-2xl font-bold">{data.subscribers.current.toLocaleString()}</p>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Subscribers</p>
                <div className="w-full bg-dark-element/50 rounded-full h-2 mt-4">
                  <div className="bg-brand-red h-2 rounded-full" style={{ width: `${subProgress}%` }}></div>
                </div>
                <p className="text-xs mt-1 text-light-text-secondary dark:text-dark-text-secondary">{data.subscribers.required.toLocaleString()} required</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-light-element dark:bg-dark-element rounded-lg">
                <ClockIcon className="w-12 h-12 text-brand-red mb-2" />
                <p className="text-2xl font-bold">{data.watchHours.current.toLocaleString()}</p>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Public watch hours</p>
                 <div className="w-full bg-dark-element/50 rounded-full h-2 mt-4">
                  <div className="bg-brand-red h-2 rounded-full" style={{ width: `${watchHoursProgress}%` }}></div>
                </div>
                <p className="text-xs mt-1 text-light-text-secondary dark:text-dark-text-secondary">{data.watchHours.required.toLocaleString()} required</p>
              </div>
            </div>
             <button className="mt-6 w-full py-2 px-4 bg-brand-red text-white font-semibold rounded-md hover:bg-brand-red-dark disabled:opacity-50" disabled={!data.isEligible}>
                {data.isEligible ? "Apply Now" : "Notify me when I'm eligible"}
            </button>
          </div>
        </div>
        
        <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg">
          <h3 className="text-xl font-bold">Estimated Earnings</h3>
           <div className="h-64 mt-4 bg-light-element dark:bg-dark-element rounded-md flex items-center justify-center">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">(Chart Placeholder)</p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Monetization;