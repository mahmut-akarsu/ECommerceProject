// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate  } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage'; // Yeni

// Admin Pages
import AdminDashboardPage from './pages/Admin/AdminDashboardPage'; // Yeni
import AdminProductsPage from './pages/Admin/AdminProductsPage';
import AdminProductEditPage from './pages/Admin/AdminProductEditPage'; // Yeni
import AdminOrdersPage from './pages/Admin/AdminOrdersPage';

// Layouts (Opsiyonel ama iyi bir pratik)
// import MainLayout from './layouts/MainLayout';
// import AdminLayout from './layouts/AdminLayout';

const ProtectedRoute = ({ children, adminOnly = false }: { children: JSX.Element, adminOnly?: boolean }) => {
  const { isAuthenticated, user, logout, isLoading: authLoading } = useAuth();
  const { cart, isLoading: cartLoading, clearClientCart } = useCart(); // 'clearClientCart' buradan geliyor
  const navigate = useNavigate();
  const location = useLocation();

  if (authLoading) {
    return <div>Kimlik bilgileri yükleniyor...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !user?.is_superuser) {
    return <Navigate to="/" replace />; // Yetkisiz erişim, ana sayfaya yönlendir
  }

  return children;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, user, logout, isLoading: authLoading } = useAuth();
  const { cart, isLoading: cartLoading, clearClientCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout(); // AuthContext'ten logout'u çağır
    clearClientCart(); // Sepet context'indeki sepet verisini de temizle
    navigate('/login', { replace: true }); // Login sayfasına yönlendir
  };

  if (authLoading) { // Auth context yüklenene kadar bekle
    return <div style={{textAlign: 'center', padding: '50px', fontSize: '1.5em'}}>Yükleniyor...</div>;
  }

  return (
    <>
      <header style={{
          padding: '1rem 0',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}>
        <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Link to="/" style={{ marginRight: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
              E-Ticaret
            </Link>
            <Link to="/products" style={{ marginRight: '1rem', color: '#555' }}>Ürünler</Link>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <Link to="/cart" style={{ position: 'relative', color: '#555' }}>
              Sepet
              {isAuthenticated && cart && cart.items.length > 0 && ( // Sepet sayısını sadece giriş yapmışsa ve sepet varsa göster
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-12px',
                  background: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  minWidth: '18px',
                  textAlign: 'center'
                }}>
                  {cart.items.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/orders" style={{ color: '#555' }}>Siparişlerim</Link>
                {user?.is_superuser && (
                  <Link to="/admin" style={{ color: '#555' }}>Admin</Link>
                )}
                {/* Basit Çıkış Butonu */}
                <button
                  onClick={handleLogout} // GÜNCELLENDİ
                  style={{
                    background: 'transparent',
                    border: '1px solid #dc3545',
                    color: '#dc3545',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Çıkış Yap ({user?.full_name?.split(' ')[0] || user?.email})
                </button>
                {/* Daha önceki dropdown menü de kullanılabilir, onun içindeki çıkış butonu handleLogout'u çağırır */}
              </>
            ) : (
              <>
                <Link to="/login" style={{ color: '#555' }}>Giriş Yap</Link>
                <Link to="/register" style={{
                    marginLeft: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '4px'
                  }}>Kayıt Ol</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem', minHeight: 'calc(100vh - 150px)' }}>
        { (authLoading || (isAuthenticated && cartLoading) ) && location.pathname !== '/login' && location.pathname !== '/register' ? (
            <div style={{textAlign: 'center', padding: '50px', fontSize: '1.2em'}}>Sayfa içeriği yükleniyor...</div>
        ) : (
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/products/:productId" element={<ProductDetailPage />} />

                {/* Protected User Routes */}
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboardPage /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute adminOnly={true}><AdminProductsPage /></ProtectedRoute>} />
                <Route path="/admin/products/new" element={<ProtectedRoute adminOnly={true}><AdminProductEditPage /></ProtectedRoute>} />
                <Route path="/admin/products/edit/:productId" element={<ProtectedRoute adminOnly={true}><AdminProductEditPage /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute adminOnly={true}><AdminOrdersPage /></ProtectedRoute>} />

                <Route path="*" element={<div style={{textAlign: 'center', marginTop: '50px'}}><h2>404 - Sayfa Bulunamadı</h2><p>Aradığınız sayfa mevcut değil.</p><Link to="/">Ana Sayfaya Dön</Link></div>} />
            </Routes>
        )}
      </main>
      <footer style={{ textAlign: 'center', padding: '1.5rem 0', background: '#333', color: 'white', marginTop: 'auto' }}>
        <p>© {new Date().getFullYear()} E-Ticaret Sitesi. Tüm hakları saklıdır.</p>
      </footer>
    </>
  );
}

function App() {
  return (
    <Router> {/* Router'ı en dışa aldık */}
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;