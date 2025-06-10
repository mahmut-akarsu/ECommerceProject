// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading, isAuthenticated } = useAuth(); // isAuthenticated eklendi
  const navigate = useNavigate();
  const location = useLocation();

  // Eğer kullanıcı zaten giriş yapmışsa ve login sayfasına gelirse, ana sayfaya yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);


  const from = location.state?.from?.pathname || '/'; // ProtectedRoute'tan gelen yönlendirme bilgisi

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
        setError("E-posta ve şifre alanları zorunludur.");
        return;
    }
    try {
      await login({ username: email, password }); // AuthContext'teki login fonksiyonu çağrılıyor
      navigate(from, { replace: true }); // Başarılı girişte önceki sayfaya veya ana sayfaya yönlendir
    } catch (err: any) {
      // Hata mesajını API'den veya genel bir mesaj olarak ayarla
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin.');
      }
      console.error("Login Error:", err);
    }
  };

  // Eğer hala auth yükleniyorsa veya kullanıcı zaten giriş yapmışsa bir şey gösterme (veya loading)
  if (isLoading || isAuthenticated) {
    return <div>Yönlendiriliyor...</div>; // Veya null, ya da bir spinner
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Giriş Yap</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>E-posta Adresiniz:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
            placeholder="ornek@eposta.com"
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>Şifreniz:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
            placeholder="Şifreniz"
          />
        </div>
        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        Hesabınız yok mu? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Kayıt Olun</Link>
      </p>
    </div>
  );
};

export default LoginPage;