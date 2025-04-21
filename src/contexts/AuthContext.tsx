
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser) as User);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
      localStorage.setItem('user', JSON.stringify(foundUser));
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    let users = JSON.parse(localStorage.getItem('users') || '[]') as User[];

    if (users.some(u => u.email === email)) {
      return false; 
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9), 
      email,
      password,
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
