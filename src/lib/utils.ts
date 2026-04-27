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

export const filterCarsByFilters = (cars: any[], filters: any) => {
  return cars.filter(car => {
    if (filters.brand) {
      const brands = filters.brand.toLowerCase().split(',').map((b: string) => b.trim());
      if (!brands.some((b: string) => car.brand.toLowerCase().includes(b))) return false;
    }

    if (filters.model) {
      const models = filters.model.toLowerCase().split(',').map((m: string) => m.trim());
      if (!models.some((m: string) => car.model.toLowerCase().includes(m))) return false;
    }

    if (filters.minPrice && car.price < filters.minPrice) return false;
    if (filters.maxPrice && car.price > filters.maxPrice) return false;
    if (filters.minYear && car.year < filters.minYear) return false;
    if (filters.maxYear && car.year > filters.maxYear) return false;
    if (filters.maxMileage && car.mileage > filters.maxMileage) return false;
    if (filters.color && !car.color.toLowerCase().includes(filters.color.toLowerCase())) return false;
    if (filters.condition && car.condition !== filters.condition) return false;
    if (filters.plateEnd !== undefined && car.plateEnd !== filters.plateEnd) return false;
    if (filters.owners !== undefined && car.owners > filters.owners) return false;
    if (filters.fuelType && !car.fuelType.toLowerCase().includes(filters.fuelType.toLowerCase())) return false;
    if (filters.transmission && !car.transmission.toLowerCase().includes(filters.transmission.toLowerCase())) return false;

    if (filters.query) {
      const q = filters.query.toLowerCase();
      const inBrand = car.brand.toLowerCase().includes(q);
      const inModel = car.model.toLowerCase().includes(q);
      const inDesc = car.description.toLowerCase().includes(q);
      const inFeatures = car.features.some((f: string) => f.toLowerCase().includes(q));
      if (!inBrand && !inModel && !inDesc && !inFeatures) return false;
    }

    return true;
  });
};

