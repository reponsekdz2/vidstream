import React, { useState, useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Avatar from '../components/Avatar';
import { SunIcon, MoonIcon, UserCircleIcon, BellIcon, PlayIcon, LockClosedIcon } from '@heroicons/react/24/solid';

const Settings: React.FC = () => {
  const { currentUser, updateCurrentUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('Account');

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // State for forms
  const [name, setName] = useState(currentUser?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [settings, setSettings] = useState(currentUser.settings);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [isDataSaver, setIsDataSaver] = useState(
      settings.playback.defaultQuality === '480p' && !settings.playback.autoplay
  );

  useEffect(() => {
    // Sync data saver state if settings change from another source
    setIsDataSaver(
      settings.playback.defaultQuality === '480p' && !settings.playback.autoplay
    );
  }, [settings]);

  const handleSettingsChange = (category: 'notifications' | 'playback' | 'privacy', key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };
  
  const handleDataSaverToggle = (enabled: boolean) => {
      setIsDataSaver(enabled);
      if (enabled) {
          setSettings(prev => ({
              ...prev,
              playback: {
                  ...prev.playback,
                  defaultQuality: '480p',
                  autoplay: false,
              }
          }));
      } else {
          // Revert to default or previous settings
          setSettings(prev => ({
              ...prev,
              playback: {
                  ...prev.playback,
                  defaultQuality: 'Auto',
                  autoplay: true,
              }
          }));
      }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // For account info, it's a separate endpoint/call
      const response = await fetch(`/api/v1/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatarUrl }),
      });
      if (!response.ok) throw new Error('Failed to update profile.');
      const updatedUser = await response.json();
      updateCurrentUser(updatedUser);
      setMessage('Profile updated successfully!');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async () => {
    setLoading(true);
    setMessage('');
    try {
        const response = await fetch(`/api/v1/users/${currentUser.id}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        if (!response.ok) throw new Error('Failed to update settings.');
        const updatedUser = await response.json();
        updateCurrentUser(updatedUser);
        setMessage('Settings saved successfully!');
    } catch(error: any) {
        setMessage(`Error: ${error.message}`);
    } finally {
        setLoading(false);
    }
  };


  const tempUser = { ...currentUser, name, avatarUrl };

  const renderAccount = () => (
     <form onSubmit={handleAccountSubmit} className="space-y-6">
        <div className="flex flex-col items-center gap-4">
            <Avatar user={tempUser} size="lg"/>
        </div>
        <div>
            <label htmlFor="name" className="block text-sm font-medium">Display Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-light-element dark:bg-dark-element border border-light-element dark:border-dark-element rounded-md" />
        </div>
        <div>
            <label htmlFor="avatarUrl" className="block text-sm font-medium">Avatar Image URL</label>
            <input id="avatarUrl" type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-light-element dark:bg-dark-element border border-light-element dark:border-dark-element rounded-md" />
        </div>
         <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input id="email" type="email" value={currentUser.email} disabled
            className="mt-1 block w-full px-3 py-2 bg-light-element/50 dark:bg-dark-element/50 border border-light-element dark:border-dark-element rounded-md text-gray-500 dark:text-gray-400 cursor-not-allowed" />
        </div>
        <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-brand-red text-white font-semibold rounded-md hover:bg-brand-red-dark disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Account Changes'}
        </button>
    </form>
  );
  
  const renderNotifications = () => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold">Manage Notifications</h3>
        <div className="flex items-center justify-between">
            <label htmlFor="notif-uploads">New uploads from subscriptions</label>
            <input type="checkbox" id="notif-uploads" checked={settings.notifications.newUploads} onChange={e => handleSettingsChange('notifications', 'newUploads', e.target.checked)} className="h-4 w-4 rounded text-brand-red focus:ring-brand-red" />
        </div>
        <div className="flex items-center justify-between">
            <label htmlFor="notif-comments">Comments on your videos</label>
            <input type="checkbox" id="notif-comments" checked={settings.notifications.comments} onChange={e => handleSettingsChange('notifications', 'comments', e.target.checked)} className="h-4 w-4 rounded text-brand-red focus:ring-brand-red" />
        </div>
        <div className="flex items-center justify-between">
            <label htmlFor="notif-mentions">Mentions of your channel</label>
            <input type="checkbox" id="notif-mentions" checked={settings.notifications.mentions} onChange={e => handleSettingsChange('notifications', 'mentions', e.target.checked)} className="h-4 w-4 rounded text-brand-red focus:ring-brand-red" />
        </div>
    </div>
  );
  
  const renderPlayback = () => (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Playback Settings</h3>
         <div className="flex items-center justify-between p-4 bg-light-element/50 dark:bg-dark-element/50 rounded-lg">
            <div>
                <label htmlFor="data-saver" className="font-medium">Data Saver Mode</label>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Lowers quality and disables autoplay.</p>
            </div>
            <input type="checkbox" id="data-saver" checked={isDataSaver} onChange={e => handleDataSaverToggle(e.target.checked)} className="h-4 w-4 rounded text-brand-red focus:ring-brand-red" />
        </div>
        <div>
            <label htmlFor="playback-quality" className="block text-sm font-medium">Default Video Quality</label>
            <select id="playback-quality" value={settings.playback.defaultQuality} onChange={e => handleSettingsChange('playback', 'defaultQuality', e.target.value)} disabled={isDataSaver}
             className="mt-1 block w-full px-3 py-2 bg-light-element dark:bg-dark-element border border-light-element dark:border-dark-element rounded-md disabled:opacity-50">
                <option>Auto</option>
                <option>1080p</option>
                <option>720p</option>
                <option>480p</option>
            </select>
        </div>
        <div className="flex items-center justify-between">
            <label htmlFor="playback-autoplay">Autoplay next video</label>
            <input type="checkbox" id="playback-autoplay" checked={settings.playback.autoplay} onChange={e => handleSettingsChange('playback', 'autoplay', e.target.checked)} disabled={isDataSaver} className="h-4 w-4 rounded text-brand-red focus:ring-brand-red disabled:opacity-50" />
        </div>
    </div>
  );
  
  const renderPrivacy = () => (
     <div className="space-y-6">
        <h3 className="text-xl font-bold">Privacy Controls</h3>
        <div className="flex items-center justify-between">
            <label htmlFor="privacy-likes">Keep all my liked videos private</label>
            <input type="checkbox" id="privacy-likes" checked={settings.privacy.showLikedVideos} onChange={e => handleSettingsChange('privacy', 'showLikedVideos', e.target.checked)} className="h-4 w-4 rounded text-brand-red focus:ring-brand-red" />
        </div>
        <div className="flex items-center justify-between">
            <label htmlFor="privacy-subs">Keep all my subscriptions private</label>
            <input type="checkbox" id="privacy-subs" checked={settings.privacy.showSubscriptions} onChange={e => handleSettingsChange('privacy', 'showSubscriptions', e.target.checked)} className="h-4 w-4 rounded text-brand-red focus:ring-brand-red" />
        </div>
    </div>
  );


  const tabs = [
    { name: 'Account', icon: UserCircleIcon, content: renderAccount },
    { name: 'Notifications', icon: BellIcon, content: renderNotifications },
    { name: 'Playback', icon: PlayIcon, content: renderPlayback },
    { name: 'Privacy', icon: LockClosedIcon, content: renderPrivacy },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="md:w-1/4">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button key={tab.name} onClick={() => setActiveTab(tab.name)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.name ? 'bg-light-element dark:bg-dark-element text-brand-red' : 'hover:bg-light-element dark:hover:bg-dark-element'
                }`}>
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
            <div className="flex items-center justify-between p-3">
              <span className="text-sm font-medium">Theme</span>
              <button onClick={toggleTheme} className="p-2 rounded-full bg-light-element dark:bg-dark-element">
                  {theme === 'dark' ? <SunIcon className="w-5 h-5 text-yellow-400"/> : <MoonIcon className="w-5 h-5 text-indigo-400" />}
              </button>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1">
          <div className="bg-light-surface dark:bg-dark-surface p-8 rounded-lg">
            {tabs.find(t => t.name === activeTab)?.content()}
             {activeTab !== 'Account' && (
                 <button onClick={handleSettingsSubmit} disabled={loading} className="mt-8 w-full py-2 px-4 bg-brand-red text-white font-semibold rounded-md hover:bg-brand-red-dark disabled:opacity-50">
                    {loading ? 'Saving...' : 'Save Settings'}
                </button>
             )}
            {message && <p className={`text-center text-sm mt-4 ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;