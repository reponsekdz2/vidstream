import React, { useState, useContext } from 'react';
import { HandThumbUpIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/react/24/solid';
import { CommunityPost as CommunityPostType } from '../types';
import { AuthContext } from '../context/AuthContext';
import { clearCache } from '../utils/api';

interface CommunityPostProps {
  post: CommunityPostType;
  channelId: string;
}

const CommunityPost: React.FC<CommunityPostProps> = ({ post, channelId }) => {
  const { currentUser } = useContext(AuthContext);
  const [currentPost, setCurrentPost] = useState(post);
  
  const handleVote = async (optionId: string) => {
    if (!currentUser || currentPost.userVote) return;
    
    // Optimistic UI update
    const updatedPost = {
        ...currentPost,
        poll: currentPost.poll?.map(opt => 
            opt.id === optionId ? {...opt, votes: opt.votes + 1} : opt
        ),
        userVote: optionId
    };
    setCurrentPost(updatedPost);

    try {
        await fetch(`/api/v1/channels/${channelId}/community/${currentPost.id}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, optionId })
        });
        clearCache(`/api/v1/channels/${channelId}/community`);
    } catch(err) {
        console.error("Failed to vote:", err);
        // Revert on failure
        setCurrentPost(post);
    }
  };
  
  const totalVotes = currentPost.poll?.reduce((sum, opt) => sum + opt.votes, 0) || 0;

  return (
    <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-lg">
      <div className="flex items-start gap-3">
        <img src={currentPost.user.avatarUrl} alt={currentPost.user.name} className="w-10 h-10 rounded-full" />
        <div>
          <div className="flex items-baseline gap-2">
            <p className="font-semibold">{currentPost.user.name}</p>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{new Date(currentPost.timestamp).toLocaleDateString()}</p>
          </div>
          <p className="mt-2 text-sm whitespace-pre-wrap">{currentPost.text}</p>
          
          {currentPost.poll && (
            <div className="mt-4 space-y-2">
              {currentPost.poll.map(option => (
                <div key={option.id}>
                  <button
                    onClick={() => handleVote(option.id)}
                    disabled={!!currentPost.userVote}
                    className={`w-full text-left p-3 border rounded-md transition-colors ${
                      currentPost.userVote ? 'cursor-default' : 'hover:border-brand-red'
                    } ${
                      currentPost.userVote === option.id ? 'border-brand-red bg-brand-red/10' : 'border-light-element dark:border-dark-element'
                    }`}
                  >
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span>{option.text}</span>
                      {currentPost.userVote && <span>{((option.votes / totalVotes) * 100).toFixed(0)}%</span>}
                    </div>
                    {currentPost.userVote && (
                       <div className="w-full bg-light-element dark:bg-dark-element rounded-full h-2 mt-2">
                          <div className="bg-brand-red h-2 rounded-full" style={{ width: `${(option.votes / totalVotes) * 100}%` }}></div>
                        </div>
                    )}
                  </button>
                </div>
              ))}
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary pt-2">{totalVotes.toLocaleString()} votes</p>
            </div>
          )}

          <div className="mt-4 flex items-center gap-4">
            <button className="flex items-center gap-1 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary">
              <HandThumbUpIcon className="w-5 h-5" />
              <span className="text-xs">{currentPost.likes.toLocaleString()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPost;