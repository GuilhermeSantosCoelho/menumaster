"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/entities';
import { authService } from '@/lib/services/auth-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'establishments'>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const user = await authService.getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
      // Clear localStorage if there's an error
      localStorage.removeItem('currentUser');
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      const { user, error } = await authService.login({ email, password });
      if (error) throw new Error(error);
      setUser(user);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  async function signUp(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'establishments'>) {
    try {
      const { user, error } = await authService.signUp(userData);
      if (error) throw new Error(error);
      setUser(user);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    signUp
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 