import React, { useState, useEffect } from 'react';
import type { TranscriptLine } from '../types';
import { fetchWithCache } from '../utils/api';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

interface VideoTranscriptProps {
  videoId: string;
  currentTime: number;
  onSeek: (time: number) => void;
}

const VideoTranscript: React.FC<VideoTranscriptProps> = ({ videoId, currentTime, onSeek }) => {
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);

  useEffect(() => {
    const fetchTranscript = async () => {
      setLoading(true);
      try {
        const data = await fetchWithCache(`/api/v1/videos/${videoId}/transcript`);
        setTranscript(data);
      } catch (error) {
        console.error("Failed to fetch transcript:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTranscript();
  }, [videoId]);

  useEffect(() => {
    let activeIndex = -1;
    for (let i = transcript.length - 1; i >= 0; i--) {
        if (currentTime >= transcript[i].time) {
            activeIndex = i;
            break;
        }
    }
    setActiveLineIndex(activeIndex);
  }, [currentTime, transcript]);


  const filteredTranscript = transcript.filter(line => 
    line.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-dark-surface rounded-xl h-full flex flex-col">
      <div className="p-4 border-b border-dark-element">
        <h3 className="font-semibold text-lg mb-2">Transcript</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-dark-element rounded-full px-4 py-2 pl-10 text-sm"
          />
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-secondary"/>
        </div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {loading ? <p>Loading transcript...</p> : (
            <div className="space-y-4">
            {filteredTranscript.map((line, index) => (
              <button
                key={index}
                onClick={() => onSeek(line.time)}
                className={`w-full text-left p-2 rounded-lg transition-colors ${activeLineIndex === transcript.indexOf(line) ? 'bg-brand-red/20' : 'hover:bg-dark-element'}`}
              >
                <span className="font-mono text-xs text-brand-red">{new Date(line.time * 1000).toISOString().substr(14, 5)}</span>
                <p className="mt-1 text-sm">{line.text}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoTranscript;