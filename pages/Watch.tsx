import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import type { Video, Comment as CommentType, User } from '../types';
import { ShareIcon, FolderPlusIcon, HandThumbUpIcon, ArrowDownTrayIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, HeartIcon, TicketIcon, PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, EllipsisHorizontalIcon, FlagIcon } from '@heroicons/react/24/solid';
import { AuthContext } from '../context/AuthContext';
import ReactPlayer from 'react-player/lazy';
import { fetchWithCache, clearCache } from '../utils/api';
import PlaylistModal from '../components/PlaylistModal';
import { PlayerContext } from '../context/PlayerContext';
import LiveChat from '../components/LiveChat';
import { DownloadsContext } from '../context/DownloadsContext';
import { AdContext } from '../context/AdContext';
import CommentThread from '../components/comments/CommentThread';
import PremiereCountdown from '../components/premiere/PremiereCountdown';
import Avatar from '../components/Avatar';
import ReportModal from '../components/ReportModal';

const Watch: React.FC = () => {
  const { id: videoId } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [channel, setChannel] = useState<User | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [reportingContent, setReportingContent] = useState<{id: string, type: 'video' | 'comment'} | null>(null);
  const [theatreMode, setTheatreMode] = useState(false);

  // Custom Player State
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState({ played: 0, playedSeconds: 0, loaded: 0, loadedSeconds: 0 });
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);


  const { currentUser, login, updateUserSubscriptions } = useContext(AuthContext);
  const { playVideo, currentVideo } = useContext(PlayerContext);
  const { downloads, addToDownloads, removeFromDownloads } = useContext(DownloadsContext);
  const { showAd, isAdPlaying } = useContext(AdContext);
  
  const location = useLocation();
  const playerRef = useRef<ReactPlayer>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const controlsTimeout = useRef<number | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const isDownloaded = downloads.some(d => d.id === videoId);
  const isSubscribed = currentUser && channel ? currentUser.subscriptions.includes(channel.id) : false;

  useEffect(() => {
    setPlaying(true); // Autoplay on new video load
    const fetchVideoData = async () => {
      if (!videoId) return;
      setLoading(true);
      try {
        const videoData: Video = await fetchWithCache(`/api/v1/videos/${videoId}`);
        setVideo(videoData);
        playVideo(videoData, location.pathname);

        const [channelData, commentsData, allVideosData] = await Promise.all([
          fetchWithCache(`/api/v1/users/${videoData.userId}`),
          fetchWithCache(`/api/v1/videos/${videoId}/comments`),
          fetchWithCache('/api/v1/videos')
        ]);

        setChannel(channelData);
        setComments(commentsData);
        setRecommendedVideos(allVideosData.filter((v: Video) => v.id !== videoId).slice(0, 10));

        showAd();

      } catch (error) {
        console.error("Failed to fetch video data:", error);
        setVideo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchVideoData();
  }, [videoId, playVideo, location.pathname, showAd]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = window.setTimeout(() => {
        setShowControls(false);
    }, 3000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        switch (e.key.toLowerCase()) {
            case 'f':
                toggleFullscreen();
                break;
            case 'm':
                 setMuted(prev => !prev);
                break;
            case 't':
                setTheatreMode(prev => !prev);
                break;
            case ' ':
            case 'k':
                e.preventDefault();
                setPlaying(p => !p);
                break;
            case 'arrowleft':
                playerRef.current?.seekTo(playerRef.current.getCurrentTime() - 5);
                break;
            case 'arrowright':
                playerRef.current?.seekTo(playerRef.current.getCurrentTime() + 5);
                break;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add to history
  useEffect(() => {
    if (currentUser && video && !isAdPlaying) {
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
  }, [currentUser, video, isAdPlaying]);


  const handleLike = async () => {
    if (!video) return;
    try {
      await fetch(`/api/v1/videos/${video.id}/like`, { method: 'POST' });
      setVideo(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      clearCache(`/api/v1/videos/${video.id}`);
    } catch (err){
       console.error("Failed to like video", err)
    }
  };

  const handleSubscribe = async () => {
    if (!currentUser) return login("admin@vidstream.com", "password123");
    if (!channel) return;
    try {
        await fetch(`/api/v1/users/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, channelId: channel.id }),
        });
        const newSubscriptions = isSubscribed
            ? currentUser.subscriptions.filter(id => id !== channel.id)
            : [...currentUser.subscriptions, channel.id];
        updateUserSubscriptions(newSubscriptions);
        setChannel(prev => prev ? { ...prev, subscribers: prev.subscribers + (isSubscribed ? -1 : 1) } : null);

        clearCache(`/api/v1/users/${currentUser.id}`);
        clearCache(`/api/v1/users/${channel.id}`);
    } catch (error) {
        console.error("Subscription failed:", error);
    }
  };

  const handleDownloadToggle = () => {
    if (!video) return;
    isDownloaded ? removeFromDownloads(video.id) : addToDownloads(video);
  }

  const handleSeekMouseDown = () => setSeeking(true);
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(prev => ({ ...prev, played: parseFloat(e.target.value) }));
  };
  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    playerRef.current?.seekTo(parseFloat((e.target as HTMLInputElement).value));
  };
  const toggleFullscreen = () => {
      if (playerWrapperRef.current) {
        if (!document.fullscreenElement) {
            playerWrapperRef.current.requestFullscreen().catch(err => {
              alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
      }
  };
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const isVideoInPlayer = currentVideo?.id === videoId;

  if (loading) return <WatchSkeleton />;
  if (!video || !channel) return <div className="p-8 text-center text-dark-text-secondary dark:text-dark-text-secondary">Video not found.</div>;
  
  const isPremiere = video.premiereTime && new Date(video.premiereTime) > new Date();
  
  return (
    <>
    {isPlaylistModalOpen && video && (
        <PlaylistModal
            videoToAdd={video}
            onClose={() => setIsPlaylistModalOpen(false)}
        />
    )}
    {reportingContent && (
        <ReportModal
            contentId={reportingContent.id}
            contentType={reportingContent.type}
            onClose={() => setReportingContent(null)}
        />
    )}
    <div className={`flex ${theatreMode ? 'flex-col' : 'flex-col lg:flex-row'} gap-6 p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto`}>
      <div className={`${theatreMode ? 'w-full' : 'lg:w-2/3'} flex-grow`}>
        {!isVideoInPlayer && (
            <div ref={playerWrapperRef} onMouseMove={handleMouseMove} className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative group">
                {isPremiere ? <PremiereCountdown premiereTime={video.premiereTime!} /> : (
                    <>
                    <ReactPlayer 
                        ref={playerRef}
                        url={video.videoUrl} 
                        controls={false}
                        playing={playing && !isAdPlaying}
                        volume={volume}
                        muted={muted}
                        onProgress={setProgress}
                        onDuration={setDuration}
                        width="100%" 
                        height="100%" 
                        light={video.thumbnailUrl} />

                    <div className={`absolute inset-0 transition-opacity duration-300 ${!playing || showControls ? 'opacity-100' : 'opacity-0'}`}>
                        {/* Play/Pause overlay button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button onClick={() => setPlaying(p => !p)} className="bg-black/50 p-4 rounded-full text-white">
                                {playing ? <PauseIcon className="w-10 h-10"/> : <PlayIcon className="w-10 h-10"/>}
                            </button>
                        </div>

                        {/* Controls */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                           <div className="flex items-center gap-4 text-white">
                               <button onClick={() => setPlaying(p => !p)}>
                                   {playing ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
                               </button>
                               <div className="flex items-center gap-2">
                                   <button onClick={() => setMuted(m => !m)}>
                                       {muted || volume === 0 ? <SpeakerXMarkIcon className="w-6 h-6"/> : <SpeakerWaveIcon className="w-6 h-6"/>}
                                   </button>
                                   <input type="range" min={0} max={1} step="any" value={muted ? 0 : volume} onChange={(e) => {setVolume(parseFloat(e.target.value)); setMuted(false);}} className="w-24 h-1 accent-brand-red"/>
                               </div>
                               <span className="text-xs">{formatTime(progress.playedSeconds)} / {formatTime(duration)}</span>
                               <div className="flex-grow mx-2">
                                   <input type="range" min={0} max={0.999999} step="any" value={progress.played}
                                   onMouseDown={handleSeekMouseDown}
                                   onChange={handleSeekChange}
                                   onMouseUp={handleSeekMouseUp}
                                   className="w-full h-1 accent-brand-red cursor-pointer" />
                               </div>
                               <button 
                                  onClick={() => setTheatreMode(!theatreMode)}
                                  className="p-1"
                                  title={theatreMode ? 'Default View' : 'Theatre Mode'}>
                                  {theatreMode ? <ArrowsPointingInIcon className="w-5 h-5"/> : <ArrowsPointingOutIcon className="w-5 h-5"/>}
                                </button>
                               <button onClick={toggleFullscreen} className="p-1"><ArrowsPointingOutIcon className="w-6 h-6"/></button>
                           </div>
                        </div>
                    </div>
                    </>
                )}
            </div>
        )}
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{video.title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
            <div className="flex items-center gap-4">
              <Link to={`/channel/${channel.id}`}>
                <Avatar user={channel} size="md" />
              </Link>
              <div>
                <Link to={`/channel/${channel.id}`} className="font-semibold text-lg hover:text-brand-red">{channel.name}</Link>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{channel.subscribers.toLocaleString()} subscribers</p>
              </div>
              <button 
                className={`font-semibold px-4 py-2 rounded-full ml-2 hover:opacity-90 transition-colors bg-light-surface dark:bg-dark-surface`}>
                Join
              </button>
              <button 
                onClick={handleSubscribe}
                className={`font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-colors ${
                    isSubscribed
                      ? 'bg-light-element dark:bg-dark-element text-light-text-secondary dark:text-dark-text-secondary'
                      : 'bg-light-text-primary dark:bg-dark-text-primary text-light-bg dark:text-dark-bg'
                }`}>
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
               <button onClick={handleLike} className="flex items-center gap-2 px-4 py-1.5 bg-light-element dark:bg-dark-element hover:bg-light-element/80 dark:hover:bg-dark-surface rounded-full transition-colors">
                <HandThumbUpIcon className="w-5 h-5"/>
                <span className="text-sm font-semibold">{video.likes.toLocaleString()}</span>
              </button>
              <button onClick={() => {}} className="flex items-center gap-2 px-4 py-1.5 bg-light-element dark:bg-dark-element hover:bg-light-element/80 dark:hover:bg-dark-surface rounded-full transition-colors">
                <HeartIcon className="w-5 h-5"/>
                <span className="text-sm font-semibold">Super Thanks</span>
              </button>
              <button onClick={() => setIsPlaylistModalOpen(true)} className="flex items-center gap-2 px-4 py-1.5 bg-light-element dark:bg-dark-element hover:bg-light-element/80 dark:hover:bg-dark-surface rounded-full transition-colors">
                <FolderPlusIcon className="w-5 h-5" />
                <span className="text-sm font-semibold">Save</span>
              </button>
               <button onClick={handleDownloadToggle} className="flex items-center gap-2 px-4 py-1.5 bg-light-element dark:bg-dark-element hover:bg-light-element/80 dark:hover:bg-dark-surface rounded-full transition-colors">
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span className="text-sm font-semibold">{isDownloaded ? 'Downloaded' : 'Download'}</span>
              </button>
              <div ref={actionsMenuRef} className="relative">
                <button onClick={() => setIsActionsMenuOpen(p => !p)} className="p-2 bg-light-element dark:bg-dark-element hover:bg-light-element/80 dark:hover:bg-dark-surface rounded-full transition-colors">
                    <EllipsisHorizontalIcon className="w-5 h-5"/>
                </button>
                 {isActionsMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-light-surface dark:bg-dark-surface rounded-md shadow-lg py-1 z-20 border border-light-element dark:border-dark-element">
                        <button onClick={() => { setReportingContent({id: video.id, type: 'video'}); setIsActionsMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-light-element dark:hover:bg-dark-element">
                            <FlagIcon className="w-5 h-5"/>
                            Report
                        </button>
                    </div>
                 )}
              </div>
            </div>
          </div>
          <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 mt-4">
            <p className="font-semibold">{video.views} &bull; {video.uploadedAt}</p>
            <p className="mt-2 text-sm whitespace-pre-wrap text-light-text-secondary dark:text-dark-text-secondary">{video.description}</p>
          </div>
          {/* Chapters Section */}
          {video.chapters && video.chapters.length > 0 && (
            <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 mt-4">
                <h3 className="font-semibold text-lg mb-2">Chapters</h3>
                <div className="space-y-2">
                    {video.chapters.map((chapter) => (
                        <button key={chapter.time} onClick={() => playerRef.current?.seekTo(chapter.time)} className="w-full text-left flex items-center gap-4 p-2 rounded-lg hover:bg-light-element dark:hover:bg-dark-element">
                           <span className="font-mono text-sm text-brand-red">{formatTime(chapter.time)}</span>
                           <span className="font-semibold">{chapter.title}</span>
                        </button>
                    ))}
                </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        {(!video.isLive && !isPremiere) && (
            <div className="mt-6">
                <CommentThread 
                    videoId={video.id} 
                    comments={comments} 
                    setComments={setComments}
                    onReportComment={(commentId) => setReportingContent({ id: commentId, type: 'comment' })}
                />
            </div>
        )}
      </div>
      <div className={`${theatreMode ? 'w-full mt-8' : 'lg:w-1/3'}`}>
        {video.isLive || (video.premiereTime && new Date(video.premiereTime) < new Date()) ? <LiveChat videoId={video.id}/> : (
            <>
                <h2 className="text-xl font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">Up next</h2>
                <div className="flex flex-col gap-4">
                {recommendedVideos.map((recVideo) => (
                    <Link to={`/watch/${recVideo.id}`} key={recVideo.id} className="flex gap-3 group hover:bg-light-element dark:hover:bg-dark-element p-2 rounded-lg transition-colors">
                    <div className="w-40 flex-shrink-0 relative">
                        <img src={recVideo.thumbnailUrl} alt={recVideo.title} className="w-full h-auto object-cover rounded-lg" />
                        <span className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
                        {recVideo.duration}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary leading-snug line-clamp-2 group-hover:text-brand-red">{recVideo.title}</h3>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">{recVideo.user.name}</p>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{recVideo.views}</p>
                    </div>
                    </Link>
                ))}
                </div>
            </>
        )}
      </div>
    </div>
    </>
  );
};

const WatchSkeleton: React.FC = () => (
    <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto animate-pulse">
      <div className="flex-grow lg:w-2/3">
        <div className="aspect-video bg-light-element dark:bg-dark-element rounded-xl"></div>
        <div className="mt-4">
          <div className="h-8 bg-light-element dark:bg-dark-element rounded w-3/4"></div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-light-element dark:bg-dark-element"></div>
              <div className="space-y-2">
                <div className="h-4 bg-light-element dark:bg-dark-element rounded w-28"></div>
                <div className="h-3 bg-light-element dark:bg-dark-element rounded w-20"></div>
              </div>
            </div>
            <div className="h-10 bg-light-element dark:bg-dark-element rounded-full w-24"></div>
          </div>
          <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 mt-4 space-y-3">
            <div className="h-4 bg-light-element dark:bg-dark-element rounded w-1/4"></div>
            <div className="h-3 bg-light-element dark:bg-dark-element rounded w-full"></div>
            <div className="h-3 bg-light-element dark:bg-dark-element rounded w-5/6"></div>
          </div>
        </div>
      </div>
      <div className="lg:w-1/3">
        <div className="h-6 bg-light-element dark:bg-dark-element rounded w-1/3 mb-4"></div>
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-40 h-24 bg-light-element dark:bg-dark-element rounded-lg flex-shrink-0"></div>
              <div className="flex-grow space-y-2">
                <div className="h-4 bg-light-element dark:bg-dark-element rounded"></div>
                <div className="h-4 bg-light-element dark:bg-dark-element rounded w-5/6"></div>
                <div className="h-3 bg-light-element dark:bg-dark-element rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
);

export default Watch;