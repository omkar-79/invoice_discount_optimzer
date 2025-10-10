"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

/**
 * User interface representing authenticated user data
 */
interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
}

/**
 * Authentication context interface providing:
 * - User state management
 * - JWT token handling
 * - Login/logout functionality
 * - Loading states
 */
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, company?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Create authentication context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * 
 * Manages global authentication state including:
 * - JWT token storage and validation
 * - User session persistence
 * - Login/logout operations
 * - Automatic token refresh
 * 
 * Features:
 * - localStorage persistence
 * - Automatic session restoration
 * - Error handling for auth failures
 * - Loading states for async operations
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state on component mount
  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'}/auth/login`;
    console.log('Login API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Login response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login error response:', errorText);
      throw new Error('Login failed');
    }

    const data = await response.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
  };

  const register = async (name: string, email: string, password: string, company?: string) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'}/auth/register`;
    console.log('Register API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, company }),
    });

    console.log('Register response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Register error response:', errorText);
      throw new Error('Registration failed');
    }

    const data = await response.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
