import React from 'react';
import { Link } from 'react-router-dom';
import { Video } from '../types';

interface SearchResultsProps {
  results: Video[];
  query: string;
  onClear: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, query, onClear }) => {
  return (
    <div className="absolute top-full mt-2 w-full max-w-2xl bg-dark-surface rounded-lg shadow-lg overflow-hidden z-20">
      <ul className="max-h-96 overflow-y-auto">
        {results.length > 0 ? (
          results.map((video) => (
            <li key={video.id}>
              <Link
                to={`/watch/${video.id}`}
                onClick={onClear}
                className="flex items-center p-3 hover:bg-dark-element transition-colors"
              >
                <img src={video.thumbnailUrl} alt={video.title} className="w-24 h-14 object-cover rounded-md" />
                <div className="ml-4">
                  <p className="font-semibold text-dark-text-primary line-clamp-1">{video.title}</p>
                  <p className="text-sm text-dark-text-secondary">{video.user.name}</p>
                </div>
              </Link>
            </li>
          ))
        ) : (
          <li className="p-4 text-dark-text-secondary">
            {query.length > 1 ? `No results for "${query}"` : "Keep typing to search..."}
          </li>
        )}
      </ul>
    </div>
  );
};

export default SearchResults;