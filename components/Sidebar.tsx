import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, BoltIcon, RectangleStackIcon, ClockIcon, FolderIcon, ArrowDownTrayIcon, ListBulletIcon, FireIcon, SignalIcon } from '@heroicons/react/24/solid';

const Sidebar: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center gap-6 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-dark-element text-dark-text-primary' : 'hover:bg-dark-element text-dark-text-secondary'
    }`;

  const navLinkSmallClass = ({ isActive }: { isActive:boolean }): string =>
    `flex flex-col items-center justify-center w-full py-2 rounded-lg text-xs font-medium transition-colors ${
      isActive ? 'bg-dark-element text-dark-text-primary' : 'hover:bg-dark-element text-dark-text-secondary'
    }`;

    const mainNavItems = [
        { to: "/", icon: HomeIcon, label: "Home", smallLabel: "Home" },
        { to: "/shorts", icon: BoltIcon, label: "Shorts", smallLabel: "Shorts" },
        { to: "/subscriptions", icon: RectangleStackIcon, label: "Subscriptions", smallLabel: "Subs" },
    ];
    
    const exploreNavItems = [
        { to: "/trending", icon: FireIcon, label: "Trending" },
        { to: "/live", icon: SignalIcon, label: "Live" },
    ];

    const libraryNavItems = [
        { to: "/playlists", icon: FolderIcon, label: "Playlists" },
        { to: "/history", icon: ClockIcon, label: "History" },
        { to: "/my-list", icon: ListBulletIcon, label: "My List" },
        { to: "/downloads", icon: ArrowDownTrayIcon, label: "Downloads" },
    ];

  return (
    <>
      {/* Small Sidebar for mobile */}
      <aside className="fixed top-16 bottom-0 left-0 bg-dark-bg z-40 w-16 md:hidden flex flex-col items-center py-4 space-y-1 border-r border-dark-element">
         {mainNavItems.map(item => (
             <NavLink to={item.to} className={navLinkSmallClass} key={item.to} end={item.to === "/"}>
                <item.icon className="w-6 h-6" />
                <span className="mt-1">{item.smallLabel}</span>
             </NavLink>
         ))}
      </aside>

      {/* Full Sidebar for desktop */}
      <aside className="fixed top-16 bottom-0 left-0 bg-dark-bg z-40 w-64 hidden md:block p-4 border-r border-dark-element">
        <nav className="flex flex-col space-y-1">
          {mainNavItems.map(item => (
              <NavLink to={item.to} className={navLinkClass} key={item.to} end={item.to === "/"}>
                <item.icon className="w-6 h-6" />
                <span>{item.label}</span>
              </NavLink>
          ))}
        </nav>
        <hr className="my-4 border-dark-element"/>
        <h3 className="px-4 text-sm font-semibold text-dark-text-secondary tracking-wider uppercase mb-2">Explore</h3>
        <nav className="flex flex-col space-y-1">
            {exploreNavItems.map(item => (
                <NavLink to={item.to} className={navLinkClass} key={item.to}>
                    <item.icon className="w-6 h-6" />
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
        <hr className="my-4 border-dark-element"/>
        <h3 className="px-4 text-sm font-semibold text-dark-text-secondary tracking-wider uppercase mb-2">Library</h3>
        <nav className="flex flex-col space-y-1">
            {libraryNavItems.map(item => (
                <NavLink to={item.to} className={navLinkClass} key={item.to}>
                    <item.icon className="w-6 h-6" />
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;