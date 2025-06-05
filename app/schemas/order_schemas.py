# app/schemas/order_schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from .product_schemas import Product # OrderItem'da ürün detayları için
from app.models.order_model import OrderStatus # Enum'u kullanmak için

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price_at_purchase: float # Sipariş oluşturulurken sepetten veya güncel fiyattan alınacak

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int
    product: Product # Ürün detaylarını da gösterelim

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    # Sipariş oluştururken kullanıcıdan alınacak ek bilgiler (adres vb.) buraya eklenebilir
    # payment_method: str # Ödeme yöntemi seçimi
    pass

class OrderCreate(OrderBase):
    # Sipariş oluşturma isteğinde özel bir şey gerekmiyorsa (sepetten otomatik alınıyorsa) boş kalabilir
    # Veya kullanıcıdan shipping_address gibi bilgiler alınabilir
    # shipping_address_line1: Optional[str] = None
    # shipping_city: Optional[str] = None
    pass

class Order(OrderBase): # Veritabanından okunan veya kullanıcıya döndürülecek sipariş
    id: int
    user_id: int
    created_at: datetime
    total_amount: float
    status: OrderStatus
    items: List[OrderItem] = []

    class Config:
        from_attributes = True