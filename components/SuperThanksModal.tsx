import React, { useState, useContext } from 'react';
import type { Video } from '../types';
import { XMarkIcon, HeartIcon } from '@heroicons/react/24/solid';
import { AuthContext } from '../context/AuthContext';

interface SuperThanksModalProps {
  video: Video;
  onClose: () => void;
  onSuccess: (comment: Comment) => void;
}

const SuperThanksModal: React.FC<SuperThanksModalProps> = ({ video, onClose, onSuccess }) => {
    const { currentUser } = useContext(AuthContext);
    const [amount, setAmount] = useState(5);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const amounts = [2, 5, 10, 20];

    const handleSubmit = async () => {
        if (!currentUser) return;
        setSubmitting(true);
        try {
            const response = await fetch(`/api/v1/comments/video/${video.id}/superthanks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    text: message || `Thanks for the great video!`,
                    amount
                }),
            });
            const newComment = await response.json();
            onSuccess(newComment);
            onClose();
        } catch (error) {
            console.error("Super Thanks failed", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[101] p-4">
            <div className="bg-dark-surface rounded-lg w-full max-w-md shadow-xl text-dark-text-primary">
                 <div className="flex items-center justify-between p-4 border-b border-dark-element">
                  <h2 className="text-xl font-semibold flex items-center gap-2 text-pink-400"><HeartIcon className="w-5 h-5"/> Send Super Thanks</h2>
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-dark-element">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-center text-dark-text-secondary">Show your support for {video.user.name} with a one-time payment. Your comment will be highlighted.</p>
                    
                    <div className="flex justify-around items-center py-4">
                        {amounts.map(amt => (
                            <button key={amt} onClick={() => setAmount(amt)}
                                className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all
                                ${amount === amt ? 'bg-pink-400 border-pink-200 text-white scale-110' : 'bg-dark-element border-dark-element hover:border-pink-400'}`}>
                                ${amt}
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Your highlighted comment (optional)..."
                        className="w-full bg-dark-element border-dark-element rounded-md p-2 focus:ring-2 focus:ring-pink-400"
                        rows={2}
                    />

                    <button onClick={handleSubmit} disabled={submitting}
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-full text-lg transition-transform hover:scale-105 disabled:opacity-50">
                        {submitting ? 'Sending...' : `Buy and Send for $${amount}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuperThanksModal;