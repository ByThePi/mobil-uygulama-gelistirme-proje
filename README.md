# Odaklanma Takibi ve Raporlama Uygulaması (Focus Tracker)

Bu proje, Sakarya Üniversitesi Bilgisayar Mühendisliği Bölümü, Mobil Uygulama Geliştirme dersi dönem projesi olarak geliştirilmiştir.

Uygulama, kullanıcıların dijital dikkat dağınıklığıyla mücadele etmesine yardımcı olmayı amaçlayan, Pomodoro tekniği tabanlı bir odaklanma asistanıdır.

## Özellikler

* **Ayarlanabilir Sayaç:** Varsayılan 25 dakika (Pomodoro) ile başlayan, artırılabilir/azaltılabilir odaklanma sayacı.
* **Dikkat Dağınıklığı Takibi (Distraction Tracking):** Kullanıcı odaklanma sırasındayken uygulamadan çıkarsa (Instagram, WhatsApp vb. için), uygulama bunu algılar (`AppState`), sayacı otomatik duraklatır ve "Odak Kaybı" sayısını artırır.
* **Kategorilendirme:** Odaklanma seansları Ders, Kodlama, Kitap Okuma gibi kategorilere ayrılabilir.
* **Veri Kalıcılığı:** Tüm veriler `AsyncStorage` kullanılarak cihazda yerel olarak saklanır.
* **Detaylı Raporlama:**
    * Günlük ve Toplam Odaklanma İstatistikleri.
    * Son 7 günün performansını gösteren **Çubuk Grafik (Bar Chart)**.
    * Kategori dağılımını gösteren **Pasta Grafik (Pie Chart)**.
* **Modüler Mimari:** Temiz kod prensiplerine uygun, yeniden kullanılabilir bileşen (Component) yapısı.

## Kullanılan Teknolojiler

* **React Native (Expo)** - Mobil Geliştirme Ortamı
* **React Navigation** - Sayfalar Arası Geçiş (Tab Navigation)
* **AsyncStorage** - Yerel Veri Tabanı
* **React Native Chart Kit** - Veri Görselleştirme
* **React Native AppState API** - Durum Yönetimi

## Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Repoyu Klonlayın:**
    ```bash
    git clone [https://github.com/bythepi/OdaklanmaUygulamasi.git](https://github.com/bythepi/OdaklanmaUygulamasi.git)
    cd OdaklanmaUygulamasi
    ```

2.  **Gerekli Paketleri Yükleyin:**
    ```bash
    npm install
    ```

3.  **Uygulamayı Başlatın:**
    ```bash
    npx expo start
    ```

4.  **Telefonunuzda Görüntüleyin:**
    * Expo Go uygulamasını telefonunuza indirin.
    * Terminalde çıkan QR kodu okutun.

## Proje Mimarisi

```text
src/
├── components/      # Tekrar kullanılabilir UI parçaları (TimerCircle, StatCard vb.)
├── screens/         # Uygulama ekranları (HomeScreen, ReportsScreen)
├── navigation/      # Navigasyon ayarları (TabNavigator)
└── utils/           # Yardımcı fonksiyonlar (Veritabanı işlemleri)