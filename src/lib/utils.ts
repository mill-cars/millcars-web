import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('es-EC').format(value);
}

export function getWhatsAppLink(carBrand: string, carModel: string, carYear: number) {
  const phoneNumber = "584126512845"; // Número de contacto actualizado
  const message = `Hola carsAgent, estoy interesado en el ${carBrand} ${carModel} del año ${carYear}. ¿Podrían darme más información sobre el precio y financiamiento?`;
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
