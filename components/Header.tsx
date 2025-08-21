import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bars3Icon, MagnifyingGlassIcon, VideoCameraIcon, UserCircleIcon, Cog6ToothIcon, ArrowRightStartOnRectangleIcon, BellIcon } from '@heroicons/react/24/outline';
import useDebounce from '../hooks/useDebounce';
import type { Video } from '../types';
import SearchResults from './SearchResults';
import { AuthContext } from '../context/AuthContext';
import Avatar from './Avatar';
import NotificationDropdown from './NotificationDropdown';

const Header: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Video[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length > 1) {
        try {
          const response = await fetch(`/api/v1/videos?q=${debouncedQuery}`);
          const data: Video[] = await response.json();
          setResults(data);
        } catch (error) {
          console.error("Failed to fetch search results:", error);
          setResults([]);
        }
      } else {
        setResults([]);
      }
    };
    fetchResults();
  }, [debouncedQuery]);

   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-dark-bg z-50 h-16 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-dark-element">
          <Bars3Icon className="w-6 h-6 text-dark-text-primary" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-wider text-brand-red">VIDSTREAM</h1>
        </Link>
      </div>

      <div ref={searchRef} className="flex-1 flex justify-center px-4 lg:px-16 relative">
        <div className="w-full max-w-2xl flex">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="bg-dark-element border border-dark-element rounded-l-full w-full py-2 px-4 text-dark-text-primary placeholder-dark-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-red z-10"
          />
          <button className="bg-dark-element px-6 rounded-r-full border-y border-r border-dark-element hover:bg-gray-700">
            <MagnifyingGlassIcon className="w-5 h-5"/>
          </button>
        </div>
        {isSearchFocused && (query.length > 0) && <SearchResults results={results} query={debouncedQuery} onClear={() => { setQuery(''); setIsSearchFocused(false); }} />}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {currentUser && (
          <>
            <Link to="/upload" className="p-2 rounded-full hover:bg-dark-element">
                <VideoCameraIcon className="w-6 h-6" />
            </Link>
             <div ref={notificationsRef} className="relative">
                <button onClick={() => setIsNotificationsOpen(prev => !prev)} className="p-2 rounded-full hover:bg-dark-element">
                    <BellIcon className="w-6 h-6" />
                </button>
                {isNotificationsOpen && <NotificationDropdown onClose={() => setIsNotificationsOpen(false)} />}
            </div>
          </>
        )}
        
        {currentUser ? (
          <div ref={menuRef} className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <Avatar user={currentUser} size="sm" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-dark-surface rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-3 border-b border-dark-element flex items-center gap-3">
                  <Avatar user={currentUser} size="sm"/>
                  <div>
                    <p className="font-semibold text-dark-text-primary truncate">{currentUser.name}</p>
                    <p className="text-sm text-dark-text-secondary truncate">{currentUser.email}</p>
                  </div>
                </div>
                <Link to="/my-channel" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-dark-text-primary hover:bg-dark-element">
                  <UserCircleIcon className="w-5 h-5" />
                  My Channel
                </Link>
                <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-dark-text-primary hover:bg-dark-element">
                  <Cog6ToothIcon className="w-5 h-5" />
                  Settings
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-dark-text-primary hover:bg-dark-element">
                  <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="bg-brand-red hover:bg-brand-red-dark text-white font-semibold py-1.5 px-4 rounded">
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;