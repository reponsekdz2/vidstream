import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import type { User, Video, Report, Comment } from '../types';
import { ShieldCheckIcon, UserGroupIcon, PlayCircleIcon, EyeIcon, HandThumbUpIcon, ChatBubbleOvalLeftEllipsisIcon, TrashIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import Avatar from '../components/Avatar';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard: React.FC = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Analytics');

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'ADMIN') {
            navigate('/');
        }
    }, [currentUser, navigate]);

    if (!currentUser || currentUser.role !== 'ADMIN') {
        return <div className="p-8 text-center">Redirecting...</div>;
    }

    const tabs = ['Analytics', 'Users', 'Videos', 'Moderation'];

    const renderContent = () => {
        switch(activeTab) {
            case 'Analytics':
                return <AnalyticsTab />;
            case 'Users':
                return <UserManagementTab />;
            case 'Videos':
                return <VideoManagementTab />;
            case 'Moderation':
                return <ModerationTab />;
            default:
                return null;
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <ShieldCheckIcon className="w-8 h-8 text-brand-red" />
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>

            <div className="border-b border-light-element dark:border-dark-element mb-6">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`${activeTab === tab ? 'border-brand-red text-brand-red' : 'border-transparent'} py-4 px-1 border-b-2 font-medium`}>
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div>{renderContent()}</div>
        </div>
    );
};

const adminFetch = async (url: string, options: RequestInit = {}) => {
    const user = JSON.parse(localStorage.getItem('vidstream-user') || '{}');
    const adminId = user.id;

    if (!adminId) {
        throw new Error("Admin user not found in local storage.");
    }
    
    const headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        'x-admin-id': adminId
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    if (response.status !== 204) { // No Content
        return response.json();
    }
    return null;
};

// --- Analytics Tab ---
const AnalyticsTab: React.FC = () => {
    const [analytics, setAnalytics] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await adminFetch('/api/v1/admin/analytics');
                setAnalytics(data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading analytics...</div>;
    if (!analytics) return <div>Could not load analytics.</div>;

    const stats = [
        { icon: UserGroupIcon, label: 'Total Users', value: analytics.totalUsers },
        { icon: PlayCircleIcon, label: 'Total Videos', value: analytics.totalVideos },
        { icon: EyeIcon, label: 'Total Views', value: analytics.totalViews },
        { icon: HandThumbUpIcon, label: 'Total Likes', value: analytics.totalLikes },
        { icon: ChatBubbleOvalLeftEllipsisIcon, label: 'Total Comments', value: analytics.totalComments },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {stats.map(stat => (
                <div key={stat.label} className="bg-dark-surface p-6 rounded-lg flex items-center gap-4">
                    <div className="bg-dark-element p-3 rounded-full">
                        <stat.icon className="w-6 h-6 text-brand-red" />
                    </div>
                    <div>
                        <p className="text-sm text-dark-text-secondary">{stat.label}</p>
                        <p className="text-2xl font-bold text-dark-text-primary">{stat.value.toLocaleString()}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- User Management Tab ---
const UserManagementTab: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await adminFetch('/api/v1/admin/users');
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (userId: string) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            try {
                await adminFetch(`/api/v1/admin/users/${userId}`, { method: 'DELETE' });
                setUsers(prev => prev.filter(u => u.id !== userId));
            } catch (error) {
                console.error("Failed to delete user", error);
                alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    };
    
    if (loading) return <div>Loading users...</div>;

    return (
        <div className="bg-dark-surface rounded-lg overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-dark-element">
                    <tr>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Subscribers</th>
                        <th className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="border-b border-dark-element hover:bg-dark-element/50">
                            <td className="px-6 py-4 flex items-center gap-3">
                                <Avatar user={user} size="sm" /> {user.name}
                            </td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'ADMIN' ? 'bg-brand-red/50 text-brand-red' : 'bg-dark-element'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4">{user.subscribers.toLocaleString()}</td>
                            <td className="px-6 py-4">
                                <button onClick={() => handleDelete(user.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Video Management Tab ---
const VideoManagementTab: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

     useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        setLoading(true);
        try {
            const data = await adminFetch('/api/v1/admin/videos');
            setVideos(data);
        } catch (error) {
            console.error("Failed to fetch videos", error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (videoId: string) => {
        if (window.confirm("Are you sure you want to delete this video?")) {
            try {
                await adminFetch(`/api/v1/admin/videos/${videoId}`, { method: 'DELETE' });
                setVideos(prev => prev.filter(v => v.id !== videoId));
            } catch (error) {
                console.error("Failed to delete video", error);
            }
        }
    };

    if (loading) return <div>Loading videos...</div>;

     return (
        <div className="bg-dark-surface rounded-lg overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-dark-element">
                    <tr>
                        <th className="px-6 py-3">Video</th>
                        <th className="px-6 py-3">Uploader</th>
                        <th className="px-6 py-3">Views</th>
                        <th className="px-6 py-3">Likes</th>
                        <th className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {videos.map(video => (
                        <tr key={video.id} className="border-b border-dark-element hover:bg-dark-element/50">
                            <td className="px-6 py-4">
                               <Link to={`/watch/${video.id}`} className="flex items-center gap-3 group">
                                    <img src={video.thumbnailUrl} alt={video.title} className="w-24 h-14 object-cover rounded"/>
                                    <p className="font-semibold group-hover:text-brand-red line-clamp-1">{video.title}</p>
                                </Link>
                            </td>
                            <td className="px-6 py-4">{video.user.name}</td>
                            <td className="px-6 py-4">{video.viewCount.toLocaleString()}</td>
                            <td className="px-6 py-4">{video.likes.toLocaleString()}</td>
                            <td className="px-6 py-4">
                                <button onClick={() => handleDelete(video.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Moderation Tab ---
const ModerationTab: React.FC = () => {
    const [subTab, setSubTab] = useState('Reported Content');
    return (
        <div>
            <div className="flex space-x-4 mb-4">
                <button onClick={() => setSubTab('Reported Content')} className={`px-3 py-1 text-sm rounded-full ${subTab === 'Reported Content' ? 'bg-brand-red' : 'bg-dark-surface'}`}>Reported Content</button>
                <button onClick={() => setSubTab('Comment Search')} className={`px-3 py-1 text-sm rounded-full ${subTab === 'Comment Search' ? 'bg-brand-red' : 'bg-dark-surface'}`}>Comment Search</button>
            </div>
            {subTab === 'Reported Content' && <ReportedContent />}
            {subTab === 'Comment Search' && <CommentSearch />}
        </div>
    );
};

const ReportedContent: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await adminFetch('/api/v1/admin/reports');
            setReports(data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleDismiss = async (reportId: string) => {
        await adminFetch(`/api/v1/admin/reports/${reportId}`, { method: 'PUT' });
        setReports(prev => prev.filter(r => r.id !== reportId));
    };
    
    const handleDelete = async (report: Report) => {
        if(window.confirm("Are you sure you want to DELETE this content?")){
            if(report.contentType === 'video') {
                await adminFetch(`/api/v1/admin/videos/${report.contentId}`, { method: 'DELETE' });
            } else {
                await adminFetch(`/api/v1/admin/comments/${report.contentId}`, { method: 'DELETE' });
            }
            await handleDismiss(report.id);
        }
    };

    if (loading) return <div>Loading reports...</div>
    if (reports.length === 0) return <div className="bg-dark-surface rounded-lg p-6 text-center">No pending reports.</div>

    return (
        <div className="bg-dark-surface rounded-lg overflow-x-auto">
            <table className="w-full text-sm text-left">
                 <thead className="text-xs uppercase bg-dark-element">
                    <tr>
                        <th className="px-6 py-3">Reported Content</th>
                        <th className="px-6 py-3">Reason</th>
                        <th className="px-6 py-3">Reported</th>
                        <th className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map(report => (
                        <tr key={report.id} className="border-b border-dark-element">
                            <td className="px-6 py-4">
                                {report.contentDetails && report.contentType === 'video' && <VideoReportItem video={report.contentDetails as Video} />}
                                {report.contentDetails && report.contentType === 'comment' && <CommentReportItem comment={report.contentDetails as Comment} />}
                                {!report.contentDetails && <p className="text-red-500">Content has been deleted.</p>}
                            </td>
                            <td className="px-6 py-4">{report.reason}</td>
                            <td className="px-6 py-4">{formatDistanceToNow(new Date(report.timestamp), { addSuffix: true })}</td>
                            <td className="px-6 py-4 space-x-2">
                               <button onClick={() => handleDismiss(report.id)} title="Dismiss Report" className="p-2 text-green-500 hover:bg-green-500/10 rounded-full"><CheckCircleIcon className="w-5 h-5"/></button>
                               <button onClick={() => handleDelete(report)} title="Delete Content" className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
};

const VideoReportItem: React.FC<{video: Video}> = ({video}) => (
    <Link to={`/watch/${video.id}`} target="_blank" className="flex items-center gap-3 group">
        <img src={video.thumbnailUrl} alt={video.title} className="w-24 h-14 object-cover rounded"/>
        <div>
            <p className="font-semibold group-hover:text-brand-red line-clamp-1">{video.title}</p>
            <p className="text-xs">{video.user.name}</p>
        </div>
    </Link>
);
const CommentReportItem: React.FC<{comment: Comment}> = ({comment}) => (
    <Link to={`/watch/${comment.videoId}`} target="_blank" className="group">
        <p className="italic">"{comment.text}"</p>
        <p className="text-xs mt-1">by <span className="font-semibold">{comment.user.name}</span></p>
    </Link>
);


const CommentSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        try {
            const data = await adminFetch(`/api/v1/admin/comments/search?q=${query}`);
            setResults(data);
        } catch(error) { console.error(error); } finally { setLoading(false); }
    };
    
    const handleDelete = async (commentId: string) => {
        await adminFetch(`/api/v1/admin/comments/${commentId}`, { method: 'DELETE' });
        setResults(prev => prev.filter(c => c.id !== commentId));
    };

    return (
        <div className="bg-dark-surface rounded-lg p-6">
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search comments..." className="flex-grow bg-dark-element rounded-md px-3 py-2" />
                <button type="submit" className="p-2 bg-brand-red rounded-md"><MagnifyingGlassIcon className="w-5 h-5"/></button>
            </form>
             {loading && <p>Searching...</p>}
            <div className="space-y-4">
                {results.map(comment => (
                    <div key={comment.id} className="flex justify-between items-start p-3 bg-dark-element rounded">
                        <div>
                            <p>"{comment.text}"</p>
                            <p className="text-xs text-dark-text-secondary mt-1">by {comment.user.name} on <Link to={`/watch/${comment.videoId}`} className="underline">video</Link></p>
                        </div>
                        <button onClick={() => handleDelete(comment.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full flex-shrink-0 ml-4"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default AdminDashboard;