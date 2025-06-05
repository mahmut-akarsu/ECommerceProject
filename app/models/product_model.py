# app/models/product_model.py
from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.orm import relationship # Eğer ürün ile başka tablolar arasında ilişki olacaksa

from app.db.session import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0) # Stok miktarı
    image_url = Column(String(500), nullable=True) # Ürün görseli URL'i

    # Örnek: Eğer bir kategoriye aitse
    # category_id = Column(Integer, ForeignKey("categories.id"))
    # category = relationship("Category", back_populates="products")

    # Örnek: Sipariş kalemlerinde bu ürün kullanılabilir
    # order_items = relationship("OrderItem", back_populates="product")