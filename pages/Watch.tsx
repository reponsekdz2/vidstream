import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import type { Video, Comment as CommentType, User, TranscriptLine, VideoQuality, Clip } from '../types';
import { ShareIcon, FolderPlusIcon, HandThumbUpIcon, ArrowDownTrayIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, HeartIcon, TicketIcon, PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, EllipsisHorizontalIcon, FlagIcon, ListBulletIcon, Cog6ToothIcon, ScissorsIcon, BackwardIcon, ForwardIcon } from '@heroicons/react/24/solid';
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
import QueuePanel from '../components/QueuePanel';
import BecomeMemberPrompt from '../components/BecomeMemberPrompt';
import SuperThanksModal from '../components/SuperThanksModal';
import VideoTranscript from '../components/VideoTranscript';
import ClipCreator from '../components/ClipCreator';

const Watch: React.FC = () => {
  const { id: videoId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [channel, setChannel] = useState<User | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isSuperThanksModalOpen, setIsSuperThanksModalOpen] = useState(false);
  const [isClipCreatorOpen, setIsClipCreatorOpen] = useState(false);
  const [reportingContent, setReportingContent] = useState<{id: string, type: 'video' | 'comment'} | null>(null);
  const [theatreMode, setTheatreMode] = useState(false);
  const [activeTab, setActiveTab] = useState('up-next');

  // Custom Player State
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState({ played: 0, playedSeconds: 0, loaded: 0, loadedSeconds: 0 });
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState<VideoQuality>('1080p');

  const { currentUser, login, updateUserSubscriptions } = useContext(AuthContext);
  const { playVideo, currentVideo, playNext, addToQueue, queue } = useContext(PlayerContext);
  const { downloads, addToDownloads, removeFromDownloads } = useContext(DownloadsContext);
  const { showAd, isAdPlaying } = useContext(AdContext);
  
  const location = useLocation();
  const playerRef = useRef<ReactPlayer>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const controlsTimeout = useRef<number | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const ambientCanvasRef = useRef<HTMLCanvasElement>(null);

  const isDownloaded = downloads.some(d => d.id === videoId);
  const isSubscribed = currentUser && channel ? currentUser.subscriptions.includes(channel.id) : false;
  const isMember = currentUser && channel ? currentUser.memberships.some(m => m.channelId === channel.id) : false;
  const canWatch = video?.visibility === 'public' || (video?.visibility === 'members-only' && isMember);

  useEffect(() => {
    setPlaying(true);
    const fetchVideoData = async () => {
      if (!videoId) return;
      setLoading(true);
      try {
        const videoData: Video = await fetchWithCache(`/api/v1/videos/${videoId}`);
        setVideo(videoData);
        playVideo(videoData, location.pathname);

        const [channelData, commentsData, allVideosData] = await Promise.all([
          fetchWithCache(`/api/v1/users/${videoData.userId}`),
          fetchWithCache(`/api/v1/comments/video/${videoData.id}`),
          fetchWithCache('/api/v1/videos')
        ]);

        setChannel(channelData);
        setComments(commentsData);
        setRecommendedVideos(allVideosData.filter((v: Video) => v.id !== videoId && v.visibility === 'public').slice(0, 10));
        
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
  
  // Ambient Mode Effect
  useEffect(() => {
    const videoElement = playerRef.current?.getInternalPlayer() as HTMLVideoElement;
    const canvas = ambientCanvasRef.current;
    if (!videoElement || !canvas || !playing) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;

    const draw = () => {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
        cancelAnimationFrame(animationFrameId);
    };
  }, [playing, video]);
  
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = window.setTimeout(() => {
        if (playing) setShowControls(false);
    }, 3000);
  };
  
  const handleSeek = (time: number) => {
    playerRef.current?.seekTo(time);
    setPlaying(true);
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

  if (loading) return <WatchSkeleton />;
  if (!video || !channel) return <div className="p-8 text-center text-dark-text-secondary dark:text-dark-text-secondary">Video not found.</div>;
  
  const isPremiere = video.premiereTime && new Date(video.premiereTime) > new Date();

  return (
    <>
      {isPlaylistModalOpen && <PlaylistModal videoToAdd={video} onClose={() => setIsPlaylistModalOpen(false)} />}
      {reportingContent && <ReportModal contentId={reportingContent.id} contentType={reportingContent.type} onClose={() => setReportingContent(null)} />}
      {isSuperThanksModalOpen && <SuperThanksModal video={video} onClose={() => setIsSuperThanksModalOpen(false)} onSuccess={(newComment) => setComments(prev => [newComment, ...prev])} />}
      {isClipCreatorOpen && <ClipCreator video={video} onClose={() => setIsClipCreatorOpen(false)} />}

      <div className={`flex ${theatreMode ? 'flex-col' : 'flex-col lg:flex-row'} gap-6 p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto`}>
        <div className={`${theatreMode ? 'w-full' : 'lg:w-2/3'} flex-grow`}>
          <div ref={playerWrapperRef} onMouseMove={handleMouseMove} onMouseLeave={() => playing && setShowControls(false)} className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative group">
            <canvas ref={ambientCanvasRef} className="absolute inset-[-50px] w-[calc(100%+100px)] h-[calc(100%+100px)] blur-2xl opacity-30 z-0" width="32" height="18"></canvas>
            
            {isPremiere ? <PremiereCountdown premiereTime={video.premiereTime!} /> : !canWatch ? <BecomeMemberPrompt channel={channel} /> : (
              <>
                <ReactPlayer 
                    ref={playerRef}
                    url={video.sources[quality]} 
                    controls={false}
                    playing={playing && !isAdPlaying}
                    volume={volume}
                    muted={muted}
                    onProgress={setProgress}
                    onDuration={setDuration}
                    onEnded={() => playNext() ? navigate(`/watch/${queue[0].id}`) : setPlaying(false)}
                    width="100%" 
                    height="100%"
                    playbackRate={playbackRate}
                    className="relative z-10"
                />
                <div className={`absolute inset-0 z-20 transition-opacity duration-300 ${!playing || showControls ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 flex items-center justify-center" onClick={() => setPlaying(p => !p)}>
                        {!playing && <button className="bg-black/50 p-4 rounded-full text-white"><PlayIcon className="w-10 h-10"/></button>}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                       <input type="range" min={0} max={0.999999} step="any" value={progress.played}
                           onMouseDown={() => setSeeking(true)}
                           onChange={(e) => setProgress(prev => ({ ...prev, played: parseFloat(e.target.value) }))}
                           onMouseUp={(e) => { setSeeking(false); playerRef.current?.seekTo(parseFloat((e.target as HTMLInputElement).value)); }}
                           className="w-full h-1 accent-brand-red cursor-pointer absolute bottom-14 left-0 right-0" />
                       <div className="flex items-center gap-4 text-white">
                           <button onClick={() => setPlaying(p => !p)}>{playing ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}</button>
                           <button onClick={() => handleSeek(progress.playedSeconds + 10)}><ForwardIcon className="w-6 h-6"/></button>
                           <div className="flex items-center gap-2">
                               <button onClick={() => setMuted(m => !m)}>{muted || volume === 0 ? <SpeakerXMarkIcon className="w-6 h-6"/> : <SpeakerWaveIcon className="w-6 h-6"/>}</button>
                           </div>
                           <span className="text-xs">{formatTime(progress.playedSeconds)} / {formatTime(duration)}</span>
                           <div className="flex-grow"></div>
                           <div className="relative">
                               <button onClick={() => setIsSettingsOpen(p => !p)}><Cog6ToothIcon className="w-6 h-6"/></button>
                               {isSettingsOpen && (
                                   <div className="absolute bottom-full right-0 mb-2 w-40 bg-black/80 rounded-lg p-2 text-sm">
                                       <div className="mb-2">
                                          <label>Speed</label>
                                          <select value={playbackRate} onChange={e => setPlaybackRate(parseFloat(e.target.value))} className="bg-transparent w-full">
                                              {[0.5, 1, 1.5, 2].map(s => <option key={s} value={s}>{s}x</option>)}
                                          </select>
                                       </div>
                                       <div>
                                          <label>Quality</label>
                                           <select value={quality} onChange={e => setQuality(e.target.value as VideoQuality)} className="bg-transparent w-full">
                                               {Object.keys(video.sources).map(q => <option key={q} value={q}>{q}</option>)}
                                           </select>
                                       </div>
                                   </div>
                               )}
                           </div>
                           <button onClick={() => (playerRef.current?.getInternalPlayer() as any)?.requestPictureInPicture()}><ArrowsPointingOutIcon className="w-6 h-6"/></button>
                           <button onClick={() => setTheatreMode(!theatreMode)}>{theatreMode ? <ArrowsPointingInIcon className="w-6 h-6"/> : <ArrowsPointingOutIcon className="w-6 h-6"/>}</button>
                           <button onClick={() => playerWrapperRef.current?.requestFullscreen()}><ArrowsPointingOutIcon className="w-6 h-6"/></button>
                       </div>
                    </div>
                </div>
              </>
            )}
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{video.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
              <div className="flex items-center gap-4">
                <Link to={`/channel/${channel.id}`}><Avatar user={channel} size="md" /></Link>
                <div>
                  <Link to={`/channel/${channel.id}`} className="font-semibold text-lg hover:text-brand-red">{channel.name}</Link>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{channel.subscribers.toLocaleString()} subscribers</p>
                </div>
                <button className={`font-semibold px-4 py-2 rounded-full ml-2 hover:opacity-90 transition-colors bg-light-surface dark:bg-dark-surface`}>Join</button>
                <button onClick={() => isSubscribed ? {} : {}} className={`font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-colors ${ isSubscribed ? 'bg-light-element dark:bg-dark-element' : 'bg-light-text-primary dark:bg-dark-text-primary text-light-bg dark:text-dark-bg'}`}>
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                 <button onClick={() => {}} className="flex items-center gap-2 px-4 py-1.5 bg-light-element dark:bg-dark-element hover:bg-dark-surface rounded-full"><HandThumbUpIcon className="w-5 h-5"/> {video.likes.toLocaleString()}</button>
                 <button onClick={() => setIsSuperThanksModalOpen(true)} className="flex items-center gap-2 px-4 py-1.5 bg-light-element dark:bg-dark-element hover:bg-dark-surface rounded-full"><HeartIcon className="w-5 h-5"/> Thanks</button>
                 <button onClick={() => setIsClipCreatorOpen(true)} className="flex items-center gap-2 px-4 py-1.5 bg-light-element dark:bg-dark-element hover:bg-dark-surface rounded-full"><ScissorsIcon className="w-5 h-5"/> Clip</button>
                 <button onClick={() => setIsPlaylistModalOpen(true)} className="flex items-center gap-2 px-4 py-1.5 bg-light-element dark:bg-dark-element hover:bg-dark-surface rounded-full"><FolderPlusIcon className="w-5 h-5" /> Save</button>
                 <button onClick={() => {}} className="flex items-center gap-2 px-4 py-1.5 bg-light-element dark:bg-dark-element hover:bg-dark-surface rounded-full"><ArrowDownTrayIcon className="w-5 h-5" /> {isDownloaded ? 'Downloaded' : 'Download'}</button>
              </div>
            </div>
          </div>
          {(!video.isLive && !isPremiere && canWatch) && <CommentThread videoId={video.id} comments={comments} setComments={setComments} onReportComment={(commentId) => setReportingContent({ id: commentId, type: 'comment' })} />}
        </div>
        <div className={`${theatreMode ? 'w-full mt-8' : 'lg:w-1/3'}`}>
          {video.isLive || (video.premiereTime && new Date(video.premiereTime) < new Date()) ? <LiveChat videoId={video.id}/> : (
              <>
                 <div className="flex border-b border-dark-element mb-4">
                    <button onClick={() => setActiveTab('up-next')} className={`px-4 py-2 ${activeTab === 'up-next' ? 'border-b-2 border-white' : ''}`}>Up Next</button>
                    <button onClick={() => setActiveTab('transcript')} className={`px-4 py-2 ${activeTab === 'transcript' ? 'border-b-2 border-white' : ''}`}>Transcript</button>
                 </div>
                 {activeTab === 'up-next' ? (
                     <>
                        {queue.length > 0 && <QueuePanel />}
                        <div className="flex flex-col gap-4">
                        {recommendedVideos.map((recVideo) => (
                            <Link to={`/watch/${recVideo.id}`} key={recVideo.id} className="flex gap-3 group hover:bg-dark-element p-2 rounded-lg">
                              <div className="w-40 flex-shrink-0 relative"><img src={recVideo.thumbnailUrl} alt={recVideo.title} className="w-full h-auto object-cover rounded-lg" /><span className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1.5 py-0.5 rounded">{recVideo.duration}</span></div>
                              <div><h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-brand-red">{recVideo.title}</h3><p className="text-xs text-dark-text-secondary mt-1">{recVideo.user.name}</p><p className="text-xs text-dark-text-secondary">{recVideo.views}</p></div>
                            </Link>
                        ))}
                        </div>
                    </>
                 ) : (
                    <VideoTranscript videoId={video.id} currentTime={progress.playedSeconds} onSeek={handleSeek} />
                 )}
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
