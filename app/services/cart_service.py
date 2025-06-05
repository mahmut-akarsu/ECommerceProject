# app/services/cart_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.crud import crud_cart, crud_product
from app.schemas import cart_schemas
from app.models.user_model import User

def get_user_cart_details(db: Session, current_user: User) -> cart_schemas.Cart:
    cart_db = crud_cart.get_or_create_cart(db, user_id=current_user.id)
    
    total_price = 0.0
    detailed_items = []
    for item_db in cart_db.items:
        product_db = crud_product.get_product(db, product_id=item_db.product_id)
        if product_db: # Ürün hala mevcutsa
            item_total = item_db.quantity * product_db.price
            total_price += item_total
            # product Pydantic şemasına dönüştürme (CartItem şeması bunu otomatik yapacak from_attributes ile)
            detailed_items.append(cart_schemas.CartItem.from_orm(item_db)) # veya model_validate
                                  # Pydantic v1: cart_schemas.CartItem.from_orm(item_db)
                                  # Pydantic v2: cart_schemas.CartItem.model_validate(item_db)

    # Cart şemasını oluştururken total_cart_price'ı da ekleyelim
    cart_response = cart_schemas.Cart(
        id=cart_db.id,
        user_id=cart_db.user_id,
        items=detailed_items,
        total_cart_price=round(total_price, 2)
    )
    return cart_response


def add_product_to_user_cart(
    db: Session, 
    current_user: User, 
    item_in: cart_schemas.CartItemCreate
) -> cart_schemas.Cart:
    cart_db = crud_cart.get_or_create_cart(db, user_id=current_user.id)
    product_db = crud_product.get_product(db, product_id=item_in.product_id)

    if not product_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    if item_in.quantity <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be positive")

    # Stok kontrolü (CRUD'da da var, burada da yapılabilir)
    # Sepetteki mevcut miktarı da hesaba katmak gerekebilir
    existing_item = db.query(crud_cart.CartItem).filter(
        crud_cart.CartItem.cart_id == cart_db.id,
        crud_cart.CartItem.product_id == item_in.product_id
    ).first()
    
    current_quantity_in_cart = existing_item.quantity if existing_item else 0
    requested_total_quantity = current_quantity_in_cart + item_in.quantity # Eğer var olanı artırıyorsak
    if not existing_item: # Yeni ekleniyorsa
        requested_total_quantity = item_in.quantity

    if requested_total_quantity > product_db.stock_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not enough stock for product {product_db.name}. Available: {product_db.stock_quantity}, Requested: {requested_total_quantity}"
        )
    
    try:
        crud_cart.add_item_to_cart(db, cart=cart_db, product=product_db, quantity=item_in.quantity)
    except ValueError as e: # crud_cart.add_item_to_cart içindeki stok hatası
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
        
    return get_user_cart_details(db, current_user)


def update_user_cart_item(
    db: Session,
    current_user: User,
    cart_item_id: int,
    item_update_in: cart_schemas.CartItemUpdate
) -> cart_schemas.Cart:
    cart_db = crud_cart.get_or_create_cart(db, user_id=current_user.id) # Kullanıcının sepetini al
    
    # cart_item_id'nin bu kullanıcının sepetine ait olduğunu kontrol et
    cart_item_db = db.query(crud_cart.CartItem).filter(
        crud_cart.CartItem.id == cart_item_id,
        crud_cart.CartItem.cart_id == cart_db.id
    ).first()

    if not cart_item_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found in user's cart")

    if item_update_in.quantity <= 0:
        # Eğer miktar 0 veya daha az ise ürünü sepetten kaldır
        crud_cart.remove_item_from_cart(db, cart_item_id=cart_item_id, cart_id=cart_db.id)
    else:
        try:
            crud_cart.update_cart_item_quantity(db, cart_item_id=cart_item_id, quantity=item_update_in.quantity, cart_id=cart_db.id)
        except ValueError as e: # crud_cart.update_cart_item_quantity içindeki stok hatası
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
            
    return get_user_cart_details(db, current_user)


def remove_product_from_user_cart(
    db: Session,
    current_user: User,
    cart_item_id: int
) -> cart_schemas.Cart:
    cart_db = crud_cart.get_or_create_cart(db, user_id=current_user.id)
    
    if not crud_cart.remove_item_from_cart(db, cart_item_id=cart_item_id, cart_id=cart_db.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found in user's cart")
        
    return get_user_cart_details(db, current_user)

def clear_user_cart_service(db: Session, current_user: User) -> cart_schemas.Cart:
    cart_db = crud_cart.get_or_create_cart(db, user_id=current_user.id)
    crud_cart.clear_cart(db, cart_id=cart_db.id)
    return get_user_cart_details(db, current_user) # Boş sepeti döndürür