import React, { useContext } from 'react';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { AuthContext } from '../context/AuthContext';
import { PremiumContext } from '../context/PremiumContext';
import { useNavigate } from 'react-router-dom';

const Premium: React.FC = () => {
    const { currentUser } = useContext(AuthContext);
    const { isPremium, subscribe } = useContext(PremiumContext);
    const navigate = useNavigate();
    
    const handleSubscribe = () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        subscribe();
        // In a real app, this would redirect to a payment processor.
        // For now, we just update the state.
    };

    const features = [
        "Ad-free viewing on all devices",
        "Background playback on mobile",
        "Download videos for offline viewing",
        "Exclusive Premium badge"
    ];

    return (
        <div className="bg-gradient-to-br from-gray-900 to-black text-white min-h-full flex items-center justify-center p-4">
            <div className="w-full max-w-lg p-8 space-y-6 bg-dark-surface rounded-2xl shadow-2xl shadow-brand-red/20 text-center">
                <h1 className="text-4xl font-bold tracking-wider text-brand-red">VIDSTREAM PREMIUM</h1>
                <p className="text-lg text-dark-text-secondary">
                    Enjoy an uninterrupted, premium viewing experience.
                </p>

                <div className="text-left py-6 space-y-4">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <CheckBadgeIcon className="w-6 h-6 text-brand-red flex-shrink-0" />
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-dark-element pt-6">
                    {isPremium ? (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-green-400">You are a Premium member!</h2>
                            <p className="mt-2 text-dark-text-secondary">Enjoy all the benefits of VidStream Premium.</p>
                        </div>
                    ) : (
                        <div>
                             <p className="text-4xl font-bold">$11.99<span className="text-lg text-dark-text-secondary">/month</span></p>
                             <button
                                onClick={handleSubscribe}
                                className="mt-6 w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-4 rounded-full text-lg transition-transform hover:scale-105"
                            >
                                {currentUser ? 'Go Premium' : 'Login to Go Premium'}
                            </button>
                            <p className="text-xs text-dark-text-secondary mt-4">
                                Cancel anytime. Terms and conditions apply.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Premium;