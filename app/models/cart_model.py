# app/models/cart_model.py
from sqlalchemy import Column, Integer, ForeignKey, Float
from sqlalchemy.orm import relationship

from app.db.session import Base

class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False) # Her kullanıcının tek sepeti

    owner = relationship("User", back_populates="cart") # User modeline 'cart' eklenecek
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

    # Sepet toplamını hesaplamak için bir property eklenebilir (servis katmanında da yapılabilir)
    # @property
    # def total_price(self) -> float:
    #     return sum(item.total_price for item in self.items)

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    # price_at_addition = Column(Float, nullable=False) # Ürünün sepete eklendiği andaki fiyatı (opsiyonel)

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product") # Product modeline 'cart_items' eklenebilir (opsiyonel)

    # Sepet öğesinin toplam fiyatı (servis katmanında da yapılabilir)
    # @property
    # def total_price(self) -> float:
    #     return self.quantity * self.product.price # Veya price_at_addition kullanılıyorsa o