// src/pages/ProductDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../api';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem, isLoading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    if (!productId) {
      setError('Ürün ID bulunamadı.');
      setLoading(false);
      return;
    }
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(productId);
        setProduct(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Ürün yüklenirken bir hata oluştu.');
        console.error(err);
        if (err.response?.status === 404) {
            setProduct(null); // Ürün bulunamadı
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      alert("Lütfen önce giriş yapınız.");
      navigate('/login', { state: { from: window.location.pathname }});
      return;
    }
    if (quantity > product.stock_quantity) {
        alert("Stokta yeterli ürün bulunmamaktadır.");
        return;
    }
    try {
      await addItem({ product_id: product.id, quantity });
      alert(`${quantity} adet ${product.name} sepete eklendi!`);
    } catch (err) {
      alert('Ürün sepete eklenirken bir sorun oluştu.');
    }
  };

  if (loading) return <p>Ürün detayı yükleniyor...</p>;
  if (error && !product) return <p style={{ color: 'red' }}>{error}</p>; // Sadece ürün null ise hata göster
  if (!product) return <p>Ürün bulunamadı.</p>;

  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 40%' }}>
        {product.image_url && (
          <img src={product.image_url} alt={product.name} style={{ width: '100%', borderRadius: '8px', border: '1px solid #eee' }}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
      </div>
      <div style={{ flex: '1 1 60%' }}>
        <h1>{product.name}</h1>
        <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#007bff' }}>{product.price.toFixed(2)} TL</p>
        <p><strong>Stok Durumu:</strong> {product.stock_quantity > 0 ? `${product.stock_quantity} adet` : <span style={{color: 'red'}}>Tükendi</span>}</p>
        <p>{product.description || "Bu ürün için açıklama bulunmamaktadır."}</p>

        {product.stock_quantity > 0 && (
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label htmlFor="quantity">Miktar:</label>
            <input
                type="number"
                id="quantity"
                value={quantity}
                min="1"
                max={product.stock_quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                style={{ padding: '8px', width: '70px', textAlign: 'center' }}
            />
            <button
                onClick={handleAddToCart}
                disabled={cartLoading || quantity > product.stock_quantity}
                style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                {cartLoading ? 'Ekleniyor...' : 'Sepete Ekle'}
            </button>
            </div>
        )}
         {quantity > product.stock_quantity && product.stock_quantity > 0 && <p style={{color: 'red', marginTop: '0.5rem'}}>Seçilen miktar stoktan fazla!</p>}
      </div>
    </div>
  );
};

export default ProductDetailPage;