# ⚒️ Retro Demirci Ustası (Blacksmith Simulator)

**Retro pixel-art tarzında, müşteri siparişlerini karşıladığınız, materyal yönetimi yaptığınız ve dükkanınızı geliştirdiğiniz hyper-casual bir demircilik simülasyonu.**

[🔴 **CANLI OYNA (Live Demo)**](https://blacksmith-game-gemini3.vercel.app/)

---

## 📖 Oyun Hakkında

Bu proje, React ve TypeScript kullanılarak geliştirilmiş web tabanlı bir oyundur. Oyuncu, bir orta çağ demircisini yönetir. Her gün dükkana gelen farklı türdeki müşterilerin (Şövalyeler, Köylüler, Hırsızlar vb.) isteklerine göre silah ve zırh üretimi yapar.

Üretim süreci tek bir tıklamadan ibaret değildir; 3 aşamalı interaktif mini oyunlardan oluşur. Üretim kalitesi, bu mini oyunlardaki başarınıza bağlıdır.

## ✨ Özellikler

### 🎮 Oynanış Mekanikleri
*   **3 Aşamalı Crafting Sistemi:**
    1.  **Kesme (Cutting):** Hareket eden testereyi doğru zamanda durdurarak malzemeyi şekillendirme.
    2.  **Dövme (Forging):** Örs üzerinde ritmik olarak doğru noktaya çekiç vurma.
    3.  **Su Verme (Quenching):** Isınan demiri doğru sıcaklıkta suya sokarak sertleştirme.
*   **Ekonomi ve Stok Yönetimi:** Gün başında dükkandan malzeme satın alın. Stok biterse Karaborsa'dan pahalıya almak zorunda kalırsınız!
*   **Gelişim Sistemi:** Kazandığınız altınlarla çekicinizi, örsünüzü geliştirin veya dükkanın itibarını artırın.
*   **Dinamik Müşteriler:** DiceBear API kullanılarak oluşturulan rastgele pixel-art avatarlar ve diyaloglar.

### 🎨 Görsel ve İşitsel Tasarım
*   **Retro Pixel Art:** `Press Start 2P` fontu ve özel CSS teknikleri ile 8-bit konsol havası.
*   **Web Audio API Ses Motoru:** Oyun içinde hiç ses dosyası (.mp3/.wav) **kullanılmamıştır**. Tüm sesler (Müzik, çekiç sesi, testere sesi) kod ile gerçek zamanlı olarak üretilir (Synthesizer mantığı).
*   **Responsive Tasarım:** Hem PC (16:9 Sinematik mod) hem de Mobil cihazlarda kusursuz çalışır.

## 🛠️ Kullanılan Teknolojiler

*   **Framework:** React 18
*   **Dil:** TypeScript
*   **Build Tool:** Vite
*   **Stil:** Tailwind CSS
*   **Ses:** Web Audio API (Custom Sound Engine)
*   **Avatar API:** DiceBear Pixel Art

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel bilgisayarınızda çalıştırmak için şu adımları izleyin:

1.  **Projeyi Klonlayın:**
    ```bash
    git clone https://github.com/kullaniciadi/retro-demirci.git
    cd retro-demirci
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Geliştirme Sunucusunu Başlatın:**
    ```bash
    npm run dev
    ```
    Tarayıcınızda `http://localhost:5173` (veya terminalde belirtilen port) adresine gidin.

## ⌨️ Kontroller

*   **Fare / Dokunmatik:** Menü etkileşimleri ve malzeme seçimi.
*   **Boşluk (Space):** Tüm mini oyunlarda (Kesme, Vurma, Suya Batırma) aksiyon tuşu olarak kullanılır.
*   **F:** Tam Ekran modu (PC için).
*   **ESC:** Menüye dön / Dükkanı kapat.

## 📂 Proje Yapısı

```
/src
  ├── components/      # Oyun içi bileşenler (CraftingTable, Shop vb.)
  ├── services/        # Ses motoru ve müşteri üretici servisler
  ├── types.ts         # TypeScript tip tanımları
  ├── constants.ts     # Oyun dengesi ve sabit veriler
  ├── App.tsx          # Ana oyun döngüsü
  └── main.tsx         # Giriş noktası
```

---

*Bu proje hyper-casual oyun mekaniklerini modern web teknolojileriyle birleştirmek amacıyla geliştirilmiştir.*
