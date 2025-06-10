// src/pages/CartPage.tsx
import React, { useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { createOrderFromCart } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { CreateOrderData } from '../types';

const CartPage: React.FC = () => {
  const { cart, isLoading, error, fetchCart, updateItemQuantity, removeItem, clearServerCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // fetchCart context içinde otomatik çağrılıyor, ama manuel tetikleme için burada bırakılabilir
    // fetchCart();
  }, [fetchCart]);

  const handleCreateOrder = async () => {
    if (!cart || cart.items.length === 0) {
      alert('Sipariş oluşturmak için sepetinizde ürün olmalıdır.');
      return;
    }
    try {
      const orderData: CreateOrderData = {
        payment_method: 'credit_card', // Veya kullanıcıdan alınır
        // payment_details: { cardNumber: 'mock' } // Opsiyonel
      };
      const order = await createOrderFromCart(orderData);
      alert(`Siparişiniz başarıyla oluşturuldu! Sipariş ID: ${order.id}`);
      fetchCart(); // Sepet temizlendiği için sepeti yeniden yükle (API'de sepet temizleniyorsa)
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      alert(`Sipariş oluşturulurken bir hata oluştu: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleQuantityChange = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) { // Miktar 0 veya daha azsa ürünü sil
        handleRemoveItem(cartItemId);
        return;
    }
    try {
        await updateItemQuantity(cartItemId, newQuantity);
    } catch (err) {
        // Hata context'te yönetiliyor, burada ek bir şey yapılabilir.
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
        await removeItem(cartItemId);
    } catch (err) {
        // Hata context'te yönetiliyor.
    }
  };

  if (isLoading && !cart) return <p>Sepet yükleniyor...</p>;
  if (error && !cart) return <p style={{ color: 'red' }}>Hata: {error}</p>;
  if (!cart || cart.items.length === 0) {
    return (
        <div>
            <h2>Alışveriş Sepetiniz</h2>
            <p>Sepetiniz boş.</p>
            <Link to="/products">Alışverişe Devam Et</Link>
        </div>
    );
  }

  return (
    <div>
      <h2>Alışveriş Sepetiniz</h2>
      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
      {cart.items.map((item) => (
        <div key={item.id} style={{ border: '1px solid #eee', padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {item.product.image_url && <img src={item.product.image_url} alt={item.product.name} style={{ width: '80px', height: '80px', objectFit: 'contain' }} onError={(e) => e.currentTarget.style.display='none'} />}
          <div style={{ flexGrow: 1 }}>
            <Link to={`/products/${item.product.id}`} style={{textDecoration: 'none', color: 'inherit'}}><h3>{item.product.name}</h3></Link>
            <p>Birim Fiyat: {item.product.price.toFixed(2)} TL</p>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} disabled={isLoading}>-</button>
            <span>{item.quantity}</span>
            <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} disabled={isLoading || item.quantity >= item.product.stock_quantity}>+</button>
            {item.quantity >= item.product.stock_quantity && <small style={{color: 'orange', marginLeft: '5px'}}>Max Stok</small>}
          </div>
          <p style={{minWidth: '80px', textAlign: 'right'}}>{(item.product.price * item.quantity).toFixed(2)} TL</p>
          <button onClick={() => handleRemoveItem(item.id)} disabled={isLoading} style={{background: 'red', color: 'white', border: 'none', padding: '5px 10px'}}>Sil</button>
        </div>
      ))}
      <div style={{ marginTop: '2rem', textAlign: 'right', borderTop: '2px solid #333', paddingTop: '1rem' }}>
        <button onClick={clearServerCart} disabled={isLoading || cart.items.length === 0} style={{ marginRight: '1rem', background: 'gray' }}>Sepeti Boşalt</button>
        <h3>Toplam Tutar: {cart.total_cart_price.toFixed(2)} TL</h3>
        <button onClick={handleCreateOrder} disabled={isLoading || cart.items.length === 0} style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1em' }}>
          {isLoading ? 'İşleniyor...' : 'Siparişi Tamamla'}
        </button>
      </div>
    </div>
  );
};

export default CartPage;