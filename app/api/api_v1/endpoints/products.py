# app/api/api_v1/endpoints/products.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.schemas import product_schemas
from app.crud import crud_product
from app.db.session import get_db
from app.services import auth_service # Admin yetkilendirmesi için
from app.models.user_model import User # Tip hinti için
from app.models.product_model import Product # Tip hinti için (opsiyonel ama iyi pratik)

router = APIRouter()

@router.post(
    "/",
    response_model=product_schemas.Product,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(auth_service.get_current_active_superuser)] # Sadece adminler
)
def create_new_product(
    *,
    db: Session = Depends(get_db),
    product_in: product_schemas.ProductCreate,
    # current_user: User = Depends(auth_service.get_current_active_superuser) # dependency'de zaten var
):
    """
    Create new product. (Admin only)
    """
    # İsim tekrarı kontrolü eklenebilir (opsiyonel)
    # existing_product = db.query(Product).filter(Product.name == product_in.name).first()
    # if existing_product:
    #     raise HTTPException(status_code=400, detail="Product with this name already exists.")
    product = crud_product.create_product(db=db, product_in=product_in)
    return product

@router.get("/{product_id}", response_model=product_schemas.Product)
def read_product_by_id(
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific product by id.
    """
    db_product = crud_product.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return db_product

@router.get("/", response_model=List[product_schemas.Product]) # Veya ProductSimple
def read_all_products(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0), # Sayfalama için
    limit: int = Query(100, ge=1, le=200) # Sayfalama için
):
    """
    Retrieve all products with pagination.
    """
    products = crud_product.get_products(db, skip=skip, limit=limit)
    return products

@router.put(
    "/{product_id}",
    response_model=product_schemas.Product,
    dependencies=[Depends(auth_service.get_current_active_superuser)] # Sadece adminler
)
def update_existing_product(
    *,
    db: Session = Depends(get_db),
    product_id: int,
    product_in: product_schemas.ProductUpdate,
    # current_user: User = Depends(auth_service.get_current_active_superuser)
):
    """
    Update a product. (Admin only)
    """
    db_product = crud_product.get_product(db, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    # İsim tekrarı kontrolü (güncelleme sırasında farklı bir ürünle çakışmaması için)
    # if product_in.name:
    #     existing_product_with_name = db.query(Product).filter(Product.name == product_in.name, Product.id != product_id).first()
    #     if existing_product_with_name:
    #         raise HTTPException(status_code=400, detail="Another product with this name already exists.")
            
    product = crud_product.update_product(db=db, db_product=db_product, product_in=product_in)
    return product

@router.delete(
    "/{product_id}",
    response_model=product_schemas.Product, # Silinen ürünü döndürür
    dependencies=[Depends(auth_service.get_current_active_superuser)] # Sadece adminler
)
def delete_existing_product(
    *,
    db: Session = Depends(get_db),
    product_id: int,
    # current_user: User = Depends(auth_service.get_current_active_superuser)
):
    """
    Delete a product. (Admin only)
    """
    db_product = crud_product.get_product(db, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    # Burada ürünün siparişlerde kullanılıp kullanılmadığı gibi kontroller eklenebilir
    # Eğer kullanılıyorsa silinmesine izin verilmeyebilir veya "soft delete" yapılabilir.
    
    deleted_product = crud_product.delete_product(db=db, product_id=product_id)
    return deleted_product # crud_product.delete_product silinen nesneyi döndürüyor