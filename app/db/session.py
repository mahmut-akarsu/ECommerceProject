# app/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from app.core.config import settings

# MySQL için bağlantı string'i .env dosyasından alınacak
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL) # pool_pre_ping=True eklenebilir production için

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency olarak kullanılacak veritabanı session'ı
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()