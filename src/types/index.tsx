// src/types/index.ts

export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
}


export interface RegisterData { // <--- export EKLENMELİ
  email: string;
  full_name?: string;
  password: string;
}
export interface CartItemProduct extends Product {
  // Product'tan miras alır, CartItem içinde product detayı için
}

export interface CartItem {
  id: number; // Sepet Öğesi ID'si
  product_id: number;
  quantity: number;
  product: CartItemProduct; // Ürün detayları
}

export interface Cart {
  id: number; // Sepet ID'si
  user_id: number;
  items: CartItem[];
  total_cart_price: number;
}

export interface OrderItem {
  // Backend dokümanında sipariş item detayı yok, basit tutalım
  product_id: number;
  quantity: number;
  price: number; // o anki fiyat
  // product_name?: string; // Frontendde göstermek için eklenebilir
}

export interface Order {
  id: number;
  user_id: number;
  created_at: string; // veya Date
  total_amount: number;
  status:  "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"; // Enum gibi
  items: OrderItem[]; // veya daha detaylı bir OrderItemProduct[]
}

export interface CreateProductData extends Omit<Product, 'id'> {} // <--- export EKLENMELİ (veya direkt tanımlanmışsa)
export interface UpdateProductData extends Partial<Omit<Product, 'id'>> {} // <--- export EKLENMELİ (veya direkt tanımlanmışsa)

export interface CreateOrderData { // <--- export EKLENMELİ
    payment_method: string;
    payment_details?: any;
}

export interface UpdateCartItemData { // <--- BU SATIRIN BAŞINDA 'export' OLDUĞUNDAN EMİN OLUN
    quantity: number;
}

export interface AddToCartData { // Bu zaten export edilmiş olmalı
    product_id: number;
    quantity: number;
}