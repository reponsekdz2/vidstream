import React, { useState, useContext, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCache } from '../utils/api';
import { ArrowUpTrayIcon, VideoCameraIcon, PhotoIcon, SparklesIcon } from '@heroicons/react/24/solid';

const Upload: React.FC = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [genre, setGenre] = useState('Lifestyle');
  const [chaptersText, setChaptersText] = useState('');
  const [isPremiere, setIsPremiere] = useState(false);
  const [premiereMinutes, setPremiereMinutes] =useState(30);

  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'video' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileType === 'video') {
          setVideoFile(file);
          setVideoPreviewUrl(URL.createObjectURL(file));
      } else {
          setThumbnailFile(file);
          setThumbnailPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const captureThumbnail = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if(blob) {
                    const file = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
                    setThumbnailFile(file);
                    setThumbnailPreviewUrl(URL.createObjectURL(file));
                }
            }, 'image/jpeg');
        }
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
    formData.append('chapters', chaptersText);
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

      xhr.onload = async () => {
        setLoading(false);
        if (xhr.status === 201) {
            const newVideo = JSON.parse(xhr.responseText);
            clearCache('/api/v1/videos');
            clearCache(`/api/v1/users/${currentUser.id}/videos`);
            
            if (isPremiere) {
                await fetch(`/api/v1/videos/${newVideo.id}/premiere`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ minutesFromNow: premiereMinutes }),
                });
            }
            
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
      <div className="w-full max-w-4xl p-8 space-y-6 bg-dark-surface rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-dark-text-primary">Upload a New Video</h2>
        <p className="text-center text-dark-text-secondary">Share your content with the world</p>
        
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-sm">{error}</div>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-medium text-dark-text-secondary">Video File</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dark-element border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                          <VideoCameraIcon className="mx-auto h-12 w-12 text-dark-text-secondary"/>
                          <div className="flex text-sm text-gray-400">
                              <label htmlFor="video-file" className="relative cursor-pointer bg-dark-surface rounded-md font-medium text-brand-red hover:text-brand-red-dark focus-within:outline-none">
                                  <span>Upload a file</span>
                                  <input id="video-file" name="video-file" type="file" className="sr-only" accept="video/*" onChange={e => handleFileChange(e, 'video')}/>
                              </label>
                              <p className="pl-1">or drag and drop</p>
                          </div>
                          {videoFile && <p className="text-xs text-dark-text-secondary truncate">{videoFile.name}</p>}
                      </div>
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-dark-text-secondary">Thumbnail</label>
                   <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dark-element border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                           <PhotoIcon className="mx-auto h-12 w-12 text-dark-text-secondary"/>
                           <div className="flex text-sm text-gray-400">
                               <label htmlFor="thumbnail-file" className="relative cursor-pointer bg-dark-surface rounded-md font-medium text-brand-red hover:text-brand-red-dark focus-within:outline-none">
                                  <span>Upload image</span>
                                  <input id="thumbnail-file" name="thumbnail-file" type="file" className="sr-only" accept="image/*" onChange={e => handleFileChange(e, 'thumbnail')}/>
                              </label>
                           </div>
                           {thumbnailFile && <p className="text-xs text-dark-text-secondary truncate">{thumbnailFile.name}</p>}
                      </div>
                   </div>
              </div>
          </div>

          {(videoPreviewUrl || thumbnailPreviewUrl) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videoPreviewUrl && (
                  <div>
                      <h3 className="text-sm font-medium text-dark-text-secondary mb-2">Video Preview</h3>
                      <video ref={videoRef} src={videoPreviewUrl} controls className="w-full rounded-md aspect-video"></video>
                      <button type="button" onClick={captureThumbnail} className="mt-2 text-sm font-medium text-brand-red hover:underline">
                          Capture thumbnail from video
                      </button>
                      <canvas ref={canvasRef} className="hidden"></canvas>
                  </div>
              )}
              {thumbnailPreviewUrl && (
                  <div>
                      <h3 className="text-sm font-medium text-dark-text-secondary mb-2">Thumbnail Preview</h3>
                      <img src={thumbnailPreviewUrl} alt="Thumbnail Preview" className="w-full rounded-md aspect-video object-cover"/>
                  </div>
              )}
            </div>
          )}
          
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
            <label htmlFor="chapters" className="block text-sm font-medium text-dark-text-secondary">Chapters</label>
             <textarea id="chapters" value={chaptersText} onChange={(e) => setChaptersText(e.target.value)}
              placeholder="00:00 - Intro&#10;01:23 - The First Topic&#10;05:45 - Conclusion"
              className="mt-1 block w-full px-3 py-2 bg-dark-element border border-dark-element rounded-md font-mono text-xs" rows={4}></textarea>
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

           <div className="space-y-4 pt-4 border-t border-dark-element">
                <h3 className="font-semibold text-lg flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-brand-red"/> Advanced Options</h3>
                <div className="flex items-center gap-4">
                    <input type="checkbox" id="premiere" checked={isPremiere} onChange={e => setIsPremiere(e.target.checked)} className="h-4 w-4 rounded text-brand-red focus:ring-brand-red"/>
                    <label htmlFor="premiere">Schedule as a Premiere</label>
                </div>
                {isPremiere && (
                    <div className="pl-8">
                        <label className="text-sm">Premiere in (minutes):</label>
                        <input type="number" value={premiereMinutes} onChange={e => setPremiereMinutes(parseInt(e.target.value))} min={1} className="ml-2 bg-dark-element rounded-md px-2 py-1 w-24"/>
                    </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-dark-text-secondary">Video Watermark (Optional)</label>
                  <p className="text-xs text-dark-text-secondary">The watermark will be "burned" into your video (feature coming soon).</p>
                  <div className="mt-2 flex items-center gap-4">
                    <input type="file" id="watermark-file" className="text-sm" />
                    <select className="bg-dark-element rounded-md px-2 py-1 text-sm">
                      <option>Top Right</option>
                      <option>Top Left</option>
                      <option>Bottom Right</option>
                      <option>Bottom Left</option>
                    </select>
                  </div>
                </div>
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
              <ArrowUpTrayIcon className="w-5 h-5 mr-2"/>
              {loading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;