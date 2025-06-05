# app/api/api_v1/endpoints/orders.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.schemas import order_schemas
from app.crud import crud_order
from app.db.session import get_db
from app.services import auth_service
from app.services.order_service import get_order_service, OrderService # OrderService'i import ediyoruz
from app.models.user_model import User
from app.models.order_model import OrderStatus # Admin güncellemesi için

router = APIRouter()

@router.post("/", response_model=order_schemas.Order, status_code=status.HTTP_201_CREATED)
def create_new_order_from_cart(
    *,
    # order_in: order_schemas.OrderCreate, # Belki ödeme yöntemi ve detayları buradan alınır
    payment_method: str = Query(..., description="Payment method (e.g., 'credit_card', 'paypal')"),
    payment_details: Dict[str, Any] = Depends(lambda: {}), # Body'den veya query'den alınabilir, şimdilik basit
    current_user: User = Depends(auth_service.get_current_active_user),
    order_service: OrderService = Depends(get_order_service) # OrderService dependency'si
):
    """
    Create a new order from the current user's cart.
    Payment method and details are required.
    """
    # payment_details'i daha yapılandırılmış bir Pydantic modeli ile almak daha iyi olurdu.
    # Örnek:
    # class PaymentDetailsModel(BaseModel):
    #     card_number: Optional[str] = None
    #     expiry_month: Optional[int] = None
    #     # ...
    #     paypal_email: Optional[str] = None
    # payment_details_body: PaymentDetailsModel # Body'den almak için

    if not payment_details and payment_method in ["credit_card", "paypal"]: # Basit kontrol
         # Gerçekte payment_details body'den veya daha güvenli bir şekilde alınmalı
         if payment_method == "credit_card":
             payment_details = {"card_number": "1234567812345678", "expiry": "12/25", "cvv": "123"} # MOCK
         elif payment_method == "paypal":
             payment_details = {"paypal_email": current_user.email} # MOCK
         else:
            raise HTTPException(status_code=400, detail="Payment details are required for this payment method.")


    try:
        order = order_service.place_order_facade(
            current_user=current_user,
            payment_method=payment_method,
            payment_details=payment_details
        )
        return order
    except HTTPException as e:
        raise e # Servisten gelen HTTP hatalarını doğrudan yükselt
    except Exception as e:
        # Beklenmedik diğer hatalar için
        print(f"Error during order placement: {str(e)}") # Sunucu loguna yaz
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred while placing the order.")


@router.get("/{order_id}", response_model=order_schemas.Order)
def read_user_order_by_id(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_active_user)
):
    """
    Get a specific order by id for the current logged-in user.
    """
    db_order = crud_order.get_order_by_id(db, order_id=order_id, user_id=current_user.id)
    if db_order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found or you do not have permission to view it.")
    return db_order

@router.get("/", response_model=List[order_schemas.Order])
def read_user_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_active_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200)
):
    """
    Retrieve orders for the current logged-in user with pagination.
    """
    orders = crud_order.get_orders_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
    return orders

# --- Admin Endpoint'leri (Opsiyonel) ---
@router.get("/admin/all", response_model=List[order_schemas.Order], dependencies=[Depends(auth_service.get_current_active_superuser)])
def read_all_orders_admin(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200)
):
    """
    (Admin Only) Retrieve all orders in the system.
    """
    orders = crud_order.get_all_orders(db, skip=skip, limit=limit)
    return orders

@router.patch("/admin/{order_id}/status", response_model=order_schemas.Order, dependencies=[Depends(auth_service.get_current_active_superuser)])
def update_order_status_admin(
    order_id: int,
    new_status: OrderStatus, # Enum'u doğrudan path/query parametresi olarak alabiliriz
    db: Session = Depends(get_db)
):
    """
    (Admin Only) Update the status of an order.
    """
    updated_order = crud_order.update_order_status(db, order_id=order_id, status=new_status)
    if not updated_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    return updated_order