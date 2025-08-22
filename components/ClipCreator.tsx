import React, { useState, useRef, useEffect } from 'react';
import type { Video } from '../types';
import { XMarkIcon, ScissorsIcon } from '@heroicons/react/24/solid';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

interface ClipCreatorProps {
  video: Video;
  onClose: () => void;
}

const ClipCreator: React.FC<ClipCreatorProps> = ({ video, onClose }) => {
    const { currentUser } = useContext(AuthContext);
    const [title, setTitle] = useState(`${video.title} - Clip`);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(15);
    const [error, setError] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const totalDuration = video.durationSeconds;

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.currentTime = startTime;
        }
    }, [startTime]);
    
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end') => {
        const value = parseFloat(e.target.value);
        if (type === 'start') {
            if (value >= endTime - 5) {
                setStartTime(endTime - 5);
            } else {
                setStartTime(value);
            }
        } else {
            if (value <= startTime + 5) {
                setEndTime(startTime + 5);
            } else if (value > startTime + 15) {
                setEndTime(startTime + 15);
            } else {
                setEndTime(value);
            }
        }
    };
    
    const handleSubmit = async () => {
        if (!currentUser) return setError("You must be logged in to create a clip.");
        
        const response = await fetch('/api/v1/clips', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                videoId: video.id,
                userId: currentUser.id,
                title,
                startTime,
                endTime,
            })
        });

        if (response.ok) {
            // In a real app, you'd show a success message with a shareable link
            onClose();
        } else {
            setError("Failed to create clip.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[101] p-4">
            <div className="bg-dark-surface rounded-lg w-full max-w-2xl shadow-xl text-dark-text-primary">
                <div className="flex items-center justify-between p-4 border-b border-dark-element">
                  <h2 className="text-xl font-semibold flex items-center gap-2"><ScissorsIcon className="w-5 h-5"/> Create Clip</h2>
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-dark-element">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                    <video ref={videoRef} src={video.videoUrl} muted controls className="w-full rounded-md aspect-video" />

                    <div>
                        <label className="block text-sm font-medium">Clip time range (5-15 seconds)</label>
                        <div className="flex items-center gap-4 mt-2">
                           <input type="range" min={0} max={totalDuration} step={0.1} value={startTime} onChange={e => handleTimeChange(e, 'start')} className="w-full h-2 accent-brand-red"/>
                           <span>{startTime.toFixed(1)}s - {endTime.toFixed(1)}s</span>
                           <input type="range" min={0} max={totalDuration} step={0.1} value={endTime} onChange={e => handleTimeChange(e, 'end')} className="w-full h-2 accent-brand-red"/>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="clip-title" className="block text-sm font-medium">Title</label>
                        <input id="clip-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-dark-element border border-dark-element rounded-md" />
                    </div>

                    {error && <p className="text-sm text-red-400">{error}</p>}
                    
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm rounded-full hover:bg-dark-element">Cancel</button>
                        <button onClick={handleSubmit} className="px-4 py-1.5 text-sm rounded-full bg-brand-red hover:bg-brand-red-dark">
                            Create Clip
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClipCreator;