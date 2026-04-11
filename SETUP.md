# DealhunterMarket - Kurulum Rehberi

## Adım 1: Node.js Yüklemesi

https://nodejs.org/ adresinden **LTS sürümü** indirin ve kurun.

Kurulduktan sonra, PowerShell'i yeniden açın ve kontrol edin:
```powershell
node --version
npm --version
```

## Adım 2: Bağımlılıkları Yükleyin

Proje klasöründe:
```powershell
cd "C:\Users\ASUS\Desktop\Yeni klasör\dealhunter-market"

# Frontend bağımlılıkları
cd frontend
npm install
cd ..

# Backend bağımlılıkları
cd backend
npm install
cd ..
```

## Adım 3: Geliştirme Modunda Çalıştırın

Proje kök klasöründe:
```powershell
npm run dev
```

Bu komut şunları başlatacak:
- ✅ Frontend: http://localhost:5173
- ✅ Backend: http://localhost:3001

## Proje Yapısı

```
dealhunter-market/
├── frontend/                  # React 19 + Vite + Tailwind
│   ├── src/
│   │   ├── components/        # Bileşenler (Hero, ProductCard, AddProductForm)
│   │   ├── styles/            # CSS (Tailwind)
│   │   ├── App.tsx            # Ana uygulama
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                   # Node.js + Express + SQLite
│   ├── server.js              # API sunucusu
│   ├── db.js                  # Veritabanı bağlantısı
│   ├── models.js              # Ürün işlemleri
│   └── package.json
│
└── package.json               # Root package
```

## Özellikler

### Frontend
- 🎨 Tailwind CSS 4 ile modern tasarım
- ✨ Framer Motion animasyonları
- 🔍 Arama ve filtreleme
- 📱 Responsive tasarım
- ➕ Modal formu ile ürün ekleme

### Backend API
- `GET /api/products` - Tüm ürünleri listele
- `GET /api/products/:id` - Belirli ürünü getir
- `POST /api/products` - Yeni ürün ekle
- `PUT /api/products/:id` - Ürünü güncelle
- `DELETE /api/products/:id` - Ürünü sil
- `GET /health` - Health check

## Ürün Ekleme Örneği

Sağ alt köşedeki **+** butonuna tıklayın ve:

```
Ürün Adı: Organik Domates 500g
Market: Albert Heijn
Orijinal Fiyat: 2.99
İndirimli Fiyat: 1.99
Resim URL: https://example.com/tomato.jpg
Sona Erme Tarihi: 2025-01-31
```

## Animasyonlar

- ✨ Ürün kartları slide-in animasyonu
- 🎯 Butonlarda hover efektleri
- 📍 Modal açma/kapama transitions
- 🔄 Yükleme spinner'ı

## İleri Adımlar (İsteğe Bağlı)

- [ ] PostgreSQL'e geçiş
- [ ] JWT Authentication
- [ ] Market API'larıyla entegrasyon
- [ ] Cloud deploy (Vercel, Heroku)
- [ ] Resim upload özelliği
- [ ] Kategori filtreleme

---

Sorularınız varsa lütfen sorun! 🚀
