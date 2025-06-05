# app/schemas/cart_schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional
from .product_schemas import Product # Sepetteki ürünleri göstermek için

class CartItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0) # Miktar 0'dan büyük olmalı

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)

class CartItem(CartItemBase): # Veritabanından okunan veya sepette gösterilen
    id: int
    product: Product # Ürün detaylarını da gösterelim
    # price_at_addition: Optional[float] = None # Eğer kullanılıyorsa
    # total_price: float # Bu dinamik olarak hesaplanabilir

    class Config:
        from_attributes = True

class CartBase(BaseModel):
    pass # Şimdilik özel bir alanı yok, sadece id ve user_id üzerinden gidiyor

class Cart(CartBase): # Kullanıcıya döndürülecek sepet şeması
    id: int
    user_id: int
    items: List[CartItem] = []
    total_cart_price: float = 0.0 # Sepet toplamını da ekleyelim

    class Config:
        from_attributes = True