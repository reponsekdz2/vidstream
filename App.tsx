import React from 'react';
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

const App: React.FC = () => {
  return (
    <div className="bg-dark-bg text-dark-text-primary min-h-screen flex flex-col">
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
            <Route path="/channel/:userId" element={<Channel />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlist/:id" element={<PlaylistDetail />} />
            <Route path="/history" element={<History />} />
            <Route path="/downloads" element={<Downloads />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;