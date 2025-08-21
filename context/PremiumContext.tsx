import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { AuthContext } from './AuthContext';

interface PremiumContextType {
  isPremium: boolean;
  subscribe: () => void;
  cancel: () => void;
}

export const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  subscribe: () => {},
  cancel: () => {},
});

interface PremiumProviderProps {
  children: ReactNode;
}

export const PremiumProvider: React.FC<PremiumProviderProps> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (currentUser) {
        try {
           const storedStatus = localStorage.getItem(`premium-status-${currentUser.id}`);
           if (storedStatus) {
               setIsPremium(JSON.parse(storedStatus));
           } else {
                // In a real app, you'd fetch this from the backend
                // For simulation, we assume they are not premium initially
                setIsPremium(false);
           }
        } catch {
            setIsPremium(false);
        }
      } else {
        setIsPremium(false);
      }
    };
    checkPremiumStatus();
  }, [currentUser]);

  const updatePremiumStatus = (status: boolean) => {
    setIsPremium(status);
    if (currentUser) {
      localStorage.setItem(`premium-status-${currentUser.id}`, JSON.stringify(status));
    }
  };

  const subscribe = useCallback(() => {
    if (currentUser) {
      // API call to backend to process subscription
      // fetch('/api/v1/premium/subscribe', ...);
      updatePremiumStatus(true);
    }
  }, [currentUser]);

  const cancel = useCallback(() => {
    if (currentUser) {
      // API call to backend to cancel
      // fetch('/api/v1/premium/cancel', ...);
      updatePremiumStatus(false);
    }
  }, [currentUser]);

  return (
    <PremiumContext.Provider value={{ isPremium, subscribe, cancel }}>
      {children}
    </PremiumContext.Provider>
  );
};