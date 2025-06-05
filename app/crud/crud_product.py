# app/crud/crud_product.py
from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.product_model import Product
from app.schemas.product_schemas import ProductCreate, ProductUpdate

def get_product(db: Session, product_id: int) -> Optional[Product]:
    return db.query(Product).filter(Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100) -> List[Product]:
    return db.query(Product).offset(skip).limit(limit).all()

def create_product(db: Session, product_in: ProductCreate) -> Product:
    db_product = Product(**product_in.model_dump()) # Pydantic v2
    # db_product = Product(**product_in.dict()) # Pydantic v1
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, db_product: Product, product_in: ProductUpdate) -> Product:
    product_data = product_in.model_dump(exclude_unset=True) # Pydantic v2
    # product_data = product_in.dict(exclude_unset=True) # Pydantic v1
    
    for field, value in product_data.items():
        setattr(db_product, field, value)
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int) -> Optional[Product]:
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product # Silinen ürünü veya bulunamadıysa None döner