# 🔔 Setup Push Notification Sungguhan (Muncul Walau App Ditutup Total)

Ini panduan supaya notifikasi tagihan WiFi masuk ke status bar Android **walau
aplikasinya sudah ditutup total** (browser/app tidak sedang jalan), persis
seperti WhatsApp.

## Cara Kerjanya (singkat)
1. HP pengguna "mendaftar" (subscribe) ke sistem push lewat browser — data
   pendaftarannya disimpan di tabel `push_subscriptions`.
2. Saat ada baris baru masuk ke tabel `notifications` (tagihan baru),
   **Database Webhook** Supabase otomatis memanggil **Edge Function**
   `send-push`.
3. Edge Function itu mengirim push ke semua device yang terdaftar, lewat
   layanan push milik Google/Mozilla/dll (FCM untuk Android/Chrome) — inilah
   yang membuat notifikasi tetap sampai walau app sedang tidak berjalan.

## 🔑 Kunci VAPID (sudah dibuatkan, tidak perlu generate ulang)

```
VAPID_PUBLIC_KEY  = BHz8rKHTRc2uPZAZ5f5QA4s48DlRrNqXVd8l_ga7Xray8Kgt8VxjrVY_VhC2R0oa8aTyWfWanaW3payG067lQZc
VAPID_PRIVATE_KEY = wo5o2EWix3oAFOroq-OIVwm1-23QAANvQejFF5IJV34
```

⚠️ **`VAPID_PRIVATE_KEY` bersifat rahasia** — jangan taruh di `index.html`
atau di GitHub. Hanya dipakai di server (Edge Function), lewat Secret.
`VAPID_PUBLIC_KEY` sudah ditulis di `index.html`, itu memang aman untuk
publik.

## Langkah Setup

### 1. Buat tabel `push_subscriptions`
Buka **Supabase Dashboard → SQL Editor**, jalankan isi file
`supabase/setup-push-subscriptions.sql`.

### 2. Install Supabase CLI (di komputer kamu)
```bash
npm install -g supabase
supabase login
```

### 3. Hubungkan project
Di dalam folder project ini:
```bash
supabase link --project-ref <PROJECT_REF_KAMU>
```
`<PROJECT_REF_KAMU>` bisa dilihat di URL dashboard Supabase project kamu
(contoh: `lvhnoybozgfibgkylftl`).

### 4. Set secret VAPID di Edge Function
```bash
supabase secrets set VAPID_PUBLIC_KEY=BHz8rKHTRc2uPZAZ5f5QA4s48DlRrNqXVd8l_ga7Xray8Kgt8VxjrVY_VhC2R0oa8aTyWfWanaW3payG067lQZc
supabase secrets set VAPID_PRIVATE_KEY=wo5o2EWix3oAFOroq-OIVwm1-23QAANvQejFF5IJV34
supabase secrets set VAPID_CONTACT_EMAIL=mailto:emailkamu@gmail.com
```
(`SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` otomatis tersedia di Edge
Function, tidak perlu di-set manual.)

### 5. Deploy Edge Function
```bash
supabase functions deploy send-push --no-verify-jwt
```
`--no-verify-jwt` dipakai karena yang memanggil function ini adalah Database
Webhook internal Supabase, bukan user biasa.

### 6. Buat Database Webhook
Di **Supabase Dashboard → Database → Webhooks → Create a new hook**:
- **Table**: `notifications`
- **Events**: centang **Insert** saja
- **Type**: `Supabase Edge Functions`
- **Edge Function**: pilih `send-push`

Setiap kali ada baris baru di `notifications`, webhook ini otomatis
memanggil `send-push`, dan `send-push` mengirim push ke semua HP yang
subscribe.

### 7. Deploy ulang situs (GitHub Pages)
Upload ulang `index.html` dan `service-worker.js` yang sudah diperbarui ke
repo GitHub Pages kamu.

### 8. Test dari HP
1. Buka situsnya di Chrome Android, install sebagai app (seperti sebelumnya).
2. Izinkan notifikasi saat diminta (atau tap tombol **"🔔 Aktifkan
   Notifikasi"**).
3. **Tutup total** app-nya (swipe dari recent apps).
4. Kirim tagihan baru lewat `admin.html` seperti biasa.
5. Notifikasi harus tetap muncul di status bar dekat jam, walau app sudah
   ditutup. 🎉

## Troubleshooting
- **Notifikasi tidak muncul**: cek log Edge Function di Dashboard → Edge
  Functions → send-push → Logs, untuk lihat error pengiriman.
- **Subscription gagal tersimpan**: pastikan tabel `push_subscriptions` dan
  policy-nya sudah dibuat (langkah 1), dan buka Console browser (F12) untuk
  lihat error.
- **Chrome minta izin notifikasi tapi tidak subscribe**: pastikan situsnya
  diakses lewat **HTTPS** (GitHub Pages otomatis HTTPS, jadi harusnya aman).
