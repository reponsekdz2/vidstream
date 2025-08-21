import React from 'react';
import type { User } from '../types';
import { LinkIcon } from '@heroicons/react/24/solid';

interface AboutTabProps {
  user: User;
}

const AboutTab: React.FC<AboutTabProps> = ({ user }) => {
  const socialLinks = user.socialLinks ? Object.entries(user.socialLinks).filter(([_, url]) => url) : [];

  return (
    <div className="max-w-3xl mx-auto py-8 text-dark-text-primary">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <h2 className="text-xl font-bold border-b border-dark-element pb-2 mb-4">Description</h2>
            <p className="whitespace-pre-wrap text-dark-text-secondary">
                {user.about || `${user.name} hasn't added a description yet.`}
            </p>
        </div>
        <div>
            <h2 className="text-xl font-bold border-b border-dark-element pb-2 mb-4">Links</h2>
            {socialLinks.length > 0 ? (
                <ul className="space-y-2">
                    {socialLinks.map(([platform, url]) => (
                        <li key={platform}>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-red hover:underline">
                                <LinkIcon className="w-5 h-5" />
                                <span className="capitalize">{platform}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            ) : (
                 <p className="text-dark-text-secondary">No links provided.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default AboutTab;