// src/pages/Admin/AdminDashboardPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboardPage: React.FC = () => {
return (
    <div>
    <h1>Admin Paneli</h1>
    <nav>
        <ul style={{listStyle: 'none', padding: 0}}>
        <li style={{marginBottom: '10px'}}><Link to="/admin/products" style={{fontSize: '1.2em'}}>Ürünleri Yönet</Link></li>
        <li style={{marginBottom: '10px'}}><Link to="/admin/orders" style={{fontSize: '1.2em'}}>Siparişleri Yönet</Link></li>
        {/* Diğer admin linkleri */}
        </ul>
    </nav>
    </div>
);
};

export default AdminDashboardPage;