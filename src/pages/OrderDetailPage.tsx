// src/pages/OrderDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderById } from '../api';
import { Order } from '../types';

const OrderDetailPage: React.FC = () => {
const { orderId } = useParams<{ orderId: string }>();
const [order, setOrder] = useState<Order | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
    if (!orderId) {
    setError('Sipariş ID bulunamadı.');
    setLoading(false);
    return;
    }
    const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
        const data = await getOrderById(orderId);
        setOrder(data);
    } catch (err: any) {
        setError(err.response?.data?.detail || 'Sipariş detayı yüklenemedi.');
        if(err.response?.status === 404) setOrder(null);
    } finally {
        setLoading(false);
    }
    };
    fetchOrder();
}, [orderId]);

if (loading) return <p>Sipariş detayı yükleniyor...</p>;
if (error && !order) return <p style={{ color: 'red' }}>{error}</p>;
if (!order) return <p>Sipariş bulunamadı.</p>;

return (
    <div>
    <h2>Sipariş Detayı #{order.id}</h2>
    <p><strong>Tarih:</strong> {new Date(order.created_at).toLocaleString('tr-TR')}</p>
    <p><strong>Toplam Tutar:</strong> {order.total_amount.toFixed(2)} TL</p>
    <p><strong>Durum:</strong> {order.status}</p>
    <h3>Sipariş Kalemleri:</h3>
    {order.items && order.items.length > 0 ? (
        <ul style={{listStyle:'none', padding:0}}>
        {order.items.map((item, index) => (
            <li key={index} style={{borderBottom: '1px solid #eee', padding: '10px 0'}}>
                {/* API'niz sipariş item'ında ürün adı veya görseli dönüyorsa burada gösterin */}
                <p>Ürün ID: {item.product_id} (isim ve görsel için product detayları çekilebilir)</p>
                <p>Miktar: {item.quantity}</p>
                <p>Birim Fiyat (Satın Alma Anı): {item.price_at_purchase ? item.price_at_purchase.toFixed(2) : 'N/A'} TL</p>
            </li>
        ))}
        </ul>
    ) : <p>Sipariş kalemi bulunmuyor.</p>}
    </div>
);
};

export default OrderDetailPage;