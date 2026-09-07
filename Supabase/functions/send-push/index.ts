// supabase/functions/send-push/index.ts
//
// Edge Function ini dipanggil otomatis oleh Database Webhook Supabase
// setiap kali ada baris BARU masuk ke tabel "notifications".
// Tugasnya: ambil semua device yang subscribe, lalu kirim push notification
// ke masing-masing device lewat Web Push Protocol.

import webpush from "npm:web-push@3.6.7";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_CONTACT_EMAIL = Deno.env.get("VAPID_CONTACT_EMAIL") ?? "mailto:admin@example.com";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

webpush.setVapidDetails(VAPID_CONTACT_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    // Payload dari Database Webhook Supabase punya bentuk { record: {...}, ... }
    const record = payload.record ?? payload;
    const message: string = record.message ?? "Ada tagihan baru";

    // Ambil semua subscription device dari tabel push_subscriptions
    const res = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?select=device_id,subscription`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    const subs: { device_id: string; subscription: any }[] = await res.json();

    const notifPayload = JSON.stringify({
      title: "📢 Tagihan WiFi",
      body: message,
    });

    const results = await Promise.allSettled(
      subs.map(async (row) => {
        try {
          await webpush.sendNotification(row.subscription, notifPayload);
        } catch (err: any) {
          // Kalau subscription sudah tidak valid (410/404), hapus dari database
          if (err.statusCode === 404 || err.statusCode === 410) {
            await fetch(
              `${SUPABASE_URL}/rest/v1/push_subscriptions?device_id=eq.${row.device_id}`,
              {
                method: "DELETE",
                headers: {
                  apikey: SUPABASE_SERVICE_ROLE_KEY,
                  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                },
              }
            );
          }
          throw err;
        }
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - sent;

    return new Response(JSON.stringify({ sent, failed }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
