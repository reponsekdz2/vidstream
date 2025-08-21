import React, { useState, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCache } from '../utils/api';
import { ArrowUpTrayIcon, VideoCameraIcon, PhotoIcon } from '@heroicons/react/24/solid';

const Upload: React.FC = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [genre, setGenre] = useState('Lifestyle');
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'video' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileType === 'video') setVideoFile(file);
      else setThumbnailFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError("You must be logged in to upload a video.");
      return;
    }
    if (!videoFile || !thumbnailFile) {
        setError("Both a video file and a thumbnail image are required.");
        return;
    }
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('userId', currentUser.id);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('genre', genre);
    formData.append('videoFile', videoFile);
    formData.append('thumbnailFile', thumbnailFile);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/v1/videos', true);
      
      xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(percentComplete);
          }
      };

      xhr.onload = () => {
        setLoading(false);
        if (xhr.status === 201) {
            const newVideo = JSON.parse(xhr.responseText);
            clearCache('/api/v1/videos');
            clearCache(`/api/v1/users/${currentUser.id}/videos`);
            navigate(`/watch/${newVideo.id}`);
        } else {
            const errData = JSON.parse(xhr.responseText);
            setError(errData.message || 'Failed to upload video.');
        }
      };
      
      xhr.onerror = () => {
          setLoading(false);
          setError('An error occurred during the upload. Please try again.');
      };

      xhr.send(formData);

    } catch (err: any) {
      setLoading(false);
      setError(err.message);
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Video File Input */}
            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-dark-element rounded-lg">
                <VideoCameraIcon className="w-12 h-12 text-dark-text-secondary"/>
                <label htmlFor="video-file" className="mt-2 text-sm font-medium text-brand-red cursor-pointer">
                    Select Video File
                </label>
                <input id="video-file" type="file" className="hidden" accept="video/*" onChange={e => handleFileChange(e, 'video')} />
                {videoFile && <p className="text-xs text-center mt-2 text-dark-text-secondary truncate">{videoFile.name}</p>}
            </div>

            {/* Thumbnail File Input */}
            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-dark-element rounded-lg">
                <PhotoIcon className="w-12 h-12 text-dark-text-secondary"/>
                <label htmlFor="thumbnail-file" className="mt-2 text-sm font-medium text-brand-red cursor-pointer">
                    Select Thumbnail
                </label>
                <input id="thumbnail-file" type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'thumbnail')} />
                {thumbnailFile && <p className="text-xs text-center mt-2 text-dark-text-secondary truncate">{thumbnailFile.name}</p>}
            </div>
          </div>
          
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
          
          {loading && (
            <div className="w-full bg-dark-element rounded-full h-2.5">
              <div className="bg-brand-red h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              <p className="text-center text-sm mt-1">{uploadProgress}%</p>
            </div>
          )}
          
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