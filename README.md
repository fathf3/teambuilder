# ⚽ Takım Oluşturucu ve Yönetim Sistemi

Bu basit ve kullanıcı dostu web uygulaması, futbol takımları oluşturmak ve oyuncuları yönetmek için tasarlanmıştır. Oyuncuların isimlerini, mevkilerini ve güç (0-100 arası) değerlerini girerek, takımlar arasında daha dengeli bir dağılım sağlamayı hedefler.

## ✨ Özellikler

* **Oyuncu Yönetimi:**
    * Oyuncu adı, mevki (Kaleci, Defans, Orta Saha, Forvet, Libero) ve güç (0-100 arası) değerleri ile oyuncu ekleme.
    * Mevcut oyuncuları listeleme ve düzenleme.
    * Oyuncuların maça gelip gelmeyeceğini işaretleme (aktif/pasif).
    * Oyuncu silme.
    * Toplam, maça gelecek ve gelmeyecek oyuncu sayılarını anlık takip.
* **Akıllı Takım Oluşturma:**
    * Maça gelecek oyuncular arasından güç ve mevki dengesini göz önünde bulundurarak iki takım (A ve B) oluşturur.
    * Oluşturulan takımlardaki oyuncu sayılarını ve ortalama güç değerlerini gösterir.
* **Veri Yedekleme ve Geri Yükleme:**
    * Oyuncu listesini JSON dosyası olarak dışa aktarma (.json dosyası indirme).
    * Daha önce indirilmiş bir JSON dosyasından oyuncu listesini içe aktarma.
    * Oyuncu listesini manuel olarak kopyalanabilir bir metin kodu olarak yedekleme ve bu koddan geri yükleme. (Tarayıcı kapatıldığında veriler kaybolur, bu özellik verileri korumak için önemlidir.)
* **Kullanıcı Dostu Arayüz:** Modern ve temiz CSS tasarımları ile kolay kullanım.


## 🛠️ Kullanılan Teknolojiler

* **HTML5:** Sayfa yapısı için.
* **CSS3:** Stil ve tasarım için.
* **JavaScript (Vanilla JS):** Uygulama mantığı ve dinamik içerik için.

## 🤝 Katkıda Bulunma

Projenin geliştirilmesine katkıda bulunmaktan çekinmeyin! Fikirleriniz, hata raporlarınız veya kod katkılarınız değerlidir.

1.  Depoyu forklayın (fork).
2.  Yeni bir özellik dalı (feature branch) oluşturun: `git checkout -b ozellik/yeni-ozellik`
3.  Değişikliklerinizi yapın ve commit'leyin: `git commit -m 'Yeni özellik: Açıklama'`
4.  Dalı push edin: `git push origin ozellik/yeni-ozellik`
5.  Bir Pull Request (Çekme İsteği) oluşturun.



## 📝 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Daha fazla bilgi için [LICENSE](LICENSE) dosyasına bakın.
