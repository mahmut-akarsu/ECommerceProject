// src/pages/Admin/AdminOrdersPage.tsx
import React, { useEffect, useState } from 'react';
import { getAllOrdersAdmin, updateOrderStatusAdmin } from '../../api';
import { Order } from '../../types';

const AdminOrdersPage: React.FC = () => {
const [orders, setOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const fetchAdminOrders = async () => {
    setLoading(true);
    setError(null);
    try {
    const data = await getAllOrdersAdmin(0, 100); // Sayfalama eklenebilir
    setOrders(data);
    } catch (err: any) {
    setError(err.response?.data?.detail || 'Siparişler yüklenemedi.');
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    fetchAdminOrders();
}, []);

const handleStatusChange = async (orderId: number, newStatus: Order['status']) => {
    if (window.confirm(`Sipariş #${orderId} durumunu "${newStatus}" olarak değiştirmek istediğinizden emin misiniz?`)) {
    try {
        await updateOrderStatusAdmin(orderId, newStatus);
        alert('Sipariş durumu başarıyla güncellendi.');
        fetchAdminOrders(); // Listeyi yenile
    } catch (err: any) {
        alert(`Durum güncellenirken hata: ${err.response?.data?.detail || err.message}`);
    }
    }
};

const orderStatuses: Order['status'][] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];


if (loading) return <p>Admin siparişleri yükleniyor...</p>;
if (error) return <p style={{ color: 'red' }}>{error}</p>;

return (
    <div>
    <h2>Sipariş Yönetimi</h2>
    {orders.length === 0 && <p>Yönetilecek sipariş bulunamadı.</p>}
    <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
        <tr style={{borderBottom: '2px solid #333'}}>
            <th style={{textAlign: 'left', padding: '8px'}}>ID</th>
            <th style={{textAlign: 'left', padding: '8px'}}>Kullanıcı ID</th>
            <th style={{textAlign: 'left', padding: '8px'}}>Tarih</th>
            <th style={{textAlign: 'left', padding: '8px'}}>Tutar</th>
            <th style={{textAlign: 'left', padding: '8px'}}>Mevcut Durum</th>
            <th style={{textAlign: 'center', padding: '8px'}}>Durumu Değiştir</th>
        </tr>
        </thead>
        <tbody>
        {orders.map((order) => (
            <tr key={order.id} style={{borderBottom: '1px solid #eee'}}>
            <td style={{padding: '8px'}}>{order.id}</td>
            <td style={{padding: '8px'}}>{order.user_id}</td>
            <td style={{padding: '8px'}}>{new Date(order.created_at).toLocaleDateString('tr-TR')}</td>
            <td style={{padding: '8px'}}>{order.total_amount.toFixed(2)} TL</td>
            <td style={{padding: '8px', fontWeight: 'bold'}}>{order.status}</td>
            <td style={{padding: '8px', textAlign: 'center'}}>
                <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                style={{padding: '5px'}}
                >
                {orderStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
                </select>
            </td>
            </tr>
        ))}
        </tbody>
    </table>
    </div>
);
};
export default AdminOrdersPage;