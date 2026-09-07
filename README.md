# 📶 Notifikasi Tagihan WiFi Real-time

Web app sederhana untuk mengirim notifikasi tagihan WiFi ke semua pelanggan secara instan menggunakan Supabase + GitHub Pages.

## 🚀 Cara Deploy

1. **Buat akun Supabase** di https://supabase.com (gratis).
2. Buat project baru, simpan **URL** dan **Anon Key**.
3. Di SQL Editor Supabase, jalankan query ini:
   ```sql
   CREATE TABLE notifications (
       id BIGSERIAL PRIMARY KEY,
       message TEXT NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Aktifkan Realtime
   ALTER TABLE notifications REPLICA IDENTITY FULL;

   -- Izinkan semua orang baca & tulis (sesuai kebutuhan)
   CREATE POLICY "Public insert" ON notifications FOR INSERT WITH CHECK (true);
   CREATE POLICY "Public select" ON notifications FOR SELECT USING (true);
