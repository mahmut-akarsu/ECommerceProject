# app/core/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    # FRONTEND_URL: str = "http://localhost:3000" # Eğer CORS için gerekiyorsa

    class Config:
        env_file = ".env"

@lru_cache() # Bu fonksiyonun sonucu önbelleğe alınır, tekrar tekrar .env okunmaz
def get_settings():
    return Settings()

settings = get_settings()