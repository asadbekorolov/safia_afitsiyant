# Safia Ofitsiantlar Uchun O'quv va Standartlar Sayti (PWA)

Safia restorani va bari xodimlari hamda ofitsiantlari uchun taomlar menyusi, bar ichimliklari, allergenlar, servirovka qoidalari hamda xizmat ko'rsatish standartlarini tez va interaktiv o'rganish uchun yaratilgan **Progressive Web App (PWA)** ilovasi.

---

### 🚀 Asosiy Imkoniyatlar

1. **🍽 Oshxona Menyusi (44 taom)**:
   - Taom rasmlari, narxlari, kategoriyasi, tarkibi hamda achchiq / go'shtsiz belgilari.
   - Real-time nom va ingredient bo'yicha instant qidiruv.
   - 7 ta allergen filtri va kategoriya chip-tugmalari.

2. **☕️ Bar Menyusi (49 ichimlik)**:
   - Ichimliklar tarkibi va har bir ichimlik uchun alohida ajralib turuvchi oltinsimon **Servirovka va podacha (`serving_ru`)** bloki.

3. **📖 Servis Standartlari (Akkordeon & Qidiruv)**:
   - 7 ta asosiy mavzuli akkordeon panellari (Missiya, Salomlashish, 12-bosqichli buyurtma olish, Pichoq/Vilka servirovka qoidalari, Shikoyatlar matritsasi).
   - E'tiborni tortuvchi **🛑 STOP Qizil Taqiqlangan Bloklar** (`.alert-forbidden`) va **✅ Yashil Tavsiya Bloklari**.

4. **🎴 3D Flip Flashcard Trenajyori**:
   - 3D silliq burilish animatsiyasi (~300ms).
   - 2 xil rejim: *Oshxona (Rasm → Nom & Tarkib)* va *Bar (Nom → Tarkib & Servirovka)*.
   - Progress-bar va o'rganilgan kartochkalarni `localStorage` da saqlash.

5. **📝 Interaktiv Test (Quiz) Moduli**:
   - Har bir sessiyada 5 xil savol turidan iborat 10 ta tasodifiy (random) savollar generatori.
   - Bir zumda yashil/qizil vizual javob va savollar yakunida **Xatolar ustida ishlash** paneli.

6. **⚙️ Admin Menyu Editor (`admin.html`)**:
   - Menejerlar uchun narxlarni, ingredientlarni va servirovka qoidalarini inline tahrirlash, yangi taom qo'shish yoki o'chirish.
   - **Lokal Saqlash**: O'zgarishlar darhol bosh sahifada aks etadi.
   - **JSON Export & Import**: Valid `dishes.json` va `drinks.json` fayllarini yuklab olish va yuklash.

7. **📱 PWA & Offline Rejim**:
   - Service Worker (`sw.js`) va `manifest.json` orqali internet uzilganda ham to'liq offline ishlash imkoniyati (`CacheFirst` & `StaleWhileRevalidate`).

8. **⚡️ Vercel Tayyoriligi**:
   - Deploy uchun `vercel.json` konfiguratsiyasi shakllantirilgan.

---

### 🛠 Texnologiyalar

- **Core**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Architecture**: Single Page Application (SPA)
- **PWA**: Service Worker API, Cache API, Web App Manifest
- **Design System**: Mobile-First, Touch target >= 44px, Safia brend ranglari (`#4A2E2B`, `#FAF4ED`, `#D4A373`)
- **Deployment**: Vercel Ready

---

### 📦 Loyihani Ishga Tushirish

1. Ushbu repozitoriyani klonlang:
   ```bash
   git clone git@github.com:asadbekorolov/safia_afitsiyant.git
   cd safia_afitsiyant
   ```

2. Mahalliy server orqali oching:
   ```bash
   npx serve .
   # yoki
   python -m http.server 8000
   ```

3. Brauzerda `http://localhost:8000` manziliga kiring.

---

### 🌐 Vercel'ga Deploy Qilish

```bash
npm install -g vercel
vercel
```

---

### 📄 Litsenziya

© 2026 Safia Waiter Trainer Project.
