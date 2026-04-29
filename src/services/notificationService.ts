export type NotificationSource = 'home' | 'catalogo' | 'detalle' | 'modal';

interface WhatsAppClickPayload {
  carId: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  source: NotificationSource;
  env: 'development' | 'production';
}

export function notifyWhatsAppClick(
  car: { id: string; brand: string; model: string; year: number },
  source: NotificationSource
): void {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  if (!supabaseUrl || !supabaseKey) return;

  const payload: WhatsAppClickPayload = {
    carId: car.id,
    carBrand: car.brand,
    carModel: car.model,
    carYear: car.year,
    source,
    env: import.meta.env.MODE === 'production' ? 'production' : 'development',
  };

  // Fire-and-forget: never block the WhatsApp redirect
  fetch(`${supabaseUrl}/functions/v1/notify-whatsapp-click`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Silent fail — notification is non-critical
  });
}
