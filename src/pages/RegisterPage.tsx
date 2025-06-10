// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RegisterData } from '../types';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    full_name: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }
    if (formData.password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }
    try {
      const registeredUser = await register(formData);
      if (registeredUser) {
        alert('Kayıt başarılı! Lütfen giriş yapınız.');
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.errors?.[0]?.msg || 'Kayıt başarısız oldu.');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Kayıt Ol</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">E-posta:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="full_name">Tam Ad (Opsiyonel):</label>
          <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">Şifre (min 8 karakter):</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="confirmPassword">Şifre Tekrar:</label>
          <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </div>
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        <button type="submit" disabled={isLoading} style={{ padding: '10px 15px', width: '100%', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
          {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;