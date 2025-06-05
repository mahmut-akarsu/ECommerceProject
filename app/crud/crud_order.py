# app/crud/crud_order.py
from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.order_model import Order, OrderItem, OrderStatus
from app.models.user_model import User
from app.schemas.order_schemas import OrderCreate # Şimdilik sadece Order'ı oluşturacağız
# from app.models.cart_model import CartItem as CartItemModel # Sepet öğelerinden veri almak için

def create_order(
    db: Session,
    user: User,
    total_amount: float,
    # order_in: OrderCreate, # Eğer OrderCreate'de ek alanlar varsa
    # items_data: List[dict] # [{"product_id": int, "quantity": int, "price_at_purchase": float}]
) -> Order:
    db_order = Order(
        user_id=user.id,
        total_amount=total_amount,
        status=OrderStatus.PENDING
        # ... OrderCreate'den gelen diğer alanlar ...
    )
    db.add(db_order)
    db.commit() # Önce Order'ı commit et ki ID'si oluşsun
    db.refresh(db_order)
    return db_order

def add_item_to_order(
    db: Session,
    order_id: int,
    product_id: int,
    quantity: int,
    price_at_purchase: float
) -> OrderItem:
    db_order_item = OrderItem(
        order_id=order_id,
        product_id=product_id,
        quantity=quantity,
        price_at_purchase=price_at_purchase
    )
    db.add(db_order_item)
    db.commit()
    db.refresh(db_order_item)
    return db_order_item

def get_order_by_id(db: Session, order_id: int, user_id: Optional[int] = None) -> Optional[Order]:
    query = db.query(Order).filter(Order.id == order_id)
    if user_id: # Eğer kullanıcı ID'si verilmişse, sadece o kullanıcının siparişini getir
        query = query.filter(Order.user_id == user_id)
    return query.first()

def get_orders_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
    return db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

def get_all_orders(db: Session, skip: int = 0, limit: int = 100) -> List[Order]: # Admin için
    return db.query(Order).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

def update_order_status(db: Session, order_id: int, status: OrderStatus) -> Optional[Order]:
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if db_order:
        db_order.status = status
        db.commit()
        db.refresh(db_order)
    return db_order