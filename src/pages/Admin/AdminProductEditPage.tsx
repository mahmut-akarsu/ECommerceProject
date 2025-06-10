// src/pages/Admin/AdminProductEditPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, createProduct, updateProduct } from '../../api';
import { Product, CreateProductData, UpdateProductData } from '../../types';

const AdminProductEditPage: React.FC = () => {
const { productId } = useParams<{ productId?: string }>(); // productId opsiyonel, yeni ürün için olmayacak
const navigate = useNavigate();
const isEditing = Boolean(productId);

const [productData, setProductData] = useState<Partial<CreateProductData | UpdateProductData>>({
    name: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    image_url: ''
});
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
    if (isEditing && productId) {
    setLoading(true);
    getProductById(productId)
        .then(data => {
        setProductData(data);
        setLoading(false);
        })
        .catch(err => {
        setError('Ürün yüklenemedi.');
        setLoading(false);
        });
    }
}, [isEditing, productId]);

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({
    ...prev,
    [name]: name === 'price' || name === 'stock_quantity' ? parseFloat(value) || 0 : value
    }));
};

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basit validasyon
    if (!productData.name || (productData.price !== undefined && productData.price <= 0) || (productData.stock_quantity !== undefined && productData.stock_quantity < 0)) {
        setError("Lütfen gerekli alanları doğru şekilde doldurun (İsim zorunlu, Fiyat > 0, Stok >= 0).");
        setLoading(false);
        return;
    }

    try {
    if (isEditing && productId) {
        await updateProduct(productId, productData as UpdateProductData);
        alert('Ürün başarıyla güncellendi!');
    } else {
        await createProduct(productData as CreateProductData);
        alert('Ürün başarıyla oluşturuldu!');
    }
    navigate('/admin/products');
    } catch (err: any) {
    setError(err.response?.data?.detail || (isEditing ? 'Güncelleme' : 'Oluşturma') + ' başarısız.');
    } finally {
    setLoading(false);
    }
};

if (loading && isEditing) return <p>Ürün bilgileri yükleniyor...</p>;

return (
    <div>
    <h2>{isEditing ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h2>
    <form onSubmit={handleSubmit} style={{maxWidth: '600px'}}>
        <div style={{marginBottom: '1rem'}}>
        <label htmlFor="name">Ürün Adı:</label>
        <input type="text" id="name" name="name" value={productData.name || ''} onChange={handleChange} required style={{width: '100%', padding: '8px'}}/>
        </div>
        <div style={{marginBottom: '1rem'}}>
        <label htmlFor="description">Açıklama:</label>
        <textarea id="description" name="description" value={productData.description || ''} onChange={handleChange} style={{width: '100%', padding: '8px', minHeight: '100px'}}/>
        </div>
        <div style={{marginBottom: '1rem'}}>
        <label htmlFor="price">Fiyat (TL):</label>
        <input type="number" step="0.01" id="price" name="price" value={productData.price || 0} onChange={handleChange} required min="0.01" style={{width: '100%', padding: '8px'}}/>
        </div>
        <div style={{marginBottom: '1rem'}}>
        <label htmlFor="stock_quantity">Stok Miktarı:</label>
        <input type="number" id="stock_quantity" name="stock_quantity" value={productData.stock_quantity || 0} onChange={handleChange} required min="0" style={{width: '100%', padding: '8px'}}/>
        </div>
        <div style={{marginBottom: '1rem'}}>
        <label htmlFor="image_url">Görsel URL:</label>
        <input type="url" id="image_url" name="image_url" value={productData.image_url || ''} onChange={handleChange} style={{width: '100%', padding: '8px'}}/>
        </div>
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{padding: '10px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px'}}>
        {loading ? 'Kaydediliyor...' : (isEditing ? 'Güncelle' : 'Oluştur')}
        </button>
    </form>
    </div>
);
};
export default AdminProductEditPage;