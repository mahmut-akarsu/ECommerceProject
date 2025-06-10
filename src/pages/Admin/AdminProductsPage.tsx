// src/pages/Admin/AdminProductsPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct as apiDeleteProduct } from '../../api';
import { Product } from '../../types';

const AdminProductsPage: React.FC = () => {
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const fetchAdminProducts = async () => {
    setLoading(true);
    setError(null);
    try {
    const data = await getProducts(0, 100); // Tüm ürünleri al (veya sayfalama ekle)
    setProducts(data);
    } catch (err: any) {
    setError(err.response?.data?.detail || 'Ürünler yüklenemedi.');
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    fetchAdminProducts();
}, []);

const handleDeleteProduct = async (productId: number) => {
    if (window.confirm(`${productId} ID'li ürünü silmek istediğinizden emin misiniz?`)) {
    try {
        await apiDeleteProduct(productId);
        alert('Ürün başarıyla silindi.');
        fetchAdminProducts(); // Listeyi yenile
    } catch (err: any) {
        alert(`Ürün silinirken hata: ${err.response?.data?.detail || err.message}`);
    }
    }
};

if (loading) return <p>Admin ürünleri yükleniyor...</p>;
if (error) return <p style={{ color: 'red' }}>{error}</p>;

return (
    <div>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h2>Ürün Yönetimi</h2>
        <Link to="/admin/products/new" style={{padding: '10px 15px', background: 'green', color: 'white', textDecoration: 'none', borderRadius: '4px'}}>Yeni Ürün Ekle</Link>
    </div>
    {products.length === 0 && <p>Yönetilecek ürün bulunamadı.</p>}
    <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
        <tr style={{borderBottom: '2px solid #333'}}>
            <th style={{textAlign: 'left', padding: '8px'}}>ID</th>
            <th style={{textAlign: 'left', padding: '8px'}}>Ad</th>
            <th style={{textAlign: 'left', padding: '8px'}}>Fiyat</th>
            <th style={{textAlign: 'left', padding: '8px'}}>Stok</th>
            <th style={{textAlign: 'center', padding: '8px'}}>İşlemler</th>
        </tr>
        </thead>
        <tbody>
        {products.map((product) => (
            <tr key={product.id} style={{borderBottom: '1px solid #eee'}}>
            <td style={{padding: '8px'}}>{product.id}</td>
            <td style={{padding: '8px'}}>{product.name}</td>
            <td style={{padding: '8px'}}>{product.price.toFixed(2)} TL</td>
            <td style={{padding: '8px'}}>{product.stock_quantity}</td>
            <td style={{padding: '8px', textAlign: 'center'}}>
                <Link to={`/admin/products/edit/${product.id}`} style={{marginRight: '10px', color: 'blue'}}>Düzenle</Link>
                <button onClick={() => handleDeleteProduct(product.id)} style={{color: 'red', background: 'none', border: 'none', cursor: 'pointer'}}>Sil</button>
            </td>
            </tr>
        ))}
        </tbody>
    </table>
    </div>
);
};
export default AdminProductsPage;