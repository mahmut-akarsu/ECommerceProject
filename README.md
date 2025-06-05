

## 🛠️ Kullanılan Teknolojiler

*   **Backend Framework:** [Python](https://www.python.org/) 3.10+ & [FastAPI](https://fastapi.tiangolo.com/)
*   **Veritabanı:** [MySQL](https://www.mysql.com/) 8.0+
*   **ORM:** [SQLAlchemy](https://www.sqlalchemy.org/)
*   **Veri Doğrulama/Serileştirme:** [Pydantic](https://pydantic-docs.helpmanual.io/)
*   **Kimlik Doğrulama:** JWT, OAuth2PasswordBearer
    *   Şifreleme: `passlib[bcrypt]`
    *   JWT İşlemleri: `python-jose[cryptography]`
## 🚀 Kurulum ve Başlatma


### 📋 Ön Gereksinimler

1.  **Python:** Makinenizde Python 3.10 veya daha yeni bir sürümünün kurulu olduğundan emin olun. [Python İndirme Sayfası](https://www.python.org/downloads/)
2.  **MySQL Server:** Çalışan bir MySQL veritabanı sunucusuna ihtiyacınız olacak.
    *   [MySQL Community Server İndirme](https://dev.mysql.com/downloads/mysql/)
    *   Kurulum sırasında bir `root` şifresi belirlemeniz veya kullanıcı oluşturmanız gerekecektir.
4.  **(Opsiyonel) Bir MySQL İstemcisi:** Veritabanını yönetmek ve kontrol etmek için MySQL Workbench, DBeaver, phpMyAdmin gibi bir araç faydalı olabilir.

### ⚙️ Kurulum Adımları

1.  **Projeyi Klonlayın:**
    ```bash
    git clone https://github.com/kullanici-adiniz/proje-adiniz.git
    cd proje-adiniz
    ```
    *(`kullanici-adiniz/proje-adiniz` kısmını kendi GitHub kullanıcı adınız ve depo adınızla değiştirin.)*

2.  **Sanal Ortam Oluşturun ve Aktifleştirin:**
    Proje bağımlılıklarını sisteminizdeki diğer Python paketlerinden izole etmek için bir sanal ortam oluşturmanız şiddetle tavsiye edilir.
    ```bash
    python -m venv venv
    ```
    Sanal ortamı aktifleştirin:
    *   **Windows:**
        ```bash
        .\venv\Scripts\activate
        ```
    *   **Linux/macOS:**
        ```bash
        source venv/bin/activate
        ```
    *(Terminal prompt'unuzun başında `(venv)` veya benzeri bir ifade görmelisiniz.)*

3.  **Gerekli Python Paketlerini Yükleyin:**
    Proje ana dizinindeyken `requirements.txt` dosyasındaki paketleri yükleyin:
    ```bash
    pip install -r requirements.txt
    ```

4.  **MySQL Veritabanını Oluşturun:**
    MySQL sunucunuza bağlanın (root veya yetkili bir kullanıcı ile) ve API için bir veritabanı oluşturun. Örneğin, veritabanı adınız `ecommerce_db` olabilir:
    ```sql
    CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```
    *(Farklı bir veritabanı adı kullanacaksanız, sonraki adımda `.env` dosyasında bunu belirtmeniz gerekecektir.)*

5.  **Ortam Değişkenlerini Ayarlayın (`.env` dosyası):**
    Proje ana dizininde `.env.example` dosyasını kopyalayarak `.env` adında yeni bir dosya oluşturun:
    *   **Windows:**
        ```bash
        copy .env.example .env
        ```
    *   **Linux/macOS:**
        ```bash
        cp .env.example .env
        ```
    Şimdi `.env` dosyasını açın ve aşağıdaki değişkenleri kendi MySQL yapılandırmanıza ve tercihlerinize göre düzenleyin:
    ```env
    DATABASE_URL="mysql+pymysql://KULLANICI_ADI:SIFRE@localhost/ecommerce_db"
    # Örnek: mysql+pymysql://root:root_sifreniz@localhost/ecommerce_db
    # Eğer mysqlclient sürücüsünü kurduysanız:
    # DATABASE_URL="mysql+mysqlclient://KULLANICI_ADI:SIFRE@localhost/ecommerce_db"

    SECRET_KEY="COK_GIZLI_BIR_ANAHTAR_BURAYA_YAZILACAK_RASTGELE_UZUN_BIR_SEY_OLSUN"
    # Güçlü bir SECRET_KEY oluşturun. Örn: openssl rand -hex 32
    ALGORITHM="HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    ```
    *   `KULLANICI_ADI`: MySQL kullanıcı adınız.
    *   `SIFRE`: MySQL şifreniz.
    *   `localhost`: MySQL sunucunuzun adresi (genellikle yerelde `localhost` veya `127.0.0.1`).
    *   `ecommerce_db`: 4. adımda oluşturduğunuz veritabanının adı.
    *   `SECRET_KEY`: JWT tokenlarını imzalamak için kullanılacak gizli bir anahtar. Güvenli ve rastgele bir değer olmalıdır.

6.  **Veritabanı Tablolarını Oluşturun:**
    Bu proje, Alembic migration'ları kullanmadan, uygulama başlatıldığında tabloları otomatik oluşturan bir yapıya sahiptir (`Base.metadata.create_all`). Eğer bu aktifse (bkz: `app/main.py` içindeki `CREATE_TABLES` değişkeni), uygulama ilk kez çalıştığında tablolarınız oluşturulacaktır.
    *(Eğer projeyi Alembic kullanacak şekilde geliştirdiyseniz, bu adım `alembic upgrade head` komutu ile yapılmalıdır.)*

### 👟 Uygulamayı Başlatma

Proje ana dizinindeyken (sanal ortamınız aktif olmalı) aşağıdaki komutla Uvicorn sunucusunu başlatın:

```bash
uvicorn app.main:app --reload
```

*   `app.main:app`: Uvicorn'a FastAPI uygulamasının (`app`) `app/main.py` dosyasında olduğunu belirtir.
*   `--reload`: Geliştirme sırasında kod dosyalarında değişiklik yaptığınızda sunucunun otomatik olarak yeniden başlatılmasını sağlar.

Sunucu başarıyla başladığında, terminalde şuna benzer bir çıktı görmelisiniz:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

Artık API'niz çalışıyor!

## 📖 API Dokümantasyonu ve Test

Uygulama çalışırken, interaktif API dokümantasyonuna (Swagger UI) ve alternatif dokümantasyona (ReDoc) aşağıdaki adreslerden erişebilirsiniz:

*   **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
*   **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

Swagger UI üzerinden endpoint'leri test edebilir, istek ve yanıt şemalarını inceleyebilirsiniz. Kimlik doğrulaması gerektiren endpoint'ler için önce `/api/v1/auth/login` ile token alıp, ardından sağ üstteki "Authorize" butonu ile bu token'ı Swagger UI'a tanıtmanız gerekmektedir.

## 🏗️ Proje Yapısı

```
e_ticaret_projesi/
├── app/                          # Ana uygulama kodları
│   ├── __init__.py
│   ├── main.py                   # FastAPI uygulama instance'ı
│   ├── api/                      # Sunum Katmanı (FastAPI router'ları)
│   │   └── api_v1/
│   │       ├── __init__.py
│   │       ├── api.py            # Tüm v1 endpoint'lerini birleştirir
│   │       └── endpoints/        # Kaynak bazlı endpoint dosyaları (auth.py, products.py vb.)
│   ├── core/                     # Temel yapılandırma ve güvenlik
│   │   ├── __init__.py
│   │   ├── config.py             # Ortam değişkenleri ve ayarlar
│   │   └── security.py           # Şifreleme, JWT işlemleri
│   ├── crud/                     # Altyapı Katmanı (Veri Erişim Katmanı - Repository Deseni)
│   ├── db/                       # Veritabanı bağlantısı ve session yönetimi
│   ├── models/                   # Alan Katmanı (SQLAlchemy veritabanı modelleri)
│   ├── schemas/                  # Pydantic şemaları (Veri doğrulama, DTO'lar)
│   ├── services/                 # Uygulama Katmanı (İş mantığı, Facade, Strategy vb.)
│   └── utils/                    # Yardımcı fonksiyonlar (varsa)
├── tests/                        # (Gelecekteki) Birim ve entegrasyon testleri
├── .env                          # Ortam değişkenleri (Git'e eklenmemeli)
├── .env.example                  # .env dosyası için şablon
├── .gitignore
├── requirements.txt              # Proje bağımlılıkları
└── README.md                     # Bu dosya
```

## 🏛️ Mimari ve Tasarım Desenleri

Proje, **Katmanlı Mimari** üzerine kurulmuştur. Kullanılan başlıca tasarım desenleri şunlardır:

*   **Singleton:** Uygulama ayarları (`config.py`) ve SQLAlchemy `engine`.
*   **Repository (CRUD Katmanı):** `app/crud/` altında veri erişim mantığını soyutlar.
*   **Data Transfer Object (DTO):** `app/schemas/` altında Pydantic modelleri ile API veri sözleşmelerini tanımlar.
*   **Facade:** `OrderService` (`app/services/order_service.py`), karmaşık sipariş oluşturma sürecini basitleştirir.
*   **Strategy:** `PaymentProcessor` (`app/services/payment_service.py`), farklı ödeme yöntemlerini yönetir.
*   **Chain of Responsibility (Kavramsal):** `OrderService` içindeki sipariş işleme adımları.
