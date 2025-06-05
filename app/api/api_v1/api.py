# app/api/api_v1/api.py
from fastapi import APIRouter

# Buraya endpoint router'larını import edeceksiniz
from .endpoints import auth # <<< YENİ EKLEDİK
from .endpoints import products
from .endpoints import cart
# from .endpoints import users, products, cart, orders, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(cart.router, prefix="/cart", tags=["Shopping Cart"])
                          
# api_router.include_router(users.router, prefix="/users", tags=["Users"])
# api_router.include_router(products.router, prefix="/products", tags=["Products"])
# api_router.include_router(cart.router, prefix="/cart", tags=["Cart"])
# api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
# api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])