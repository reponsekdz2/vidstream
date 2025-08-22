import React, { useState, useEffect } from 'react';
import type { User, MembershipTier } from '../types';
import { fetchWithCache } from '../utils/api';
import { StarIcon } from '@heroicons/react/24/solid';

interface BecomeMemberPromptProps {
    channel: User;
}

const BecomeMemberPrompt: React.FC<BecomeMemberPromptProps> = ({ channel }) => {
    const [tiers, setTiers] = useState<MembershipTier[]>([]);
    
    useEffect(() => {
        const fetchTiers = async () => {
            try {
                const data = await fetchWithCache(`/api/v1/monetization/${channel.id}/memberships`);
                setTiers(data);
            } catch (error) {
                console.error("Failed to fetch membership tiers", error);
            }
        };
        fetchTiers();
    }, [channel.id]);

    return (
        <div className="w-full h-full bg-dark-element text-white flex flex-col items-center justify-center p-8 text-center rounded-xl">
            <StarIcon className="w-16 h-16 text-yellow-400" />
            <h2 className="text-2xl font-bold mt-4">This video is for members only</h2>
            <p className="mt-2 text-dark-text-secondary">
                Join {channel.name}'s channel to get access to this video and other exclusive perks.
            </p>

            <div className="mt-6 flex gap-4">
                {tiers.slice(0, 3).map(tier => (
                    <div key={tier.id} className="bg-dark-surface p-4 rounded-lg border border-dark-element w-48">
                        <h3 className="font-bold text-brand-red">{tier.name}</h3>
                        <p className="text-xl font-bold my-2">${tier.price}/month</p>
                    </div>
                ))}
            </div>

            <button className="mt-8 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-full text-lg transition-transform hover:scale-105">
                Join Now
            </button>
        </div>
    );
};

export default BecomeMemberPrompt;