# ⚠️ KURULUM GEREKLİ

## Node.js Kurulumunu Tamamlayın

Sistem Node.js bulamıyor. Lütfen şu adımları takip edin:

### 1. Node.js İndirin
- https://nodejs.org/ adresine gidin
- **LTS (Long Term Support)** sürümünü indirin (v20.x veya v18.x)

### 2. Kurulumu Çalıştırın
- İndirilen `.msi` dosyasını çift tıklayın
- "Next" düğmesine tıklayarak devam edin
- "Automatically install the necessary tools" seçeneğini işaretleyin
- Kurulumu tamamlayın

### 3. Bilgisayarı Yeniden Başlatın
⚠️ **ÖNEMLİ**: Node.js düzgün çalışması için yeniden başlatmanız gerekir

### 4. Doğrulama
Yeniden başlattıktan sonra PowerShell'i açıp kontrol edin:
```powershell
node --version
npm --version
```

### 5. Projeyi Çalıştırın
```powershell
cd "C:\Users\ASUS\Desktop\Yeni klasör\dealhunter-market"
npm install
npm run dev
```

---

**Yardım:** Kurulum sırasında sorun yaşarsanız, Windows Search'te "Node.js" yazıp kaldırabilir ve yeniden kurabilirsiniz.

Browser açılacak: http://localhost:5173 🎉
