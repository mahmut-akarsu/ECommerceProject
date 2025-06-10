

## E-Ticaret Frontend Uygulaması - Kurulum ve Çalıştırma

Bu doküman, e-ticaret frontend uygulamasını yerel geliştirme ortamınızda kurmanız ve çalıştırmanız için gerekli adımları açıklamaktadır.

**Proje Hakkında:**

Bu proje, [kısaca projenin amacı, örn: bir e-ticaret platformu için geliştirilmiş, React ve TypeScript tabanlı bir kullanıcı arayüzüdür]. Backend API'leri ile etkileşime girerek kullanıcıların ürünleri listelemesine, sepete eklemesine, sipariş vermesine ve adminlerin ürün/sipariş yönetimi yapmasına olanak tanır.

**Gereksinimler:**

*   **Node.js ve npm (veya Yarn):** Node.js'in güncel bir LTS sürümü önerilir. npm, Node.js ile birlikte gelir.
    *   Node.js İndirme: [https://nodejs.org/](https://nodejs.org/)
*   **Git:** Versiyon kontrol sistemi (projeyi klonlamak için).
    *   Git İndirme: [https://git-scm.com/](https://git-scm.com/)
*   **Backend API Sunucusu:** Bu frontend uygulamasının çalışabilmesi için backend API sunucusunun yerel ortamınızda çalışır durumda olması gerekmektedir. Backend projesinin kurulum dokümanlarına başvurun. (Varsayılan olarak `http://127.0.0.1:8000/api/v1` adresinde çalıştığı varsayılmıştır.)

**Kurulum Adımları:**

1.  **Projeyi Klonlayın:**
    Terminalinizi veya komut istemcinizi açın ve projeyi yerel makinenize klonlayın:
    ```bash
    git clone <proje_git_repository_url>
    cd <proje_klasor_adi> # Örn: cd e-ticaret-frontend
    ```

2.  **Bağımlılıkları Yükleyin:**
    Proje ana dizinindeyken (klonladığınız klasörün içinde), gerekli Node.js paketlerini yüklemek için aşağıdaki komutu çalıştırın:
    ```bash
    npm install
    ```
    Eğer Yarn kullanıyorsanız:
    ```bash
    yarn install
    ```
    Bu komut, `package.json` dosyasında listelenen tüm bağımlılıkları `node_modules` klasörüne indirecektir.

3.  **Ortam Değişkenlerini Ayarlayın:**
    Proje ana dizininde `.env.example` adında bir dosya varsa (veya yoksa direkt oluşturun), bu dosyayı kopyalayarak `.env` adında yeni bir dosya oluşturun.
    ```bash
    # Eğer .env.example varsa:
    cp .env.example .env
    ```
    Ardından `.env` dosyasını açın ve backend API'nizin çalıştığı adresi `REACT_APP_API_BASE_URL` değişkenine atayın. Varsayılan olarak:
    ```env
    # .env
    REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api/v1
    ```
    Eğer backend API'niz farklı bir adreste veya portta çalışıyorsa, bu değeri ona göre güncelleyin.

**Uygulamayı Çalıştırma:**

1.  **Backend API Sunucusunu Başlatın:**
    Frontend uygulamasının düzgün çalışabilmesi için backend API sunucusunun çalışır durumda olduğundan emin olun. Backend projesinin kendi çalıştırma talimatlarını izleyin.

2.  **Frontend Geliştirme Sunucusunu Başlatın:**
    Tüm bağımlılıklar yüklendikten ve ortam değişkenleri ayarlandıktan sonra, proje ana dizinindeyken aşağıdaki komutu çalıştırarak frontend geliştirme sunucusunu başlatın:
    ```bash
    npm start
    ```
    Eğer Yarn kullanıyorsanız:
    ```bash
    yarn start
    ```
    Bu komut, Webpack geliştirme sunucusunu başlatacak ve uygulamayı varsayılan web tarayıcınızda genellikle `http://localhost:3001` (veya `webpack.config.js` dosyasında belirttiğiniz port) adresinde açacaktır. Terminalde sunucunun hangi adreste çalıştığına dair bilgiler de görünecektir.

    Artık uygulamayı tarayıcınız üzerinden kullanmaya başlayabilirsiniz!

**Olası Sorunlar ve Çözümleri:**

*   **Port Çakışması (`EADDRINUSE` hatası):**
    Eğer `npm start` komutu `EADDRINUSE` hatası verirse, bu genellikle belirtilen portun (örn: 3001) başka bir uygulama tarafından kullanıldığı anlamına gelir.
    *   **Çözüm 1:** Portu kullanan diğer uygulamayı durdurun.
    *   **Çözüm 2:** `webpack.config.js` dosyasındaki `devServer.port` değerini veya `package.json`'daki `start` script'indeki `--port` parametresini farklı bir port numarasıyla (örn: 3002) güncelleyin.
*   **Modül Bulunamadı Hataları (`Module not found`):**
    Bu genellikle bağımlılıkların eksik veya yanlış kurulmasından kaynaklanır. `npm install` komutunu tekrar çalıştırmayı deneyin. `node_modules` klasörünü silip tekrar `npm install` yapmak da yardımcı olabilir.
*   **API Bağlantı Hataları:**
    Uygulama çalışıyor ancak API'den veri alamıyorsanız (örn: ürünler listelenmiyorsa, giriş yapılamıyorsa):
    *   Backend API sunucusunun çalıştığından emin olun.
    *   `.env` dosyasındaki `REACT_APP_API_BASE_URL` değişkeninin doğru backend adresini gösterdiğinden emin olun.
    *   Tarayıcınızın geliştirici konsolundaki ağ (network) hatalarını kontrol edin.

**Proje Yapısı (Kısaca):**

*   `public/`: Statik dosyalar (index.html, favicon.ico, manifest.json vb.).
*   `src/`: Uygulamanın ana kaynak kodları.
    *   `api/`: Backend API ile iletişim kuran servis fonksiyonları.
    *   `assets/`: Resimler, fontlar gibi statik varlıklar.
    *   `components/`: Yeniden kullanılabilir UI bileşenleri.
    *   `contexts/`: React Context API ile global state yönetimi.
    *   `pages/`: Her bir rota için ana sayfa bileşenleri.
    *   `types/`: TypeScript tip tanımları.
    *   `App.tsx`: Ana uygulama bileşeni ve routing.
    *   `index.tsx`: Uygulamanın giriş noktası.
*   `webpack.config.js`: Webpack derleme ve geliştirme sunucusu ayarları.
*   `.babelrc`: Babel transpiler ayarları.
*   `package.json`: Proje bağımlılıkları ve script'leri.
*   `tsconfig.json`: TypeScript derleyici ayarları.
