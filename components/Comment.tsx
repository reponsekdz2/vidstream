import React from 'react';
import { Link } from 'react-router-dom';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import type { Comment as CommentType } from '../types';

interface CommentProps {
  comment: CommentType;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  return (
    <div className="flex items-start gap-4">
      <Link to={`/channel/${comment.user.id}`}>
        <img src={comment.user.avatarUrl} alt={comment.user.name} className="w-10 h-10 rounded-full" />
      </Link>
      <div>
        <div className="flex items-baseline gap-2">
          <Link to={`/channel/${comment.user.id}`} className="font-semibold text-sm hover:text-brand-red">
            {comment.user.name}
          </Link>
          <span className="text-xs text-dark-text-secondary">{comment.timestamp}</span>
        </div>
        <p className="text-dark-text-primary mt-1">{comment.text}</p>
        <div className="flex items-center gap-4 mt-2">
          <button className="flex items-center gap-1 text-dark-text-secondary hover:text-dark-text-primary">
            <HandThumbUpIcon className="w-4 h-4" />
            {/* <span className="text-xs">123</span> */}
          </button>
          <button className="text-dark-text-secondary hover:text-dark-text-primary">
            <HandThumbDownIcon className="w-4 h-4" />
          </button>
          <button className="text-xs font-semibold text-dark-text-secondary hover:text-dark-text-primary">
            Reply
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comment;