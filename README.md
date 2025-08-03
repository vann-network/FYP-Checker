# 🤖 FYP Checker Bot (Discord)

Bot Discord untuk mengecek kemungkinan video TikTok kamu masuk FYP berdasarkan caption dan hashtag.

## 📦 Cara Jalankan Lokal

1. Clone repo ini
2. Buat file `.env` dan isi:
```
DISCORD_TOKEN=ISI_TOKEN_DISCORD_BOT_KAMU
```
3. Jalankan:
```bash
npm install
npm start
```

## 🚀 Deploy ke Railway

1. Fork repo ini ke akun GitHub kamu
2. Buka [railway.app](https://railway.app)
3. Buat project baru → pilih deploy via GitHub → pilih repo ini
4. Tambahkan variable:
   - `DISCORD_TOKEN`: token bot kamu

5. Railway akan otomatis build & run `npm start`

## 🧪 Contoh Penggunaan

```
!fypcek video masak indomie #fyp #resep
```

Bot membalas:

```
📊 Skor kemungkinan FYP: 80/100

💡 Tips:
• Tambahkan ajakan, seperti 'tag temanmu' atau 'komen ya!'
```
