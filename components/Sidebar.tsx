import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, BoltIcon, RectangleStackIcon, ListBulletIcon } from '@heroicons/react/24/solid';

const Sidebar: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center gap-6 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-dark-element text-dark-text-primary' : 'hover:bg-dark-element text-dark-text-secondary'
    }`;

  const navLinkSmallClass = ({ isActive }: { isActive:boolean }): string =>
    `flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors ${
      isActive ? 'bg-dark-element text-dark-text-primary' : 'hover:bg-dark-element text-dark-text-secondary'
    }`;

  return (
    <>
      {/* Small Sidebar for mobile */}
      <aside className="fixed top-16 bottom-0 left-0 bg-dark-bg z-40 w-16 md:hidden flex flex-col items-center py-4 space-y-2 border-r border-dark-element">
         <NavLink to="/" className={navLinkSmallClass} end>
            <HomeIcon className="w-6 h-6" />
            <span>Home</span>
        </NavLink>
        <NavLink to="/shorts" className={navLinkSmallClass}>
            <BoltIcon className="w-6 h-6" />
            <span>Shorts</span>
        </NavLink>
        <NavLink to="/subscriptions" className={navLinkSmallClass}>
            <RectangleStackIcon className="w-6 h-6" />
            <span>Subs</span>
        </NavLink>
        <NavLink to="/my-list" className={navLinkSmallClass}>
            <ListBulletIcon className="w-6 h-6" />
            <span>My List</span>
        </NavLink>
      </aside>

      {/* Full Sidebar for desktop */}
      <aside className="fixed top-16 bottom-0 left-0 bg-dark-bg z-40 w-64 hidden md:block p-4 border-r border-dark-element">
        <nav className="flex flex-col space-y-2">
          <NavLink to="/" className={navLinkClass} end>
            <HomeIcon className="w-6 h-6" />
            <span>Home</span>
          </NavLink>
          <NavLink to="/shorts" className={navLinkClass}>
            <BoltIcon className="w-6 h-6" />
            <span>Shorts</span>
          </NavLink>
          <NavLink to="/subscriptions" className={navLinkClass}>
            <RectangleStackIcon className="w-6 h-6" />
            <span>Subscriptions</span>
          </NavLink>
           <NavLink to="/my-list" className={navLinkClass}>
            <ListBulletIcon className="w-6 h-6" />
            <span>My List</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;