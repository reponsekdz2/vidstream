import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { Video, SearchFilters } from '../types';
import { FunnelIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

const Search: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [results, setResults] = useState<Video[]>([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    
    const [filters, setFilters] = useState<SearchFilters>({
        uploadDate: searchParams.get('uploadDate') as SearchFilters['uploadDate'] || 'any',
        duration: searchParams.get('duration') as SearchFilters['duration'] || 'any',
        sortBy: searchParams.get('sortBy') as SearchFilters['sortBy'] || 'relevance'
    });
    
    const query = searchParams.get('q') || '';

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setResults([]);
                return;
            };
            setLoading(true);

            const params = new URLSearchParams({
                q: query,
                ...filters
            });

            try {
                const response = await fetch(`/api/v1/videos/search?${params.toString()}`);
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query, filters]);
    
    const handleFilterChange = (filterName: keyof SearchFilters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 mb-4 px-4 py-2 bg-dark-surface rounded-full text-sm font-semibold">
                <FunnelIcon className="w-5 h-5"/>
                Filters
            </button>

            {showFilters && (
                <div className="bg-dark-surface p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FilterGroup label="Upload Date" value={filters.uploadDate} onChange={(v) => handleFilterChange('uploadDate', v)}
                        options={[{value: 'any', label: 'Anytime'}, {value: 'hour', label: 'Last hour'}, {value: 'today', label: 'Today'}, {value: 'week', label: 'This week'}, {value: 'month', label: 'This month'}, {value: 'year', label: 'This year'}]} />
                    <FilterGroup label="Duration" value={filters.duration} onChange={(v) => handleFilterChange('duration', v)}
                        options={[{value: 'any', label: 'Any'}, {value: 'short', label: 'Short (< 4 min)'}, {value: 'medium', label: 'Medium (4-20 min)'}, {value: 'long', label: 'Long (> 20 min)'}]} />
                    <FilterGroup label="Sort By" value={filters.sortBy} onChange={(v) => handleFilterChange('sortBy', v)}
                        options={[{value: 'relevance', label: 'Relevance'}, {value: 'date', label: 'Upload date'}, {value: 'views', label: 'View count'}]} />
                </div>
            )}

            <hr className="border-dark-element mb-6"/>

            {loading ? <p>Loading results...</p> : (
                <div className="space-y-6">
                    {results.length > 0 ? results.map(video => <SearchResultItem key={video.id} video={video} />)
                    : <p>No results found for "{query}".</p>}
                </div>
            )}
        </div>
    );
};

const FilterGroup = ({ label, value, onChange, options }: {label: string, value: string, onChange: (v: string) => void, options: {value: string, label: string}[] }) => (
    <div>
        <label className="block text-sm font-bold text-dark-text-secondary mb-2">{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-dark-element p-2 rounded-md text-sm">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const SearchResultItem = ({ video }: { video: Video }) => (
     <Link to={`/watch/${video.id}`} className="flex flex-col sm:flex-row items-start gap-4 group p-2 rounded-lg hover:bg-dark-element transition-colors">
        <div className="relative w-full sm:w-64 sm:flex-shrink-0">
            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-auto object-cover rounded-lg" />
            <span className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
              {video.duration}
            </span>
        </div>
        <div className="flex-grow">
            <h3 className="text-xl font-semibold text-dark-text-primary line-clamp-2 group-hover:text-brand-red">{video.title}</h3>
            <div className="text-sm text-dark-text-secondary mt-1">
                <span>{video.viewCount.toLocaleString()} views</span> &bull; <span>{formatDistanceToNow(new Date(video.uploadDate), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-3 mt-4">
                <img src={video.user.avatarUrl} alt={video.user.name} className="w-8 h-8 rounded-full" />
                <span className="text-sm font-semibold">{video.user.name}</span>
            </div>
            <p className="text-sm text-dark-text-secondary mt-2 line-clamp-2 hidden md:block">{video.description}</p>
        </div>
    </Link>
);


export default Search;