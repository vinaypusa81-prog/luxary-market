import React, { createContext, useContext, useState, useEffect } from 'react';
import axios, { AxiosInstance } from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EDITOR';
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (accessToken: string, refreshToken: string, userData: User) => void;
  logout: () => void;
  api: AxiosInstance;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Base Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('admin-user');
    const savedToken = localStorage.getItem('admin-token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  // Axios Interceptors for JWT authorization & Auto Refresh token logic
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const savedToken = localStorage.getItem('admin-token');
        if (savedToken) {
          config.headers.Authorization = `Bearer ${savedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const rToken = localStorage.getItem('admin-refresh-token');
          const savedUser = localStorage.getItem('admin-user');
          
          if (rToken && savedUser) {
            try {
              const u = JSON.parse(savedUser);
              const { data } = await axios.post('/api/auth/refresh', {
                userId: u.id,
                token: rToken,
              });
              
              localStorage.setItem('admin-token', data.accessToken);
              localStorage.setItem('admin-refresh-token', data.refreshToken);
              setToken(data.accessToken);

              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
              return api(originalRequest);
            } catch (refreshError) {
              logout();
              return Promise.reject(refreshError);
            }
          } else {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem('admin-token', accessToken);
    localStorage.setItem('admin-refresh-token', refreshToken);
    localStorage.setItem('admin-user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-refresh-token');
    localStorage.removeItem('admin-user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, api, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
export { api };
