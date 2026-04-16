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

export function countActiveFilters<T extends object>(filters: T) {
  return Object.values(filters as Record<string, unknown>).filter(value => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  }).length;
}

export function getWhatsAppLink(carBrand: string, carModel: string, carYear: number) {
  const phoneNumber = "584126512845"; // Número de contacto actualizado
  const message = `Hola, estoy interesado en el ${carBrand} ${carModel} del año ${carYear}. ¿Podrían darme más información sobre el precio y financiamiento?`;
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
