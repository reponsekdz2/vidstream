import React, { useContext, useState } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const QueuePanel: React.FC = () => {
    const { queue, removeFromQueue, reorderQueue } = useContext(PlayerContext);
    const [isOpen, setIsOpen] = useState(true);
    const [draggedItem, setDraggedItem] = useState<string | null>(null);

    const handleDragStart = (videoId: string) => {
        setDraggedItem(videoId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (targetVideoId: string) => {
        if (!draggedItem || draggedItem === targetVideoId) return;

        const draggedIndex = queue.findIndex(v => v.id === draggedItem);
        const targetIndex = queue.findIndex(v => v.id === targetVideoId);

        const newQueue = [...queue];
        const [removed] = newQueue.splice(draggedIndex, 1);
        newQueue.splice(targetIndex, 0, removed);
        
        reorderQueue(newQueue);
        setDraggedItem(null);
    };


    return (
        <div className="bg-dark-surface rounded-xl mb-6">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4">
                <h2 className="text-xl font-semibold">Up Next</h2>
                {isOpen ? <ChevronUpIcon className="w-6 h-6"/> : <ChevronDownIcon className="w-6 h-6"/>}
            </button>
            <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                >
                    <div className="p-4 pt-0 max-h-96 overflow-y-auto">
                        {queue.map(video => (
                            <div key={video.id}
                                draggable
                                onDragStart={() => handleDragStart(video.id)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(video.id)}
                                className={`flex items-center gap-3 group p-2 rounded-lg hover:bg-dark-element transition-colors cursor-grab ${draggedItem === video.id ? 'opacity-50' : ''}`}
                            >
                               <Bars3Icon className="w-5 h-5 text-dark-text-secondary flex-shrink-0" />
                                <Link to={`/watch/${video.id}`} className="flex-grow flex items-center gap-3">
                                    <div className="w-24 flex-shrink-0 relative">
                                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-auto object-cover rounded-lg" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary leading-snug line-clamp-2">{video.title}</h3>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">{video.user.name}</p>
                                    </div>
                                </Link>
                                <button onClick={() => removeFromQueue(video.id)} className="p-1 opacity-0 group-hover:opacity-100 text-dark-text-secondary hover:text-white">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default QueuePanel;