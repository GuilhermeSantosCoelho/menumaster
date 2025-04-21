import { useState } from 'react';
import api from '@/lib/axios';
import { User } from '@/types/entities';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  establishmentName: string;
  phone?: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
}

interface UseCreateUserReturn {
  createUser: (data: CreateUserData) => Promise<User>;
  isLoading: boolean;
  error: Error | null;
}

export function useCreateUser(): UseCreateUserReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createUser = async (data: CreateUserData): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<User>('/users', data);
      return response.data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createUser,
    isLoading,
    error,
  };
} 