import React, { useState, useContext, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCache } from '../utils/api';
import { ArrowUpTrayIcon, VideoCameraIcon, SparklesIcon, EyeIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';

const Upload: React.FC = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [genre, setGenre] = useState('Lifestyle');
  const [chaptersText, setChaptersText] = useState('');
  const [isPremiere, setIsPremiere] = useState(false);
  const [premiereMinutes, setPremiereMinutes] =useState(30);
  const [visibility, setVisibility] = useState<'public' | 'members-only'>('public');

  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
 
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'video' | 'transcript') => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileType === 'video') {
          setVideoFile(file);
          setVideoPreviewUrl(URL.createObjectURL(file));
      } else {
          setTranscriptFile(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError("You must be logged in to upload a video.");
      return;
    }
    if (!videoFile) {
        setError("A video file is required.");
        return;
    }
    setError('');
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('userId', currentUser.id);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('genre', genre);
    formData.append('chapters', chaptersText);
    formData.append('visibility', visibility);
    formData.append('videoFile', videoFile);
    if (transcriptFile) {
        formData.append('transcriptFile', transcriptFile);
    }

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
        setIsUploading(false);
        if (xhr.status === 201) {
            setIsProcessing(true); // Start processing phase
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
            
            // In a real app with websockets, you'd wait for a "processing complete" event.
            // Here, we'll just navigate after a simulated delay.
            setTimeout(() => {
                setIsProcessing(false);
                navigate(`/watch/${newVideo.id}`);
            }, 5000); // Simulate 5 seconds of backend processing

        } else {
            const errData = JSON.parse(xhr.responseText);
            setError(errData.message || 'Failed to upload video.');
        }
      };
      
      xhr.onerror = () => {
          setIsUploading(false);
          setError('An error occurred during the upload. Please try again.');
      };

      xhr.send(formData);

    } catch (err: any) {
      setIsUploading(false);
      setError(err.message);
    }
  };

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  const loading = isUploading || isProcessing;
  
  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <div className="w-full max-w-4xl p-8 space-y-6 bg-dark-surface rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-dark-text-primary">Upload a New Video</h2>
        <p className="text-center text-dark-text-secondary">Share your content with the world</p>
        
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-sm">{error}</div>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-medium text-dark-text-secondary">Video File*</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dark-element border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                          <VideoCameraIcon className="mx-auto h-12 w-12 text-dark-text-secondary"/>
                          <div className="flex text-sm text-gray-400">
                              <label htmlFor="video-file" className="relative cursor-pointer bg-dark-surface rounded-md font-medium text-brand-red hover:text-brand-red-dark focus-within:outline-none">
                                  <span>Upload a file</span>
                                  <input id="video-file" name="video-file" type="file" className="sr-only" accept="video/*" required onChange={e => handleFileChange(e, 'video')}/>
                              </label>
                              <p className="pl-1">or drag and drop</p>
                          </div>
                          {videoFile && <p className="text-xs text-dark-text-secondary truncate">{videoFile.name}</p>}
                      </div>
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-dark-text-secondary">Transcript File (Optional, .vtt)</label>
                   <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dark-element border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                           <ChatBubbleBottomCenterTextIcon className="mx-auto h-12 w-12 text-dark-text-secondary"/>
                           <div className="flex text-sm text-gray-400">
                               <label htmlFor="transcript-file" className="relative cursor-pointer bg-dark-surface rounded-md font-medium text-brand-red hover:text-brand-red-dark focus-within:outline-none">
                                  <span>Upload VTT file</span>
                                  <input id="transcript-file" name="transcript-file" type="file" className="sr-only" accept=".vtt" onChange={e => handleFileChange(e, 'transcript')}/>
                              </label>
                           </div>
                           {transcriptFile && <p className="text-xs text-dark-text-secondary truncate">{transcriptFile.name}</p>}
                      </div>
                   </div>
              </div>
          </div>
           <p className="text-xs text-center text-dark-text-secondary">Thumbnail will be generated automatically from the video.</p>

          {videoPreviewUrl && (
            <div>
                <h3 className="text-sm font-medium text-dark-text-secondary mb-2">Video Preview</h3>
                <video src={videoPreviewUrl} controls className="w-full rounded-md aspect-video"></video>
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
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <label htmlFor="visibility" className="block text-sm font-medium text-dark-text-secondary">Visibility</label>
                <select id="visibility" value={visibility} onChange={(e) => setVisibility(e.target.value as 'public' | 'members-only')}
                  className="mt-1 block w-full px-3 py-2 bg-dark-element border border-dark-element rounded-md">
                    <option value="public">Public</option>
                    <option value="members-only">Members-Only</option>
                </select>
              </div>
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
           </div>
          
          {isUploading && (
            <div>
                <p className="text-center text-sm mb-1">Uploading...</p>
                <div className="w-full bg-dark-element rounded-full h-2.5">
                    <div className="bg-brand-red h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="text-center text-sm mt-1">{uploadProgress}%</p>
            </div>
          )}
          {isProcessing && (
              <div className="text-center text-sm p-4 bg-dark-element rounded-md">
                <p>Upload complete! Processing video... (Generating thumbnail &amp; different quality versions). You will be redirected shortly.</p>
              </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-red hover:bg-brand-red-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-red disabled:opacity-50"
            >
              <ArrowUpTrayIcon className="w-5 h-5 mr-2"/>
              {loading ? (isProcessing ? 'Processing...' : 'Uploading...') : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;