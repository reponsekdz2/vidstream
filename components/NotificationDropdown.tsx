import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import type { Notification } from '../types';
import { fetchWithCache } from '../utils/api';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const data = await fetchWithCache(`/api/v1/notifications?userId=${currentUser.id}`);
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [currentUser]);

  return (
    <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-dark-surface rounded-md shadow-lg z-50 border border-dark-element">
      <div className="p-3 border-b border-dark-element">
        <h3 className="font-semibold text-dark-text-primary">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading ? <p className="p-4 text-center text-dark-text-secondary">Loading...</p> :
         notifications.length > 0 ? (
          <ul>
            {notifications.map(notification => (
              <li key={notification.id} className={`${notification.isRead ? '' : 'bg-dark-element/50'}`}>
                <Link to={notification.link} onClick={onClose} className="block p-3 hover:bg-dark-element transition-colors">
                  <p className="text-sm text-dark-text-primary">{notification.text}</p>
                  <p className="text-xs text-dark-text-secondary mt-1">{notification.timestamp}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-center text-dark-text-secondary">No new notifications.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;