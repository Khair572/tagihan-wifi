-- Jalankan ini di Supabase SQL Editor
-- Tabel untuk menyimpan data subscription push tiap device/HP

CREATE TABLE push_subscriptions (
    device_id TEXT PRIMARY KEY,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Izinkan siapa saja (anon key) menyimpan subscription-nya sendiri
CREATE POLICY "Public insert/update subscription" ON push_subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update subscription" ON push_subscriptions
    FOR UPDATE USING (true);

-- Tidak perlu izin SELECT/DELETE untuk publik — hanya server (service role) yang baca & hapus
