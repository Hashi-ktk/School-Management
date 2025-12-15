'use client';

import { useEffect, useState } from 'react';
import type { User } from '@/types';

type AuthState = {
  user: User | null;
  role: User['role'] | null;
  isLoading: boolean;
};

const parseUser = (raw: string | null): User | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      const stored = parseUser(typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null);
      setUser(stored);
      setIsLoading(false);
    };

    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  return {
    user,
    role: user?.role ?? null,
    isLoading,
  };
}

