import React from 'react';

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value }) => {
  return (
    <div className="bg-dark-surface p-6 rounded-lg flex items-center gap-4">
      <div className="bg-dark-element p-3 rounded-full">
        <Icon className="w-6 h-6 text-brand-red" />
      </div>
      <div>
        <p className="text-sm text-dark-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-dark-text-primary">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;