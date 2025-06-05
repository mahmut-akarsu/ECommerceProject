from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api_v1.api import api_router as api_v1_router
from app.db.session import engine, Base
import app.models.user_model # User modelinin Base.metadata'ya kaydedilmesi için
import app.models.product_model
import app.models.cart_model
import app.models.order_model

# Eğer Alembic kullanmıyorsanız ve tabloları uygulama başlangıcında oluşturmak isterseniz:
CREATE_TABLES = True # <<< Kontrolü kolaylaştırmak için bir değişken kullanabilirsiniz

if CREATE_TABLES:
    print("Checking/Creating database tables...")
    # Modellerin Base'i app.db.session'dan miras aldığından
    # ve modellerin uygulamanız tarafından import edildiğinden emin olun.
    # `import app.models.user_model` satırı User modelinin yüklenmesini ve
    # Base.metadata'ya kaydedilmesini sağlar.
    # Diğer modelleriniz için de benzer importlar eklemeniz gerekecektir:
    # import app.models.product_model # (Eklendiğinde)
    # import app.models.order_model # (Eklendiğinde)
    Base.metadata.create_all(bind=engine)
    print("Database tables checked/created.")


app = FastAPI(
    title="E-Ticaret Projesi API",
    description="İstanbul Sağlık ve Teknoloji Üniversitesi - Yazılım Mimarisi ve Tasarımı Dersi Projesi",
    version="0.1.0"
)

# CORS Middleware (Eğer frontend farklı bir domain/port üzerinde çalışacaksa)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"], # settings.FRONTEND_URL
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "E-Ticaret API'sine Hoş Geldiniz!"}

app.include_router(api_v1_router, prefix="/api/v1")