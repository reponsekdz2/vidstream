import React from 'react';
import type { MerchItem } from '../types';

interface StoreTabProps {
    merch: MerchItem[];
}

const StoreTab: React.FC<StoreTabProps> = ({ merch }) => {
    if (merch.length === 0) {
        return (
            <div className="text-center py-16 text-light-text-secondary dark:text-dark-text-secondary">
                This creator doesn't have any merchandise available right now.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {merch.map(item => (
                <a href={item.storeUrl} key={item.id} target="_blank" rel="noopener noreferrer" className="group">
                    <div className="aspect-square bg-dark-element rounded-lg overflow-hidden">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    </div>
                    <div className="mt-2">
                        <h3 className="font-semibold text-dark-text-primary group-hover:text-brand-red line-clamp-2">{item.title}</h3>
                        <p className="text-sm text-dark-text-secondary">${item.price.toFixed(2)}</p>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default StoreTab;