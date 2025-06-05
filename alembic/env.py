# alembic/env.py

# ... diğer importlar ...
from app.core.config import settings # .env'den DATABASE_URL'i almak için
from app.db.session import Base # <<< Base'i buradan alıyoruz

# ...
# Bu satırı bulun:
# target_metadata = None
# Ve şu şekilde değiştirin veya ekleyin:
target_metadata = Base.metadata
# ...

# `configure` fonksiyonu içinde `context.configure` çağrısını bulun:
#         context.configure(
#             connection=connection, target_metadata=target_metadata
#         )
# URL'yi .env dosyasından almak için:
def run_migrations_online() -> None:
    """Run migrations in 'online' mode.
    # ...
    """
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = settings.DATABASE_URL # <<< EKLENDİ/GÜNCELLENDİ
    connectable = engine_from_config(
        configuration, # <<< DEĞİŞTİRİLDİ
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
# ...