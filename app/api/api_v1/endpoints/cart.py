# app/api/api_v1/endpoints/cart.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas import cart_schemas
from app.services import cart_service, auth_service
from app.db.session import get_db
from app.models.user_model import User

router = APIRouter()

@router.get("/", response_model=cart_schemas.Cart)
def get_current_user_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_active_user)
):
    """
    Get the current logged-in user's cart.
    """
    return cart_service.get_user_cart_details(db, current_user=current_user)

@router.post("/items", response_model=cart_schemas.Cart)
def add_item_to_current_user_cart(
    item_in: cart_schemas.CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_active_user)
):
    """
    Add a product item to the current user's cart.
    If the item already exists, its quantity is increased.
    """
    return cart_service.add_product_to_user_cart(db, current_user=current_user, item_in=item_in)

@router.put("/items/{cart_item_id}", response_model=cart_schemas.Cart)
def update_cart_item_for_current_user(
    cart_item_id: int,
    item_update: cart_schemas.CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_active_user)
):
    """
    Update the quantity of an item in the current user's cart.
    If quantity is 0 or less, item is removed.
    """
    return cart_service.update_user_cart_item(db, current_user=current_user, cart_item_id=cart_item_id, item_update_in=item_update)

@router.delete("/items/{cart_item_id}", response_model=cart_schemas.Cart)
def remove_cart_item_for_current_user(
    cart_item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_active_user)
):
    """
    Remove an item from the current user's cart.
    """
    return cart_service.remove_product_from_user_cart(db, current_user=current_user, cart_item_id=cart_item_id)

@router.delete("/", response_model=cart_schemas.Cart, status_code=status.HTTP_200_OK) # Veya 204 No Content ve farklı response
def clear_current_user_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_active_user)
):
    """
    Clear all items from the current user's cart.
    """
    return cart_service.clear_user_cart_service(db, current_user=current_user)