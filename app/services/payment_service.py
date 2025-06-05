# app/services/payment_service.py
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import random # Simülasyon için

# --- Strategy Arayüzü ---
class PaymentStrategy(ABC):
    @abstractmethod
    def pay(self, amount: float, payment_details: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ödeme işlemini gerçekleştirir.
        Başarılı olursa ödeme ID'si ve durumu, başarısız olursa hata mesajı döner.
        payment_details: Kredi kartı bilgileri, PayPal hesabı vb. içerebilir.
        """
        pass

# --- Concrete Stratejiler ---
class CreditCardPaymentStrategy(PaymentStrategy):
    def pay(self, amount: float, payment_details: Dict[str, Any]) -> Dict[str, Any]:
        print(f"Processing credit card payment of {amount:.2f}...")
        print(f"Card Details (Mock): {payment_details.get('card_number', 'N/A')[-4:]}") # Sadece son 4 haneyi gösterelim (simülasyon)
        
        # Basit simülasyon: %90 başarılı, %10 başarısız
        if random.random() < 0.9:
            payment_id = f"cc_txn_{random.randint(10000, 99999)}"
            print(f"Credit card payment successful. Transaction ID: {payment_id}")
            return {"status": "success", "transaction_id": payment_id, "message": "Payment successful"}
        else:
            print("Credit card payment failed (mock).")
            return {"status": "failed", "message": "Credit card processing failed (mock)."}

class PayPalPaymentStrategy(PaymentStrategy):
    def pay(self, amount: float, payment_details: Dict[str, Any]) -> Dict[str, Any]:
        print(f"Redirecting to PayPal for payment of {amount:.2f}...")
        print(f"PayPal Account (Mock): {payment_details.get('paypal_email', 'N/A')}")
        
        # Basit simülasyon: %95 başarılı
        if random.random() < 0.95:
            payment_id = f"pp_txn_{random.randint(10000, 99999)}"
            print(f"PayPal payment successful. Transaction ID: {payment_id}")
            return {"status": "success", "transaction_id": payment_id, "message": "PayPal payment successful"}
        else:
            print("PayPal payment failed (mock).")
            return {"status": "failed", "message": "PayPal processing failed (mock)."}

# --- Context Sınıfı (PaymentProcessor) ---
class PaymentProcessor:
    def __init__(self):
        self._strategies: Dict[str, PaymentStrategy] = {
            "credit_card": CreditCardPaymentStrategy(),
            "paypal": PayPalPaymentStrategy(),
            # Gelecekte yeni ödeme yöntemleri eklenebilir
        }
        self._default_strategy_key = "credit_card" # Varsayılan strateji

    def set_strategy_by_key(self, strategy_key: str):
        if strategy_key not in self._strategies:
            print(f"Warning: Payment strategy '{strategy_key}' not found. Using default.")
            self._current_strategy_key = self._default_strategy_key
        else:
            self._current_strategy_key = strategy_key
        print(f"Payment strategy set to: {self._current_strategy_key}")


    def process_payment(self, amount: float, payment_details: Dict[str, Any], strategy_key: Optional[str] = None) -> Dict[str, Any]:
        if strategy_key:
            self.set_strategy_by_key(strategy_key)
        elif not hasattr(self, '_current_strategy_key') or not self._current_strategy_key:
             self.set_strategy_by_key(self._default_strategy_key) # Eğer hiç ayarlanmadıysa varsayılanı kullan

        strategy_to_use = self._strategies.get(self._current_strategy_key)
        if not strategy_to_use: # Ekstra güvenlik
            return {"status": "error", "message": "No valid payment strategy selected."}

        return strategy_to_use.pay(amount, payment_details)

# Singleton deseni ile tek bir PaymentProcessor örneği de kullanılabilir,
# ancak FastAPI'nin dependency injection sistemi ile her istekte yeni bir instance
# oluşturmak veya bir factory kullanmak daha yaygındır. Şimdilik basit tutalım.
# Örnek: payment_processor_instance = PaymentProcessor()