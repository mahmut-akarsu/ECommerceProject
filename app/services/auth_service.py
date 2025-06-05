# app/services/auth_service.py
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from app.crud import crud_user
from app.models.user_model import User
from app.schemas.token_schemas import TokenData
from app.core.security import verify_password, create_access_token, ALGORITHM, SECRET_KEY
from jose import JWTError, jwt
from app.db.session import get_db

# OAuth2 şeması, token'ı Authorization header'ından "Bearer <token>" olarak alır.
# tokenUrl, token'ı almak için gidilecek endpoint'i belirtir.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login") # Henüz bu endpoint'i oluşturmadık

def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = crud_user.get_user_by_email(db, email=email)
    if not user:
        return None
    if not user.is_active: # Aktif olmayan kullanıcı giriş yapamasın
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

# Token'dan geçerli kullanıcıyı almak için dependency
async def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub") # Token oluştururken 'sub' olarak email'i kullanacağız
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = crud_user.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    if not user.is_active: # Token geçerli olsa bile kullanıcı deaktive edilmiş olabilir
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    # Bu fonksiyon get_current_user'ı çağırır ve kullanıcının aktif olup olmadığını bir kez daha kontrol eder.
    # Aslında get_current_user içinde bu kontrol zaten var, ama bazen daha spesifik roller için
    # (örn: get_current_active_superuser) bu tür katmanlı dependency'ler kullanışlı olabilir.
    # Şimdilik get_current_user yeterli, bu sadece bir örnek.
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user

async def get_current_active_superuser(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="The user doesn't have enough privileges"
        )
    if not current_user.is_active: # Ekstra kontrol
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user