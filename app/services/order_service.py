# app/services/order_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.crud import crud_order, crud_cart, crud_product
from app.schemas import order_schemas, cart_schemas
from app.models.user_model import User
from app.models.order_model import OrderStatus
from app.models.product_model import Product
from .payment_service import PaymentProcessor # Ödeme servisimizi import ediyoruz
from typing import Dict, Any
from fastapi import Depends
from app.db.session import get_db


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.payment_processor = PaymentProcessor() # Her OrderService instance'ı kendi PaymentProcessor'ını alır

    def _validate_cart_and_stock(self, cart: cart_schemas.Cart) -> bool:
        """Sepetteki ürünlerin stok durumunu kontrol eder."""
        if not cart.items:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty. Cannot create order.")

        for item in cart.items:
            product_db = crud_product.get_product(self.db, product_id=item.product_id)
            if not product_db:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with ID {item.product_id} not found.")
            if product_db.stock_quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Not enough stock for product '{product_db.name}'. Available: {product_db.stock_quantity}, Requested: {item.quantity}"
                )
        return True

    def _process_payment(self, amount: float, payment_method: str, payment_details: Dict[str, Any]) -> Dict[str, Any]:
        """Ödeme işlemini gerçekleştirir."""
        print(f"OrderService: Attempting payment of {amount} via {payment_method}")
        payment_result = self.payment_processor.process_payment(
            amount=amount,
            payment_details=payment_details,
            strategy_key=payment_method.lower().replace(" ", "_") # "Credit Card" -> "credit_card"
        )
        print(f"OrderService: Payment result: {payment_result}")
        if payment_result.get("status") != "success":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Payment failed: {payment_result.get('message', 'Unknown error')}")
        return payment_result

    def _create_order_from_cart(self, user: User, cart: cart_schemas.Cart, payment_transaction_id: str) -> order_schemas.Order:
        """Veritabanında siparişi ve sipariş kalemlerini oluşturur."""
        # Siparişi oluştur
        order_db = crud_order.create_order(
            db=self.db,
            user=user,
            total_amount=cart.total_cart_price
        )
        
        # Sipariş kalemlerini oluştur ve stokları güncelle
        for cart_item_schema in cart.items:
            crud_order.add_item_to_order(
                db=self.db,
                order_id=order_db.id,
                product_id=cart_item_schema.product_id,
                quantity=cart_item_schema.quantity,
                price_at_purchase=cart_item_schema.product.price # CartItem şemasındaki ürün fiyatını kullanıyoruz
            )
            # Stok güncelleme
            product_db = crud_product.get_product(self.db, product_id=cart_item_schema.product_id)
            if product_db: # Ekstra kontrol
                product_db.stock_quantity -= cart_item_schema.quantity
                self.db.add(product_db) # Değişikliği session'a ekle
        
        # Sipariş durumunu güncelle (Ödeme başarılı olduğu için)
        crud_order.update_order_status(self.db, order_id=order_db.id, status=OrderStatus.PROCESSING)
        
        self.db.commit() # Tüm stok güncellemelerini ve sipariş kalemlerini commit et
        self.db.refresh(order_db) # İlişkili item'ları da yüklemek için

        # Sepeti temizle
        user_cart_db = crud_cart.get_cart_by_user_id(self.db, user_id=user.id)
        if user_cart_db:
            crud_cart.clear_cart(self.db, cart_id=user_cart_db.id)

        # Pydantic şemasına dönüştür (Order CRUD'da daha detaylı item'larla dönebiliriz)
        # Veya order_db'yi doğrudan döndürebiliriz, schema bunu halleder.
        # Şimdilik crud_order'dan gelen order_db'yi döndürelim, CartService'teki gibi detaylı şema oluşturmaya gerek yok
        # çünkü order_db zaten ilişkili item'ları içerecek (eager loading veya refresh sonrası).
        
        # Order'ı tam detaylarıyla (items ve product detayları) almak için yeniden sorgula
        final_order_db = crud_order.get_order_by_id(self.db, order_id=order_db.id)
        return order_schemas.Order.from_orm(final_order_db) # Pydantic v1
        # return order_schemas.Order.model_validate(final_order_db) # Pydantic v2


    def place_order_facade(
        self,
        current_user: User,
        payment_method: str, # örn: "credit_card", "paypal"
        payment_details: Dict[str, Any] # örn: {"card_number": "...", "paypal_email": "..."}
    ) -> order_schemas.Order:
        """
        Sipariş verme sürecini yöneten Facade metodu.
        Adımlar (Chain of Responsibility benzeri bir akış):
        1. Kullanıcının sepetini al.
        2. Sepeti ve stokları doğrula.
        3. Ödemeyi işle.
        4. Siparişi oluştur ve kaydet.
        5. Sepeti temizle.
        """
        # 1. Kullanıcının sepetini al (CartService'i burada kullanmak yerine doğrudan CRUD kullanabiliriz veya CartService'ten sepet detaylarını alabiliriz)
        from app.services.cart_service import get_user_cart_details # Döngüsel importu önlemek için fonksiyon içinde import
        
        user_cart_details = get_user_cart_details(self.db, current_user)
        if not user_cart_details.items:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot place order with an empty cart.")

        # 2. Sepeti ve stokları doğrula
        self._validate_cart_and_stock(user_cart_details)
        
        # 3. Ödemeyi işle
        payment_result = self._process_payment(
            amount=user_cart_details.total_cart_price,
            payment_method=payment_method,
            payment_details=payment_details
        )
        payment_transaction_id = payment_result.get("transaction_id", "N/A_MOCK_ID")

        # 4. Siparişi oluştur, kaydet ve stokları güncelle
        # 5. Sepeti temizle (bu adım _create_order_from_cart içinde yapılıyor)
        try:
            created_order = self._create_order_from_cart(
                user=current_user,
                cart=user_cart_details,
                payment_transaction_id=payment_transaction_id
            )
            # Burada başarılı sipariş için bir bildirim (email vb.) tetiklenebilir.
            print(f"OrderService: Order {created_order.id} placed successfully for user {current_user.email}.")
            return created_order
        except HTTPException as e: # Ödeme veya stoktan gelen HTTP hatalarını tekrar yükselt
            raise e
        except Exception as e:
            # Ödeme başarılı oldu ama sipariş oluşturmada/stok güncellemede sorun çıktıysa ne yapmalı?
            # İdealde ödemeyi geri alma (refund) işlemi tetiklenmeli. Bu karmaşık bir senaryo.
            # Şimdilik basit bir hata loglayıp genel bir hata döndürelim.
            print(f"CRITICAL ERROR: Payment successful (txn: {payment_transaction_id}) but order creation/stock update failed for user {current_user.email}. Error: {str(e)}")
            # Sipariş durumunu FAILED olarak işaretleyebiliriz
            # ... (Eğer order_db kısmen oluştuysa)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Order placement failed after payment. Please contact support. Ref: {payment_transaction_id}")

# Dependency olarak OrderService'i sağlamak için
def get_order_service(db: Session = Depends(get_db)):
    return OrderService(db=db)