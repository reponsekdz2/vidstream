import React, { useState, useRef, useEffect } from 'react';
import type { Short } from '../types';
import ShortsPlayer from '../components/ShortsPlayer';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { fetchWithCache } from '../utils/api';

const Shorts: React.FC = () => {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [currentShortIndex, setCurrentShortIndex] = useState(0);

  useEffect(() => {
    const fetchShorts = async () => {
        try {
            const data: Short[] = await fetchWithCache('/api/shorts');
            setShorts(data);
        } catch (error) {
            console.error(error);
        }
    };
    fetchShorts();
  }, []);

  const handleNext = () => {
    setCurrentShortIndex((prev) => (prev + 1) % shorts.length);
  };

  const handlePrev = () => {
    setCurrentShortIndex((prev) => (prev - 1 + shorts.length) % shorts.length);
  };

  if (shorts.length === 0) {
    return <div className="flex items-center justify-center h-full">Loading shorts...</div>
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-black">
      <div className="h-full w-full max-w-md flex items-center justify-center">
        {shorts.map((short, index) => (
          <div key={short.id} className={`h-full w-full absolute transition-opacity duration-300 ${index === currentShortIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <ShortsPlayer short={short} isActive={index === currentShortIndex} />
          </div>
        ))}
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
        <button
          onClick={handlePrev}
          className="bg-black bg-opacity-50 p-3 rounded-full text-white hover:bg-opacity-75 disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={currentShortIndex === 0}
          aria-label="Previous Short"
        >
          <ChevronUpIcon className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="bg-black bg-opacity-50 p-3 rounded-full text-white hover:bg-opacity-75 disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={currentShortIndex === shorts.length - 1}
          aria-label="Next Short"
        >
          <ChevronDownIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Shorts;