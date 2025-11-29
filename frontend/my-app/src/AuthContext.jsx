'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyAuth, getCurrentUser, logout } from './api';

// Create the authentication context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [provider, setProvider] = useState(null);
  
  // Note: useNavigate must be used in a component, not directly in context
  // We'll handle navigation in the logout handler differently

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Verify with the backend first (don't trust localStorage alone)
        const { authenticated, user: serverUser, provider: serverProvider } = await verifyAuth();
        
        if (authenticated && serverUser) {
          setUser(serverUser);
          setProvider(serverProvider);
          setIsAuthenticated(true);
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(serverUser));
          // Also store provider data in localStorage if available
          if (serverProvider) {
            localStorage.setItem('provider', JSON.stringify(serverProvider));
            console.log('Provider data saved to localStorage:', serverProvider);
          }
        } else {
          // Clear invalid auth data
          setUser(null);
          setProvider(null);
          setIsAuthenticated(false);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('provider');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        setIsAuthenticated(false);
        setUser(null);
        setProvider(null);
        // Clear potentially invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('provider');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Update auth context when user changes
  const updateUser = (userData) => {
    console.log('updateUser called with:', userData);
    
    // If provider data exists, merge provider_id into user object for easy access
    if (userData && userData.provider) {
      userData.provider_id = userData.provider.provider_id;
      // Also save provider separately
      localStorage.setItem('provider', JSON.stringify(userData.provider));
    }
    
    setUser(userData);
    setIsAuthenticated(!!userData);
    
    // Save to localStorage so components can access it
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('User data saved to localStorage:', userData);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('provider');
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setUser(null);
    setProvider(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('provider');
    // Use window.location for reliable navigation after logout
    // This ensures a clean state reset
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // Context value
  const value = {
    user,
    provider,
    isAuthenticated,
    loading,
    updateUser,
    logout: handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // During SSR/prerendering, return a safe default instead of throwing
    if (typeof window === 'undefined') {
      return {
        user: null,
        provider: null,
        isAuthenticated: false,
        loading: true,
        updateUser: () => {},
        logout: () => {}
      };
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}