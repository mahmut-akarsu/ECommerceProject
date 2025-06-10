// src/pages/OrdersPage.tsx
import React, { useEffect, useState } from 'react';
import { getMyOrders } from '../api';
import { Order } from '../types';
import { Link } from 'react-router-dom';

const OrdersPage: React.FC = () => {
const [orders, setOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
    const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
        const data = await getMyOrders(); // Sayfalama eklenebilir
        setOrders(data);
    } catch (err: any) {
        setError(err.response?.data?.detail || 'Siparişler yüklenemedi.');
    } finally {
        setLoading(false);
    }
    };
    fetchOrders();
}, []);

if (loading) return <p>Siparişleriniz yükleniyor...</p>;
if (error) return <p style={{ color: 'red' }}>{error}</p>;
if (orders.length === 0) return <p>Henüz siparişiniz bulunmamaktadır.</p>;

return (
    <div>
    <h2>Siparişlerim</h2>
    <ul style={{ listStyle: 'none', padding: 0 }}>
        {orders.map((order) => (
        <li key={order.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Sipariş ID: #{order.id}</h3>
            <Link to={`/orders/${order.id}`} style={{textDecoration: 'none', padding: '8px 12px', background: '#007bff', color: 'white', borderRadius: '4px'}}>Detayları Gör</Link>
            </div>
            <p>Tarih: {new Date(order.created_at).toLocaleDateString('tr-TR')} - {new Date(order.created_at).toLocaleTimeString('tr-TR')}</p>
            <p>Toplam Tutar: {order.total_amount.toFixed(2)} TL</p>
            <p>Durum: <span style={{fontWeight: 'bold'}}>{order.status}</span></p>
            {/* Sipariş item'ları da burada kısaca listelenebilir */}
        </li>
        ))}
    </ul>
    </div>
);
};

export default OrdersPage;