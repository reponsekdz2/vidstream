import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Shorts from './pages/Shorts';
import MyList from './pages/MyList';
import Subscriptions from './pages/Subscriptions';
import Login from './pages/Login';
import Register from './pages/Register';
import MyChannel from './pages/MyChannel';
import Channel from './pages/Channel';
import Upload from './pages/Upload';
import Settings from './pages/Settings';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import History from './pages/History';
import Downloads from './pages/Downloads';
import Miniplayer from './components/Miniplayer';
import Trending from './pages/Trending';
import Live from './pages/Live';
import CreatorDashboard from './pages/CreatorDashboard';
import CustomizeChannel from './pages/CustomizeChannel';
import Monetization from './pages/Monetization';
import Moderation from './pages/Moderation';
import Premium from './pages/Premium';
import { ThemeContext } from './context/ThemeContext';
import AdPlayer from './components/ads/AdPlayer';

const App: React.FC = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`${theme} bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary min-h-screen flex flex-col`}>
      <Header />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pl-16 md:pl-64">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/shorts" element={<Shorts />} />
            <Route path="/my-list" element={<MyList />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/my-channel" element={<MyChannel />} />
            <Route path="/my-channel/customize" element={<CustomizeChannel />} />
            <Route path="/creator-dashboard" element={<CreatorDashboard />} />
            <Route path="/creator-dashboard/monetization" element={<Monetization />} />
            <Route path="/creator-dashboard/moderation" element={<Moderation />} />
            <Route path="/channel/:userId" element={<Channel />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlist/:id" element={<PlaylistDetail />} />
            <Route path="/history" element={<History />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/live" element={<Live />} />
            <Route path="/premium" element={<Premium />} />
          </Routes>
        </main>
      </div>
      <Miniplayer />
      <AdPlayer />
    </div>
  );
};

export default App;