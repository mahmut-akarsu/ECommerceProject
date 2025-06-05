# app/db/base.py
# Bu dosya, tüm modellerinizin Base'i import edebileceği
# ve Alembic'in modelleri bulmasına yardımcı olacak bir yer olarak düşünülebilir.
# Ancak doğrudan model importları döngüsel bağımlılıklara yol açabilir.
# Modeller Base'i app.db.session'dan alacak.

# Alembic'in modelleri bulabilmesi için, modellerin tanımlandığı modüllerin
# projeniz tarafından import edildiğinden emin olmanız yeterlidir.
# Genellikle endpoint'leriniz veya servisleriniz bu modelleri import ettiğinde
# Alembic bunları bulabilir.

# Eğer Alembic'in modelleri bulmasında sorun yaşarsanız,
# modelleri buraya import edebilirsiniz AMA DİKKATLİCE:
# import app.models.user_model
# import app.models.product_model # (gelecekte)
# Yalnızca modülü import edin, içinden spesifik bir sınıfı değil.
# Bu, döngüsel import riskini azaltır ama tamamen ortadan kaldırmaz.

# En temiz çözüm, modellerin Base'i session.py'den alması ve
# Alembic'in env.py'sinde Base.metadata'nın doğru şekilde ayarlanmasıdır.
# Bu dosyayı şu an için boş bırakabilir veya sadece bir yorum satırı içerebilir.

# Veya, Base'i buradan tekrar export edebilirsiniz, modeller de buradan alır.
# Ama session.py'de zaten var.
# from app.db.session import Base
pass