import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Video, Comment as CommentType, User } from '../types';
import { ShareIcon, PlusIcon, FolderPlusIcon, HandThumbUpIcon } from '@heroicons/react/24/solid';
import { AuthContext } from '../context/AuthContext';
import ReactPlayer from 'react-player/lazy';
import { fetchWithCache, clearCache } from '../utils/api';
import Comment from '../components/Comment';
import PlaylistModal from '../components/PlaylistModal';

const Watch: React.FC = () => {
  const { id: videoId } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [channel, setChannel] = useState<User | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  const { currentUser, login, updateUserSubscriptions } = useContext(AuthContext);

  const isSubscribed = currentUser && channel ? currentUser.subscriptions.includes(channel.id) : false;

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!videoId) return;
      setLoading(true);
      try {
        const videoData: Video = await fetchWithCache(`/api/v1/videos/${videoId}`);
        setVideo(videoData);

        const [channelData, commentsData, allVideosData] = await Promise.all([
          fetchWithCache(`/api/v1/users/${videoData.userId}`),
          fetchWithCache(`/api/v1/videos/${videoId}/comments`),
          fetchWithCache('/api/v1/videos')
        ]);

        setChannel(channelData);
        setComments(commentsData);
        setRecommendedVideos(allVideosData.filter((v: Video) => v.id !== videoId).slice(0, 10));

      } catch (error) {
        console.error("Failed to fetch video data:", error);
        setVideo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchVideoData();
  }, [videoId]);
  
  // Add to history
  useEffect(() => {
    if (currentUser && video) {
      const addToHistory = async () => {
        try {
          await fetch(`/api/v1/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, videoId: video.id }),
          });
          clearCache(`/api/v1/users/${currentUser.id}/history`);
        } catch (error) {
          console.error("Failed to add to history:", error);
        }
      };
      
      const timer = setTimeout(addToHistory, 5000); // Add to history after 5 seconds of watch time
      return () => clearTimeout(timer);
    }
  }, [currentUser, video]);


  const handleLike = async () => {
    if (!video) return;
    const originalLikes = video.likes;
    setVideo(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);

    try {
      const response = await fetch(`/api/v1/videos/${video.id}/like`, { method: 'POST' });
      if (!response.ok) {
        setVideo(prev => prev ? { ...prev, likes: originalLikes } : null);
      } else {
        clearCache(`/api/v1/videos/${video.id}`);
      }
    } catch {
       setVideo(prev => prev ? { ...prev, likes: originalLikes } : null);
    }
  };

  const handleSubscribe = async () => {
    if (!currentUser) return login("admin@vidstream.com", "password123");
    if (!channel) return;

    const originalSubscriptions = [...currentUser.subscriptions];
    const newSubscriptions = isSubscribed
        ? originalSubscriptions.filter(id => id !== channel.id)
        : [...originalSubscriptions, channel.id];
    
    updateUserSubscriptions(newSubscriptions);
    setChannel(prev => prev ? { ...prev, subscribers: prev.subscribers + (isSubscribed ? -1 : 1) } : null);

    try {
        const response = await fetch(`/api/v1/users/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, channelId: channel.id }),
        });
        if (!response.ok) {
            updateUserSubscriptions(originalSubscriptions);
            setChannel(prev => prev ? { ...prev, subscribers: prev.subscribers + (isSubscribed ? 1 : -1) } : null);
        } else {
            clearCache(`/api/v1/users/${currentUser.id}`);
            clearCache(`/api/v1/users/${channel.id}`);
        }
    } catch (error) {
        console.error("Subscription failed:", error);
        updateUserSubscriptions(originalSubscriptions);
    }
  };
  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || !video) return;
    
    const tempComment: CommentType = {
        id: `temp-${Date.now()}`,
        videoId: video.id,
        user: { id: currentUser.id, name: currentUser.name, avatarUrl: currentUser.avatarUrl || '' },
        text: newComment,
        timestamp: 'Just now'
    };

    setComments(prev => [tempComment, ...prev]);
    setNewComment("");

    try {
        const response = await fetch(`/api/v1/videos/${video.id}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, text: newComment }),
        });
        const actualComment = await response.json();
        
        setComments(prev => prev.map(c => c.id === tempComment.id ? actualComment : c));
        clearCache(`/api/v1/videos/${video.id}/comments`);

    } catch (error) {
        console.error("Failed to post comment:", error);
        setComments(prev => prev.filter(c => c.id !== tempComment.id));
    }
  };


  if (loading) return <WatchSkeleton />;
  if (!video || !channel) return <div className="p-8 text-center text-dark-text-secondary">Video not found.</div>;
  
  return (
    <>
    {isPlaylistModalOpen && video && (
        <PlaylistModal
            videoToAdd={video}
            onClose={() => setIsPlaylistModalOpen(false)}
        />
    )}
    <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
      <div className="flex-grow lg:w-2/3">
        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg shadow-brand-red/20">
            <ReactPlayer url={video.videoUrl} controls playing width="100%" height="100%" light={video.thumbnailUrl} />
        </div>
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-dark-text-primary">{video.title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
            <div className="flex items-center gap-4">
              <Link to={`/channel/${channel.id}`}>
                <img src={channel.avatarUrl} alt={channel.name} className="w-12 h-12 rounded-full" />
              </Link>
              <div>
                <Link to={`/channel/${channel.id}`} className="font-semibold text-lg hover:text-brand-red">{channel.name}</Link>
                <p className="text-sm text-dark-text-secondary">{channel.subscribers.toLocaleString()} subscribers</p>
              </div>
              <button 
                onClick={handleSubscribe}
                className={`${
                    isSubscribed
                      ? 'bg-dark-element text-dark-text-secondary'
                      : 'bg-dark-text-primary text-dark-bg'
                } font-semibold px-4 py-2 rounded-full ml-4 hover:bg-opacity-90 transition-colors`}>
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
            <div className="flex items-center gap-2">
               <button onClick={handleLike} className="flex items-center gap-2 px-4 py-1.5 bg-dark-element hover:bg-dark-surface rounded-full transition-colors">
                <HandThumbUpIcon className="w-5 h-5"/>
                <span className="text-sm font-semibold">{video.likes.toLocaleString()}</span>
              </button>
              <button onClick={() => setIsPlaylistModalOpen(true)} className="flex items-center gap-2 px-4 py-1.5 bg-dark-element hover:bg-dark-surface rounded-full transition-colors">
                <FolderPlusIcon className="w-5 h-5" />
                <span className="text-sm font-semibold">Save</span>
              </button>
               <button className="flex items-center gap-2 px-4 py-1.5 bg-dark-element hover:bg-dark-surface rounded-full ml-2">
                <ShareIcon className="w-5 h-5"/>
                <span className="text-sm">Share</span>
              </button>
            </div>
          </div>
          <div className="bg-dark-surface rounded-xl p-4 mt-4">
            <p className="font-semibold">{video.views} &bull; {video.uploadedAt}</p>
            <p className="mt-2 text-sm whitespace-pre-wrap text-dark-text-secondary">{video.description}</p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">{comments.length} Comments</h2>
            {currentUser && (
                <form onSubmit={handleCommentSubmit} className="flex items-start gap-4 mb-6">
                    <img src={currentUser.avatarUrl} alt="Your avatar" className="w-10 h-10 rounded-full"/>
                    <div className="flex-grow">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full bg-transparent border-b-2 border-dark-element focus:border-brand-red outline-none pb-1 transition-colors"
                        />
                        {newComment && (
                           <div className="flex justify-end gap-2 mt-2">
                             <button type="button" onClick={() => setNewComment('')} className="px-4 py-1.5 text-sm rounded-full hover:bg-dark-element">Cancel</button>
                             <button type="submit" className="px-4 py-1.5 text-sm rounded-full bg-brand-red hover:bg-brand-red-dark disabled:opacity-50" disabled={!newComment.trim()}>Comment</button>
                           </div>
                        )}
                    </div>
                </form>
            )}
            <div className="space-y-6">
                {comments.map(comment => <Comment key={comment.id} comment={comment}/>)}
            </div>
        </div>
      </div>
      <div className="lg:w-1/3">
        <h2 className="text-xl font-semibold mb-4 text-dark-text-primary">Up next</h2>
        <div className="flex flex-col gap-4">
          {recommendedVideos.map((recVideo) => (
            <Link to={`/watch/${recVideo.id}`} key={recVideo.id} className="flex gap-3 group hover:bg-dark-element p-2 rounded-lg transition-colors">
              <div className="w-40 flex-shrink-0 relative">
                <img src={recVideo.thumbnailUrl} alt={recVideo.title} className="w-full h-auto object-cover rounded-lg" />
                 <span className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
                  {recVideo.duration}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-dark-text-primary leading-snug line-clamp-2 group-hover:text-brand-red">{recVideo.title}</h3>
                <p className="text-xs text-dark-text-secondary mt-1">{recVideo.user.name}</p>
                <p className="text-xs text-dark-text-secondary">{recVideo.views}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

const WatchSkeleton: React.FC = () => (
    <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto animate-pulse">
      <div className="flex-grow lg:w-2/3">
        <div className="aspect-video bg-dark-element rounded-xl"></div>
        <div className="mt-4">
          <div className="h-8 bg-dark-element rounded w-3/4"></div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-dark-element"></div>
              <div className="space-y-2">
                <div className="h-4 bg-dark-element rounded w-28"></div>
                <div className="h-3 bg-dark-element rounded w-20"></div>
              </div>
            </div>
            <div className="h-10 bg-dark-element rounded-full w-24"></div>
          </div>
          <div className="bg-dark-surface rounded-xl p-4 mt-4 space-y-3">
            <div className="h-4 bg-dark-element rounded w-1/4"></div>
            <div className="h-3 bg-dark-element rounded w-full"></div>
            <div className="h-3 bg-dark-element rounded w-5/6"></div>
          </div>
        </div>
      </div>
      <div className="lg:w-1/3">
        <div className="h-6 bg-dark-element rounded w-1/3 mb-4"></div>
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-40 h-24 bg-dark-element rounded-lg flex-shrink-0"></div>
              <div className="flex-grow space-y-2">
                <div className="h-4 bg-dark-element rounded"></div>
                <div className="h-4 bg-dark-element rounded w-5/6"></div>
                <div className="h-3 bg-dark-element rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
);

export default Watch;