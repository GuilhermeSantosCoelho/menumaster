'use client';

import type React from 'react';

import { useRouter } from 'next/navigation';
import { useState, useEffect, createContext, useContext } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { login } from './use-login';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  // signUp: (
  //   email: string,
  //   password: string,
  //   name: string
  // ) => Promise<{
  //   error: Error | null;
  //   data: { user: User | null } | null;
  // }>;
  // signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const response = await login({ email, password });
    setLoading(false);
    return response;
  };

  // const signUp = async (email: string, password: string, name: string) => {
  //   setLoading(true);
  //   const response = await supabase.auth.signUp({
  //     email,
  //     password,
  //     options: {
  //       data: {
  //         name,
  //       },
  //     },
  //   });

  //   // Se o registro for bem-sucedido, crie o perfil do usuário
  //   if (response.data.user) {
  //     await supabase.from('users').insert({
  //       id: response.data.user.id,
  //       name,
  //       email,
  //       role: 'OWNER',
  //     });
  //   }

  //   setLoading(false);
  //   return response;
  // };

  // const signOut = async () => {
  //   await supabase.auth.signOut();
  //   router.push('/login');
  // };

  return <AuthContext.Provider value={{ user, loading, signIn }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
