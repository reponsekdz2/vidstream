import React, { useState, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCache } from '../utils/api';

const Upload: React.FC = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [genre, setGenre] = useState('Lifestyle');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError("You must be logged in to upload a video.");
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title,
          description,
          videoUrl,
          thumbnailUrl,
          genre,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to upload video.');
      }
      
      const newVideo = await response.json();

      // Clear relevant caches
      clearCache('/api/v1/videos');
      clearCache(`/api/v1/users/${currentUser.id}/videos`);

      navigate(`/watch/${newVideo.id}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-dark-surface rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-dark-text-primary">Upload a New Video</h2>
        <p className="text-center text-dark-text-secondary">Share your content with the world</p>
        
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-sm">{error}</div>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-dark-text-secondary">Title</label>
            <input id="title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-dark-element border border-dark-element rounded-md" />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-dark-text-secondary">Description</label>
            <textarea id="description" required value={description} onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-dark-element border border-dark-element rounded-md" rows={4}></textarea>
          </div>

          <div>
            <label htmlFor="videoUrl" className="block text-sm font-medium text-dark-text-secondary">Video URL</label>
            <input id="videoUrl" type="url" required value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="e.g., http://commondatastorage.googleapis.com/.../video.mp4"
              className="mt-1 block w-full px-3 py-2 bg-dark-element border border-dark-element rounded-md" />
          </div>

          <div>
            <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-dark-text-secondary">Thumbnail URL</label>
            <input id="thumbnailUrl" type="url" required value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="e.g., https://picsum.photos/1280/720"
              className="mt-1 block w-full px-3 py-2 bg-dark-element border border-dark-element rounded-md" />
          </div>

           <div>
            <label htmlFor="genre" className="block text-sm font-medium text-dark-text-secondary">Genre</label>
            <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-dark-element border border-dark-element rounded-md">
                <option>Lifestyle</option>
                <option>Technology</option>
                <option>Education</option>
                <option>Travel</option>
                <option>Cooking</option>
                <option>Documentary</option>
            </select>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-red hover:bg-brand-red-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-red disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;
