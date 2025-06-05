# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Gerekirse CORS için

# from app.core.config import settings # Eğer CORS için frontend URL gerekiyorsa
from app.api.api_v1.api import api_router as api_v1_router
# from app.db.session import engine # Alembic kullanmayacaksanız tabloları oluşturmak için
# from app.db.base import Base # Alembic kullanmayacaksanız tabloları oluşturmak için

# Eğer Alembic kullanmıyorsanız ve tabloları uygulama başlangıcında oluşturmak isterseniz:
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="E-Ticaret Projesi API",
    description="İstanbul Sağlık ve Teknoloji Üniversitesi - Yazılım Mimarisi ve Tasarımı Dersi Projesi",
    version="0.1.0"
)

# CORS Middleware (Eğer frontend farklı bir domain/port üzerinde çalışacaksa)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[settings.FRONTEND_URL], # İzin verilen kaynaklar
#     allow_credentials=True,
#     allow_methods=["*"], # İzin verilen HTTP metodları
#     allow_headers=["*"], # İzin verilen HTTP başlıkları
# )

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "E-Ticaret API'sine Hoş Geldiniz!"}

# API v1 router'ını ana uygulamaya dahil et
app.include_router(api_v1_router, prefix="/api/v1")

# Uvicorn ile çalıştırmak için (geliştirme sırasında):
# uvicorn app.main:app --reload