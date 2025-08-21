import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUserSubscriptions: (subscriptionIds: string[]) => void;
  updateCurrentUser: (userData: Partial<User>) => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: async () => { throw new Error('login function not yet implemented'); },
  register: async () => { throw new Error('register function not yet implemented'); },
  logout: () => {},
  updateUserSubscriptions: () => {},
  updateCurrentUser: () => {},
  loading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('vidstream-user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from local storage', error);
      localStorage.removeItem('vidstream-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserInStorage = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('vidstream-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('vidstream-user');
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const user: User = await response.json();
    updateUserInStorage(user);
    return user;
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
    }
    
    const user: User = await response.json();
    updateUserInStorage(user);
    return user;
  };

  const logout = () => {
    updateUserInStorage(null);
  };
  
  const updateUserSubscriptions = (subscriptionIds: string[]) => {
      if (currentUser) {
          const updatedUser = { ...currentUser, subscriptions: subscriptionIds };
          updateUserInStorage(updatedUser);
      }
  };
  
  const updateCurrentUser = (userData: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      updateUserInStorage(updatedUser);
    }
  };


  const value = {
    currentUser,
    login,
    register,
    logout,
    updateUserSubscriptions,
    updateCurrentUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};