# app/models/order_model.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.session import Base

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"          # Beklemede (Ödeme bekleniyor veya işleniyor)
    PROCESSING = "PROCESSING"    # İşleniyor (Ödeme alındı, hazırlanıyor)
    SHIPPED = "SHIPPED"          # Kargoya Verildi
    DELIVERED = "DELIVERED"        # Teslim Edildi
    CANCELLED = "CANCELLED"        # İptal Edildi
    FAILED = "FAILED"            # Başarısız (Ödeme hatası vb.)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    total_amount = Column(Float, nullable=False)
    status = Column(SQLAlchemyEnum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    
    # Adres bilgileri eklenebilir
    # shipping_address_line1 = Column(String(255))
    # shipping_city = Column(String(100))
    # shipping_postal_code = Column(String(20))
    # payment_method = Column(String(50)) # Ödeme yöntemi (örn: "credit_card", "paypal_mock")

    owner = relationship("User", back_populates="orders") # User modeline 'orders' eklenecek
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False) # Ürün silinirse ne olacak? Nullable yapıp ürün adı saklanabilir veya cascade.
    quantity = Column(Integer, nullable=False)
    price_at_purchase = Column(Float, nullable=False) # Ürünün satın alındığı andaki fiyatı

    order = relationship("Order", back_populates="items")
    product = relationship("Product") # Product modeline 'order_items' eklenebilir