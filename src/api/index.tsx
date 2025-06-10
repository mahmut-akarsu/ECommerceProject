// src/api/index.ts
import axios from 'axios';
import {
  User, AuthResponse, Product, Cart, Order, RegisterData, CreateProductData, UpdateProductData,
  AddToCartData, UpdateCartItemData, CreateOrderData
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Authentication ---
export const registerUser = async (userData: RegisterData): Promise<User> => {
  const response = await apiClient.post<User>('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
  const params = new URLSearchParams();
  params.append('username', credentials.username);
  params.append('password', credentials.password);
  const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

// --- Products ---
export const getProducts = async (skip: number = 0, limit: number = 10): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>(`/products/?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getProductById = async (productId: string | number): Promise<Product> => {
  const response = await apiClient.get<Product>(`/products/${productId}`);
  return response.data;
};

export const createProduct = async (productData: CreateProductData): Promise<Product> => {
  const response = await apiClient.post<Product>('/products/', productData);
  return response.data;
};

export const updateProduct = async (productId: string | number, productData: UpdateProductData): Promise<Product> => {
  const response = await apiClient.put<Product>(`/products/${productId}`, productData);
  return response.data;
};

export const deleteProduct = async (productId: string | number): Promise<void> => {
  await apiClient.delete(`/products/${productId}`);
};

// --- Shopping Cart ---
export const getCart = async (): Promise<Cart> => {
  const response = await apiClient.get<Cart>('/cart/');
  return response.data;
};

export const addItemToCart = async (itemData: AddToCartData): Promise<Cart> => {
  const response = await apiClient.post<Cart>('/cart/items', itemData);
  return response.data;
};

export const updateCartItem = async (cartItemId: number, itemData: UpdateCartItemData): Promise<Cart> => {
  const response = await apiClient.put<Cart>(`/cart/items/${cartItemId}`, itemData);
  return response.data;
};

export const removeCartItem = async (cartItemId: number): Promise<Cart> => {
  const response = await apiClient.delete<Cart>(`/cart/items/${cartItemId}`);
  return response.data;
};

export const clearCart = async (): Promise<Cart> => { // API'niz boş sepet döndürüyorsa Cart, yoksa void
  const response = await apiClient.delete<Cart>('/cart/');
  return response.data;
};

// --- Orders ---
export const createOrderFromCart = async (orderData: CreateOrderData): Promise<Order> => {
  const response = await apiClient.post<Order>(`/orders/?payment_method=${orderData.payment_method}`, orderData.payment_details || {});
  return response.data;
};

export const getMyOrders = async (skip: number = 0, limit: number = 10): Promise<Order[]> => {
  const response = await apiClient.get<Order[]>(`/orders/?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getOrderById = async (orderId: string | number): Promise<Order> => {
  const response = await apiClient.get<Order>(`/orders/${orderId}`);
  return response.data;
};

// Admin Order Endpoints
export const getAllOrdersAdmin = async (skip: number = 0, limit: number = 10): Promise<Order[]> => {
  const response = await apiClient.get<Order[]>(`/orders/admin/all?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const updateOrderStatusAdmin = async (orderId: string | number, newStatus: Order['status']): Promise<Order> => {
  const response = await apiClient.patch<Order>(`/orders/admin/${orderId}/status?new_status=${newStatus}`);
  return response.data;
};

export default apiClient;