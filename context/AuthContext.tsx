
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface AuthContextType {
  userSlug: string | null;
  loading: boolean;
  login: (slug: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedSlug = localStorage.getItem('sorareUserSlug');
      if (storedSlug) {
        setUserSlug(storedSlug);
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((slug: string) => {
    try {
      localStorage.setItem('sorareUserSlug', slug);
      setUserSlug(slug);
    } catch (error) {
      console.error("Failed to write to localStorage", error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('sorareUserSlug');
      setUserSlug(null);
    } catch (error) {
      console.error("Failed to remove from localStorage", error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ userSlug, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};