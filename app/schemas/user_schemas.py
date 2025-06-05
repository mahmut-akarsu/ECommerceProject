# app/schemas/user_schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# Kullanıcı oluşturma için temel şema
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

# Kullanıcı oluşturma isteği için şema (şifre içerir)
class UserCreate(UserBase):
    password: str = Field(..., min_length=8) # Şifre minimum 8 karakter

# Kullanıcı güncellerken kullanılacak şema
class UserUpdate(UserBase):
    password: Optional[str] = Field(None, min_length=8)
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None

# Veritabanından okunan ve API'ye döndürülecek kullanıcı şeması (şifre hariç)
class UserInDBBase(UserBase):
    id: int
    is_active: bool
    is_superuser: bool

    class Config:
        # Pydantic v1: orm_mode = True
        # Pydantic v2: from_attributes = True
        # Bu, Pydantic modelinin SQLAlchemy modeli gibi ORM nesnelerinden veri okumasını sağlar.
        from_attributes = True # Pydantic v2 için
        # orm_mode = True # Pydantic v1 kullanıyorsanız

class User(UserInDBBase):
    pass # Şimdilik UserInDBBase ile aynı, ileride farklılaşabilir

# Veritabanında saklanacak kullanıcı (hashed_password içerir)
class UserInDB(UserInDBBase):
    hashed_password: str