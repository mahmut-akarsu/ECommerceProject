# app/schemas/product_schemas.py
from pydantic import BaseModel, HttpUrl
from typing import Optional
from pydantic import Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    price: float = Field(..., gt=0) # Fiyat 0'dan büyük olmalı
    stock_quantity: int = Field(..., ge=0) # Stok 0 veya daha büyük olmalı
    image_url: Optional[HttpUrl] = None # Geçerli bir URL olmalı (opsiyonel)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    # Güncellemede tüm alanlar opsiyonel olabilir
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)

class ProductInDBBase(ProductBase):
    id: int

    class Config:
        from_attributes = True # Pydantic v2
        # orm_mode = True # Pydantic v1

class Product(ProductInDBBase):
    pass

# Listeleme için daha basit bir şema da tanımlanabilir (opsiyonel)
class ProductSimple(BaseModel):
    id: int
    name: str
    price: float
    image_url: Optional[HttpUrl] = None

    class Config:
        from_attributes = True