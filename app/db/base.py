# app/db/base.py
from app.db.session import Base  # SQLAlchemy Base
# Modellerinizi buraya import edeceksiniz, böylece Alembic migration'ları için bulunabilirler.
# Örnek: from app.models.user_model import User
# from app.models.product_model import Product
# ... diğer modelleriniz ...