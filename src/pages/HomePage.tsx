// src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext'; // Sepet context'i
import { useAuth } from '../contexts/AuthContext'; // Auth context'i

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem, isLoading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(0); // skip parametresi için
const productsPerPage = 12; // limit parametresi için

  useEffect(() => {
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts(currentPage * productsPerPage, productsPerPage);
      setProducts(data);
      // Eğer API toplam ürün sayısını dönüyorsa, toplam sayfa sayısı hesaplanabilir
    } catch (err: any) {
      // ... hata yönetimi ...
    } finally {
      setLoading(false);
    }
  };
  fetchProducts();
}, [currentPage, productsPerPage]);

  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated) {
      alert("Lütfen önce giriş yapınız.");
      // Veya login sayfasına yönlendir
      return;
    }
    try {
      await addItem({ product_id: productId, quantity: 1 });
      alert('Ürün sepete eklendi!');
    } catch (err) {
      alert('Ürün sepete eklenirken bir sorun oluştu.');
    }
  };

  if (loading) return <p>Ürünler yükleniyor...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Ürünler</h1>
      {products.length === 0 && <p>Gösterilecek ürün bulunamadı.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  style={{ width: '100%', height: '200px', objectFit: 'contain', marginBottom: '10px', borderRadius: '4px' }}
                  onError={(e) => (e.currentTarget.style.display = 'none')} // Resim yüklenemezse gizle
                />
              )}
              <h3 style={{ minHeight: '3em' /* İki satırlık başlık alanı */ }}>{product.name}</h3>
            </Link>
            <p style={{ fontWeight: 'bold', fontSize: '1.2em', color: '#333' }}>{product.price.toFixed(2)} TL</p>
            <p>Stok: {product.stock_quantity > 0 ? product.stock_quantity : <span style={{color: 'red'}}>Tükendi</span>}</p>
            {product.stock_quantity > 0 && (
              <button
                onClick={() => handleAddToCart(product.id)}
                disabled={cartLoading}
                style={{ padding: '8px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                {cartLoading ? 'Ekleniyor...' : 'Sepete Ekle'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;