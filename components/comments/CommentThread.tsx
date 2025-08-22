import React, { useState, useContext } from 'react';
import { Comment as CommentType, User } from '../../types';
import { fetchWithCache, clearCache } from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { EllipsisHorizontalIcon, FlagIcon } from '@heroicons/react/24/solid';

interface CommentThreadProps {
  videoId: string;
  comments: CommentType[];
  setComments: React.Dispatch<React.SetStateAction<CommentType[]>>;
  onReportComment: (commentId: string) => void;
}

const CommentThread: React.FC<CommentThreadProps> = ({ videoId, comments, setComments, onReportComment }) => {
  const { currentUser } = useContext(AuthContext);
  const [newComment, setNewComment] = useState("");

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || !videoId) return;

    try {
      const response = await fetch(`/api/v1/comments/video/${videoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, text: newComment }),
      });
      const actualComment = await response.json();
      setComments(prev => [actualComment, ...prev]);
      clearCache(`/api/v1/comments/video/${videoId}`);
      setNewComment("");
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{comments.length} Comments</h2>
      {currentUser && (
        <form onSubmit={handleCommentSubmit} className="flex items-start gap-4 mb-6">
          <img src={currentUser.avatarUrl} alt="Your avatar" className="w-10 h-10 rounded-full" />
          <div className="flex-grow">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-transparent border-b-2 border-light-element dark:border-dark-element focus:border-brand-red outline-none pb-1 transition-colors"
            />
            {newComment && (
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setNewComment('')} className="px-4 py-1.5 text-sm rounded-full hover:bg-light-element dark:hover:bg-dark-element">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-sm rounded-full bg-brand-red hover:bg-brand-red-dark disabled:opacity-50" disabled={!newComment.trim()}>Comment</button>
              </div>
            )}
          </div>
        </form>
      )}
      <div className="space-y-6">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} onReportComment={onReportComment} />
        ))}
      </div>
    </div>
  );
};

interface CommentItemProps {
    comment: CommentType;
    onReportComment: (commentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReportComment }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentType[]>([]);
  const [isReplying, setIsReplying] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const [newReply, setNewReply] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fetchReplies = async () => {
    const data = await fetchWithCache(`/api/v1/comments/${comment.id}/replies`);
    setReplies(data);
  };
  
  const handleToggleReplies = () => {
    if (!showReplies) {
      fetchReplies();
    }
    setShowReplies(!showReplies);
  };
  
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !currentUser) return;
    try {
        const response = await fetch(`/api/v1/comments/${comment.id}/replies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, text: newReply }),
        });
        const createdReply = await response.json();
        setReplies(prev => [...prev, createdReply]);
        clearCache(`/api/v1/comments/${comment.id}/replies`);
        setNewReply('');
        setIsReplying(false);
    } catch(err) {
        console.error("Failed to post reply:", err);
    }
  };

  return (
    <div className="flex items-start gap-4 group">
      <img src={comment.user.avatarUrl} alt={comment.user.name} className="w-10 h-10 rounded-full" />
      <div className="flex-grow">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm">{comment.user.name}</span>
          <span className="text-xs text-dark-text-secondary">{new Date(comment.timestamp).toLocaleDateString()}</span>
        </div>
        <p className="text-dark-text-primary mt-1">{comment.text}</p>
        <div className="flex items-center gap-4 mt-2">
          <button onClick={() => setIsReplying(!isReplying)} className="text-xs font-semibold text-dark-text-secondary hover:text-dark-text-primary">
            REPLY
          </button>
        </div>

        {isReplying && currentUser && (
            <form onSubmit={handleReplySubmit} className="flex items-start gap-4 mt-4">
                <img src={currentUser.avatarUrl} alt="Your avatar" className="w-8 h-8 rounded-full"/>
                <div className="flex-grow">
                     <input type="text" value={newReply} onChange={e => setNewReply(e.target.value)} placeholder={`Replying to ${comment.user.name}...`} className="w-full bg-transparent border-b-2 border-dark-element focus:border-brand-red outline-none transition-colors text-sm"/>
                     <div className="flex justify-end gap-2 mt-2">
                         <button type="button" onClick={() => setIsReplying(false)} className="px-3 py-1 text-xs rounded-full">Cancel</button>
                         <button type="submit" disabled={!newReply.trim()} className="px-3 py-1 text-xs rounded-full bg-brand-red disabled:opacity-50">Reply</button>
                     </div>
                </div>
            </form>
        )}

        {comment.replyCount && comment.replyCount > 0 && (
          <button onClick={handleToggleReplies} className="text-sm font-semibold text-brand-red mt-2">
            {showReplies ? `Hide ${comment.replyCount} replies` : `View ${comment.replyCount} replies`}
          </button>
        )}

        {showReplies && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-dark-element">
            {replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} onReportComment={onReportComment} />
            ))}
          </div>
        )}
      </div>
       <div className="relative">
          <button onClick={() => setIsMenuOpen(p => !p)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-dark-element">
              <EllipsisHorizontalIcon className="w-5 h-5"/>
          </button>
          {isMenuOpen && (
               <div className="absolute top-full right-0 mt-1 w-32 bg-dark-surface rounded-md shadow-lg py-1 z-10 border border-dark-element">
                    <button onClick={() => { onReportComment(comment.id); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-1 text-sm hover:bg-dark-element">
                        <FlagIcon className="w-4 h-4"/> Report
                    </button>
               </div>
          )}
      </div>
    </div>
  );
};

export default CommentThread;