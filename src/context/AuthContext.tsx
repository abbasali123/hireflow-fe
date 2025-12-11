import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import api from '../api/client';

type User = {
  id?: string;
  name?: string;
  email: string;
  companyName?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (params: { email: string; password: string; name: string; companyName: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem('hf_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get<{ user: User }>('/me');
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem('hf_token');
      } finally {
        setLoading(false);
      }
    };

    void initialize();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
      localStorage.setItem('hf_token', data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (params: { email: string; password: string; name: string; companyName: string }) => {
    setLoading(true);

    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/register', params);
      localStorage.setItem('hf_token', data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('hf_token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
