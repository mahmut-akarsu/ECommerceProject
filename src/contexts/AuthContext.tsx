// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, RegisterData } from '../types';
import { loginUser as apiLogin, getMe as apiGetMe, registerUser as apiRegister } from '../api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<User | null>; // Başarıda User dönsün
  logout: () => void;
  register: (userData: RegisterData) => Promise<User | null>; // Başarıda User dönsün
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // apiClient interceptor'ı token'ı zaten ekliyor
          const currentUser = await apiGetMe();
          setUser(currentUser);
        } catch (error) {
          console.error('Token validation failed or failed to fetch user', error);
          localStorage.removeItem('accessToken');
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (credentials: { username: string; password: string }): Promise<User | null> => {
    setIsLoading(true);
    try {
      const data: AuthResponse = await apiLogin(credentials);
      localStorage.setItem('accessToken', data.access_token);
      const currentUser = await apiGetMe(); // Login sonrası kullanıcı bilgisini çek
      setUser(currentUser);
      setIsLoading(false);
      return currentUser;
    } catch (error) {
      console.error('Login failed', error);
      localStorage.removeItem('accessToken');
      setUser(null);
      setIsLoading(false);
      throw error; // Hatanın component'e iletilmesi için
    }
  };

  const register = async (userData: RegisterData): Promise<User | null> => {
    setIsLoading(true);
    try {
      // API register sonrası kullanıcı bilgisini dönüyor, token dönmüyor.
      // İdealde register sonrası otomatik login olmalı veya login sayfasına yönlendirilmeli.
      // Şimdilik sadece kullanıcıyı oluşturup, login için ayrı adım bekleyelim.
      const newUser = await apiRegister(userData);
      setIsLoading(false);
      // Otomatik login isteniyorsa:
      // await login({ username: userData.email, password: userData.password });
      // return newUser; // veya login'den dönen user
      return newUser; // Sadece kayıt olan kullanıcıyı döndür, login ayrı.
    } catch (error) {
      console.error('Registration failed', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    // İsteğe bağlı: Kullanıcıyı login sayfasına yönlendir. App.tsx'de yönlendirme yapılabilir.
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, register }}>
      {!isLoading && children} {/* İçeriği sadece yükleme bittikten sonra render et */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};