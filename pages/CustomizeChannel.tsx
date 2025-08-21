import React, { useState, useContext, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCache, fetchWithCache } from '../utils/api';
import type { Video, Playlist, ChannelLayoutShelf, MembershipTier } from '../types';
import Avatar from '../components/Avatar';
import { v4 as uuidv4 } from 'uuid';
import { TrashIcon, Bars3Icon, PlusIcon } from '@heroicons/react/24/solid';

const CustomizeChannel: React.FC = () => {
    const { currentUser, updateCurrentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Layout');
    
    // Form State
    const [name, setName] = useState(currentUser?.name || '');
    const [about, setAbout] = useState(currentUser?.about || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [featuredVideoId, setFeaturedVideoId] = useState(currentUser?.featuredVideoId || '');
    const [socialLinks, setSocialLinks] = useState(currentUser?.socialLinks || { twitter: '', instagram: '' });
    const [layout, setLayout] = useState<ChannelLayoutShelf[]>(currentUser?.channelLayout || []);
    const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
    
    // UI State
    const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatarUrl || '');
    const [bannerPreview, setBannerPreview] = useState(currentUser?.bannerUrl || '');
    const [userVideos, setUserVideos] = useState<Video[]>([]);
    const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (currentUser) {
                const [videos, playlists, tiers] = await Promise.all([
                    fetchWithCache(`/api/v1/users/${currentUser.id}/videos`),
                    fetchWithCache(`/api/v1/playlists?userId=${currentUser.id}`),
                    fetchWithCache(`/api/v1/monetization/${currentUser.id}/memberships`)
                ]);
                setUserVideos(videos);
                setUserPlaylists(playlists);
                setMembershipTiers(tiers);
            }
        };
        fetchData();
    }, [currentUser]);
    
    const handleAddShelf = (type: 'LATEST_UPLOADS' | 'POPULAR_UPLOADS' | 'PLAYLIST', playlistId?: string) => {
      let title = '';
      if (type === 'LATEST_UPLOADS') title = 'Latest Uploads';
      if (type === 'POPULAR_UPLOADS') title = 'Popular Uploads';
      if (type === 'PLAYLIST') {
        const playlist = userPlaylists.find(p => p.id === playlistId);
        if (!playlist) return;
        title = `Playlist: ${playlist.name}`;
      }
      
      const newShelf: ChannelLayoutShelf = { id: uuidv4(), type, title, playlistId };
      setLayout(prev => [...prev, newShelf]);
    };

    const handleRemoveShelf = (id: string) => {
      setLayout(prev => prev.filter(shelf => shelf.id !== id));
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            if (type === 'avatar') {
                setAvatarFile(file);
                setAvatarPreview(previewUrl);
            } else {
                setBannerFile(file);
                setBannerPreview(previewUrl);
            }
        }
    };
    
    const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>, platform: string) => {
        setSocialLinks(prev => ({...prev, [platform]: e.target.value}));
    };

    const handleSubmit = async () => {
        if (!currentUser) return;
        setLoading(true);
        setMessage('');

        try {
             // Combine all promises
            await Promise.all([
                // Update Layout
                fetch(`/api/v1/channels/${currentUser.id}/layout`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ layout })
                }),
                // Update Membership Tiers (a bit complex for one call, but for simulation)
                ...membershipTiers.map(tier => fetch(`/api/v1/monetization/memberships/${tier.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tier)
                }))
            ]);

            const formData = new FormData();
            formData.append('name', name);
            formData.append('about', about);
            formData.append('featuredVideoId', featuredVideoId);
            formData.append('socialLinks', JSON.stringify(socialLinks));
            if (avatarFile) formData.append('avatar', avatarFile);
            if (bannerFile) formData.append('banner', bannerFile);

            const response = await fetch(`/api/v1/users/${currentUser.id}`, {
                method: 'PUT',
                body: formData,
            });
            if (!response.ok) throw new Error('Failed to update channel info.');
            
            const updatedUser = await response.json();
            updateCurrentUser(updatedUser);
            clearCache(`/api/v1/users/${currentUser.id}`);
            clearCache(`/api/v1/channels/${currentUser.id}/layout`);
            clearCache(`/api/v1/monetization/${currentUser.id}/memberships`);
            setMessage('Channel updated successfully!');
            setTimeout(() => navigate('/my-channel'), 1500);

        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) return <Navigate to="/login" replace />;

    const renderLayout = () => (
      <div>
        <h3 className="text-lg font-semibold mb-4">Channel Homepage Layout</h3>
        <div className="space-y-4 mb-6">
          {layout.map((shelf) => (
            <div key={shelf.id} className="flex items-center gap-4 p-3 bg-light-element dark:bg-dark-element rounded-md">
              <Bars3Icon className="w-5 h-5 cursor-grab" />
              <span className="flex-grow font-medium">{shelf.title}</span>
              <button onClick={() => handleRemoveShelf(shelf.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded-full">
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-4">
          <button onClick={() => handleAddShelf('LATEST_UPLOADS')} className="px-3 py-1.5 text-sm bg-light-element dark:bg-dark-element rounded-full">Add Latest Uploads</button>
          <button onClick={() => handleAddShelf('POPULAR_UPLOADS')} className="px-3 py-1.5 text-sm bg-light-element dark:bg-dark-element rounded-full">Add Popular Uploads</button>
          <select onChange={(e) => handleAddShelf('PLAYLIST', e.target.value)} className="px-3 py-1.5 text-sm bg-light-element dark:bg-dark-element rounded-full">
            <option>Add Playlist...</option>
            {userPlaylists.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
    );

    const renderBranding = () => (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold">Profile Picture</h3>
                <div className="flex items-center gap-6 mt-2">
                    <Avatar user={{...currentUser, avatarUrl: avatarPreview}} size="lg"/>
                    <div>
                        <p className="text-sm">Upload a new photo for your profile.</p>
                        <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                        <label htmlFor="avatar-upload" className="mt-2 inline-block text-sm font-semibold text-brand-red cursor-pointer hover:underline">
                            Upload
                        </label>
                    </div>
                </div>
            </div>
             <div>
                <h3 className="text-lg font-semibold">Banner Image</h3>
                <div className="mt-2">
                    <div className="aspect-[16/5] w-full bg-light-element dark:bg-dark-element rounded-md overflow-hidden flex items-center justify-center">
                        {bannerPreview ? <img src={bannerPreview} className="w-full h-full object-cover" /> : <p className="text-sm">No banner set</p>}
                    </div>
                    <input type="file" id="banner-upload" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
                    <label htmlFor="banner-upload" className="mt-2 inline-block text-sm font-semibold text-brand-red cursor-pointer hover:underline">
                        Upload
                    </label>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold">Featured Video</h3>
                <p className="text-sm mt-1">Select a video to feature at the top of your channel page.</p>
                <select value={featuredVideoId} onChange={(e) => setFeaturedVideoId(e.target.value)} className="mt-2 block w-full px-3 py-2 bg-light-element dark:bg-dark-element border border-light-element dark:border-dark-element rounded-md">
                    <option value="">-- No Featured Video --</option>
                    {userVideos.map(video => <option key={video.id} value={video.id}>{video.title}</option>)}
                </select>
            </div>
        </div>
    );
    
    const handleTierChange = (index: number, field: keyof MembershipTier, value: any) => {
        const newTiers = [...membershipTiers];
        (newTiers[index] as any)[field] = value;
        setMembershipTiers(newTiers);
    };

    const handlePerkChange = (tierIndex: number, perkIndex: number, value: string) => {
        const newTiers = [...membershipTiers];
        newTiers[tierIndex].perks[perkIndex] = value;
        setMembershipTiers(newTiers);
    };

    const renderMemberships = () => (
        <div>
            <h3 className="text-lg font-semibold mb-4">Channel Memberships</h3>
            <div className="space-y-6">
                {membershipTiers.map((tier, tierIndex) => (
                    <div key={tier.id} className="p-4 bg-light-element dark:bg-dark-element rounded-lg">
                        <input type="text" value={tier.name} onChange={e => handleTierChange(tierIndex, 'name', e.target.value)} placeholder="Tier Name" className="text-xl font-bold bg-transparent w-full mb-2 focus:outline-none focus:ring-1 focus:ring-brand-red rounded px-2" />
                        <input type="number" value={tier.price} onChange={e => handleTierChange(tierIndex, 'price', parseFloat(e.target.value))} placeholder="Price ($)" className="font-semibold bg-transparent w-full mb-4 focus:outline-none focus:ring-1 focus:ring-brand-red rounded px-2" />
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Perks</label>
                            {tier.perks.map((perk, perkIndex) => (
                                <input key={perkIndex} type="text" value={perk} onChange={e => handlePerkChange(tierIndex, perkIndex, e.target.value)} placeholder={`Perk ${perkIndex + 1}`} className="block w-full text-sm px-2 py-1 bg-light-surface dark:bg-dark-surface rounded-md" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );


    const renderBasicInfo = () => (
        <div className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-lg font-semibold">Channel Name</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="mt-2 block w-full px-3 py-2 bg-light-element dark:bg-dark-element border border-light-element dark:border-dark-element rounded-md" />
            </div>
             <div>
                <label htmlFor="about" className="block text-lg font-semibold">About</label>
                <textarea id="about" value={about} onChange={e => setAbout(e.target.value)} className="mt-2 block w-full px-3 py-2 bg-light-element dark:bg-dark-element border border-light-element dark:border-dark-element rounded-md" rows={6}></textarea>
            </div>
             <div>
                <h3 className="text-lg font-semibold">Social Links</h3>
                <div className="space-y-2 mt-2">
                    <input type="url" placeholder="Twitter URL" value={socialLinks.twitter} onChange={e => handleSocialLinkChange(e, 'twitter')} className="block w-full px-3 py-2 bg-light-element dark:bg-dark-element border border-light-element dark:border-dark-element rounded-md" />
                    <input type="url" placeholder="Instagram URL" value={socialLinks.instagram} onChange={e => handleSocialLinkChange(e, 'instagram')} className="block w-full px-3 py-2 bg-light-element dark:bg-dark-element border border-light-element dark:border-dark-element rounded-md" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Channel Customization</h1>
                <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-brand-red text-white font-semibold rounded-full hover:bg-brand-red-dark disabled:opacity-50">
                    {loading ? 'Saving...' : 'Publish Changes'}
                </button>
            </div>

            {message && <p className={`text-center text-sm mb-4 ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}

            <div className="border-b border-light-element dark:border-dark-element mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => setActiveTab('Layout')} className={`${activeTab === 'Layout' ? 'border-brand-red text-brand-red' : 'border-transparent'} py-4 px-1 border-b-2 font-medium`}>Layout</button>
                    <button onClick={() => setActiveTab('Branding')} className={`${activeTab === 'Branding' ? 'border-brand-red text-brand-red' : 'border-transparent'} py-4 px-1 border-b-2 font-medium`}>Branding</button>
                    <button onClick={() => setActiveTab('Memberships')} className={`${activeTab === 'Memberships' ? 'border-brand-red text-brand-red' : 'border-transparent'} py-4 px-1 border-b-2 font-medium`}>Memberships</button>
                    <button onClick={() => setActiveTab('Basic Info')} className={`${activeTab === 'Basic Info' ? 'border-brand-red text-brand-red' : 'border-transparent'} py-4 px-1 border-b-2 font-medium`}>Basic Info</button>
                </nav>
            </div>

            <div className="bg-light-surface dark:bg-dark-surface p-8 rounded-lg">
                {activeTab === 'Layout' && renderLayout()}
                {activeTab === 'Branding' && renderBranding()}
                {activeTab === 'Memberships' && renderMemberships()}
                {activeTab === 'Basic Info' && renderBasicInfo()}
            </div>
        </div>
    );
};

export default CustomizeChannel;