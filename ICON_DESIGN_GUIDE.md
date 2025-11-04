# 📱 PWA İkon Tasarım Rehberi

## 🎯 Gerekli Boyutlar

### Canva'da Tasarlanacak Boyutlar:
1. **512x512** - Ana tasarım (diğerleri bundan türetilecek)
2. **192x192** - Standart Android icon
3. **72x72** - Küçük Android icon

## 🎨 Tasarım Kriterleri

### Ana Tasarım (512x512):
```
- Boyut: 512x512 piksel
- Format: PNG (şeffaflık yok)
- Safe Area: Merkezde 410x410 piksel alan kullan
- Kenarlarda 51 piksel boşluk bırak
```

### Renk Paleti:
```
🟢 Primary: #38e07b (Ana yeşil)
⚫ Dark BG: #122118 (En koyu yeşil - arka plan)
⚫ Surface: #264532 (Orta koyu yeşil)
⚫ Border: #366348 (Açık koyu yeşil)
⚪ Light: #ffffff (Beyaz)
🔵 Accent: #3b82f6 (Mavi vurgu)
```

### İkon İçeriği Önerileri:
```
📚 Seçenek 1: Kitap + Graduation Cap
🏫 Seçenek 2: Okul Binası Silueti  
📊 Seçenek 3: Grafik + Öğrenci İkonu
🎓 Seçenek 4: ARDN Harfleri (Stylized)
```

## 📋 Dosya Isimlendirme

Canva'dan indirdikten sonra:
```
icon-512x512.png
icon-192x192.png
icon-144x144.png
icon-128x128.png
icon-96x96.png
icon-72x72.png
```

## 🚀 Kurulum Adımları

1. **Canva'da tasarla** (512x512)
2. **Farklı boyutlara resize et**
3. **public/icons/** klasörüne kaydet
4. **Manifesti güncelleyelim** (otomatik)
5. **Test edelim** (Chrome DevTools)

## ✅ Test Kontrolleri

- [ ] Tüm boyutlar mevcut
- [ ] PNG format
- [ ] Şeffaflık yok
- [ ] Maskable uyumlu
- [ ] Mobilde net görünüyor
- [ ] PWA install edildiğinde doğru ikon