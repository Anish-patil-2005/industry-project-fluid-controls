import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { server } from '../main.tsx';
import toast from 'react-hot-toast'

export type UserRole = 'admin' | 'supervisor' | 'operator';

export interface UserProfile {
  _id: string;
  email: string;
  name: string;
  displayName: string; // Keep for consistency if used elsewhere
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  logout: () => void;
  fetchUserProfile: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async (authToken: string) => {
    // No need to set loading to true here, as the initial load handles it.
    // This prevents a loading flash on every navigation.
    try {
      const response = await fetch('/api/user/my-profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userProfile = { ...data.user, displayName: data.user.name };
        setUser(userProfile);
      } else {
        // Token is invalid or expired, so log the user out.
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Clear user state on error
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      // Only set loading to false on the initial check
      if (loading) {
        setLoading(false);
      }
    }
  }, [loading]); // dependency on `loading` to ensure it only runs once initially if needed


  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok ) {
        throw new Error(data.message || 'Sign in failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      const userProfile = { ...data.user, displayName: data.user.name };
      setUser(userProfile);

      toast({
        title: `Welcome back, ${data.user.name}!`,
        description: "You've been successfully signed in.",
      });
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, role: UserRole) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: displayName, role }),
      });

      const data = await response.json();
console.log(data)
      if (!response.ok) {
        throw new Error(data.message || 'Sign up failed');
      }

      toast({
        title: "OTP Sent!",
        description: "Please check your email to verify your account.",
      });
      
      // --- CORRECTED LOGIC ---
      // Navigate to the OTP verification page with necessary state
      navigate('/verify-user', { state: { activationToken: data.activationToken, email } });

    } catch (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    // Navigate to auth page on logout
    navigate('/auth');
  };

  const value = {
    user,
    token,
    loading,
    signIn,
    signUp,
    logout,
    fetchUserProfile: () => token ? fetchUserProfile(token) : Promise.resolve(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
