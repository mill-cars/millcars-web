import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  carId: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  source: string;
  env: 'development' | 'production';
}

const SOURCE_LABELS: Record<string, string> = {
  home: 'Página Principal',
  catalogo: 'Catálogo',
  detalle: 'Detalle del Vehículo',
  modal: 'Vista Rápida',
};

async function getGmailAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
      refresh_token: Deno.env.get('GOOGLE_REFRESH_TOKEN')!,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OAuth token error: ${err}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

async function sendNotificationEmail(payload: NotificationPayload): Promise<void> {
  const accessToken = await getGmailAccessToken();

  const to = Deno.env.get('NOTIFICATION_EMAIL')!;
  const from = Deno.env.get('GMAIL_FROM') || to;
  const envLabel = payload.env === 'production' ? 'Producción' : 'Desarrollo';
  const sourceLabel = SOURCE_LABELS[payload.source] ?? payload.source;

  const subject = `[Millcars] WhatsApp: ${payload.carBrand} ${payload.carModel} ${payload.carYear} – ${envLabel}`;
  const body = [
    `Se ha redireccionado a WhatsApp el auto ${payload.carBrand} ${payload.carModel} ${payload.carYear} para información.`,
    '',
    `  Auto    : ${payload.carBrand} ${payload.carModel} ${payload.carYear}`,
    `  ID      : ${payload.carId}`,
    `  Origen  : ${sourceLabel}`,
    `  Ambiente: ${envLabel}`,
    '',
    '---',
    'Notificación automática de Millcars',
  ].join('\n');

  const raw = [
    `From: Millcars Notificaciones <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    body,
  ].join('\r\n');

  // Base64url encoding required by Gmail API
  const base64url = btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: base64url }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail API error: ${err}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  try {
    const payload: NotificationPayload = await req.json();

    if (!payload.carId || !payload.carBrand || !payload.carModel || !payload.carYear) {
      return new Response('Missing required fields', { status: 400, headers: CORS_HEADERS });
    }

    await sendNotificationEmail(payload);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[notify-whatsapp-click]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
