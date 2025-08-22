import React, { useState, useEffect, useRef, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { VideoCameraIcon, SignalIcon } from '@heroicons/react/24/solid';

const GoLive: React.FC = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamId, setStreamId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        mediaStreamRef.current = stream;
      } catch (err) {
        setError("Could not access camera. Please check permissions.");
        console.error("Camera access error:", err);
      }
    };
    setupCamera();

    return () => {
      // Cleanup: stop the camera stream when the component unmounts
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStartStream = async () => {
    if (!currentUser || !title.trim()) {
      setError("Title is required to start a stream.");
      return;
    }
    setError('');
    try {
      const response = await fetch('/api/v1/live/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, title, description }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsStreaming(true);
        setStreamId(data.id);
        navigate(`/watch/${data.id}`);
      } else {
        throw new Error(data.message || "Failed to start stream");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEndStream = async () => {
    if (!streamId) return;
    try {
      await fetch(`/api/v1/live/${streamId}/stop`, { method: 'POST' });
      setIsStreaming(false);
      setStreamId(null);
      // Stop camera tracks
       if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      navigate('/my-channel');
    } catch (err) {
      console.error("Failed to stop stream:", err);
    }
  };

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-full">
      <div className="md:w-2/3 bg-black flex items-center justify-center p-4">
        <video ref={videoRef} autoPlay muted className="w-full h-full object-contain"></video>
      </div>
      <div className="md:w-1/3 bg-dark-surface p-6 space-y-6">
        <h1 className="text-2xl font-bold">Broadcast Setup</h1>
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-sm">{error}</div>}
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-dark-text-secondary">Stream Title</label>
          <input 
            id="title" 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-dark-element border border-dark-element rounded-md" 
            disabled={isStreaming}
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-dark-text-secondary">Description</label>
          <textarea 
            id="description" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-dark-element border border-dark-element rounded-md" 
            rows={4}
            disabled={isStreaming}
          ></textarea>
        </div>

        {isStreaming ? (
          <button
            onClick={handleEndStream}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gray-600 hover:bg-gray-700"
          >
            <VideoCameraIcon className="w-6 h-6" />
            End Stream
          </button>
        ) : (
          <button
            onClick={handleStartStream}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-brand-red hover:bg-brand-red-dark"
          >
            <SignalIcon className="w-6 h-6" />
            Go Live
          </button>
        )}
      </div>
    </div>
  );
};

export default GoLive;
