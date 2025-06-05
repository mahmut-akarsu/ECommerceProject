# app/models/user_model.py
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship # Eğer kullanıcı ile başka tablolar arasında ilişki olacaksa

from app.db.session import Base # app.db.session yerine buradan Base'i alıyoruz

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), index=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False) # Admin yetkisi için

    # Örnek: Kullanıcının siparişleri varsa
    # orders = relationship("Order", back_populates="owner")