import React from 'react';
import { Link } from 'react-router-dom';
import type { VideoAnalytics } from '../../types';
import { EyeIcon, HandThumbUpIcon, ChatBubbleOvalLeftEllipsisIcon, ClockIcon } from '@heroicons/react/24/outline';

interface VideoPerformanceTableProps {
  videos: VideoAnalytics[];
}

const VideoPerformanceTable: React.FC<VideoPerformanceTableProps> = ({ videos }) => {
  return (
    <div className="bg-dark-surface rounded-lg">
      <div className="p-4 border-b border-dark-element">
        <h3 className="text-xl font-bold">Top Video Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-dark-text-secondary">
          <thead className="text-xs uppercase bg-dark-element">
            <tr>
              <th scope="col" className="px-6 py-3">Video</th>
              <th scope="col" className="px-6 py-3 text-center">Views</th>
              <th scope="col" className="px-6 py-3 text-center">Likes</th>
              <th scope="col" className="px-6 py-3 text-center">Comments</th>
              <th scope="col" className="px-6 py-3 text-center">Avg. Duration</th>
            </tr>
          </thead>
          <tbody>
            {videos.map(({ video, viewCount, likes, commentCount, avgWatchDuration }) => (
              <tr key={video.id} className="border-b border-dark-element hover:bg-dark-element/50">
                <td className="px-6 py-4">
                  <Link to={`/watch/${video.id}`} className="flex items-center gap-3 group">
                    <img src={video.thumbnailUrl} alt={video.title} className="w-24 h-14 object-cover rounded"/>
                    <div>
                        <p className="font-semibold text-dark-text-primary group-hover:text-brand-red line-clamp-1">{video.title}</p>
                        <p className="text-xs">{video.uploadedAt}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4 text-center">{viewCount.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">{likes.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">{commentCount.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">{avgWatchDuration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VideoPerformanceTable;