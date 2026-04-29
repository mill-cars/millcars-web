export type NotificationSource = 'home' | 'catalogo' | 'detalle' | 'modal';

interface WhatsAppClickPayload {
  carId: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  source: NotificationSource;
  env: 'development' | 'production';
  userIp?: string;
}

async function fetchUserIp(): Promise<string | undefined> {
  try {
    const res = await fetch('https://api.ipify.org?format=json', {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    return data.ip as string;
  } catch {
    return undefined;
  }
}

export function notifyWhatsAppClick(
  car: { id: string; brand: string; model: string; year: number },
  source: NotificationSource
): void {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  if (!supabaseUrl || !supabaseKey) return;

  // Fire-and-forget: resolve IP then send — never blocks WhatsApp redirect
  fetchUserIp().then((userIp) => {
    const payload: WhatsAppClickPayload = {
      carId: car.id,
      carBrand: car.brand,
      carModel: car.model,
      carYear: car.year,
      source,
      env: import.meta.env.MODE === 'production' ? 'production' : 'development',
      userIp,
    };

    fetch(`${supabaseUrl}/functions/v1/notify-whatsapp-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  });
}
