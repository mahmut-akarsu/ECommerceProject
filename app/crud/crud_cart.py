# app/crud/crud_cart.py
from sqlalchemy.orm import Session
from typing import Optional

from app.models.cart_model import Cart, CartItem
from app.models.user_model import User
from app.models.product_model import Product
from app.schemas.cart_schemas import CartItemCreate, CartItemUpdate

def get_cart_by_user_id(db: Session, user_id: int) -> Optional[Cart]:
    return db.query(Cart).filter(Cart.user_id == user_id).first()

def create_cart(db: Session, user_id: int) -> Cart:
    db_cart = Cart(user_id=user_id)
    db.add(db_cart)
    db.commit()
    db.refresh(db_cart)
    return db_cart

def get_or_create_cart(db: Session, user_id: int) -> Cart:
    db_cart = get_cart_by_user_id(db, user_id=user_id)
    if not db_cart:
        db_cart = create_cart(db, user_id=user_id)
    return db_cart

def add_item_to_cart(db: Session, cart: Cart, product: Product, quantity: int) -> CartItem:
    # Aynı üründen sepette var mı kontrol et
    db_cart_item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == product.id).first()
    
    if db_cart_item:
        # Varsa miktarını artır
        db_cart_item.quantity += quantity
    else:
        # Yoksa yeni bir öğe olarak ekle
        db_cart_item = CartItem(
            cart_id=cart.id,
            product_id=product.id,
            quantity=quantity
            # price_at_addition=product.price # Eğer fiyatı o anki haliyle saklamak isterseniz
        )
        db.add(db_cart_item)
    
    # Stok kontrolü burada veya serviste yapılabilir
    if db_cart_item.quantity > product.stock_quantity:
        # Yeterli stok yoksa hata ver veya maksimum stok kadar ekle
        # Şimdilik basit tutalım, serviste daha detaylı ele alınabilir
        raise ValueError(f"Not enough stock for product {product.name}. Available: {product.stock_quantity}, Requested: {db_cart_item.quantity}")

    db.commit()
    db.refresh(db_cart_item)
    return db_cart_item


def update_cart_item_quantity(db: Session, cart_item_id: int, quantity: int, cart_id: int) -> Optional[CartItem]:
    db_cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id, CartItem.cart_id == cart_id).first()
    if db_cart_item:
        # Stok kontrolü
        product = db.query(Product).filter(Product.id == db_cart_item.product_id).first()
        if not product or quantity > product.stock_quantity:
            raise ValueError(f"Not enough stock. Available: {product.stock_quantity if product else 0}, Requested: {quantity}")
        
        db_cart_item.quantity = quantity
        db.commit()
        db.refresh(db_cart_item)
    return db_cart_item

def remove_item_from_cart(db: Session, cart_item_id: int, cart_id: int) -> bool:
    db_cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id, CartItem.cart_id == cart_id).first()
    if db_cart_item:
        db.delete(db_cart_item)
        db.commit()
        return True
    return False

def clear_cart(db: Session, cart_id: int) -> bool:
    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    if cart:
        # Tüm sepet öğelerini sil
        db.query(CartItem).filter(CartItem.cart_id == cart_id).delete()
        db.commit()
        return True
    return False